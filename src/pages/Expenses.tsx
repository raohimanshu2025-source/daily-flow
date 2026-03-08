import { useState } from "react";
import { useExpenses, useAddExpense } from "@/hooks/use-cloud-data";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import MobileLayout from "@/components/MobileLayout";
import { Plus, X, ShoppingCart, Car, Home, Heart, BookOpen, ShoppingBag, Zap, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const categoryConfig: Record<string, { icon: any; color: string }> = {
  food: { icon: ShoppingCart, color: "bg-warning/10 text-warning" },
  transport: { icon: Car, color: "bg-primary/10 text-primary" },
  rent: { icon: Home, color: "bg-destructive/10 text-destructive" },
  medical: { icon: Heart, color: "bg-accent/10 text-accent" },
  education: { icon: BookOpen, color: "bg-info/10 text-info" },
  shopping: { icon: ShoppingBag, color: "bg-primary/10 text-primary" },
  utilities: { icon: Zap, color: "bg-warning/10 text-warning" },
  other: { icon: MoreHorizontal, color: "bg-muted text-muted-foreground" },
};

const categories = Object.keys(categoryConfig);

export default function Expenses() {
  useLanguage();
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");

  const { data: expenses = [] } = useExpenses();
  const addExpense = useAddExpense();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = expenses.filter(e => e.date.startsWith(todayStr)).reduce((s, e) => s + e.amount, 0);
  const weekTotal = expenses.filter(e => new Date(e.date) > new Date(Date.now() - 7 * 86400000)).reduce((s, e) => s + e.amount, 0);
  const monthTotal = expenses.filter(e => new Date(e.date) > new Date(Date.now() - 30 * 86400000)).reduce((s, e) => s + e.amount, 0);

  const byCategory: Record<string, number> = {};
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const handleAdd = async () => {
    if (!amount) return;
    try {
      await addExpense.mutateAsync({ amount: parseInt(amount), category, note: note || t(`expense.${category}`) });
      setShowAdd(false);
      setAmount("");
      setNote("");
      toast.success("Expense added!");
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">{t('expense.title')}</h1>

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

        {topCategories.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card mb-6">
            <h3 className="font-semibold text-foreground mb-3">{t('expense.category')}</h3>
            <div className="space-y-3">
              {topCategories.map(([cat, amt]) => {
                const config = categoryConfig[cat];
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

        <button onClick={() => setShowAdd(true)}
          className="w-full py-3.5 rounded-xl gradient-warm text-primary-foreground font-semibold flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform shadow-card">
          <Plus className="h-5 w-5" /> {t('expense.addExpense')}
        </button>

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
          {expenses.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">{t('common.noData')}</p>}
        </div>
      </div>

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
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" autoFocus
                  className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground text-lg font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t('expense.category')}</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${category === c ? "gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
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
              <button onClick={handleAdd} disabled={!amount || addExpense.isPending}
                className="w-full py-4 rounded-xl gradient-warm text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all mt-2">
                {addExpense.isPending ? 'Adding...' : t('expense.addExpense')}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
