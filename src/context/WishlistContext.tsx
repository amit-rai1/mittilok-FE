import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "../types";

interface WishlistContextValue {
  ids: string[];
  toggleWishlist: (product: Product) => void;
  has: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => JSON.parse(localStorage.getItem("mittilok-wishlist") ?? "[]") as string[]);
  const save = (next: string[]) => {
    setIds(next);
    localStorage.setItem("mittilok-wishlist", JSON.stringify(next));
  };
  const value = useMemo(() => ({
    ids,
    toggleWishlist(product: Product) {
      save(ids.includes(product.id) ? ids.filter((id) => id !== product.id) : [...ids, product.id]);
    },
    has(id: string) {
      return ids.includes(id);
    },
  }), [ids]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist must be used inside WishlistProvider");
  return value;
};
