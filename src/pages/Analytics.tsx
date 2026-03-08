import { useIncomeLogs, useSavingsGoals, useLoans, useTransactions, useExpenses } from "@/hooks/use-cloud-data";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { TrendingUp, PiggyBank, CreditCard, BarChart3, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(340, 82%, 52%)', 'hsl(45, 100%, 51%)', 'hsl(152, 69%, 45%)', 'hsl(210, 100%, 56%)', 'hsl(24, 95%, 53%)'];

export default function Analytics() {
  useLanguage();
  const { data: incomes = [] } = useIncomeLogs();
  const { data: savings = [] } = useSavingsGoals();
  const { data: loans = [] } = useLoans();
  const { data: transactions = [] } = useTransactions();
  const { data: expenses = [] } = useExpenses();

  // Weekly income data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayIncome = incomes.filter(inc => inc.date.startsWith(dateStr)).reduce((s, inc) => s + inc.amount, 0);
    const dayExpense = expenses.filter(exp => exp.date.startsWith(dateStr)).reduce((s, exp) => s + exp.amount, 0);
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), income: dayIncome, expense: dayExpense };
  });

  // Monthly income trend
  const monthlyIncome: Record<string, number> = {};
  incomes.forEach(i => {
    const month = new Date(i.date).toLocaleDateString('en-IN', { month: 'short' });
    monthlyIncome[month] = (monthlyIncome[month] || 0) + i.amount;
  });
  const monthlyData = Object.entries(monthlyIncome).map(([month, amount]) => ({ month, amount }));

  // Expense by category
  const categorySpend: Record<string, number> = {};
  expenses.forEach(e => {
    categorySpend[e.category] = (categorySpend[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categorySpend).map(([name, value]) => ({ name, value }));

  // Stats
  const avgDailyIncome = incomes.length > 0 ? Math.round(incomes.reduce((s, i) => s + i.amount, 0) / Math.min(incomes.length, 30)) : 0;
  const totalSavings = savings.reduce((s, g) => s + g.current_amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const savingsRate = avgDailyIncome > 0 ? Math.round((totalSavings / (avgDailyIncome * 30)) * 100) : 0;
  const activeLoansAmount = loans.filter(l => ['approved', 'active'].includes(l.status || '')).reduce((s, l) => s + (l.amount - l.repaid_amount), 0);

  return (
    <MobileLayout>
      <motion.div className="px-5 pt-6" variants={stagger} initial="hidden" animate="show">
        <motion.h1 variants={fadeUp} className="text-xl font-black text-foreground mb-5">
          {t('analytics.title')} 📊
        </motion.h1>

        {/* Stats Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: TrendingUp, label: t('analytics.avgDaily'), value: `₹${avgDailyIncome.toLocaleString("en-IN")}`, bg: "gradient-success", emoji: "💰" },
            { icon: PiggyBank, label: t('analytics.savingsRate'), value: `${savingsRate}%`, bg: "gradient-primary", emoji: "📈" },
            { icon: ArrowUpRight, label: "Total Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}`, bg: "gradient-warm", emoji: "💸" },
            { icon: CreditCard, label: t('analytics.outstandingLoans'), value: `₹${activeLoansAmount.toLocaleString("en-IN")}`, bg: "gradient-cool", emoji: "🏦" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-card border border-border/50 relative overflow-hidden">
              <div className="absolute -top-1 -right-1 text-2xl opacity-10">{stat.emoji}</div>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Income vs Expense Chart */}
        <motion.div variants={fadeUp} className="bg-card rounded-2xl p-4 shadow-card border border-border/50 mb-5">
          <h3 className="font-black text-foreground mb-4">Weekly Income vs Expenses 📉</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 20%, 92%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="income" name="Income" fill="hsl(152, 69%, 45%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="hsl(340, 82%, 52%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Income Trend */}
        {monthlyData.length > 0 && (
          <motion.div variants={fadeUp} className="bg-card rounded-2xl p-4 shadow-card border border-border/50 mb-5">
            <h3 className="font-black text-foreground mb-4">Income Trend 📈</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 20%, 92%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="hsl(262, 83%, 58%)" fill="url(#incGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Expense Breakdown */}
        {pieData.length > 0 && (
          <motion.div variants={fadeUp} className="bg-card rounded-2xl p-4 shadow-card border border-border/50 mb-5">
            <h3 className="font-black text-foreground mb-4">Expense Breakdown 🍩</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Savings Goals Progress */}
        <motion.div variants={fadeUp} className="bg-card rounded-2xl p-4 shadow-card border border-border/50 mb-5">
          <h3 className="font-black text-foreground mb-4">{t('analytics.savingsGoals')} 🎯</h3>
          <div className="space-y-4">
            {savings.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-foreground">{goal.name}</span>
                    <span className="text-muted-foreground font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>₹{goal.current_amount.toLocaleString("en-IN")}</span>
                    <span>₹{goal.target_amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })}
            {savings.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No savings goals yet</p>}
          </div>
        </motion.div>

        {/* Loan Health */}
        <motion.div variants={fadeUp} className="bg-card rounded-2xl p-4 shadow-card border border-border/50 mb-6">
          <h3 className="font-black text-foreground mb-3">{t('analytics.loanHealth')} 🏥</h3>
          {loans.length > 0 ? (
            <div className="space-y-2">
              {loans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-foreground">₹{loan.amount.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-muted-foreground ml-2">{loan.duration}d</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                    loan.status === "repaid" ? "bg-success/10 text-success" :
                    loan.status === "overdue" ? "bg-destructive/10 text-destructive" :
                    loan.status === "approved" || loan.status === "active" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>{loan.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No loans yet</p>
          )}
        </motion.div>
      </motion.div>
    </MobileLayout>
  );
}
