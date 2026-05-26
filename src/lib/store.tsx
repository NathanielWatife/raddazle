import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types/product";

interface StoreCtx {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (p: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (p: Product) => void;
  inWishlist: (id: string) => boolean;
  cartTotal: number;
  cartCount: number;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const c = localStorage.getItem("souvenir-cart");
      const w = localStorage.getItem("souvenir-wishlist");
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("souvenir-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("souvenir-wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const addToCart = useCallback((p: Product, qty = 1) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === p.id);
      if (ex) return prev.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i));
      return [...prev, { product: p, quantity: qty }];
    });
  }, []);
  const removeFromCart = useCallback((id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id)), []);
  const updateQty = useCallback((id: string, qty: number) => setCart((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i))), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((p: Product) => setWishlist((prev) => (prev.find((i) => i.id === p.id) ? prev.filter((i) => i.id !== p.id) : [...prev, p])), []);
  const inWishlist = useCallback((id: string) => wishlist.some((i) => i.id === id), [wishlist]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.product.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  return <Ctx.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, inWishlist, cartTotal, cartCount }}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
};
