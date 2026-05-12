import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface Ctx {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  count: number;
  total: number;
  clear: () => void;
}

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = typeof window !== "undefined" && localStorage.getItem("cart");
    if (raw) try { setItems(JSON.parse(raw)); } catch { /* noop */ }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (item: CartItem) => setItems((prev) => [...prev, { ...item, id: `${item.id}-${Date.now()}` }]);
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const count = items.length;
  const total = items.reduce((s, i) => s + i.price, 0);

  return <CartCtx.Provider value={{ items, add, remove, count, total, clear }}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
