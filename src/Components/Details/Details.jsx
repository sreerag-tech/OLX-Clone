import React, { useContext, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Context } from "../Context/item";
import Navbar from "../Navbar/Navbar";
import Login from "../Modal/Login";
import Sell from "../Modal/Sell";
import SignUp from "../Modal/signUp";

function Details() {
  const { items, setItems, loadingItems } = useContext(Context);
  const location = useLocation();
  const { id } = useParams();
  const stateItem = location.state?.item;
  const item =
    stateItem || items?.find((p) => String(p.id) === String(id));
  const [openModal, setOpenModal] = useState(false);
  const [modalSell, setModalSell] = useState(false);
  const [modalSignUp, setModalSignUp] = useState(false);

  const toggleModal = () => setOpenModal(!openModal);
  const toggleModalSell = () => setModalSell(!modalSell);
  const toggleModalSignUp = () => {
    setModalSignUp(!modalSignUp);
    setOpenModal(false);
  };

  const createdAtText =
    item?.createdAt?.toDate?.().toDateString?.() ||
    (typeof item?.createdAt === "string" ? item.createdAt : "");

  return (
    <div>
      <Navbar toggleModalSell={toggleModalSell} toggleModal={toggleModal} />
      <Login
        toggleModal={toggleModal}
        status={openModal}
        toggleModalSignUp={toggleModalSignUp}
      />
      <SignUp toggleModalSignUp={toggleModalSignUp} status={modalSignUp} />

      {loadingItems && !item ? (
        <div className="p-10 px-5 sm:px-15 md:px-30 lg:px-40">
          <p className="text-sm text-gray-600">Loading item...</p>
        </div>
      ) : !item ? (
        <div className="p-10 px-5 sm:px-15 md:px-30 lg:px-40">
          <p className="text-lg font-semibold" style={{ color: "#002f34" }}>
            Item not found
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Go back and select a product again.
          </p>
        </div>
      ) : (
      <div className="grid gap-0 sm:gap-5 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 p-10 px-5 sm:px-15 md:px-30 lg:px-40">
        <div className="border-2 w-full rounded-lg flex justify-center overflow-hidden h-96">
          <img
            className="object-cover"
            src={item?.imageUrl}
            alt={item?.title}
          />
        </div>
        <div className="flex flex-col relative w-full">
          <p className="p-1 pl-0 text-2xl font-bold">₹ {item?.price}</p>
          <p className="p-1 pl-0 text-base">{item?.category}</p>
          <p className="p-1 pl-0 text-xl font-bold">{item?.title}</p>
          <p className="p-1 pl-0 sm:pb-0 break-words text-ellipsis overflow-hidden w-full">
            {item?.description}
          </p>
          <div className="w-full relative sm:relative md:absolute bottom-0 flex justify-between">
            <p className="p-1 pl-0 font-bold">Seller: {item?.userName}</p>
            <p className="p-1 pl-0 text-sm">{createdAtText}</p>
          </div>
        </div>
      </div>
      )}

      <Sell
        setItems={setItems}
        toggleModalSell={toggleModalSell}
        status={modalSell}
      />
    </div>
  );
}

export default Details;
