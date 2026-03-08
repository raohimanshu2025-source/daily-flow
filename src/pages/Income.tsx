import { useState } from "react";
import { store, IncomeLog } from "@/lib/store";
import MobileLayout from "@/components/MobileLayout";
import { Plus, X, TrendingUp, Wallet, Smartphone } from "lucide-react";

export default function Income() {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "upi">("cash");
  const [, setRefresh] = useState(0);

  const incomes = store.getIncome();
  const todayIncome = store.getTodayIncome();
  const weekIncome = incomes
    .filter((i) => new Date(i.date) > new Date(Date.now() - 7 * 86400000))
    .reduce((s, i) => s + i.amount, 0);
  const monthIncome = incomes
    .filter((i) => new Date(i.date) > new Date(Date.now() - 30 * 86400000))
    .reduce((s, i) => s + i.amount, 0);

  const sources = ["Construction", "Delivery", "Auto Driving", "Shop Work", "Painting", "Other"];

  const handleAdd = () => {
    if (!amount || !source) return;
    const log: IncomeLog = {
      id: `inc-${Date.now()}`,
      amount: parseInt(amount),
      source,
      paymentType,
      date: new Date().toISOString(),
    };
    store.addIncome(log);
    setShowAdd(false);
    setAmount("");
    setSource("");
    setRefresh((r) => r + 1);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">Daily Income</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Today", value: todayIncome, color: "gradient-primary" },
            { label: "This Week", value: weekIncome, color: "gradient-accent" },
            { label: "This Month", value: monthIncome, color: "gradient-warm" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 text-primary-foreground`}>
              <p className="text-[10px] opacity-70">{s.label}</p>
              <p className="text-lg font-bold">₹{s.value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform shadow-card"
        >
          <Plus className="h-5 w-5" /> Add Today's Income
        </button>

        {/* Income Log */}
        <h3 className="font-semibold text-foreground mb-3">Income History</h3>
        <div className="space-y-2">
          {incomes.slice(0, 20).map((inc) => (
            <div key={inc.id} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{inc.source}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {inc.paymentType === "cash" ? <Wallet className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                  {inc.paymentType.toUpperCase()} · {new Date(inc.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <p className="text-sm font-semibold text-success">+₹{inc.amount.toLocaleString("en-IN")}</p>
            </div>
          ))}
          {incomes.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No income logged yet</p>
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
          <div className="bg-card w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Add Income</h2>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground text-lg font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Source of Work</label>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSource(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        source === s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Payment Type</label>
                <div className="flex gap-3">
                  {(["cash", "upi"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPaymentType(t)}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        paymentType === t ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t === "cash" ? <Wallet className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!amount || !source}
                className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all mt-2"
              >
                Add Income
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
