import Navbar from "../Navbar/Navbar";
import React, { useMemo, useState, useContext } from "react";
import Login from "../Modal/Login";
import Sell from "../Modal/Sell";
import SignUp from "../Modal/signUp";
import Card from "../Card";
import { Context } from "../Context/item";
import Footer from '../Pages/Footer'


function Home() {
  const [sellModal, setSellModal] = useState(false);
  const [viewModal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!viewModal);
  };
  const toggleModalSell = () => {
    setSellModal(!sellModal);
  };
  const [modalSignUp, setModalSignUp] = useState(false);
  const toggleModalSignUp = () => {
    setModalSignUp(!modalSignUp);
    setModal(false);
  };
  const { items, setItems, loadingItems, itemsError } = useContext(Context);

  const categories = useMemo(() => {
    const unique = new Set();
    (items || []).forEach((i) => {
      if (i?.category) unique.add(i.category);
    });
    return ["All", ...Array.from(unique)];
  }, [items]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    let filtered = items || [];
    if (selectedCategory !== "All") {
      filtered = filtered.filter((i) => i?.category === selectedCategory);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((i) =>
        i?.title?.toLowerCase().includes(lowerQuery) ||
        i?.category?.toLowerCase().includes(lowerQuery) ||
        i?.description?.toLowerCase().includes(lowerQuery) ||
        i?.price?.toString().includes(lowerQuery)
      );
    }
    return filtered;
  }, [items, selectedCategory, searchQuery]);



  return (
    <div>
      <Navbar toggleModal={toggleModal} toggleModalSell={toggleModalSell} setSearchQuery={setSearchQuery} />
      <Login
        toggleModal={toggleModal}
        status={viewModal}
        toggleModalSignUp={toggleModalSignUp}
      />
      <Sell
        setItems={setItems}
        toggleModalSell={toggleModalSell}
        status={sellModal}
      />
      <SignUp toggleModalSignUp={toggleModalSignUp} status={modalSignUp} />
 <br />
      <br />
      <br />
      {loadingItems ? (
        <div className="py-10">
          <h1 style={{ color: "#002f34" }} className="text-3xl font-bold">
            Fresh recommendations
          </h1>
          <p className="mt-4 text-sm text-gray-600">Loading items...</p>
        </div>
      ) : itemsError ? (
        <div className="py-10">
          <h1 style={{ color: "#002f34" }} className="text-3xl font-bold">
            Fresh recommendations
          </h1>
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-800">Couldn’t load items from Firebase.</p>
            <p className="mt-1 text-sm text-red-700">
              Check Firestore rules + ensure the `products` collection exists.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="px-2 pt-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full border font-semibold text-sm ${
                    selectedCategory === cat
                      ? "bg-[#002f34] text-white border-[#002f34]"
                      : "bg-white text-[#002f34] border-[#002f34] opacity-90"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <Card items={filteredItems} />
        </>
      )}
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Footer/>
    </div>
  );
}

export default Home;
