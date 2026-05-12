import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-secondary/40 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="font-display text-xl font-extrabold tracking-tighter text-primary">{t("brand")}</div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Instagram</a>
          <a href="#" className="hover:text-foreground">TikTok</a>
          <a href="#" className="hover:text-foreground">X / Twitter</a>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} — {t("footer_made")}</p>
      </div>
    </footer>
  );
}
