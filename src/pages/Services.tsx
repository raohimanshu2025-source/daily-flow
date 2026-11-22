import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { QrCode, ShoppingBag, Coins, Shield, Gift, Smartphone, MessageCircle, Users, Award, Brain, Receipt, LifeBuoy, Landmark, Wallet, GraduationCap } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

import { LIVE_SERVICES } from "@/lib/features";

type Service = { icon: typeof Wallet; label: string; desc: string; path: string; color: string; live?: boolean };

const services: Service[] = [
  { icon: Wallet, label: "sts.service", desc: "sts.serviceDesc", path: "/safe-to-spend", color: "bg-success/10 text-success" },
  { icon: GraduationCap, label: "sk.service", desc: "sk.serviceDesc", path: "/skills", color: "bg-primary/10 text-primary" },
  { icon: Landmark, label: "ben.service", desc: "ben.serviceDesc", path: "/benefits", color: "bg-success/10 text-success" },
  { icon: Receipt, label: "svc.expenses", desc: "svc.expensesDesc", path: "/expenses", color: "bg-destructive/10 text-destructive" },
  { icon: Award, label: "svc.credit", desc: "svc.creditDesc", path: "/credit-export", color: "bg-success/10 text-success" },
  { icon: Brain, label: "svc.nudges", desc: "svc.nudgesDesc", path: "/smart-nudges", color: "bg-primary/10 text-primary" },
  { icon: MessageCircle, label: "svc.chat", desc: "svc.chatDesc", path: "/chatbot", color: "bg-info/10 text-info" },
  { icon: LifeBuoy, label: "svc.support", desc: "svc.supportDesc", path: "/support", color: "bg-info/10 text-info" },
  { icon: QrCode, label: "soon.upiQr.name", desc: "svc.upiDesc", path: "/upi-qr", color: "bg-primary/10 text-primary", live: LIVE_SERVICES.upiQr },
  { icon: ShoppingBag, label: "soon.bnpl.name", desc: "svc.bnplDesc", path: "/bnpl", color: "bg-warning/10 text-warning", live: LIVE_SERVICES.bnpl },
  { icon: Coins, label: "soon.gold.name", desc: "svc.goldDesc", path: "/gold", color: "bg-accent/10 text-accent", live: LIVE_SERVICES.gold },
  { icon: Shield, label: "soon.insurance.name", desc: "svc.insuranceDesc", path: "/insurance", color: "bg-destructive/10 text-destructive", live: LIVE_SERVICES.insurance },
  { icon: Smartphone, label: "soon.bills.name", desc: "svc.billsDesc", path: "/bills", color: "bg-accent/10 text-accent", live: LIVE_SERVICES.bills },
  { icon: Users, label: "soon.groupSavings.name", desc: "svc.groupDesc", path: "/group-savings", color: "bg-warning/10 text-warning", live: LIVE_SERVICES.groupSavings },
  { icon: Gift, label: "soon.rewards.name", desc: "svc.rewardsDesc", path: "/rewards", color: "bg-primary/10 text-primary", live: LIVE_SERVICES.rewards },
];

export default function Services() {
  const navigate = useNavigate();
  useLanguage();

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">{t("svc.title")}</h1>
        <p className="text-sm text-muted-foreground mb-5">{t("svc.subtitle")}</p>

        {[
          { title: t("svc.available"), items: services.filter((s) => s.live !== false) },
          { title: t("soon.badge"), items: services.filter((s) => s.live === false) },
        ].filter((g) => g.items.length > 0).map((g) => (
          <div key={g.title} className="mb-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{g.title}</p>
            <div className="grid grid-cols-2 gap-3">
              {g.items.map((s) => (
                <button
                  key={s.path}
                  onClick={() => navigate(s.path)}
                  className={`flex items-start gap-3 bg-card rounded-xl p-4 shadow-card text-left transition-all active:scale-[0.98] ${s.live === false ? "opacity-60" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{t(s.label)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t(s.desc)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
