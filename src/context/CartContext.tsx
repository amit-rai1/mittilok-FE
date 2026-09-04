import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { CartDto, CartItemDto, LocalCartItem } from "../types";
import { useAuth } from "./AuthContext";

const CART_KEY = "mittilok-cart";

export type AddCartInput = {
  productId: number;
  variantId?: number | null;
  quantity?: number;
  productName: string;
  slug?: string;
  imageUrl?: string | null;
  unitPrice: number;
  mrp: number;
  variantName?: string | null;
};

interface CartContextValue {
  items: (CartItemDto | LocalCartItem & { id?: number; lineTotal?: number; availableStock?: number; sku?: string })[];
  loading: boolean;
  addToCart: (input: AddCartInput) => Promise<void>;
  removeFromCart: (item: { id?: number; productId: number; variantId?: number | null }) => Promise<void>;
  updateQuantity: (item: { id?: number; productId: number; variantId?: number | null }, quantity: number) => Promise<void>;
  clearLocal: () => void;
  refresh: () => Promise<void>;
  subtotal: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function readLocal(): LocalCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as LocalCartItem[];
  } catch {
    return [];
  }
}

function writeLocal(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function sameLine(a: { productId: number; variantId?: number | null }, b: { productId: number; variantId?: number | null }) {
  return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [localItems, setLocalItems] = useState<LocalCartItem[]>(() => readLocal());
  const [serverCart, setServerCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(false);

  const saveLocal = (next: LocalCartItem[]) => {
    setLocalItems(next);
    writeLocal(next);
  };

  const loadServer = useCallback(async () => {
    if (!isAuthenticated) {
      setServerCart(null);
      return;
    }
    setLoading(true);
    try {
      const cart = await api<CartDto>("/cart");
      setServerCart(cart);
    } catch {
      setServerCart(null);
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
      const cart = await api<CartDto>("/cart/merge", {
        method: "POST",
        body: {
          items: pending.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
          })),
        },
      });
      writeLocal([]);
      setLocalItems([]);
      setServerCart(cart);
    } catch {
      try {
        for (const item of pending) {
          await api<CartDto>("/cart/items", {
            method: "POST",
            body: {
              productId: item.productId,
              variantId: item.variantId ?? null,
              quantity: item.quantity,
            },
          });
        }
        writeLocal([]);
        setLocalItems([]);
        await loadServer();
      } catch {
        await loadServer();
      }
    } finally {
      setLoading(false);
    }
  }, [loadServer]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      void mergeLocalIntoServer();
    } else {
      setServerCart(null);
      setLocalItems(readLocal());
    }
  }, [authLoading, isAuthenticated, mergeLocalIntoServer]);

  const items = isAuthenticated ? (serverCart?.items ?? []) : localItems;

  const value = useMemo<CartContextValue>(() => ({
    items,
    loading,
    async addToCart(input) {
      const qty = input.quantity ?? 1;
      if (isAuthenticated) {
        const cart = await api<CartDto>("/cart/items", {
          method: "POST",
          body: {
            productId: input.productId,
            variantId: input.variantId ?? null,
            quantity: qty,
          },
        });
        setServerCart(cart);
        return;
      }
      const existing = localItems.find((item) => sameLine(item, input));
      saveLocal(existing
        ? localItems.map((item) => (item === existing ? { ...item, quantity: item.quantity + qty } : item))
        : [...localItems, {
          productId: input.productId,
          variantId: input.variantId ?? null,
          quantity: qty,
          productName: input.productName,
          slug: input.slug,
          imageUrl: input.imageUrl,
          unitPrice: input.unitPrice,
          mrp: input.mrp,
          variantName: input.variantName,
        }]);
    },
    async removeFromCart(item) {
      if (isAuthenticated && item.id != null) {
        const cart = await api<CartDto>(`/cart/items/${item.id}`, { method: "DELETE" });
        setServerCart(cart);
        return;
      }
      saveLocal(localItems.filter((row) => !sameLine(row, item)));
    },
    async updateQuantity(item, quantity) {
      const nextQty = Math.max(1, quantity);
      if (isAuthenticated && item.id != null) {
        const cart = await api<CartDto>(`/cart/items/${item.id}`, {
          method: "PUT",
          body: { quantity: nextQty },
        });
        setServerCart(cart);
        return;
      }
      saveLocal(localItems.map((row) => (sameLine(row, item) ? { ...row, quantity: nextQty } : row)));
    },
    clearLocal() {
      saveLocal([]);
    },
    refresh: loadServer,
    subtotal: isAuthenticated
      ? (serverCart?.subtotal ?? 0)
      : localItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    count: isAuthenticated
      ? (serverCart?.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0))
      : localItems.reduce((sum, item) => sum + item.quantity, 0),
  }), [items, loading, isAuthenticated, localItems, serverCart, loadServer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
