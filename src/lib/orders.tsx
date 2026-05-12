import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type OrderStatus = "confirmed" | "preparing" | "ready" | "delivered";
export const ORDER_FLOW: OrderStatus[] = ["confirmed", "preparing", "ready", "delivered"];

export interface OrderLine {
  name: string;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  createdAt: number;
  total: number;
  status: OrderStatus;
  lines: OrderLine[];
  designImage?: string;
  customerNote?: string;
  eta?: string;
}

export interface AIDesign {
  id: string;
  createdAt: number;
  prompt: string;
  image: string;
}

interface Ctx {
  orders: Order[];
  designs: AIDesign[];
  createOrder: (input: Omit<Order, "id" | "createdAt" | "status">) => Order;
  advance: (id: string) => void;
  saveDesign: (d: Omit<AIDesign, "id" | "createdAt">) => AIDesign;
  removeDesign: (id: string) => void;
}

const OrdersCtx = createContext<Ctx | null>(null);
const ORDERS_KEY = "cc_orders";
const DESIGNS_KEY = "cc_ai_designs";

function rand(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [designs, setDesigns] = useState<AIDesign[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const o = localStorage.getItem(ORDERS_KEY);
      if (o) setOrders(JSON.parse(o));
      const d = localStorage.getItem(DESIGNS_KEY);
      if (d) setDesigns(JSON.parse(d));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs));
  }, [designs]);

  const createOrder: Ctx["createOrder"] = (input) => {
    const order: Order = {
      ...input,
      id: rand("CC"),
      createdAt: Date.now(),
      status: "confirmed",
    };
    setOrders((p) => [order, ...p]);
    // Auto-progress for demo: preparing after a short delay
    setTimeout(() => {
      setOrders((p) => p.map((x) => (x.id === order.id && x.status === "confirmed" ? { ...x, status: "preparing" } : x)));
    }, 4000);
    return order;
  };

  const advance: Ctx["advance"] = (id) => {
    setOrders((p) =>
      p.map((o) => {
        if (o.id !== id) return o;
        const i = ORDER_FLOW.indexOf(o.status);
        const next = ORDER_FLOW[Math.min(i + 1, ORDER_FLOW.length - 1)];
        return { ...o, status: next };
      }),
    );
  };

  const saveDesign: Ctx["saveDesign"] = (d) => {
    const design: AIDesign = { ...d, id: rand("AI"), createdAt: Date.now() };
    setDesigns((p) => [design, ...p].slice(0, 24));
    return design;
  };

  const removeDesign: Ctx["removeDesign"] = (id) => {
    setDesigns((p) => p.filter((d) => d.id !== id));
  };

  return (
    <OrdersCtx.Provider value={{ orders, designs, createOrder, advance, saveDesign, removeDesign }}>
      {children}
    </OrdersCtx.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersCtx);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
