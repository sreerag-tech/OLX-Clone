import { createContext, useState, useEffect } from "react";
import { auth, db } from "../Firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const FirebaseContext = createContext(null);
export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData({ ...docSnap.data(), uid: currentUser.uid });
          } else {
            setUserData({
              uid: currentUser.uid,
              email: currentUser.email || "",
              name: currentUser.displayName || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email || "",
            name: currentUser.displayName || "",
          });
        }
      } else {
        setUserData(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ userData, setUserData, authReady }}>
      <AuthContext.Provider value={{ user, setUser, authReady }}>
        {children}
      </AuthContext.Provider>
    </FirebaseContext.Provider>
  );
}
