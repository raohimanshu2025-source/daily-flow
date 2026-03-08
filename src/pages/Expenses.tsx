import { useState } from "react";
import { expenseStore, Expense } from "@/lib/store-expenses";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import MobileLayout from "@/components/MobileLayout";
import { Plus, X, ShoppingCart, Car, Home, Heart, BookOpen, ShoppingBag, Zap, MoreHorizontal } from "lucide-react";

const categoryConfig = {
  food: { icon: ShoppingCart, color: "bg-warning/10 text-warning" },
  transport: { icon: Car, color: "bg-primary/10 text-primary" },
  rent: { icon: Home, color: "bg-destructive/10 text-destructive" },
  medical: { icon: Heart, color: "bg-accent/10 text-accent" },
  education: { icon: BookOpen, color: "bg-info/10 text-info" },
  shopping: { icon: ShoppingBag, color: "bg-primary/10 text-primary" },
  utilities: { icon: Zap, color: "bg-warning/10 text-warning" },
  other: { icon: MoreHorizontal, color: "bg-muted text-muted-foreground" },
};

const categories = Object.keys(categoryConfig) as Expense['category'][];

export default function Expenses() {
  useLanguage(); // re-render on lang change
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense['category']>("food");
  const [note, setNote] = useState("");
  const [, setRefresh] = useState(0);

  const expenses = expenseStore.getAll();
  const todayTotal = expenseStore.getTodayTotal();
  const weekTotal = expenseStore.getWeekTotal();
  const monthTotal = expenseStore.getMonthTotal();
  const byCategory = expenseStore.getByCategory();

  const handleAdd = () => {
    if (!amount) return;
    expenseStore.add({
      id: `exp-${Date.now()}`,
      amount: parseInt(amount),
      category,
      note: note || t(`expense.${category}`),
      date: new Date().toISOString(),
    });
    setShowAdd(false);
    setAmount("");
    setNote("");
    setRefresh(r => r + 1);
  };

  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">{t('expense.title')}</h1>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t('income.today'), value: todayTotal, color: "gradient-warm" },
            { label: t('income.thisWeek'), value: weekTotal, color: "gradient-primary" },
            { label: t('income.thisMonth'), value: monthTotal, color: "gradient-accent" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 text-primary-foreground`}>
              <p className="text-[10px] opacity-70">{s.label}</p>
              <p className="text-lg font-bold">₹{s.value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        {topCategories.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card mb-6">
            <h3 className="font-semibold text-foreground mb-3">{t('expense.category')}</h3>
            <div className="space-y-3">
              {topCategories.map(([cat, amt]) => {
                const config = categoryConfig[cat as Expense['category']];
                const Icon = config?.icon || MoreHorizontal;
                const pct = monthTotal > 0 ? Math.round((amt / monthTotal) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config?.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-foreground">{t(`expense.${cat}`)}</span>
                        <span className="text-muted-foreground">₹{amt.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full gradient-warm transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3.5 rounded-xl gradient-warm text-primary-foreground font-semibold flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform shadow-card"
        >
          <Plus className="h-5 w-5" /> {t('expense.addExpense')}
        </button>

        {/* Expense History */}
        <h3 className="font-semibold text-foreground mb-3">{t('expense.history')}</h3>
        <div className="space-y-2">
          {expenses.slice(0, 20).map((exp) => {
            const config = categoryConfig[exp.category];
            const Icon = config?.icon || MoreHorizontal;
            return (
              <div key={exp.id} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config?.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{exp.note}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`expense.${exp.category}`)} · {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-destructive">-₹{exp.amount.toLocaleString("en-IN")}</p>
              </div>
            );
          })}
          {expenses.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">{t('common.noData')}</p>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
          <div className="bg-card w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">{t('expense.addExpense')}</h2>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t('income.amount')}</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount" autoFocus
                  className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground text-lg font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t('expense.category')}</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        category === c ? "gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                      {t(`expense.${c}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was this for?"
                  className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button onClick={handleAdd} disabled={!amount}
                className="w-full py-4 rounded-xl gradient-warm text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all mt-2">
                {t('expense.addExpense')}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
