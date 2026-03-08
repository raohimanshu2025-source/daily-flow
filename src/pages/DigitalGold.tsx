import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Coins, TrendingUp, ArrowUpRight } from "lucide-react";
import { featureStore } from "@/lib/store-features";

const GOLD_PRICE = 7200; // ₹ per gram (mock)

export default function DigitalGold() {
  const investments = featureStore.getGoldInvestments();
  const totalGrams = featureStore.getTotalGoldGrams();
  const totalValue = featureStore.getTotalGoldValue();
  const [amount, setAmount] = useState("");

  const handleBuy = () => {
    if (!amount || Number(amount) < 10) return;
    const amt = Number(amount);
    featureStore.addGoldInvestment({
      id: `gold-${Date.now()}`,
      amountInr: amt,
      goldGrams: parseFloat((amt / GOLD_PRICE).toFixed(4)),
      pricePerGram: GOLD_PRICE,
      date: new Date().toISOString(),
    });
    setAmount("");
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Digital Gold</h1>
        <p className="text-sm text-muted-foreground mb-5">Save in 24K gold from just ₹10</p>

        {/* Portfolio Card */}
        <div className="gradient-warm rounded-2xl p-5 mb-6 shadow-elevated text-primary-foreground">
          <p className="text-sm opacity-80 mb-1">Your Gold Holdings</p>
          <h2 className="text-2xl font-bold mb-1">{totalGrams.toFixed(4)}g</h2>
          <p className="text-sm opacity-80">Worth ₹{totalValue.toLocaleString("en-IN")}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">+2.3% this week</span>
          </div>
        </div>

        {/* Live Price */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="h-6 w-6 text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">24K Gold</p>
              <p className="text-xs text-muted-foreground">Live price</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">₹{GOLD_PRICE.toLocaleString("en-IN")}</p>
            <p className="text-xs text-success flex items-center gap-0.5 justify-end">
              <ArrowUpRight className="h-3 w-3" /> +0.4%
            </p>
          </div>
        </div>

        {/* Buy Gold */}
        <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
          <p className="font-semibold text-foreground mb-3">Buy Gold</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (min ₹10)"
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[10, 50, 100, 500].map((v) => (
              <button key={v} onClick={() => setAmount(String(v))} className="py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
                ₹{v}
              </button>
            ))}
          </div>
          {amount && Number(amount) >= 10 && (
            <p className="text-xs text-muted-foreground mb-3">
              You'll get <span className="font-semibold text-foreground">{(Number(amount) / GOLD_PRICE).toFixed(4)}g</span> of 24K gold
            </p>
          )}
          <button onClick={handleBuy} className="w-full py-3.5 rounded-xl gradient-warm text-primary-foreground font-semibold shadow-elevated">
            Buy Gold
          </button>
        </div>

        {/* History */}
        {investments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Purchase History</h3>
            <div className="space-y-2">
              {investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.goldGrams}g gold</p>
                    <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">₹{inv.amountInr.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
