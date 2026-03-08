import { useState } from "react";
import { useIncomeLogs, useAddIncome } from "@/hooks/use-cloud-data";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import MobileLayout from "@/components/MobileLayout";
import { Plus, X, TrendingUp, Wallet, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function Income() {
  useLanguage();
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "upi">("cash");

  const { data: incomes = [] } = useIncomeLogs();
  const addIncome = useAddIncome();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayIncome = incomes.filter(i => i.date.startsWith(todayStr)).reduce((s, i) => s + i.amount, 0);
  const weekIncome = incomes.filter(i => new Date(i.date) > new Date(Date.now() - 7 * 86400000)).reduce((s, i) => s + i.amount, 0);
  const monthIncome = incomes.filter(i => new Date(i.date) > new Date(Date.now() - 30 * 86400000)).reduce((s, i) => s + i.amount, 0);

  const sources = ["Construction", "Delivery", "Auto Driving", "Shop Work", "Painting", "Other"];

  const handleAdd = async () => {
    if (!amount || !source) return;
    try {
      await addIncome.mutateAsync({ amount: parseInt(amount), source, payment_type: paymentType });
      setShowAdd(false);
      setAmount("");
      setSource("");
      toast.success("Income added!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">{t('income.title')}</h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t('income.today'), value: todayIncome, color: "gradient-primary" },
            { label: t('income.thisWeek'), value: weekIncome, color: "gradient-accent" },
            { label: t('income.thisMonth'), value: monthIncome, color: "gradient-warm" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 text-primary-foreground`}>
              <p className="text-[10px] opacity-70">{s.label}</p>
              <p className="text-lg font-bold">₹{s.value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setShowAdd(true)}
          className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform shadow-card">
          <Plus className="h-5 w-5" /> {t('income.addToday')}
        </button>

        <h3 className="font-semibold text-foreground mb-3">{t('income.history')}</h3>
        <div className="space-y-2">
          {incomes.slice(0, 20).map((inc) => (
            <div key={inc.id} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{inc.source}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {inc.payment_type === "cash" ? <Wallet className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                  {(inc.payment_type || 'cash').toUpperCase()} · {new Date(inc.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <p className="text-sm font-semibold text-success">+₹{inc.amount.toLocaleString("en-IN")}</p>
            </div>
          ))}
          {incomes.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">{t('common.noData')}</p>}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
          <div className="bg-card w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">{t('dash.addIncome')}</h2>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t('income.amount')}</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" autoFocus
                  className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground text-lg font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t('income.source')}</label>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <button key={s} onClick={() => setSource(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${source === s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t('income.paymentType')}</label>
                <div className="flex gap-3">
                  {(["cash", "upi"] as const).map((tp) => (
                    <button key={tp} onClick={() => setPaymentType(tp)}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${paymentType === tp ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {tp === "cash" ? <Wallet className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                      {tp.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAdd} disabled={!amount || !source || addIncome.isPending}
                className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all mt-2">
                {addIncome.isPending ? 'Adding...' : t('dash.addIncome')}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
