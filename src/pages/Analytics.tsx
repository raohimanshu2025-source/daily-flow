import { store } from "@/lib/store";
import MobileLayout from "@/components/MobileLayout";
import { TrendingUp, PiggyBank, CreditCard, BarChart3 } from "lucide-react";

export default function Analytics() {
  const incomes = store.getIncome();
  const savings = store.getSavings();
  const loans = store.getLoans();

  // Weekly income data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayIncome = incomes
      .filter((inc) => inc.date.startsWith(dateStr))
      .reduce((s, inc) => s + inc.amount, 0);
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      amount: dayIncome,
    };
  });

  const maxIncome = Math.max(...last7Days.map((d) => d.amount), 1);
  const avgDailyIncome = incomes.length > 0
    ? Math.round(incomes.reduce((s, i) => s + i.amount, 0) / Math.min(incomes.length, 30))
    : 0;
  const totalSavings = store.getTotalSavings();
  const savingsRate = avgDailyIncome > 0 ? Math.round((totalSavings / (avgDailyIncome * 30)) * 100) : 0;
  const activeLoansAmount = store.getActiveLoans().reduce((s, l) => s + (l.amount - l.repaidAmount), 0);

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">Financial Insights</h1>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: TrendingUp, label: "Avg. Daily Income", value: `₹${avgDailyIncome.toLocaleString("en-IN")}`, color: "text-success" },
            { icon: PiggyBank, label: "Savings Rate", value: `${savingsRate}%`, color: "text-primary" },
            { icon: CreditCard, label: "Outstanding Loans", value: `₹${activeLoansAmount.toLocaleString("en-IN")}`, color: "text-warning" },
            { icon: BarChart3, label: "Total Transactions", value: `${store.getTransactions().length}`, color: "text-info" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Income Chart */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <h3 className="font-semibold text-foreground mb-4">Weekly Income</h3>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {day.amount > 0 ? `₹${day.amount}` : ""}
                </span>
                <div className="w-full rounded-t-md gradient-primary transition-all duration-500"
                  style={{ height: `${day.amount > 0 ? Math.max((day.amount / maxIncome) * 100, 8) : 4}%` }} />
                <span className="text-[10px] text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Goals Progress */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <h3 className="font-semibold text-foreground mb-4">Savings Goals</h3>
          <div className="space-y-4">
            {savings.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{goal.name}</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full gradient-accent transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
            {savings.length === 0 && <p className="text-sm text-muted-foreground">No savings goals</p>}
          </div>
        </div>

        {/* Loan Health */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <h3 className="font-semibold text-foreground mb-3">Loan Health</h3>
          {loans.length > 0 ? (
            <div className="space-y-2">
              {loans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">₹{loan.amount} · {loan.duration}d</span>
                  <span className={`font-medium ${
                    loan.status === "repaid" ? "text-success" :
                    loan.status === "overdue" ? "text-destructive" : "text-foreground"
                  }`}>{loan.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No loans</p>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
