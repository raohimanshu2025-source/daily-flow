import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { ShoppingBag, ShoppingCart, Pill, GraduationCap, Package, ChevronRight } from "lucide-react";
import { featureStore } from "@/lib/store-features";

const categories = [
  { id: 'grocery', label: 'Groceries', icon: ShoppingCart, limit: 3000 },
  { id: 'medicine', label: 'Medicine', icon: Pill, limit: 2000 },
  { id: 'school', label: 'School Supplies', icon: GraduationCap, limit: 5000 },
  { id: 'essentials', label: 'Essentials', icon: Package, limit: 2000 },
] as const;

export default function Bnpl() {
  const orders = featureStore.getBnplOrders();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<typeof categories[number]['id']>('grocery');
  const [amount, setAmount] = useState("");

  const handleApply = () => {
    if (!amount || Number(amount) <= 0) return;
    const amt = Number(amount);
    featureStore.addBnplOrder({
      id: `bnpl-${Date.now()}`,
      category,
      amount: amt,
      dailyRepayment: Math.ceil(amt / 20),
      totalRepaid: 0,
      durationDays: 20,
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    setShowForm(false);
    setAmount("");
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Buy Now Pay Later</h1>
        <p className="text-sm text-muted-foreground mb-5">Get essentials now, pay daily</p>

        {!showForm ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setShowForm(true); }}
                  className="bg-card rounded-xl p-4 shadow-card text-left active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
                    <cat.icon className="h-5 w-5 text-warning" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">Up to ₹{cat.limit.toLocaleString("en-IN")}</p>
                </button>
              ))}
            </div>

            {orders.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Active Orders</h3>
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div key={o.id} className="bg-card rounded-xl p-4 shadow-card">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-foreground capitalize">{o.category}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          o.status === 'active' ? 'bg-warning/10 text-warning' :
                          o.status === 'completed' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>{o.status}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>₹{o.totalRepaid} / ₹{o.amount}</span>
                        <span>₹{o.dailyRepayment}/day</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${(o.totalRepaid / o.amount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card rounded-2xl p-5 shadow-elevated">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-6 w-6 text-warning" />
              <div>
                <p className="font-semibold text-foreground capitalize">{category}</p>
                <p className="text-xs text-muted-foreground">Up to ₹{categories.find(c => c.id === category)?.limit?.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg font-semibold mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {amount && Number(amount) > 0 && (
              <div className="bg-muted rounded-xl p-3 mb-4 text-sm text-muted-foreground">
                <p>Daily repayment: <span className="font-semibold text-foreground">₹{Math.ceil(Number(amount) / 20)}</span></p>
                <p>Duration: <span className="font-semibold text-foreground">20 days</span></p>
                <p>Zero interest on essentials!</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium">Cancel</button>
              <button onClick={handleApply} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold">Apply</button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
