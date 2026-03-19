import { useState, useContext } from "react";
import { Modal, ModalBody } from "flowbite-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../Firebase/Firebase.jsx";
import { FirebaseContext, AuthContext } from "../Context/Auth.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { doc, getDoc } from "firebase/firestore";

import close from "../../Assets/close.svg";

const errorMessages = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many failed attempts. Try again later.",
  "auth/invalid-credential": "Incorrect email or password.",
};

const Login = ({ toggleModal, status, toggleModalSignUp }) => {
  const [user, setUserInput] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [spinner, setSpinner] = useState(false);

  const { setUserData } = useContext(FirebaseContext);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const err = {};
    if (!user.email.match(/^\S+@\S+\.\S+$/)) err.email = "Enter a valid email";
    if (user.password.length < 6)
      err.password = "Password must be at least 6 characters";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setUserInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSpinner(true);
      const result = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const loggedInUser = result.user;

      if (loggedInUser) {
        setUser(loggedInUser);
        // Load the profile doc so we have `name` for Navbar + Sell.
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
        toggleModal();
      }
    } catch (error) {
      const errorCode = error.code;
      const message =
        errorMessages[errorCode] || "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setSpinner(false);
    }
  };

  return (
    <Modal
      theme={{
        content: {
          base: "relative w-full p-4 md:h-auto",
          inner:
            "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700",
        },
      }}
      onClick={toggleModal}
      className="bg-black rounded-none"
      show={status}
      size="md"
      popup
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="p-6 pl-2 pr-2 bg-white"
      >
        <img
          onClick={toggleModal}
          className="w-6 absolute z-10 top-4 right-4 cursor-pointer"
          src={close}
          alt="Close"
        />
        <div className="flex flex-col items-center justify-center pb-5">
          <p
            style={{ color: "#002f34" }}
            className="w-60 sm:w-72 text-center font-semibold"
          >
            Help us become one of the safest places to buy and sell.
          </p>
        </div>
      </div>

      <ModalBody
        className="bg-white h-auto p-6 pt-0 rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {spinner ? (
          <div className="flex justify-center items-center h-40">
            <BeatLoader color="#4d7068" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={user.email}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email}</span>
            )}

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password}</span>
            )}

            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700"
            >
              Login
            </button>

            <div className="flex items-center justify-center rounded-md border-2 border-solid border-gray-300 p-5 relative h-8 opacity-60 cursor-not-allowed">
              <p className="text-sm text-gray-500">Continue with Google (coming soon)</p>
            </div>

            <div className="pt-5 flex flex-col items-center justify-center">
              <p className="font-semibold text-sm">OR</p>
              <button
                type="button"
                onClick={toggleModalSignUp}
                className="flex justify-center text-sm font-bold underline pt-3 text-teal-700 hover:text-teal-900"
              >
                SIGNUP
              </button>
            </div>

            <p className="text-xs text-center pt-4 text-gray-600">
              By continuing, you accept the OLX Terms & Privacy Policy.
            </p>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
};

export default Login;
