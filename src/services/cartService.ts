import type { CartItem } from "../types";

export const cartService = {
  async saveCart(items: CartItem[]) {
    localStorage.setItem("mittilok-cart", JSON.stringify(items));
    return items;
  },
  async loadCart(): Promise<CartItem[]> {
    return JSON.parse(localStorage.getItem("mittilok-cart") ?? "[]") as CartItem[];
  },
};
