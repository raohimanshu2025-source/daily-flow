import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Smartphone, Zap, Tv, Flame, Droplets, Check } from "lucide-react";
import { featureStore } from "@/lib/store-features";

const billTypes = [
  { type: 'mobile' as const, icon: Smartphone, label: 'Mobile Recharge', providers: ['Jio', 'Airtel', 'Vi', 'BSNL'] },
  { type: 'electricity' as const, icon: Zap, label: 'Electricity', providers: ['MSEDCL', 'TATA Power', 'BESCOM', 'CESC'] },
  { type: 'dth' as const, icon: Tv, label: 'DTH', providers: ['Tata Play', 'Airtel DTH', 'Dish TV', 'Sun Direct'] },
  { type: 'gas' as const, icon: Flame, label: 'Gas', providers: ['Indane', 'HP Gas', 'Bharat Gas'] },
  { type: 'water' as const, icon: Droplets, label: 'Water', providers: ['Municipal Corp'] },
];

export default function BillPayments() {
  const bills = featureStore.getBillPayments();
  const [selected, setSelected] = useState<typeof billTypes[number] | null>(null);
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    if (!selected || !provider || !amount) return;
    featureStore.addBillPayment({
      id: `bill-${Date.now()}`,
      type: selected.type,
      provider,
      amount: Number(amount),
      status: 'completed',
      date: new Date().toISOString(),
    });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setSelected(null); setProvider(""); setAmount(""); }, 2000);
  };

  if (success) {
    return (
      <MobileLayout>
        <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Payment Successful!</h2>
          <p className="text-sm text-muted-foreground mt-1">₹{amount} paid to {provider}</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Bill Payments</h1>
        <p className="text-sm text-muted-foreground mb-5">Recharge & pay bills instantly</p>

        {!selected ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {billTypes.map((b) => (
                <button
                  key={b.type}
                  onClick={() => setSelected(b)}
                  className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 shadow-card active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <b.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">{b.label}</span>
                </button>
              ))}
            </div>

            {bills.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Recent Payments</h3>
                <div className="space-y-2">
                  {bills.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card">
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.provider}</p>
                        <p className="text-xs text-muted-foreground capitalize">{b.type} · {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">₹{b.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card rounded-2xl p-5 shadow-elevated">
            <div className="flex items-center gap-3 mb-4">
              <selected.icon className="h-6 w-6 text-accent" />
              <p className="font-semibold text-foreground">{selected.label}</p>
            </div>

            <div className="mb-3">
              <label className="text-sm text-muted-foreground mb-1 block">Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {selected.providers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${
                      provider === p ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg font-semibold mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {selected.type === 'mobile' && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[49, 99, 199, 299].map((v) => (
                  <button key={v} onClick={() => setAmount(String(v))} className="py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium">₹{v}</button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setSelected(null); setProvider(""); setAmount(""); }} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium">Back</button>
              <button onClick={handlePay} disabled={!provider || !amount} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold disabled:opacity-50">Pay Now</button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
