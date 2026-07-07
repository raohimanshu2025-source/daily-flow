import MobileLayout from "@/components/MobileLayout";
import { Smartphone, Zap, Droplets, Star, Flame, Trophy, Gift, Coffee, ShoppingBag } from "lucide-react";
import { useRewards, useAddReward, useIncomeLogs } from "@/hooks/use-cloud-data";
import { toast } from "sonner";
import { useMemo, useEffect, useRef } from "react";

type CatalogItem = { id: string; label: string; category: "recharge" | "bills" | "vouchers"; coins: number; icon: any };

const catalog: CatalogItem[] = [
  { id: "rc49", label: "Mobile Recharge ₹49", category: "recharge", coins: 100, icon: Smartphone },
  { id: "rc99", label: "Mobile Recharge ₹99", category: "recharge", coins: 200, icon: Smartphone },
  { id: "rc199", label: "Mobile Recharge ₹199", category: "recharge", coins: 400, icon: Smartphone },
  { id: "elec100", label: "Electricity Bill ₹100", category: "bills", coins: 200, icon: Zap },
  { id: "water50", label: "Water Bill ₹50", category: "bills", coins: 100, icon: Droplets },
  { id: "chai25", label: "Chai Voucher ₹25", category: "vouchers", coins: 60, icon: Coffee },
  { id: "kirana100", label: "Kirana Voucher ₹100", category: "vouchers", coins: 220, icon: ShoppingBag },
  { id: "kirana500", label: "Kirana Voucher ₹500", category: "vouchers", coins: 1050, icon: ShoppingBag },
];

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  // If no activity today, streak can still be 0 or count from yesterday
  for (let i = 0; i < 400; i++) {
    const key = cur.toISOString().slice(0, 10);
    if (set.has(key)) streak++;
    else if (i > 0) break; // allow "no activity today" only for day 0
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export default function Rewards() {
  const { data: rewards = [] } = useRewards();
  const { data: income = [] } = useIncomeLogs();
  const addReward = useAddReward();
  const streakBonusChecked = useRef(false);

  const coins = useMemo(() => rewards.reduce((s, r) => s + Number(r.coins || 0), 0), [rewards]);
  const streak = useMemo(() => computeStreak(income.map((i: any) => new Date(i.date))), [income]);
  const multiplier = streak >= 30 ? 3 : streak >= 14 ? 2 : streak >= 7 ? 1.5 : 1;

  // Grant a 7-day streak milestone bonus once per streak-week
  useEffect(() => {
    if (streakBonusChecked.current) return;
    if (streak > 0 && streak % 7 === 0) {
      const key = `streak-bonus-${streak}`;
      const already = rewards.some((r: any) => r.reason === key);
      if (!already) {
        streakBonusChecked.current = true;
        addReward.mutate({ coins: 50 * (streak / 7), reason: key });
      }
    }
  }, [streak, rewards, addReward]);

  const handleRedeem = (opt: CatalogItem) => {
    if (coins < opt.coins) return;
    addReward.mutate(
      { coins: -opt.coins, reason: `Redeemed: ${opt.label}` },
      { onSuccess: () => toast.success(`${opt.label} redeemed!`), onError: (e: any) => toast.error(e.message) },
    );
  };

  const byCategory: Record<string, CatalogItem[]> = {
    recharge: catalog.filter((c) => c.category === "recharge"),
    bills: catalog.filter((c) => c.category === "bills"),
    vouchers: catalog.filter((c) => c.category === "vouchers"),
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Rewards</h1>
        <p className="text-sm text-muted-foreground mb-5">Earn coins for good financial habits</p>

        {/* Coins Balance */}
        <div className="gradient-primary rounded-2xl p-5 mb-4 shadow-elevated text-center text-primary-foreground">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-sm opacity-80">Your Coins</p>
          <h2 className="text-4xl font-bold">{coins}</h2>
          <p className="text-xs opacity-70 mt-1">Earn more by logging income, saving & repaying on time</p>
        </div>

        {/* Streak card */}
        <div className="bg-card rounded-2xl p-4 mb-6 shadow-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-warning/15 flex items-center justify-center">
            <Flame className={`h-7 w-7 ${streak > 0 ? "text-warning" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Current streak</p>
            <p className="text-lg font-bold text-foreground">{streak} day{streak === 1 ? "" : "s"}</p>
            <p className="text-xs text-muted-foreground">Reward multiplier: <span className="font-semibold text-primary">{multiplier}×</span></p>
          </div>
          <Trophy className="h-6 w-6 text-warning" />
        </div>

        {/* How to earn */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <p className="font-semibold text-foreground mb-3">How to Earn</p>
          <div className="space-y-2 text-sm">
            {[
              { action: "Log income daily", reward: `+${Math.round(10 * multiplier)} coins` },
              { action: "Save to a goal", reward: `+${Math.round(20 * multiplier)} coins` },
              { action: "On-time loan repayment", reward: `+${Math.round(100 * multiplier)} coins` },
              { action: "7-day streak milestone", reward: "+50 coins" },
              { action: "14-day streak", reward: "2× multiplier" },
              { action: "30-day streak", reward: "3× multiplier" },
            ].map((e, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">{e.action}</span>
                <span className="font-semibold text-success">{e.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem catalog */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Gift className="h-4 w-4" /> Redemption Catalog</h3>
          {(["recharge", "bills", "vouchers"] as const).map((cat) => (
            <div key={cat} className="mb-4">
              <p className="text-xs uppercase font-semibold text-muted-foreground mb-2">
                {cat === "recharge" ? "Mobile Recharge" : cat === "bills" ? "Utility Bills" : "Vouchers"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {byCategory[cat].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleRedeem(opt)}
                    disabled={coins < opt.coins || addReward.isPending}
                    className={`bg-card rounded-xl p-3 shadow-card text-left transition-all ${
                      coins < opt.coins ? "opacity-50" : "active:scale-[0.98]"
                    }`}
                  >
                    <opt.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-warning font-bold">{opt.coins} coins</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        {rewards.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {rewards.slice(0, 15).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${Number(r.coins) > 0 ? "text-success" : "text-destructive"}`}>
                    {Number(r.coins) > 0 ? "+" : ""}{r.coins}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
