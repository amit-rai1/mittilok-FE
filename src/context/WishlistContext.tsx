import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { WishlistDto, WishlistItemDto } from "../types";
import { useAuth } from "./AuthContext";

const WISHLIST_KEY = "mittilok-wishlist";

interface WishlistContextValue {
  items: WishlistItemDto[];
  ids: number[];
  loading: boolean;
  toggleWishlist: (product: { id: number; name?: string; slug?: string; thumbnail?: string | null; sellingPrice?: number; mrp?: number }) => Promise<void>;
  has: (id: number) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readLocal(): number[] {
  try {
    return (JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as Array<number | string>)
      .map(Number)
      .filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

function writeLocal(ids: number[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [localIds, setLocalIds] = useState<number[]>(() => readLocal());
  const [serverItems, setServerItems] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  const saveLocal = (next: number[]) => {
    setLocalIds(next);
    writeLocal(next);
  };

  const loadServer = useCallback(async () => {
    if (!isAuthenticated) {
      setServerItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api<WishlistDto>("/wishlist");
      setServerItems(data.items ?? []);
    } catch {
      setServerItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const mergeLocalIntoServer = useCallback(async () => {
    const pending = readLocal();
    if (!pending.length) {
      await loadServer();
      return;
    }
    setLoading(true);
    try {
      for (const productId of pending) {
        await api<WishlistDto>(`/wishlist/${productId}`, { method: "POST" });
      }
      writeLocal([]);
      setLocalIds([]);
      const data = await api<WishlistDto>("/wishlist");
      setServerItems(data.items ?? []);
    } catch {
      await loadServer();
    } finally {
      setLoading(false);
    }
  }, [loadServer]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) void mergeLocalIntoServer();
    else {
      setServerItems([]);
      setLocalIds(readLocal());
    }
  }, [authLoading, isAuthenticated, mergeLocalIntoServer]);

  const ids = isAuthenticated ? serverItems.map((item) => item.productId) : localIds;
  const items = isAuthenticated
    ? serverItems
    : localIds.map((id) => ({
      id,
      productId: id,
      productName: `Product #${id}`,
      slug: "",
      thumbnail: null,
      sellingPrice: 0,
      mrp: 0,
    }));

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    ids,
    loading,
    async toggleWishlist(product) {
      if (isAuthenticated) {
        const exists = ids.includes(product.id);
        const data = exists
          ? await api<WishlistDto>(`/wishlist/${product.id}`, { method: "DELETE" })
          : await api<WishlistDto>(`/wishlist/${product.id}`, { method: "POST" });
        setServerItems(data.items ?? []);
        return;
      }
      saveLocal(ids.includes(product.id) ? ids.filter((id) => id !== product.id) : [...ids, product.id]);
    },
    has(id) {
      return ids.includes(id);
    },
    refresh: loadServer,
  }), [items, ids, loading, isAuthenticated, loadServer]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist must be used inside WishlistProvider");
  return value;
}
