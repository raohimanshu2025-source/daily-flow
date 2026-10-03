import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { getLegalDoc, LEGAL_CONFIG } from "@/lib/legal";
import { t } from "@/lib/i18n";

/** Public Privacy Policy / Terms page. Readable without signing in. */
export default function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const navigate = useNavigate();
  const { lang, toggle } = useLanguage();
  const doc = getLegalDoc(kind, lang);
  const Icon = kind === "privacy" ? ShieldCheck : FileText;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 pt-6 pb-12">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
            aria-label={t("legal.back")}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={toggle}
            className="h-10 px-3 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
            aria-label={t("legal.switchLang")}
          >
            <span className="text-xs font-extrabold text-foreground">{lang === "en" ? "हिंदी" : "English"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground">{doc.title}</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {t("legal.updated")}: {LEGAL_CONFIG.lastUpdated}
        </p>
        <p className="text-sm text-foreground mb-6 leading-relaxed">{doc.intro}</p>

        <div className="space-y-4">
          {doc.sections.map((s) => (
            <section key={s.heading} className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
              <h2 className="text-sm font-extrabold text-foreground mb-2">{s.heading}</h2>
              <ul className="space-y-2">
                {s.body.map((line, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-8 text-xs font-semibold">
          <button onClick={() => navigate("/privacy")} className="text-primary">{t("legal.privacy")}</button>
          <span className="text-muted-foreground">•</span>
          <button onClick={() => navigate("/terms")} className="text-primary">{t("legal.terms")}</button>
        </div>
      </div>
    </div>
  );
}
