import { useState, useRef } from "react";
import { Sparkles, Upload, Download, Loader2, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useOrders } from "@/lib/orders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PRESETS_AR = [
  "كعكة عيد ميلاد بنقش سدو ذهبي وألوان نيون",
  "تورتة عرس بألوان السعودية مع نخلة من الذهب",
  "كعكة بالخط العربي 'مبروك' وحلى الزعفران",
];
const PRESETS_EN = [
  "Birthday cake with gold sadu pattern and neon palette",
  "Wedding torte in Saudi colors with golden palm tree",
  "Cake with Arabic 'Mabrook' calligraphy and saffron sweets",
];

export function AIDesigner() {
  const { lang, t } = useI18n();
  const { add } = useCart();
  const { designs, saveDesign, removeDesign } = useOrders();
  const [prompt, setPrompt] = useState("");
  const [refImage, setRefImage] = useState<string | undefined>();
  const [result, setResult] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const presets = lang === "ar" ? PRESETS_AR : PRESETS_EN;

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > 5_000_000) {
      toast.error(lang === "ar" ? "الصورة كبيرة جداً (٥ ميجا حد أقصى)" : "Image too large (5MB max)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  const generate = async () => {
    if (prompt.trim().length < 3) {
      toast.error(lang === "ar" ? "اكتب وصف الكعكة أولاً" : "Please describe your cake");
      return;
    }
    setLoading(true);
    setResult(undefined);
    try {
      const { data, error } = await supabase.functions.invoke("ai-cake-design", {
        body: { prompt, imageUrl: refImage, lang },
      });
      if (error) throw error;
      const payload = data as any;
      if (payload?.error && !payload?.image) throw new Error(payload.error);
      if (!payload?.image) throw new Error(lang === "ar" ? "لم يتم توليد صورة" : "No image returned");
      setResult(payload.image);
      saveDesign({ prompt, image: payload.image });
      toast.success(lang === "ar" ? "تم التوليد وتم حفظ التصميم!" : "Generated & saved!");
    } catch (e: any) {
      toast.error(e?.message ?? (lang === "ar" ? "فشل التوليد" : "Generation failed"));
    } finally {
      setLoading(false);
    }
  };

  const orderIt = () => {
    if (!result) return;
    add({
      id: "ai-custom",
      name: lang === "ar" ? "كعكة مصممة بالذكاء الاصطناعي" : "AI-designed cake",
      price: 320,
      image: result,
    });
    toast.success(lang === "ar" ? "أُضيفت للسلة بسعر تقديري ٣٢٠ ريال" : "Added at estimated 320 SAR");
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Nano Banana
        </span>
        <h2 className="mt-4 font-display text-4xl font-black md:text-6xl">{t("ai_studio")}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("ai_studio_sub")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-5 rounded-3xl border border-border bg-card p-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("your_prompt")}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder={lang === "ar" ? "مثال: كعكة عيد ميلاد بنقش سدو ذهبي وألوان نيون…" : "e.g. Birthday cake with gold sadu pattern…"}
              className="w-full resize-none rounded-2xl border border-border bg-background p-4 text-base outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-primary"
              >
                {p}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("upload_ref")}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm hover:border-primary"
              >
                <Upload className="h-4 w-4" /> {lang === "ar" ? "اختر صورة" : "Choose image"}
              </button>
              {refImage && (
                <div className="flex items-center gap-2">
                  <img src={refImage} alt="ref" className="h-12 w-12 rounded-lg object-cover" />
                  <button onClick={() => setRefImage(undefined)} className="text-xs text-muted-foreground underline">
                    {lang === "ar" ? "إزالة" : "Remove"}
                  </button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t("generating")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> {t("generate")}
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary to-background p-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
            {result ? (
              <img src={result} alt="Generated cake" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <Sparkles className="h-10 w-10 text-accent/60" />
                <p className="text-sm">{lang === "ar" ? "ستظهر كعكتك هنا" : "Your cake will appear here"}</p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
          </div>
          {result && (
            <div className="mt-4 flex gap-3 px-1">
              <a
                href={result}
                download="crazycake-ai-design.png"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold hover:bg-muted"
              >
                <Download className="h-4 w-4" /> {t("download")}
              </a>
              <button
                onClick={orderIt}
                className="flex-1 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-background hover:bg-primary"
              >
                {t("add_cart")} · 320 SAR
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
