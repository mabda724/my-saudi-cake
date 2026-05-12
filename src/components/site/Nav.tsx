import { Link } from "@tanstack/react-router";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

export function Nav() {
  const { lang, setLang, t } = useI18n();
  const { count } = useCart();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tighter text-primary">
            {t("brand")}
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/" hash="shop" className="hover:text-primary transition-colors">{t("nav_shop")}</Link>
            <Link to="/builder" className="hover:text-primary transition-colors">{t("nav_builder")}</Link>
            <Link to="/ai-design" className="hover:text-primary transition-colors flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {t("nav_ai")}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted transition-colors"
            aria-label="Toggle language"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
          <Link
            to="/cart"
            className="relative rounded-full bg-card border border-border p-2.5 hover:shadow-md transition-all"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-1 -end-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-ink border-2 border-background">
              {count}
            </span>
          </Link>
          <Link
            to="/builder"
            className="hidden md:inline-flex rounded-full bg-ink px-5 py-2 text-sm font-bold text-background hover:bg-primary transition-colors"
          >
            {t("cta_design")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
