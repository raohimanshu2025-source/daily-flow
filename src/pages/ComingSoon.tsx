import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Landmark, Wallet, PiggyBank } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

export type SoonService = "upiQr" | "bnpl" | "gold" | "insurance" | "bills" | "groupSavings" | "rewards";

/**
 * Shown instead of a demo-only screen until a licensed partner is live.
 * Honest: says the feature is not available yet and points to what works today.
 */
export default function ComingSoon({ service }: { service: SoonService }) {
  const navigate = useNavigate();
  useLanguage();
  const tryNow = [
    { icon: Wallet, label: t("sts.service"), path: "/safe-to-spend" },
    { icon: Landmark, label: t("ben.service"), path: "/benefits" },
    { icon: PiggyBank, label: t("nav.savings"), path: "/savings" },
  ];

  return (
    <MobileLayout>
      <div className="px-5 pt-6 pb-8">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/services"))}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-6"
          aria-label={t("legal.back")}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-6 shadow-card text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-4">
            <Clock className="h-7 w-7 text-primary-foreground" />
          </div>
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t("soon.badge")}</p>
          <h1 className="text-2xl font-black text-foreground mb-2">{t(`soon.${service}.name`)}</h1>
          <p className="text-sm text-muted-foreground mb-3">{t(`soon.${service}.what`)}</p>
          <p className="text-xs text-muted-foreground bg-muted rounded-xl p-3">{t("soon.why")}</p>
        </motion.div>

        <p className="text-sm font-bold text-foreground mt-6 mb-3">{t("soon.tryNow")}</p>
        <div className="grid grid-cols-3 gap-3">
          {tryNow.map((s) => (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className="bg-card rounded-2xl p-3 shadow-card flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-success" />
              </div>
              <span className="text-[11px] font-bold text-foreground text-center leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
