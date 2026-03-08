import MobileLayout from "@/components/MobileLayout";
import { Gift, Smartphone, Zap, Droplets, Star } from "lucide-react";
import { featureStore } from "@/lib/store-features";

const redeemOptions = [
  { label: "Mobile Recharge ₹49", coins: 100, icon: Smartphone },
  { label: "Mobile Recharge ₹99", coins: 200, icon: Smartphone },
  { label: "Electricity Bill ₹100", coins: 200, icon: Zap },
  { label: "Water Bill ₹50", coins: 100, icon: Droplets },
];

export default function Rewards() {
  const coins = featureStore.getRewardCoins();
  const history = featureStore.getRewardHistory();

  const handleRedeem = (option: typeof redeemOptions[number]) => {
    if (coins < option.coins) return;
    featureStore.addRewardCoins(-option.coins, `Redeemed: ${option.label}`);
    window.location.reload();
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Rewards</h1>
        <p className="text-sm text-muted-foreground mb-5">Earn coins for good financial habits</p>

        {/* Coins Balance */}
        <div className="gradient-primary rounded-2xl p-5 mb-6 shadow-elevated text-center text-primary-foreground">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-sm opacity-80">Your Coins</p>
          <h2 className="text-4xl font-bold">{coins}</h2>
          <p className="text-xs opacity-70 mt-1">Earn more by saving & repaying on time</p>
        </div>

        {/* How to earn */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <p className="font-semibold text-foreground mb-3">How to Earn</p>
          <div className="space-y-2 text-sm">
            {[
              { action: "Daily login", reward: "+5 coins" },
              { action: "Log income daily", reward: "+10 coins" },
              { action: "Save money", reward: "+20 coins" },
              { action: "On-time loan repayment", reward: "+100 coins" },
              { action: "7-day streak", reward: "+50 coins" },
            ].map((e, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">{e.action}</span>
                <span className="font-semibold text-success">{e.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Redeem Coins</h3>
          <div className="grid grid-cols-2 gap-3">
            {redeemOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleRedeem(opt)}
                disabled={coins < opt.coins}
                className={`bg-card rounded-xl p-3 shadow-card text-left transition-all ${
                  coins < opt.coins ? 'opacity-50' : 'active:scale-[0.98]'
                }`}
              >
                <opt.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-warning font-bold">{opt.coins} coins</p>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {history.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <p className={`text-sm font-bold ${r.coins > 0 ? 'text-success' : 'text-destructive'}`}>
                    {r.coins > 0 ? '+' : ''}{r.coins}
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
