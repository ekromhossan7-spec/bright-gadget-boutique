import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  color?: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("techllect-cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("techllect-cart", JSON.stringify(items));
  }, [items]);

  const addItem = async (item: Omit<CartItem, "quantity">, quantity = 1) => {
    // Check stock before adding
    const { data: product } = await supabase
      .from("products")
      .select("in_stock, stock_quantity")
      .eq("id", item.id)
      .single();

    if (product) {
      const inStock = product.in_stock !== false && (product.stock_quantity === null || product.stock_quantity > 0);
      if (!inStock) {
        toast.error("This product is out of stock");
        return;
      }
      // Check if requested quantity exceeds stock
      const currentInCart = items.find((i) => i.id === item.id)?.quantity || 0;
      if (product.stock_quantity !== null && (currentInCart + quantity) > product.stock_quantity) {
        toast.error(`Only ${product.stock_quantity} items available in stock`);
        return;
      }
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.color === item.color && i.size === item.size);
      if (existing) {
        return prev.map((i) => (i.id === item.id && i.color === item.color && i.size === item.size) ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
