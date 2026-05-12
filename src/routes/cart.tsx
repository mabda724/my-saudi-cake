import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useOrders } from "@/lib/orders";
import { Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "السلة — كريزي كيك" }] }),
});

function CartPage() {
  const { items, remove, total, clear } = useCart();
  const { lang, t } = useI18n();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const checkout = () => {
    if (items.length === 0) return;
    const order = createOrder({
      total,
      lines: items.map((i) => ({ name: i.name, price: i.price, image: i.image })),
      designImage: items.find((i) => i.image)?.image,
    });
    clear();
    toast.success(lang === "ar" ? "تم تأكيد طلبك!" : "Order confirmed!");
    navigate({ to: "/orders/$id", params: { id: order.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-4xl font-black md:text-5xl">{t("cart")}</h1>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {lang === "ar" ? "السلة فارغة" : "Your cart is empty"}
            </p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
              {t("cta_browse")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 divide-y divide-border rounded-3xl border border-border bg-card">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 p-4">
                  {it.image && (
                    <img src={it.image} alt={it.name} className="h-16 w-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">{it.name}</div>
                    <div className="text-sm text-muted-foreground">{it.price} SAR</div>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink p-6 text-background">
              <div>
                <div className="text-xs uppercase tracking-widest text-background/60">
                  {lang === "ar" ? "الإجمالي" : "Total"}
                </div>
                <div className="font-display text-4xl font-black text-accent">{total} SAR</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clear}
                  className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/5"
                >
                  {lang === "ar" ? "إفراغ" : "Clear"}
                </button>
                <button
                  onClick={() => toast.success(lang === "ar" ? "الدفع قريباً!" : "Checkout coming soon!")}
                  className="rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:brightness-110"
                >
                  {lang === "ar" ? "إتمام الطلب" : "Checkout"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
