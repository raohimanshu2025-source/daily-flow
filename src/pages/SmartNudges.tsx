import MobileLayout from "@/components/MobileLayout";
import { Brain, TrendingUp, PiggyBank, AlertTriangle, Target, Lightbulb, ArrowRight } from "lucide-react";
import { store } from "@/lib/store";
import { featureStore } from "@/lib/store-features";

function generateNudges() {
  const balance = store.getBalance();
  const todayIncome = store.getTodayIncome();
  const totalSavings = store.getTotalSavings();
  const activeLoans = store.getActiveLoans();
  const income = store.getIncome();
  const savings = store.getSavings();
  const rewardCoins = featureStore.getRewardCoins();

  const nudges: { icon: any; title: string; message: string; type: 'tip' | 'alert' | 'goal' | 'reward'; action?: string }[] = [];

  // Income-based nudges
  if (todayIncome > 0) {
    const saveAmount = Math.round(todayIncome * 0.1);
    nudges.push({
      icon: TrendingUp,
      title: "Smart Save Suggestion",
      message: `You earned ₹${todayIncome.toLocaleString("en-IN")} today! Save ₹${saveAmount} (10%) to build your safety net faster.`,
      type: 'tip',
      action: 'Save Now',
    });
  } else {
    nudges.push({
      icon: Lightbulb,
      title: "Log Your Income",
      message: "Don't forget to log today's earnings! Consistent tracking improves your credit score.",
      type: 'tip',
      action: 'Log Income',
    });
  }

  // Savings nudges
  const incompleteSavings = savings.filter(g => g.currentAmount < g.targetAmount);
  if (incompleteSavings.length > 0) {
    const closest = incompleteSavings.sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];
    const pct = Math.round((closest.currentAmount / closest.targetAmount) * 100);
    nudges.push({
      icon: Target,
      title: `${closest.name} - ${pct}% Done!`,
      message: `You're ₹${(closest.targetAmount - closest.currentAmount).toLocaleString("en-IN")} away from your ${closest.name} goal. Keep going! 🎯`,
      type: 'goal',
    });
  }

  // Loan alerts
  if (activeLoans.length > 0) {
    const overdueRisk = activeLoans.filter(l => l.status === 'active');
    if (overdueRisk.length > 0) {
      nudges.push({
        icon: AlertTriangle,
        title: "Loan Repayment Due",
        message: `You have ${overdueRisk.length} active loan(s). Timely repayment boosts your credit score by +50 points!`,
        type: 'alert',
        action: 'Repay Now',
      });
    }
  }

  // Rewards nudge
  if (rewardCoins >= 100) {
    nudges.push({
      icon: PiggyBank,
      title: "Redeem Your Coins!",
      message: `You have ${rewardCoins} reward coins! Redeem for mobile recharge or bill payments.`,
      type: 'reward',
      action: 'Redeem',
    });
  }

  // Weekly pattern
  if (income.length >= 7) {
    const weekTotal = income.slice(0, 7).reduce((s, i) => s + i.amount, 0);
    const avgDaily = Math.round(weekTotal / 7);
    nudges.push({
      icon: Brain,
      title: "Weekly Insight",
      message: `Your average daily income this week: ₹${avgDaily.toLocaleString("en-IN")}. ${avgDaily > 500 ? 'Great consistency! 💪' : 'Try diversifying income sources for stability.'}`,
      type: 'tip',
    });
  }

  // General tips
  nudges.push({
    icon: Lightbulb,
    title: "Pro Tip",
    message: totalSavings > 0
      ? `You've saved ₹${totalSavings.toLocaleString("en-IN")} so far! Users who save daily reach their goals 3x faster.`
      : "Start with just ₹10/day savings. Small amounts grow into big safety nets! 🌱",
    type: 'tip',
  });

  return nudges;
}

const typeColors = {
  tip: 'bg-primary/10 text-primary',
  alert: 'bg-destructive/10 text-destructive',
  goal: 'bg-success/10 text-success',
  reward: 'bg-warning/10 text-warning',
};

export default function SmartNudges() {
  const nudges = generateNudges();

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Smart Insights</h1>
        <p className="text-sm text-muted-foreground mb-5">AI-powered tips for better finances</p>

        <div className="space-y-3 mb-6">
          {nudges.map((nudge, i) => (
            <div key={i} className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[nudge.type]}`}>
                  <nudge.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">{nudge.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{nudge.message}</p>
                  {nudge.action && (
                    <button className="mt-2 text-xs font-semibold text-primary flex items-center gap-1">
                      {nudge.action} <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
