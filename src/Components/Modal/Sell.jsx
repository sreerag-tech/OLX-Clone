import { Modal, ModalBody } from "flowbite-react";
import Input from "../Input/Input";
import React, { useContext, useState } from "react";
import { AuthContext, FirebaseContext } from "../Context/Auth";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../Firebase/Firebase";

function Sell({ toggleModalSell, status, setItems }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [dec, setDec] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState(null);

  const auth = useContext(FirebaseContext);
  const { user } = useContext(AuthContext);

  const handleImageUpload = (event) => {
    if (event.target.files) setImage(event.target.files[0]);
  };

  const compressImageToBlob = async (
    file,
    { maxWidth = 600, maxHeight = 600, quality = 0.7 } = {}
  ) => {
    // Use createImageBitmap where available for speed.
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

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Image compression failed"))),
        "image/jpeg",
        quality
      );
    });

    return blob;
  };

  const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!auth?.userData) {
      toast("Please Login to continue");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = dec.trim();

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

    setSubmitting(true);

    try {
      if (image.size > 5 * 1024 * 1024) {
        toast("Image too large. Max 5MB.");
        return;
      }

      // Firestore-only: store a small thumbnail Data URL (must stay well under 1MB doc limit).
      const toastId = toast.loading("Optimizing image...");
      const thumbBlob = await compressImageToBlob(image, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.7,
      });
      const imageUrl = await blobToDataUrl(thumbBlob);

      // Safety guard: Firestore doc limit is 1MB; keep image small.
      if (imageUrl.length > 700_000) {
        toast.update(toastId, {
          render: "Image still too large. Please choose a smaller image.",
          type: "error",
          isLoading: false,
          autoClose: 2500,
        });
        return;
      }

      toast.update(toastId, { render: "Saving item...", isLoading: true });

      const newItem = {
        title: trimmedTitle,
        category: trimmedCategory,
        price: parsedPrice,
        imageUrl,
        description: trimmedDescription,
        userId: user.uid,
        userName:
          auth.userData.name ||
          user?.displayName ||
          (user?.email ? user.email.split("@")[0] : "") ||
          "Anonymous",
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "products"), newItem);

      setItems((prevItems) => [
        ...(prevItems || []),
        { id: docRef.id, ...newItem },
      ]);

      setTitle("");
      setCategory("");
      setPrice(0);
      setDec("");
      setImage(null);

      toggleModalSell();
      toast.dismiss(toastId);
      toast.success("Item listed successfully!");
    } catch (error) {
      console.error("Sell upload failed:", error);
      toast.dismiss();
      if (error?.code === "permission-denied") {
        toast("Firestore blocked by rules. Allow writes to `products`.");
      } else {
        toast("Save failed. Check console for details.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Modal
        theme={{
          content: {
            base: "relative w-full p-4 md:h-auto",
            inner:
              "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700",
          },
        }}
        onClick={toggleModalSell}
        show={status}
        className="bg-black"
        position={"center"}
        size="md"
        popup={true}
      >
        <ModalBody
          className="bg-white h-96 p-0 rounded-md"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="p-6 pl-8 pr-8 pb-8">
            <p className="font-bold text-lg mb-3">Sell Item</p>
            <form onSubmit={handleSubmit}>
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
                value={dec}
                onChange={(e) => setDec(e.target.value)}
                placeholder="Description"
                name="description"
              />
              <div className="pt-2 w-full relative">
                {image ? (
                  <div className="relative h-40 sm:h-60 w-full flex justify-center border-2 border-black border-solid rounded-md overflow-hidden">
                    <img
                      className="object-contain"
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="relative h-40 sm:h-60 w-full border-2 border-black border-solid rounded-md">
                    <input
                      onChange={handleImageUpload}
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-30"
                      required
                    />
                    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                      <img className="w-12" alt="" />
                      <p className="text-center text-sm pt-2">
                        Click to upload images
                      </p>
                      <p className="text-center text-sm pt-2">
                        SVG, PNG, JPG (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {submitting ? (
                <div className="w-full flex h-14 justify-center pt-4 pb-2">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Processing...</span>
                  </div>
                </div>
              ) : (
                <div className="w-full pt-2">
                  <button
                    type="submit"
                    className="w-full p-3 rounded-lg text-white"
                    style={{ backgroundColor: "#024f57ff" }}
                  >
                    Sell Item
                  </button>
                </div>
              )}
            </form>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default Sell;
