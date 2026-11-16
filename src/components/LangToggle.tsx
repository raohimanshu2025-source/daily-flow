import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

/** Small हिंदी / English switch for screens outside the signed-in layout. */
export default function LangToggle({ variant = "muted", className = "" }: { variant?: "muted" | "glass"; className?: string }) {
  const { lang, toggle } = useLanguage();
  const style = variant === "glass"
    ? "bg-white/20 backdrop-blur-md text-white"
    : "bg-muted text-foreground hover:bg-primary/10";
  return (
    <button
      onClick={toggle}
      aria-label={t("legal.switchLang")}
      className={`h-10 px-3 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${style} ${className}`}
    >
      <span className="text-xs font-extrabold">{lang === "en" ? "हिंदी" : "English"}</span>
    </button>
  );
}
