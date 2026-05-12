import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { useOrders, ORDER_FLOW, type OrderStatus } from "@/lib/orders";
import { Package } from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "تتبع الطلبات — كريزي كيك | Track Orders" },
      { name: "description", content: "تتبع حالة طلباتك من كريزي كيك في الوقت الحقيقي." },
    ],
  }),
});

function OrdersPage() {
  const { lang, t } = useI18n();
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-4xl font-black md:text-5xl">{t("orders_title")}</h1>
        <p className="mt-2 text-muted-foreground">{lang === "ar" ? "كل طلباتك في مكان واحد" : "All your orders in one place"}</p>

        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-16 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{t("orders_empty")}</p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
              {t("cta_browse")}
            </Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="block overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-glow"
                >
                  <div className="flex items-stretch gap-4">
                    <div className="grid h-28 w-28 shrink-0 place-items-center bg-secondary">
                      {o.designImage ? (
                        <img src={o.designImage} alt="design" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-4 p-4">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("order")} #{o.id}</div>
                        <div className="mt-1 font-display text-xl font-black">{o.total} SAR</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(o.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
                        </div>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useI18n();
  const tone: Record<OrderStatus, string> = {
    confirmed: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    preparing: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    ready: "bg-violet-500/15 text-violet-600 border-violet-500/30",
    delivered: "bg-saudi/15 text-saudi border-saudi/30",
  };
  const labelKey = `status_${status}` as const;
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${tone[status]}`}>
      {t(labelKey)}
    </span>
  );
}
