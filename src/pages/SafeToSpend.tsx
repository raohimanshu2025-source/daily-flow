import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, AlertTriangle, Info, Loader2, Lock, TrendingUp, CreditCard, PiggyBank, ShoppingBasket, Plus } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useSafeToSpend } from "@/hooks/use-safe-to-spend";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

const tf = (key: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t(key));
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function SafeToSpend() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { data, isLoading } = useSafeToSpend();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";

  return (
    <MobileLayout>
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("sts.title")}</h1>
        </div>

        {(isLoading || !data) && (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        )}

        {data && !data.ready && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 shadow-card text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg font-extrabold text-foreground mb-1">{t("sts.lockedTitle")}</p>
            <p className="text-sm text-muted-foreground mb-4">{tf("sts.lockedBody", { d: data.daysLogged })}</p>
            {data.daysNeeded > 0 && (
              <>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-1.5">
                  <div className="h-full gradient-primary rounded-full" style={{ width: `${Math.min(100, ((14 - data.daysNeeded) / 14) * 100)}%` }} />
                </div>
                <p className="text-xs font-semibold text-primary mb-4">{tf("sts.lockedMore", { n: data.daysNeeded })}</p>
              </>
            )}
            <button onClick={() => navigate("/income")} className="w-full gradient-primary text-primary-foreground font-bold py-3.5 rounded-2xl shadow-glow flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> {t("sts.logIncome")}
            </button>
          </motion.div>
        )}

        {data && data.ready && (() => {
          const max = Math.max(1, ...data.days.map((d) => d.typical));
          const rows = [
            { icon: TrendingUp, label: t("sts.income"), sub: tf("sts.incomeTypical", { n: data.typical.toLocaleString("en-IN") }), value: data.cautious, sign: "+", color: "bg-success/10 text-success" },
            { icon: CreditCard, label: t("sts.loans"), sub: data.loansDueList.some((l) => l.overdue) ? t("sts.loanOverdue") : undefined, value: data.loansDue, sign: "−", color: "bg-warning/10 text-warning" },
            { icon: PiggyBank, label: t("sts.autoSave"), value: data.autoSave, sign: "−", color: "bg-primary/10 text-primary" },
            { icon: ShoppingBasket, label: t("sts.essentials"), sub: data.essentials === 0 ? t("sts.noExpenses") : undefined, value: data.essentials, sign: "−", color: "bg-info/10 text-info" },
          ];
          return (
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="relative gradient-hero rounded-3xl p-6 shadow-elevated overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">{t("sts.dashLabel")}</p>
                <p className="text-5xl font-black text-white tracking-tight">{inr(data.perDay)}</p>
                <p className="text-white/80 text-sm font-semibold">{t("sts.perDay")}</p>
                <p className="text-white/60 text-xs mt-2">{t("sts.heroHint")}</p>
              </motion.div>

              {data.spare < 0 && (
                <div className="flex gap-3 bg-destructive/10 rounded-2xl p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-destructive">{t("sts.tight")}</p>
                    <p className="text-xs text-foreground mt-0.5">{tf("sts.tightBody", { n: Math.abs(data.spare).toLocaleString("en-IN") })}</p>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl p-4 shadow-card">
                <p className="text-sm font-bold text-foreground mb-3">{t("sts.breakdown")}</p>
                <div className="space-y-3">
                  {rows.map((r) => (
                    <div key={r.label} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.color}`}><r.icon className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight">{r.label}</p>
                        {r.sub && <p className="text-[10px] text-muted-foreground">{r.sub}</p>}
                      </div>
                      <p className={`text-sm font-bold ${r.sign === "+" ? "text-success" : "text-foreground"}`}>{r.sign} {inr(r.value)}</p>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <p className="text-sm font-extrabold text-foreground">{t("sts.spare")}</p>
                    <p className={`text-lg font-black ${data.spare < 0 ? "text-destructive" : "text-success"}`}>
                      {data.spare < 0 ? "−" : ""}{inr(Math.abs(data.spare))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-foreground">{t("sts.chart")}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary" />{t("sts.legendCareful")}</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary/25" />{t("sts.legendUsual")}</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {data.days.map((d, i) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <p className="text-[9px] font-semibold text-muted-foreground">{inr(d.cautious)}</p>
                      <div className="w-full relative rounded-lg bg-primary/25" style={{ height: `${(d.typical / max) * 80}%`, minHeight: 4 }}>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${d.typical ? (d.cautious / d.typical) * 100 : 0}%` }} transition={{ delay: i * 0.05 }}
                          className="absolute bottom-0 left-0 right-0 rounded-lg bg-primary" />
                      </div>
                      <p className={`text-[10px] font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {i === 0 ? t("sts.today") : new Date(d.date + "T12:00:00").toLocaleDateString(locale, { weekday: "short" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 text-[11px] text-muted-foreground bg-muted rounded-xl p-3">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{tf("sts.how", { w: data.weeks })} {t("sts.private")}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </MobileLayout>
  );
}
