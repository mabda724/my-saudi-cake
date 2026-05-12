import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import heroCake from "@/assets/hero-cake.jpg";

export function Hero() {
  const { t, dir, lang } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden sadu-pattern">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-12 pb-24 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="z-10">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero_kicker")}
          </span>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]">
            {t("hero_title_1")}
            <br />
            <span className="text-primary">{t("hero_title_2")}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t("hero_desc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/ai-design"
              className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              {t("cta_ai")}
              <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
            <a
              href="#shop"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-background px-8 py-4 font-bold text-ink transition-colors hover:bg-ink hover:text-background"
            >
              {t("cta_browse")}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {[t("saudi_touch"), t("gen_z"), t("real_3d")].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-accent/30 blur-3xl opacity-60" />
          <div className="relative z-10 overflow-hidden rounded-[2.5rem] border-8 border-background/70 shadow-2xl">
            <img
              src={heroCake}
              alt={lang === "ar" ? "كعكة كريزي كيك بنكهة الزعفران مع زخرفة سعودية" : "CrazyCake hero saffron cake with Saudi ornament"}
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 start-6 z-20 flex items-center gap-3 rounded-2xl border border-border bg-background/90 backdrop-blur p-4 shadow-xl animate-float">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">AI</div>
            <div className="text-start">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "مولّد بـ" : "Powered by"}</div>
              <div className="text-sm font-bold">Nano Banana</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
