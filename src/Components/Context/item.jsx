import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { createContext, useEffect, useState } from "react";

export const Context = createContext(null);

const ItemContextProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState(null);

  useEffect(() => {
    setLoadingItems(true);
    setItemsError(null);

    const productsCollection = collection(db, "products");
    const unsubscribe = onSnapshot(
      productsCollection,
      (snapshot) => {
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(productList || []);
        setLoadingItems(false);
      },
      (error) => {
        console.error("Error fetching products realtime:", error);
        setItems([]);
        setItemsError(error);
        setLoadingItems(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Context.Provider value={{ items, setItems, loadingItems, itemsError }}>
      {children}
    </Context.Provider>
  );
};

export default ItemContextProvider;
