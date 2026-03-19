import React, { useContext, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";

import Input from "../Input/Input";
import { AuthContext, FirebaseContext } from "../Context/Auth";
import { db } from "../Firebase/Firebase";

function compressImageToBlob(
  file,
  { maxWidth = 800, maxHeight = 800, quality = 0.7 } = {}
) {
  // Firestore-only (image as thumbnail Data URL). Keep it small to avoid 1MB limit.
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

function PostAdPage() {
  const navigate = useNavigate();
  const { user, authReady } = useContext(AuthContext);
  const { userData } = useContext(FirebaseContext);
  // Reuse your existing Firestore structure: collection `products`

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isProfileReady = useMemo(() => Boolean(userData), [userData]);

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

  if (!isProfileReady) {
    return (
      <div className="p-10 px-5 sm:px-15 md:px-30 lg:px-40">
        <p className="text-sm text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const parsedPrice = parseFloat(price);

    if (
      !trimmedTitle ||
      !trimmedCategory ||
      isNaN(parsedPrice) ||
      parsedPrice <= 0 ||
      !trimmedDescription
    ) {
      toast("All fields are required");
      return;
    }

    if (!image) {
      toast("Please select an image");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      toast("Image too large. Max 5MB.");
      return;
    }

    setSubmitting(true);
    try {
      toast("Optimizing image...");
      const thumbBlob = await compressImageToBlob(image, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.7,
      });
      const imageUrl = await blobToDataUrl(thumbBlob);

      if (imageUrl.length > 700_000) {
        toast("Image too large even after compression. Choose a smaller one.");
        return;
      }

      const newItem = {
        title: trimmedTitle,
        category: trimmedCategory,
        price: parsedPrice,
        imageUrl,
        description: trimmedDescription,
        userId: user.uid,
        userName: userData.name || (userData.email ? userData.email.split("@")[0] : "") || "Anonymous",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products"), newItem);
      toast.success("Ad posted successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast("Failed to post ad. Check console + Firestore rules.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-10 px-5 sm:px-15 md:px-30 lg:px-40">
      <h1 className="text-2xl font-bold" style={{ color: "#002f34" }}>
        Post Ad
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        Create a new product listing (protected).
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          name="title"
        />
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          name="category"
        />
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          name="price"
          type="number"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          name="description"
        />

        <div className="pt-2 w-full relative">
          <div className="relative h-40 sm:h-60 w-full border-2 border-black border-solid rounded-md">
            {image ? (
              <div className="h-full w-full overflow-hidden">
                <img
                  className="object-contain w-full h-full"
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                />
              </div>
            ) : null}

            <input
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              type="file"
              accept="image/*"
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-30"
              required
            />
            {!image ? (
              <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                <p className="text-center text-sm pt-2">
                  Click to upload images
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 p-3 rounded-lg text-white"
          style={{ backgroundColor: "#024f57ff", opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Submitting..." : "Post Ad"}
        </button>
      </form>
    </div>
  );
}

export default PostAdPage;

