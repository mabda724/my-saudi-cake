import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, Package, ShoppingCart, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: catCount = 0 } = useQuery({
    queryKey: ["admin", "categories", "count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: prodCount = 0 } = useQuery({
    queryKey: ["admin", "products", "count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: orderCount = 0 } = useQuery({
    queryKey: ["admin", "orders", "count"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: revenue = 0 } = useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("total").eq("status", "delivered");
      return data?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
    },
  });

  const cards = [
    {
      label: "الأصناف",
      value: catCount,
      icon: FolderTree,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "المنتجات",
      value: prodCount,
      icon: Package,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "الطلبات",
      value: orderCount,
      icon: ShoppingCart,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "الإيرادات (ر.س)",
      value: revenue.toLocaleString("ar-SA"),
      icon: TrendingUp,
      color: "text-primary bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">لوحة التحكم</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
