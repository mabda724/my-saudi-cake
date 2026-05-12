import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import heroCake from "@/assets/hero-cake.jpg";

const SIZES = [
  { id: "s", ar: "صغير 6\"", en: "Small 6\"", price: 180 },
  { id: "m", ar: "وسط 8\"", en: "Medium 8\"", price: 260 },
  { id: "l", ar: "كبير 10\"", en: "Large 10\"", price: 360 },
] as const;

const FLAVORS = [
  { id: "saf", ar: "زعفران وفانيلا", en: "Saffron Vanilla", price: 0 },
  { id: "pist", ar: "فستق وهيل", en: "Pistachio Cardamom", price: 25 },
  { id: "date", ar: "تمر وشوكولاتة", en: "Date & Chocolate", price: 30 },
  { id: "rose", ar: "ورد جوري", en: "Damask Rose", price: 35 },
];

const TOPPINGS = [
  { id: "gold", ar: "ورق ذهب صالح للأكل", en: "Edible Gold Leaf", price: 45 },
  { id: "sadu", ar: "زخرفة سدو", en: "Sadu Pattern", price: 30 },
  { id: "naj", ar: "نقش نجدي", en: "Najdi Geometry", price: 35 },
  { id: "calig", ar: "خط عربي مخصص", en: "Custom Arabic Calligraphy", price: 50 },
  { id: "dates", ar: "حبات تمر فاخرة", en: "Premium Dates", price: 20 },
];

export function CakeBuilder() {
  const { lang, t } = useI18n();
  const { add } = useCart();
  const [size, setSize] = useState<(typeof SIZES)[number]["id"]>("m");
  const [layers, setLayers] = useState(2);
  const [flavor, setFlavor] = useState(FLAVORS[0].id);
  const [tops, setTops] = useState<string[]>(["gold"]);

  const price = useMemo(() => {
    const sz = SIZES.find((s) => s.id === size)!.price;
    const fl = FLAVORS.find((f) => f.id === flavor)!.price;
    const tp = tops.reduce((s, id) => s + (TOPPINGS.find((t) => t.id === id)?.price ?? 0), 0);
    const layerCost = (layers - 1) * 60;
    return sz + fl + tp + layerCost;
  }, [size, layers, flavor, tops]);

  const toggleTop = (id: string) =>
    setTops((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onAdd = () => {
    const flavorName = FLAVORS.find((f) => f.id === flavor)![lang === "ar" ? "ar" : "en"];
    add({
      id: `custom-${size}`,
      name: `${lang === "ar" ? "كعكة مخصصة" : "Custom Cake"} — ${flavorName}`,
      price,
      image: heroCake,
    });
    toast.success(lang === "ar" ? "تمت إضافة كعكتك المخصصة" : "Custom cake added");
  };

  return (
    <section className="bg-ink text-background px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-black md:text-5xl">{t("builder_title")}</h2>
          <p className="mt-3 text-background/60">{t("builder_sub")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Controls */}
          <div className="space-y-5 lg:col-span-1">
            <Group label={t("size")}>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`rounded-xl border py-3 text-xs font-bold transition-colors ${
                      size === s.id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/15 hover:bg-white/5"
                    }`}
                  >
                    {lang === "ar" ? s.ar : s.en}
                  </button>
                ))}
              </div>
            </Group>

            <Group label={t("layers")}>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={layers}
                  onChange={(e) => setLayers(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="w-10 text-end font-display text-2xl font-black text-accent">{layers}</span>
              </div>
            </Group>

            <Group label={t("flavor")}>
              <div className="space-y-2">
                {FLAVORS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFlavor(f.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start text-sm transition-colors ${
                      flavor === f.id
                        ? "border-primary bg-primary/10"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <span>{lang === "ar" ? f.ar : f.en}</span>
                    {f.price > 0 && <span className="text-xs text-background/50">+{f.price} SAR</span>}
                  </button>
                ))}
              </div>
            </Group>

            <Group label={t("decor")}>
              <div className="space-y-2">
                {TOPPINGS.map((tp) => {
                  const active = tops.includes(tp.id);
                  return (
                    <button
                      key={tp.id}
                      onClick={() => toggleTop(tp.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start text-sm transition-colors ${
                        active
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <span>{lang === "ar" ? tp.ar : tp.en}</span>
                      <span className="text-xs opacity-70">+{tp.price} SAR</span>
                    </button>
                  );
                })}
              </div>
            </Group>
          </div>

          {/* Preview + price */}
          <div className="lg:col-span-2">
            <div className="relative h-[420px] overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/0 ring-1 ring-white/10 md:h-[520px]">
              <img
                src={heroCake}
                alt="Custom cake preview"
                className="h-full w-full object-cover opacity-90"
                style={{
                  transform: `scale(${0.85 + layers * 0.04})`,
                  transition: "transform 0.4s ease",
                }}
              />
              <div className="absolute inset-x-0 top-0 flex justify-between p-5">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                  Live Preview
                </span>
                <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-ink">
                  3D Render
                </span>
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent">
                  {lang === "ar" ? "اختياراتك" : "Your selection"}
                </p>
                <p className="text-sm">
                  {SIZES.find((s) => s.id === size)![lang === "ar" ? "ar" : "en"]} ·{" "}
                  {layers} {lang === "ar" ? "طبقات" : "layers"} ·{" "}
                  {FLAVORS.find((f) => f.id === flavor)![lang === "ar" ? "ar" : "en"]}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-background/60">{t("estimate")}</div>
                <div className="font-display text-4xl font-black text-accent">{price} <span className="text-lg">SAR</span></div>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/ai-design"
                  className="inline-flex items-center gap-2 rounded-2xl border border-accent/40 bg-transparent px-5 py-3 text-sm font-bold text-accent hover:bg-accent/10"
                >
                  <Sparkles className="h-4 w-4" /> {t("open_ai")}
                </Link>
                <button
                  onClick={onAdd}
                  className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:brightness-110"
                >
                  {t("add_cart")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{label}</div>
      {children}
    </div>
  );
}
