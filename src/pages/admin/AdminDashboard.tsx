import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Users, CreditCard, BarChart3, Shield, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, XCircle, Search, ShoppingCart, FileCheck, ScrollText, ExternalLink } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

type Tab = "overview" | "users" | "loans" | "bnpl" | "kyc" | "risk" | "audit";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    // Check admin role via has_role function
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' } as any).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-primary font-bold">Checking access...</div></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-xl font-black text-foreground mb-2">Admin Access Required</h2>
          <p className="text-sm text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <button onClick={() => navigate("/dashboard")} className="text-primary font-bold text-sm">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as Tab, icon: BarChart3, label: "Overview" },
    { id: "users" as Tab, icon: Users, label: "Users" },
    { id: "loans" as Tab, icon: CreditCard, label: "Loans" },
    { id: "bnpl" as Tab, icon: ShoppingCart, label: "BNPL" },
    { id: "kyc" as Tab, icon: FileCheck, label: "KYC" },
    { id: "risk" as Tab, icon: Shield, label: "Risk" },
    { id: "audit" as Tab, icon: ScrollText, label: "Audit" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero animated-gradient px-6 pt-6 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <h1 className="text-xl font-black text-white">Admin Dashboard 🛡️</h1>
          </div>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  tab === t.id ? "bg-white/20 text-white backdrop-blur-sm" : "text-white/60 hover:text-white/80"
                }`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "users" && <UsersTab />}
        {tab === "loans" && <LoansTab />}
        {tab === "bnpl" && <BnplTab />}
        {tab === "kyc" && <KycTab />}
        {tab === "risk" && <RiskTab />}
        {tab === "audit" && <AuditTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({ users: 0, totalLoans: 0, totalSavings: 0, totalIncome: 0 });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [profiles, loans, savings, income] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('loans').select('amount, status'),
      supabase.from('savings_goals').select('current_amount'),
      supabase.from('income_logs').select('amount, date'),
    ]);

    setStats({
      users: profiles.count || 0,
      totalLoans: (loans.data || []).reduce((s, l) => s + l.amount, 0),
      totalSavings: (savings.data || []).reduce((s, g) => s + g.current_amount, 0),
      totalIncome: (income.data || []).reduce((s, i) => s + i.amount, 0),
    });

    // Build monthly chart data from income
    const months: Record<string, number> = {};
    (income.data || []).forEach(i => {
      const month = new Date(i.date).toLocaleDateString('en-IN', { month: 'short' });
      months[month] = (months[month] || 0) + i.amount;
    });
    setMonthlyData(Object.entries(months).map(([month, amount]) => ({ month, amount })));
  };

  const loanStatusData = [
    { name: 'Active', value: 45, color: 'hsl(262, 83%, 58%)' },
    { name: 'Pending', value: 20, color: 'hsl(38, 92%, 50%)' },
    { name: 'Repaid', value: 30, color: 'hsl(152, 69%, 45%)' },
    { name: 'Overdue', value: 5, color: 'hsl(0, 84%, 60%)' },
  ];

  const statCards = [
    { label: "Total Users", value: stats.users.toLocaleString(), icon: Users, bg: "gradient-primary", emoji: "👥" },
    { label: "Loans Disbursed", value: `₹${(stats.totalLoans / 100000).toFixed(1)}L`, icon: CreditCard, bg: "gradient-warm", emoji: "💳" },
    { label: "Total Savings", value: `₹${(stats.totalSavings / 100000).toFixed(1)}L`, icon: TrendingUp, bg: "gradient-success", emoji: "💰" },
    { label: "Total Income", value: `₹${(stats.totalIncome / 100000).toFixed(1)}L`, icon: BarChart3, bg: "gradient-cool", emoji: "📈" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border/50 relative overflow-hidden">
            <div className="absolute -top-2 -right-2 text-3xl opacity-10">{s.emoji}</div>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-black text-foreground mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <h3 className="font-black text-foreground mb-4">Income Trend 📊</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'No data', amount: 0 }]}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 20%, 92%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="hsl(262, 83%, 58%)" fill="url(#incomeGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <h3 className="font-black text-foreground mb-4">Loan Distribution 🏦</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={loanStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {loanStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase()) ||
    u.occupation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <span className="text-sm text-muted-foreground font-bold">{filtered.length} users</span>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Occupation</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">City</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Credit</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">KYC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{u.name?.charAt(0) || '?'}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{u.name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.occupation || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.city || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${(u.credit_score || 300) >= 500 ? 'text-success' : 'text-destructive'}`}>
                      {u.credit_score || 300}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                      u.kyc_status === 'verified' ? 'bg-success/10 text-success' :
                      u.kyc_status === 'submitted' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>{u.kyc_status || 'pending'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LoansTab() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    const { data } = await supabase.from('loans').select('*').order('applied_at', { ascending: false });
    setLoans(data || []);
    setLoading(false);
  };

  const handleAction = async (loanId: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      const loan = loans.find(l => l.id === loanId);
      const dueDate = new Date();
      if (loan) dueDate.setDate(dueDate.getDate() + loan.duration);
      // First set due_date + approved_at, then call disburse_loan RPC (which posts ledger + status)
      const { error: updErr } = await supabase.from('loans')
        .update({ approved_at: new Date().toISOString(), due_date: dueDate.toISOString() } as any)
        .eq('id', loanId);
      if (updErr) { toast.error(updErr.message); return; }
      const { error } = await supabase.rpc('disburse_loan', { _loan_id: loanId });
      if (error) { toast.error(error.message); return; }
      toast.success('Loan approved & disbursed');
    } else {
      const { error } = await supabase.from('loans').update({ status: 'rejected' } as any).eq('id', loanId);
      if (error) { toast.error(error.message); return; }
      toast.success('Loan rejected');
    }
    loadLoans();
  };

  const pendingLoans = loans.filter(l => l.status === 'pending');
  const otherLoans = loans.filter(l => l.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-foreground mb-4">Pending Approvals ({pendingLoans.length}) ⏳</h3>
        {loading ? <p className="text-muted-foreground">Loading...</p> :
        pendingLoans.length === 0 ? (
          <div className="bg-card rounded-2xl p-6 text-center shadow-card border border-border/50">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-muted-foreground text-sm">No pending loan applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingLoans.map((loan) => (
              <motion.div key={loan.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-foreground">₹{loan.amount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{loan.duration} days · {loan.interest_rate}% interest · Applied {new Date(loan.applied_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction(loan.id, 'approved')}
                    className="px-4 py-2 rounded-xl gradient-success text-white text-sm font-bold flex items-center gap-1 shadow-glow-success">
                    <CheckCircle className="h-4 w-4" /> Approve
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction(loan.id, 'rejected')}
                    className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-bold flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Reject
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-black text-foreground mb-4">All Loans ({otherLoans.length})</h3>
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Repaid</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {otherLoans.map(loan => (
                  <tr key={loan.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 text-sm font-bold text-foreground">₹{loan.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{loan.duration}d</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">₹{loan.repaid_amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                        loan.status === 'approved' || loan.status === 'active' ? 'bg-success/10 text-success' :
                        loan.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        loan.status === 'repaid' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>{loan.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function BnplTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    const { data } = await supabase.from('bnpl_orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'active' | 'rejected') => {
    const { error } = await supabase.from('bnpl_orders').update({ status: action }).eq('id', id);
    if (error) { toast.error("Update failed"); return; }
    toast.success(action === 'active' ? 'BNPL approved!' : 'BNPL rejected');
    loadOrders();
  };

  const pending = orders.filter(o => o.status === 'pending');
  const active = orders.filter(o => o.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-foreground mb-4">Pending BNPL Approvals ({pending.length}) 🛒</h3>
        {loading ? <p className="text-muted-foreground">Loading...</p> :
        pending.length === 0 ? (
          <div className="bg-card rounded-2xl p-6 text-center shadow-card border border-border/50">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-muted-foreground text-sm">No pending BNPL applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(o => (
              <motion.div key={o.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-foreground capitalize">{o.category} · ₹{o.amount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">₹{o.daily_repayment}/day for {o.duration_days} days · Applied {new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction(o.id, 'active')}
                    className="px-4 py-2 rounded-xl gradient-success text-white text-sm font-bold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Approve
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction(o.id, 'rejected')}
                    className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-bold flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Reject
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-black text-foreground mb-4">Active BNPL Orders ({active.length})</h3>
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Repaid</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.status !== 'pending').map(o => (
                  <tr key={o.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 text-sm font-bold text-foreground capitalize">{o.category}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">₹{o.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">₹{o.total_repaid.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                        o.status === 'active' ? 'bg-success/10 text-success' :
                        o.status === 'completed' ? 'bg-primary/10 text-primary' :
                        o.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskTab() {
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('loans').select('*').then(({ data }) => {
      setLoans(data || []);
    });
  }, []);

  const overdue = loans.filter(l => l.due_date && new Date(l.due_date) < new Date() && l.status !== 'repaid');
  const highRisk = loans.filter(l => l.amount > 10000 && l.repaid_amount < l.amount * 0.2);
  const defaultRate = loans.length > 0 ? ((overdue.length / loans.length) * 100).toFixed(1) : '0';

  const riskData = [
    { category: 'Low Risk', count: loans.filter(l => l.amount <= 5000).length },
    { category: 'Medium', count: loans.filter(l => l.amount > 5000 && l.amount <= 15000).length },
    { category: 'High Risk', count: loans.filter(l => l.amount > 15000).length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-destructive/20">
          <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
          <p className="text-xs text-muted-foreground font-bold uppercase">Default Rate</p>
          <p className="text-3xl font-black text-destructive">{defaultRate}%</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card border border-warning/20">
          <AlertTriangle className="h-6 w-6 text-warning mb-2" />
          <p className="text-xs text-muted-foreground font-bold uppercase">Overdue Loans</p>
          <p className="text-3xl font-black text-warning">{overdue.length}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <Shield className="h-6 w-6 text-primary mb-2" />
          <p className="text-xs text-muted-foreground font-bold uppercase">High Risk</p>
          <p className="text-3xl font-black text-foreground">{highRisk.length}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
        <h3 className="font-black text-foreground mb-4">Risk Distribution 📊</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 20%, 92%)" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              <Cell fill="hsl(152, 69%, 45%)" />
              <Cell fill="hsl(38, 92%, 50%)" />
              <Cell fill="hsl(0, 84%, 60%)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KycTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{ id: string; url: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').in('kyc_status', ['submitted', 'pending', 'rejected']).order('updated_at', { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const viewDoc = async (p: any) => {
    if (!p.kyc_doc_url) { toast.error('No document uploaded'); return; }
    const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(p.kyc_doc_url, 3600);
    if (error || !data) { toast.error('Could not load document'); return; }
    setViewing({ id: p.id, url: data.signedUrl });
  };

  const decide = async (userId: string, status: 'verified' | 'rejected') => {
    const { error } = await supabase.from('profiles').update({ kyc_status: status } as any).eq('user_id', userId);
    if (error) { toast.error(error.message); return; }
    await supabase.rpc('log_audit_event', {
      _action: `kyc.${status}`, _entity_type: 'profile', _entity_id: userId, _metadata: {},
    });
    // Recompute credit score to reflect KYC change
    await supabase.rpc('compute_credit_score', { _user_id: userId });
    toast.success(`KYC ${status}`);
    setViewing(null);
    load();
  };

  const submitted = profiles.filter(p => p.kyc_status === 'submitted');
  const others = profiles.filter(p => p.kyc_status !== 'submitted');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-foreground mb-4">Pending KYC Review ({submitted.length}) 📄</h3>
        {loading ? <p className="text-muted-foreground">Loading...</p> :
        submitted.length === 0 ? (
          <div className="bg-card rounded-2xl p-6 text-center shadow-card border border-border/50">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-muted-foreground text-sm">No pending KYC submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submitted.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-foreground">{p.name || 'Unnamed'} · {p.phone || '—'}</p>
                  <p className="text-xs text-muted-foreground">{p.occupation || '-'} · {p.city || '-'} · Submitted {new Date(p.updated_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => viewDoc(p)}
                    className="px-3 py-2 rounded-xl bg-muted text-foreground text-sm font-bold flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" /> View Doc
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => decide(p.user_id, 'verified')}
                    className="px-3 py-2 rounded-xl gradient-success text-white text-sm font-bold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Verify
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => decide(p.user_id, 'rejected')}
                    className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-bold flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Reject
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-black text-foreground mb-4">Reviewed / Other ({others.length})</h3>
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {others.map(p => (
                <tr key={p.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{p.name || 'Unnamed'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                      p.kyc_status === 'verified' ? 'bg-success/10 text-success' :
                      p.kyc_status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>{p.kyc_status || 'pending'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-card rounded-2xl p-4 max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-foreground">KYC Document</h4>
              <button onClick={() => setViewing(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            {/\.(png|jpe?g|webp|gif)$/i.test(viewing.url.split('?')[0]) ? (
              <img src={viewing.url} alt="KYC document" className="w-full rounded-xl" />
            ) : (
              <iframe src={viewing.url} title="KYC document" className="w-full h-[70vh] rounded-xl bg-white" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AuditTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, []);

  const filtered = rows.filter(r =>
    !filter ||
    r.action?.toLowerCase().includes(filter.toLowerCase()) ||
    r.entity_type?.toLowerCase().includes(filter.toLowerCase()) ||
    r.entity_id?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by action / entity..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <span className="text-sm text-muted-foreground font-bold">{filtered.length} events</span>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">When</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Meta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{r.action}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.entity_type ? <span className="font-bold">{r.entity_type}</span> : '-'}
                    {r.entity_id && <span className="ml-1 font-mono">{r.entity_id.slice(0, 8)}…</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground max-w-xs truncate">{r.metadata ? JSON.stringify(r.metadata) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
