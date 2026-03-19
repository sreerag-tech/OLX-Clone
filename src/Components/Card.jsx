import React from "react";
import { Link } from "react-router-dom";
import Favorite from "../Assets/favorite.svg";

function Card({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="w-full py-10">
        <h1 style={{ color: "#002f34" }} className="text-3xl font-bold">
          Fresh recommendations
        </h1>
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-lg font-semibold" style={{ color: "#002f34" }}>
            No items listed yet
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Click <span className="font-semibold">SELL</span> to post your first item.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: "#002f34" }} className="text-3xl font-bold">
        Fresh recommendations
      </h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pt-5">
        {items.map((item) => {
          return (
            <Link
              to={`/details/${item.id}`}
              state={{ item }}
              key={item.id}
              className="relative w-full h-72 rounded-md border-solid bg-gray-50 overflow-hidden cursor-pointer"
              style={{ borderWidth: "1px", borderColor: "lightgray" }}
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={item.image || item.imageUrl || "/placeholder-image.jpg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>

              <div className="details p-1 pl-4 pr-4">
                <h1 style={{ color: "#002f34" }} className="font-bold text-xl">
                  ₹ {item.price}
                </h1>
                <p className="text-sm pt-2">{item.category}</p>
                <p className="pt-2">{item.title}</p>
              </div>

              <div className="absolute flex justify-center items-center p-2 bg-white rounded-full top-3 right-3 cursor-pointer">
                <img className="w-5" src={Favorite} alt="" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Card;
