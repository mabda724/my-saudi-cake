import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { PRODUCTS, type Product } from "@/lib/products";
import { toast } from "sonner";

const CATS = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "cakes", ar: "كعكات وتورتات", en: "Cakes & Tortes" },
  { id: "tarts", ar: "تارت", en: "Tarts" },
  { id: "mini", ar: "ميني وتوزيعات", en: "Mini & Favors" },
] as const;

export function ProductGrid() {
  const { lang, t } = useI18n();
  const { add } = useCart();
  const [cat, setCat] = useState<string>("all");

  const filtered = cat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat);

  const handleAdd = (p: Product) => {
    add({ id: p.id, name: p[lang].name, price: p.price, image: p.image });
    toast.success(lang === "ar" ? "تمت الإضافة للسلة" : "Added to cart");
  };

  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-24 scroll-mt-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-4xl font-black uppercase md:text-5xl">{t("drops_title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("drops_sub")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                cat === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {lang === "ar" ? c.ar : c.en}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((p) => (
          <article key={p.id} className="group cursor-pointer">
            <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-3xl bg-secondary">
              <img
                src={p.image}
                alt={p[lang].name}
                width={800}
                height={960}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={() => handleAdd(p)}
                className="absolute inset-x-3 bottom-3 translate-y-2 rounded-xl bg-background/95 py-3 text-xs font-bold uppercase tracking-widest opacity-0 backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100"
              >
                {t("add_cart")} — {p.price} SAR
              </button>
            </div>
            <h3 className="text-lg font-bold leading-tight">{p[lang].name}</h3>
            <p className="text-sm text-muted-foreground">{p[lang].sub}</p>
            <p className="mt-2 font-display font-black text-primary">{p.price} SAR</p>
          </article>
        ))}
      </div>
    </section>
  );
}
