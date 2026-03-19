import React from "react";
import Home from "./Components/Pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import Details from "./Components/Details/Details";
import LoginPage from "./Components/Pages/LoginPage";
import PostAdPage from "./Components/Pages/PostAdPage";
import MyAdsPage from "./Components/Pages/MyAdsPage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/post-ad" element={<PostAdPage />} />
        <Route path="/my-ads" element={<MyAdsPage />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
};

export default App;
