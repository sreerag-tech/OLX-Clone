import React, { useContext, useState, } from 'react'
import search from '../../Assets/search1.svg'
import arrow from '../../Assets/arrow-down.svg'
import { FirebaseContext, AuthContext } from '../Context/Auth'
import { signOut } from 'firebase/auth'
import { auth } from '../Firebase/Firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';


import './Navbar.css'

function Navbar({ toggleModal, toggleModalSell }) {


    const { userData, setUserData } = useContext(FirebaseContext)
    const { setUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const [showLogout, setShowLogout] = useState(false)


    
    const handleUserClick = () => {
        if (userData) {
            setShowLogout(!showLogout)
        } else {
            if (typeof toggleModal === "function") {
                toggleModal();
            } else {
                navigate("/login");
            }
        }
    }
    

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                // alert("looged out")
                console.log("User signed out");
                localStorage.removeItem("userData");
                setUser(null);
                setUserData(null);
                setShowLogout(false);
                      toast.success("Logged out successfully");
                navigate("/");
            })
            .catch((error) => {
                console.error("Logout error:", error);
                toast.error("Logout failed ");

            });
            
    }

    return (
        <div>
<nav className="relative z-50 w-full p-2 pl-3 pr-10 shadow-md bg-slate-100 border-b-4 border-solid border-b-white flex items-center">
                <div className="font-extrabold text-xl tracking-wide" style={{ color: '#002f34' }}>
                  OLX
                </div>
                <div className='relative location-search  ml-5'>
                    <img src={search} alt="" className='absolute top-4 left-2 w-5' />
                    <input placeholder='Search city, area, or locality...' className='w-[50px] sm:w-[150px] md:w-[250] lg:w-[270px] p-3 pl-8 pr-8 border-black border-solid border-2 rounded-md placeholder:text-ellipsis focus:outline-none focus:border-teal-300' type="text" />
                    <img src={arrow} alt="" className='absolute top-4 right-3 w-5 cursor-pointer' />
                </div>

                <div className="ml-5 mr-2 relative w-full main-search">
                    <input placeholder='Find Cars, Mobile Phones, and More...' className='w-full p-3 border-black border-solid border-2 rounded-md placeholder:text-ellipsis focus:outline-none focus:border-teal-300' type="text" />
                    <div style={{ backgroundColor: '#002f34' }} className="flex justify-center items-center absolute top-0 right-0 h-full rounded-e-md w-12">
                    </div>
                </div>

                <div className="mx-1 sm:ml-5 sm:mr-5 relative lang">
                    <p className="font-bold mr-3">English</p>
                    <img src={arrow} alt="" className='w-5 cursor-pointer' />
                </div>

                <div className="relative">
                    <button onClick={handleUserClick}>
                        {userData ? `Welcome, ${userData.name || userData.email || "User"}` : 'Login'}
                    </button>

                    {userData && showLogout && (
                        <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                            <button 
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                <button
                  onClick={() => {
                    if (typeof toggleModalSell === "function") {
                      toggleModalSell();
                    } else {
                      navigate("/post-ad");
                    }
                  }}
                  className="mx-1 sm:ml-5 sm:mr-5 px-4 py-2 rounded-full border-2 border-[#002f34] font-bold"
                  style={{ color: '#002f34' }}
                >
                  SELL
                </button>
            </nav>

            {showLogout && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowLogout(false)}
                ></div>
            )}
        </div>
    )
}

export default Navbar