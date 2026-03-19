import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, ModalBody } from "flowbite-react";
import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import Input from "../Input/Input";
import { AuthContext, FirebaseContext } from "../Context/Auth";
import { db } from "../Firebase/Firebase";

function compressImageToBlob(
  file,
  { maxWidth = 600, maxHeight = 600, quality = 0.7 } = {}
) {
  return new Promise(async (resolve, reject) => {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(
        1,
        maxWidth / bitmap.width,
        maxHeight / bitmap.height
      );
      const targetW = Math.max(1, Math.round(bitmap.width * scale));
      const targetH = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, targetW, targetH);
      bitmap.close?.();

      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Image compression failed"))),
        "image/jpeg",
        quality
      );
    } catch (e) {
      reject(e);
    }
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function formatCreatedAt(createdAt) {
  try {
    const asDate = createdAt?.toDate?.();
    if (asDate) return asDate.toLocaleDateString();
  } catch {
    // ignore
  }
  if (typeof createdAt === "string") return createdAt;
  return "";
}

function MyAdsPage() {
  const navigate = useNavigate();
  const { user, authReady } = useContext(AuthContext);
  const { userData } = useContext(FirebaseContext);

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newImage, setNewImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    price: 0,
    description: "",
  });

  useEffect(() => {
    const uid = user?.uid;
    if (!authReady || !uid) return;

    setLoading(true);
    setErr(null);

    const q = collection(db, "products");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const list = allDocs.filter((d) => String(d.userId) === String(uid));
        setAds(list);
        setLoading(false);
      },
      (e) => {
        console.error("My ads error:", e);
        setErr(e);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, authReady]);

  if (!authReady) {
    return (
      <div className="p-10 px-5 sm:px-15 md:px-30 lg:px-40">
        <p className="text-sm text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const startEdit = (ad) => {
    setEditing(ad);
    setNewImage(null);
    setForm({
      title: ad.title || "",
      category: ad.category || "",
      price: ad.price || 0,
      description: ad.description || "",
    });
    setEditOpen(true);
  };

  const handleDelete = async (ad) => {
    if (!window.confirm("Delete this ad?")) return;
    try {
      await deleteDoc(doc(db, "products", ad.id));
      toast.success("Ad deleted");
      setAds((prev) => prev.filter((x) => x.id !== ad.id));
    } catch (e) {
      console.error(e);
      toast("Delete failed. Check Firestore rules + console.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const title = form.title.trim();
    const category = form.category.trim();
    const description = form.description.trim();
    const price = parseFloat(form.price);

    if (!title || !category || !description || isNaN(price) || price <= 0) {
      toast("All fields are required");
      return;
    }

    try {
      let imageUrl = editing.imageUrl;

      if (newImage) {
        if (newImage.size > 5 * 1024 * 1024) {
          toast("Image too large. Max 5MB.");
          return;
        }
        toast("Optimizing image...");
        const thumbBlob = await compressImageToBlob(newImage, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.7,
        });
        imageUrl = await blobToDataUrl(thumbBlob);
        if (imageUrl.length > 700_000) {
          toast("Image too large even after compression.");
          return;
        }
      }

      await updateDoc(doc(db, "products", editing.id), {
        title,
        category,
        price,
        description,
        imageUrl,
      });

      // Update local state so it reflects immediately.
      setAds((prev) =>
        prev.map((x) =>
          x.id === editing.id
            ? { ...x, title, category, price, description, imageUrl }
            : x
        )
      );

      setEditOpen(false);
      setEditing(null);
      setNewImage(null);
      toast.success("Ad updated");
    } catch (e) {
      console.error(e);
      toast("Update failed. Check Firestore rules + console.");
    }
  };

  return (
    <div className="p-10 px-5 sm:px-15 md:px-30 lg:px-40">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#002f34" }}>
            My Ads
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Edit or delete your listings. (Debug UID: {user?.uid} | Total Filtered: {ads.length})
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg border border-[#002f34] font-semibold"
          style={{ color: "#002f34" }}
          onClick={() => navigate("/post-ad")}
        >
          Post Ad
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Loading ads...</p>
      ) : err ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-800">Failed to load ads.</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <p className="font-semibold" style={{ color: "#002f34" }}>
            No ads yet
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Click <span className="font-semibold">Post Ad</span> to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              <div className="h-48 w-full overflow-hidden bg-gray-50">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-lg" style={{ color: "#002f34" }}>
                      {ad.title}
                    </p>
                    <p className="text-sm text-gray-600">{ad.category}</p>
                    <p className="text-sm mt-1 font-semibold">
                      ₹ {ad.price}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCreatedAt(ad.createdAt)}
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    className="px-3 py-1 rounded-lg border border-[#002f34] mr-2 font-semibold"
                    style={{ color: "#002f34" }}
                    onClick={() => startEdit(ad)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded-lg bg-red-500 text-white font-semibold"
                    onClick={() => handleDelete(ad)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={editOpen}
        onClick={() => {
          setEditOpen(false);
          setEditing(null);
          setNewImage(null);
        }}
        popup
        position="center"
        size="md"
        className="bg-black"
      >
        <ModalBody
          className="bg-white p-6 rounded-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold" style={{ color: "#002f34" }}>
            Edit Ad
          </h2>

          <div className="mt-4">
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              name="title"
            />
            <Input
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              placeholder="Category"
              name="category"
            />
            <Input
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="Price"
              name="price"
              type="number"
            />
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Description"
              name="description"
            />

            <div className="pt-2 w-full relative">
              <div className="relative h-36 w-full border-2 border-black border-solid rounded-md overflow-hidden bg-gray-50">
                {newImage ? (
                  <img
                    className="w-full h-full object-contain"
                    src={URL.createObjectURL(newImage)}
                    alt="New preview"
                  />
                ) : (
                  <img
                    className="w-full h-full object-contain"
                    src={editing?.imageUrl}
                    alt="Current preview"
                  />
                )}

                <input
                  onChange={(e) =>
                    setNewImage(e.target.files?.[0] || null)
                  }
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-30"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Upload a new image to replace, or leave as-is.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 font-semibold"
              onClick={() => {
                setEditOpen(false);
                setEditing(null);
                setNewImage(null);
              }}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: "#024f57ff" }}
              onClick={handleSaveEdit}
            >
              Save
            </button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default MyAdsPage;

