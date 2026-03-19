import { useState, useContext } from 'react';
import { Modal, ModalBody } from 'flowbite-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../Firebase/Firebase.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseContext } from '../Context/Auth.jsx';
import close from '../../Assets/close.svg';
import Input from '../Input/Input.jsx';

const errorMessages = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
};

const Signup = ({ toggleModalSignUp, status }) => {
  const [user, setUser] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [spinner, setSpinner] = useState(false);
  const { setUserData } = useContext(FirebaseContext);
  const navigate = useNavigate();

  const validate = () => {
    const err = {};
    if (!user.name.trim()) {
      err.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(user.name.trim())) {
      err.name = 'Enter a valid name (letters only, min 2 characters)';
    }
    if (!user.email.trim()) {
      err.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      err.email = 'Enter a valid email address';
    }
    if (!user.password) {
      err.password = 'Password is required';
    } else if (user.password.length < 6) {
      err.password = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(user.password)) {
      err.password = 'Include at least one uppercase letter';
    } else if (!/[a-z]/.test(user.password)) {
      err.password = 'Include at least one lowercase letter';
    } else if (!/[0-9]/.test(user.password)) {
      err.password = 'Include at least one number';
    } else if (!/[^A-Za-z0-9]/.test(user.password)) {
      err.password = 'Include at least one special character';
    }
    if (!user.confirmPassword) {
      err.confirmPassword = 'Please confirm your password';
    } else if (user.confirmPassword !== user.password) {
      err.confirmPassword = 'Passwords do not match';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSpinner(true);
      const result = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const signedUpUser = result.user;

      await setDoc(doc(db, "users", signedUpUser.uid), {
        uid: signedUpUser.uid,
        name: user.name,
        email: user.email,
        createdAt: new Date(),
      });

      setUserData({
        uid: signedUpUser.uid,
        name: user.name,
        email: user.email,
      });

      toast.success(`${user.name} successfully SignedUp`);
      toggleModalSignUp();
      setUser({ name: '', email: '', password: '', confirmPassword: '' });
      navigate('/');
    } catch (error) {
      const errorCode = error.code;
      const message = errorMessages[errorCode] || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setSpinner(false);
    }
  };

  return (
    <Modal
      onClick={toggleModalSignUp}
      show={status}
      className="bg-black"
      position="center"
      size="md"
      popup={true}
      theme={{
        content: {
          base: 'relative w-full p-4 md:h-auto',
          inner: 'relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700',
        },
      }}
    >
      <div onClick={(e) => e.stopPropagation()} className="p-6 pl-2 pr-2 bg-white">
        <img
          onClick={toggleModalSignUp}
          className="w-6 absolute z-10 top-4 right-4 cursor-pointer"
          src={close}
          alt="Close"
        />
        <div className="flex flex-col items-center justify-center pb-5">
          <p style={{ color: '#002f34' }} className="w-60 sm:w-72 text-center font-semibold">
            Join us and start buying & selling securely.
          </p>
        </div>
      </div>

      <ModalBody className="bg-white h-auto p-6 pt-0 rounded-none" onClick={(e) => e.stopPropagation()}>
        {spinner ? (
          <div className="flex justify-center items-center h-40">
            <span>Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input name="name" value={user.name} onChange={handleChange} placeholder="Enter your name" />
            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}

            <Input name="email" type="email" value={user.email} onChange={handleChange} placeholder="Enter your email" />
            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}

            <Input name="password" type="password" value={user.password} onChange={handleChange} placeholder="Enter your password" />
            {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}

            <Input name="confirmPassword" type="password" value={user.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}

            <button type="submit" className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700">
              Sign up
            </button>

            <p className="text-xs text-center pt-4 text-gray-600">
              By signing up, you accept the OLX Terms & Privacy Policy.
            </p>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
};

export default Signup;
