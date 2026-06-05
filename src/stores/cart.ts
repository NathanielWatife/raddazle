import { create } from "zustand";
import api from "@/lib/api";
import type { Product } from "@/lib/services";

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  fetched: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  fetched: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/cart");
      set({ cart: data.cart, loading: false, fetched: true });
    } catch {
      set({ cart: null, loading: false, fetched: true });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const { data } = await api.post("/cart", { productId, quantity });
    set({ cart: data.cart });
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    set({ cart: data.cart });
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    set({ cart: data.cart });
  },

  clearCart: async () => {
    await api.delete("/cart");
    set({ cart: null });
  },

  reset: () => set({ cart: null, fetched: false }),

  count: () => {
    const c = get().cart;
    if (!c?.items) return 0;
    return c.items.reduce((n, i) => n + i.quantity, 0);
  },

  subtotal: () => {
    const c = get().cart;
    if (!c?.items) return 0;
    return c.items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  },
}));
