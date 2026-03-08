import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { ShoppingBag, ShoppingCart, Pill, GraduationCap, Package, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

const categories = [
  { id: 'grocery', label: 'Groceries', icon: ShoppingCart, limit: 3000 },
  { id: 'medicine', label: 'Medicine', icon: Pill, limit: 2000 },
  { id: 'school', label: 'School Supplies', icon: GraduationCap, limit: 5000 },
  { id: 'essentials', label: 'Essentials', icon: Package, limit: 2000 },
] as const;

interface BnplOrder {
  id: string;
  category: string;
  amount: number;
  daily_repayment: number;
  total_repaid: number;
  duration_days: number;
  status: string;
  created_at: string;
}

export default function Bnpl() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<BnplOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<string>('grocery');
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bnpl_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [user]);

  const handleApply = async () => {
    if (!amount || Number(amount) <= 0 || !user) return;
    const amt = Number(amount);
    const catInfo = categories.find(c => c.id === category);
    if (catInfo && amt > catInfo.limit) {
      toast.error(`Maximum limit for ${catInfo.label} is ₹${catInfo.limit.toLocaleString("en-IN")}`);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('bnpl_orders').insert({
      user_id: user.id,
      category,
      amount: amt,
      daily_repayment: Math.ceil(amt / 20),
      duration_days: 20,
      status: 'pending',
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit application");
      return;
    }

    toast.success("BNPL application submitted! Awaiting approval ⏳");
    setShowForm(false);
    setAmount("");
    loadOrders();
  };

  const handleRepay = async (order: BnplOrder) => {
    if (order.total_repaid >= order.amount) return;
    const repayAmount = Math.min(order.daily_repayment, order.amount - order.total_repaid);
    const newTotal = order.total_repaid + repayAmount;
    const newStatus = newTotal >= order.amount ? 'completed' : order.status;

    const { error } = await supabase
      .from('bnpl_orders')
      .update({ total_repaid: newTotal, status: newStatus })
      .eq('id', order.id);

    if (error) {
      toast.error("Repayment failed");
      return;
    }

    toast.success(`Repaid ₹${repayAmount}! ${newStatus === 'completed' ? '🎉 Fully repaid!' : ''}`);
    loadOrders();
  };

  const activeOrders = orders.filter(o => o.status === 'active');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const overdueOrders = orders.filter(o => o.status === 'overdue');

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-black text-foreground">Buy Now Pay Later 🛒</h1>
            <p className="text-xs text-muted-foreground">Get essentials now, pay daily</p>
          </div>
        </div>

        {!showForm ? (
          <>
            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setCategory(cat.id); setShowForm(true); }}
                  className="bg-card rounded-2xl p-4 shadow-card border border-border/50 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
                    <cat.icon className="h-5 w-5 text-warning" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">Up to ₹{cat.limit.toLocaleString("en-IN")}</p>
                </motion.button>
              ))}
            </div>

            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">⏳ Pending Approval</h3>
                <div className="space-y-2">
                  {pendingOrders.map(o => (
                    <div key={o.id} className="bg-warning/5 rounded-2xl p-4 border border-warning/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground capitalize">{o.category}</p>
                          <p className="text-xs text-muted-foreground">₹{o.amount.toLocaleString("en-IN")} · Waiting for admin approval</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-lg font-bold bg-warning/10 text-warning">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">✅ Active Orders</h3>
                <div className="space-y-3">
                  {activeOrders.map(o => {
                    const progress = (o.total_repaid / o.amount) * 100;
                    const remaining = o.amount - o.total_repaid;
                    return (
                      <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-foreground capitalize">{o.category}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-success/10 text-success">Active</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                          <span>₹{o.total_repaid.toLocaleString("en-IN")} / ₹{o.amount.toLocaleString("en-IN")}</span>
                          <span>₹{o.daily_repayment}/day</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted mb-3">
                          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Remaining: ₹{remaining.toLocaleString("en-IN")}</p>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleRepay(o)}
                            className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-glow">
                            Pay ₹{Math.min(o.daily_repayment, remaining)}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Overdue */}
            {overdueOrders.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-destructive" /> Overdue
                </h3>
                <div className="space-y-2">
                  {overdueOrders.map(o => (
                    <div key={o.id} className="bg-destructive/5 rounded-2xl p-4 border border-destructive/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-foreground capitalize">{o.category}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-destructive/10 text-destructive">Overdue</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">₹{(o.amount - o.total_repaid).toLocaleString("en-IN")} remaining</p>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleRepay(o)}
                        className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold">
                        Pay Now ₹{Math.min(o.daily_repayment, o.amount - o.total_repaid)}
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedOrders.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">🎉 Completed</h3>
                <div className="space-y-2">
                  {completedOrders.map(o => (
                    <div key={o.id} className="bg-muted/50 rounded-2xl p-3 border border-border/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground capitalize">{o.category} · ₹{o.amount.toLocaleString("en-IN")}</p>
                        <span className="text-xs text-success font-bold">✅ Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-bold text-foreground capitalize">{category}</p>
                <p className="text-xs text-muted-foreground">Up to ₹{categories.find(c => c.id === category)?.limit?.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg font-bold mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {amount && Number(amount) > 0 && (
              <div className="bg-muted rounded-xl p-3 mb-4 text-sm space-y-1">
                <p className="text-muted-foreground">Daily repayment: <span className="font-bold text-foreground">₹{Math.ceil(Number(amount) / 20)}</span></p>
                <p className="text-muted-foreground">Duration: <span className="font-bold text-foreground">20 days</span></p>
                <p className="text-xs text-success font-semibold">Zero interest on essentials! 🎉</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium">Cancel</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleApply} disabled={submitting}
                className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Apply
              </motion.button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">Application will be reviewed by admin before activation</p>
          </motion.div>
        )}
      </div>
    </MobileLayout>
  );
}
