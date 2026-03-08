import { useState } from "react";
import { useSavingsGoals, useAddSavingsGoal, useAddToSavings } from "@/hooks/use-cloud-data";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import MobileLayout from "@/components/MobileLayout";
import { Plus, X, PiggyBank, Target, Heart, BookOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";

const categoryIcons: Record<string, any> = { emergency: Heart, festival: Sparkles, school: BookOpen, medical: Heart, other: Target };
const categoryLabels: Record<string, string> = { emergency: "Emergency Fund", festival: "Festival Fund", school: "School Fees", medical: "Medical Fund", other: "Other" };

export default function Savings() {
  useLanguage();
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);
  const [depositGoalName, setDepositGoalName] = useState("");
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [autoSave, setAutoSave] = useState("50");
  const [category, setCategory] = useState("emergency");
  const [depositAmount, setDepositAmount] = useState("");

  const { data: goals = [] } = useSavingsGoals();
  const addGoal = useAddSavingsGoal();
  const addToSavings = useAddToSavings();
  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);

  const handleCreate = async () => {
    if (!goalName || !targetAmount) return;
    try {
      await addGoal.mutateAsync({ name: goalName, target_amount: parseInt(targetAmount), auto_save_amount: parseInt(autoSave), category });
      setShowCreate(false);
      setGoalName("");
      setTargetAmount("");
      toast.success("Goal created!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDeposit = async () => {
    if (!showDeposit || !depositAmount) return;
    try {
      await addToSavings.mutateAsync({ goalId: showDeposit, amount: parseInt(depositAmount), goalName: depositGoalName });
      setShowDeposit(null);
      setDepositAmount("");
      toast.success("Saved!");
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">{t('savings.title')}</h1>

        <div className="gradient-accent rounded-2xl p-5 mb-6 shadow-elevated">
          <div className="flex items-center gap-3 mb-2">
            <PiggyBank className="h-6 w-6 text-accent-foreground" />
            <p className="text-accent-foreground/80 text-sm">{t('savings.totalSaved')}</p>
          </div>
          <h2 className="text-3xl font-bold text-accent-foreground">₹{totalSaved.toLocaleString("en-IN")}</h2>
          <p className="text-sm text-accent-foreground/70 mt-1">{goals.length} active goals</p>
        </div>

        <button onClick={() => setShowCreate(true)}
          className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform shadow-card">
          <Plus className="h-5 w-5" /> {t('savings.createGoal')}
        </button>

        <div className="space-y-3">
          {goals.map((goal) => {
            const Icon = categoryIcons[goal.category || 'other'] || Target;
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            return (
              <div key={goal.id} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">Auto-save ₹{goal.auto_save_amount}/day</p>
                  </div>
                  <button onClick={() => { setShowDeposit(goal.id); setDepositGoalName(goal.name); }}
                    className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">
                    + Add
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">₹{goal.current_amount.toLocaleString("en-IN")}</span>
                  <span className="font-medium text-foreground">₹{goal.target_amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% {t('savings.completed')}</p>
              </div>
            );
          })}
          {goals.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">{t('common.noData')}</p>}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
          <div className="bg-card w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">{t('savings.newGoal')}</h2>
              <button onClick={() => setShowCreate(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(categoryLabels).map((c) => (
                    <button key={c} onClick={() => { setCategory(c); setGoalName(categoryLabels[c]); }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${category === c ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {categoryLabels[c]}
                    </button>
                  ))}
                </div>
              </div>
              <input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Goal name"
                className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="Target amount (₹)"
                className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t('savings.autoSave')} (₹)</label>
                <div className="flex gap-2">
                  {["10", "30", "50", "100"].map((v) => (
                    <button key={v} onClick={() => setAutoSave(v)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${autoSave === v ? "gradient-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>₹{v}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} disabled={!goalName || !targetAmount || addGoal.isPending}
                className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all">
                {addGoal.isPending ? 'Creating...' : t('savings.createGoal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeposit && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
          <div className="bg-card w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">{t('savings.addToSavings')}</h2>
              <button onClick={() => setShowDeposit(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {["50", "100", "200", "500"].map((v) => (
                <button key={v} onClick={() => setDepositAmount(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${depositAmount === v ? "gradient-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>₹{v}</button>
              ))}
            </div>
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Or enter custom amount"
              className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4" />
            <button onClick={handleDeposit} disabled={!depositAmount || addToSavings.isPending}
              className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all">
              {addToSavings.isPending ? 'Saving...' : t('common.save')}
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
