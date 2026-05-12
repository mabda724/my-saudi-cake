import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict.ar) => string;
  dir: "rtl" | "ltr";
}

const dict = {
  ar: {
    brand: "كريزي كيك",
    nav_shop: "المتجر",
    nav_builder: "صمم كعكتك",
    nav_ai: "تصميم بالذكاء",
    nav_story: "قصتنا",
    cta_design: "ابدأ التصميم",
    hero_kicker: "ثورة كعك جيل Z",
    hero_title_1: "كعكتك،",
    hero_title_2: "بخيالك.",
    hero_desc: "أول منصة سعودية تدمج الذكاء الاصطناعي والتصميم ثلاثي الأبعاد لتصنع حلوياتك الخاصة. صمم، عدل، واستلم فنك على باب البيت.",
    cta_ai: "صمم بالذكاء الاصطناعي",
    cta_browse: "تصفح الجاهز",
    drops_title: "تشكيلة الأسبوع",
    drops_sub: "أكثر التصاميم طلباً هذا الأسبوع",
    view_all: "عرض الكل",
    add_cart: "أضف للسلة",
    builder_title: "مختبر التصميم الذكي",
    builder_sub: "تحكم في كل طبقة، نكهة، وزخرفة",
    size: "الحجم",
    layers: "الطبقات",
    flavor: "النكهة",
    decor: "الزخرفة السعودية",
    ai_decor: "صور بالذكاء الاصطناعي",
    estimate: "السعر التقديري",
    open_ai: "افتح استوديو الذكاء",
    ai_studio: "استوديو الذكاء الاصطناعي",
    ai_studio_sub: "صف كعكتك بالعربية أو الإنجليزية، أو ارفع صورة مرجعية",
    your_prompt: "وصف الكعكة",
    upload_ref: "ارفع صورة مرجعية (اختياري)",
    generate: "ولّد التصميم",
    generating: "جاري التوليد…",
    download: "تنزيل",
    cart: "السلة",
    footer_made: "صُنع بحب في المملكة العربية السعودية",
    saudi_touch: "لمسة سعودية",
    gen_z: "جيل Z",
    real_3d: "3D واقعي",
    nav_orders: "تتبع الطلبات",
    orders_title: "تتبع طلباتك",
    orders_empty: "لا توجد طلبات بعد",
    order: "طلب",
    status_confirmed: "مؤكد",
    status_preparing: "يتم التحضير",
    status_ready: "جاهز للاستلام",
    status_delivered: "تم التسليم",
    final_design: "التصميم النهائي",
    advance_status: "تحديث الحالة (تجريبي)",
    saved_designs: "تصاميمك المحفوظة",
    no_designs: "لم يتم توليد أي تصميم بعد",
    use_design: "استخدم هذا التصميم",
    delete: "حذف",
  },
  en: {
    brand: "CRAZYCAKE+",
    nav_shop: "Shop",
    nav_builder: "Cake Builder",
    nav_ai: "AI Design",
    nav_story: "Our Story",
    cta_design: "Start Designing",
    hero_kicker: "Gen-Z Bakery Revolution",
    hero_title_1: "Your Cake,",
    hero_title_2: "Your Vision.",
    hero_desc: "The first Saudi platform blending AI and 3D design for your dream desserts. Design, edit, and get your art delivered to your door.",
    cta_ai: "Design with AI",
    cta_browse: "Browse Drops",
    drops_title: "Drop of the Week",
    drops_sub: "Most-loved designs right now",
    view_all: "View all",
    add_cart: "Add to Cart",
    builder_title: "Smart Design Lab",
    builder_sub: "Control every layer, flavor and ornament",
    size: "Size",
    layers: "Layers",
    flavor: "Flavor",
    decor: "Saudi Ornament",
    ai_decor: "AI Imagery",
    estimate: "Estimated Price",
    open_ai: "Open AI Studio",
    ai_studio: "AI Design Studio",
    ai_studio_sub: "Describe your cake in any language, or upload a reference image",
    your_prompt: "Describe your cake",
    upload_ref: "Upload reference image (optional)",
    generate: "Generate Design",
    generating: "Generating…",
    download: "Download",
    cart: "Cart",
    footer_made: "Crafted with love in Saudi Arabia",
    saudi_touch: "Saudi Touch",
    gen_z: "Gen Z",
    real_3d: "Real 3D",
    nav_orders: "Track Orders",
    orders_title: "Track Your Orders",
    orders_empty: "No orders yet",
    order: "Order",
    status_confirmed: "Confirmed",
    status_preparing: "Preparing",
    status_ready: "Ready",
    status_delivered: "Delivered",
    final_design: "Final Design",
    advance_status: "Advance status (demo)",
    saved_designs: "Your saved designs",
    no_designs: "No designs generated yet",
    use_design: "Use this design",
    delete: "Delete",
  },
} as const;

const LangCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (key: keyof typeof dict.ar) => dict[lang][key];
  return (
    <LangCtx.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
