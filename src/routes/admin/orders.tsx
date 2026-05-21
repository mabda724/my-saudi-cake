import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, OrderStatus } from "@/integrations/supabase/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

type Order = Tables<"orders">;
type OrderLine = Tables<"order_lines">;

const STATUS_FLOW: OrderStatus[] = ["confirmed", "preparing", "ready", "delivered"];

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: "مؤكد",
  preparing: "يتم التحضير",
  ready: "جاهز للاستلام",
  delivered: "تم التسليم",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
  preparing: "bg-amber-500/10 text-amber-600 border-amber-200",
  ready: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  delivered: "bg-primary/10 text-primary border-primary/20",
};

function OrdersPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 15_000,
  });

  const { data: detailLines = [] } = useQuery({
    queryKey: ["admin", "order_lines", detailOrder?.id],
    queryFn: async () => {
      if (!detailOrder) return [];
      const { data, error } = await supabase
        .from("order_lines")
        .select("*")
        .eq("order_id", detailOrder.id);
      if (error) throw error;
      return data;
    },
    enabled: !!detailOrder,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("تم تحديث حالة الطلب");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered =
    filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  const advanceStatus = (order: Order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      updateStatus.mutate({ id: order.id, status: STATUS_FLOW[idx + 1] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">متابعة الطلبات</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {STATUS_FLOW.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {STATUS_FLOW.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s === filterStatus ? "all" : s)}
              className={`rounded-xl border p-4 text-start transition-all ${
                filterStatus === s ? "ring-2 ring-primary" : "hover:shadow-sm"
              } ${STATUS_COLORS[s]}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm font-medium">{STATUS_LABELS[s]}</p>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          لا توجد طلبات
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">رقم الطلب</th>
                <th className="px-4 py-3 text-start font-medium">العميل</th>
                <th className="px-4 py-3 text-start font-medium">المجموع</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-end font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{order.customer_name || "بدون اسم"}</p>
                      {order.customer_phone && (
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {order.customer_phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {Number(order.total).toLocaleString("ar-SA")} ر.س
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={STATUS_COLORS[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setDetailOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status !== "delivered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => advanceStatus(order)}
                          disabled={updateStatus.isPending}
                        >
                          {updateStatus.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ChevronRight className="me-1 h-3 w-3" />
                              {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]]}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(v) => !v && setDetailOrder(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">رقم الطلب</p>
                  <p className="font-mono text-xs">{detailOrder.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">الحالة</p>
                  <Badge variant="outline" className={STATUS_COLORS[detailOrder.status]}>
                    {STATUS_LABELS[detailOrder.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">العميل</p>
                  <p>{detailOrder.customer_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">الهاتف</p>
                  <p dir="ltr">{detailOrder.customer_phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المجموع</p>
                  <p className="font-bold">
                    {Number(detailOrder.total).toLocaleString("ar-SA")} ر.س
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">التاريخ</p>
                  <p>
                    {new Date(detailOrder.created_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {detailOrder.customer_note && (
                <div>
                  <p className="text-sm text-muted-foreground">ملاحظة العميل</p>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-sm">
                    {detailOrder.customer_note}
                  </p>
                </div>
              )}

              {detailOrder.design_image && (
                <div>
                  <p className="text-sm text-muted-foreground">صورة التصميم</p>
                  <img
                    src={detailOrder.design_image}
                    alt="تصميم الطلب"
                    className="mt-1 max-h-48 rounded-lg object-contain"
                  />
                </div>
              )}

              {detailLines.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">عناصر الطلب</p>
                  <div className="space-y-2">
                    {detailLines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {line.image_url && (
                            <img
                              src={line.image_url}
                              alt={line.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span>
                            {line.name} × {line.quantity}
                          </span>
                        </div>
                        <span className="font-medium">
                          {Number(line.price).toLocaleString("ar-SA")} ر.س
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailOrder.status !== "delivered" && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => {
                      advanceFromDetail(detailOrder);
                    }}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    نقل إلى:{" "}
                    {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(detailOrder.status) + 1]]}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function advanceFromDetail(order: Order) {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      updateStatus.mutate(
        { id: order.id, status: STATUS_FLOW[idx + 1] },
        {
          onSuccess: () => {
            setDetailOrder((prev) => (prev ? { ...prev, status: STATUS_FLOW[idx + 1] } : null));
          },
        },
      );
    }
  }
}
