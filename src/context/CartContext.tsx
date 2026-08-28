import { createContext, useContext, useMemo, useState } from "react";
import { products } from "../data/catalog";
import type { CartItem, Product } from "../types";

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  subtotal: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem("mittilok-cart") ?? "[]") as CartItem[]);

  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("mittilok-cart", JSON.stringify(next));
  };

  const value = useMemo<CartContextValue>(() => ({
    items,
    addToCart(product, size = product.sizes[0]) {
      const existing = items.find((item) => item.productId === product.id && item.size === size);
      save(existing
        ? items.map((item) => (item === existing ? { ...item, quantity: item.quantity + 1 } : item))
        : [...items, { productId: product.id, quantity: 1, size }]);
    },
    removeFromCart(productId) {
      save(items.filter((item) => item.productId !== productId));
    },
    updateQuantity(productId, quantity) {
      save(items.map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item)));
    },
    subtotal: items.reduce((sum, item) => sum + (products.find((product) => product.id === item.productId)?.price ?? 0) * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
};
