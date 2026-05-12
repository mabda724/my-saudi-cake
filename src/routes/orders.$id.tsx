import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { useOrders, ORDER_FLOW, type OrderStatus } from "@/lib/orders";
import { Check, ChefHat, ShoppingBag, Truck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetail,
  head: () => ({ meta: [{ title: "تفاصيل الطلب — كريزي كيك" }] }),
});

const ICONS: Record<OrderStatus, typeof Check> = {
  confirmed: Check,
  preparing: ChefHat,
  ready: ShoppingBag,
  delivered: Truck,
};

function OrderDetail() {
  const { id } = Route.useParams();
  const { lang, t } = useI18n();
  const { orders, advance } = useOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-black">
            {lang === "ar" ? "الطلب غير موجود" : "Order not found"}
          </h1>
          <Link to="/orders" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
            {t("orders_title")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const currentIdx = ORDER_FLOW.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {t("orders_title")}
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="aspect-square w-full overflow-hidden bg-secondary">
              {order.designImage ? (
                <img src={order.designImage} alt="final design" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  {lang === "ar" ? "بدون صورة تصميم" : "No design image"}
                </div>
              )}
            </div>
            <div className="border-t border-border p-4 text-xs uppercase tracking-widest text-muted-foreground">
              {t("final_design")}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("order")} #{order.id}</div>
            <h1 className="mt-1 font-display text-3xl font-black">{order.total} SAR</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
            </p>

            {/* Timeline */}
            <ol className="mt-8 space-y-5">
              {ORDER_FLOW.map((s, i) => {
                const reached = i <= currentIdx;
                const Icon = ICONS[s];
                return (
                  <li key={s} className="flex items-start gap-4">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                        reached
                          ? "border-saudi bg-saudi text-white"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className={`font-bold ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                        {t(`status_${s}` as const)}
                      </div>
                      {i === currentIdx && order.status !== "delivered" && (
                        <div className="text-xs text-saudi">{lang === "ar" ? "الحالة الحالية" : "Current status"}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {order.status !== "delivered" && (
              <button
                onClick={() => advance(order.id)}
                className="mt-6 w-full rounded-2xl border border-dashed border-border bg-background px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary"
              >
                {t("advance_status")}
              </button>
            )}

            {/* Lines */}
            <div className="mt-8">
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {lang === "ar" ? "العناصر" : "Items"}
              </div>
              <ul className="space-y-2 rounded-2xl border border-border bg-card p-3">
                {order.lines.map((l, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {l.image && <img src={l.image} alt={l.name} className="h-12 w-12 rounded-lg object-cover" />}
                    <div className="flex-1 text-sm">{l.name}</div>
                    <div className="text-sm font-bold">{l.price} SAR</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
