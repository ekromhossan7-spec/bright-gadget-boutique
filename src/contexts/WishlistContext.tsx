import React, { createContext, useContext, useState, useEffect } from "react";

interface WishlistContextType {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<string[]>(() => {
    const stored = localStorage.getItem("techllect-wishlist");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("techllect-wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = (id: string) => setItems((prev) => prev.includes(id) ? prev : [...prev, id]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i !== id));
  const toggleItem = (id: string) => items.includes(id) ? removeItem(id) : addItem(id);
  const isInWishlist = (id: string) => items.includes(id);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isInWishlist, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
