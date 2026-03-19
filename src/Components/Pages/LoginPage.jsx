import React, { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import { auth, db } from "../Firebase/Firebase.jsx";
import { AuthContext, FirebaseContext } from "../Context/Auth.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { user, authReady } = useContext(AuthContext);
  const { setUserData } = useContext(FirebaseContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [spinner, setSpinner] = useState(false);
  const [errors, setErrors] = useState({});

  const errorMessages = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many failed attempts. Try again later.",
    "auth/invalid-credential": "Incorrect email or password.",
  };

  const validate = () => {
    const err = {};
    if (!form.email.match(/^\S+@\S+\.\S+$/)) err.email = "Enter a valid email";
    if (form.password.length < 6)
      err.password = "Password must be at least 6 characters";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSpinner(true);
      const result = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const loggedInUser = result.user;

      // Load the user profile from Firestore so we have `name` for UI.
      const profileSnap = await getDoc(doc(db, "users", loggedInUser.uid));
      const profile = profileSnap.exists()
        ? profileSnap.data()
        : {
            uid: loggedInUser.uid,
            email: loggedInUser.email || "",
            name: loggedInUser.displayName || "",
          };

      setUserData(profile);
      localStorage.setItem("userData", JSON.stringify(profile));

      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      const message = errorMessages[error.code] || "Something went wrong.";
      toast.error(message);
    } finally {
      setSpinner(false);
    }
  };

  // If already logged in, don’t show the login page.
  if (!authReady) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <p className="text-sm text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold" style={{ color: "#002f34" }}>
          Login
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Login to post ads and manage your listings.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            {errors.email && (
              <div className="text-sm text-red-600 mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            {errors.password && (
              <div className="text-sm text-red-600 mt-1">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={spinner}
            className="w-full py-2 px-4 rounded text-white"
            style={{ backgroundColor: "#024f57ff", opacity: spinner ? 0.7 : 1 }}
          >
            {spinner ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

