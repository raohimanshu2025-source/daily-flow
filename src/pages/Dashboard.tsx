import { useNavigate } from "react-router-dom";
import { store } from "@/lib/store";
import MobileLayout from "@/components/MobileLayout";
import { Plus, PiggyBank, Send, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Bell, Coins, Shield, Gift, LayoutGrid } from "lucide-react";
import { featureStore } from "@/lib/store-features";
import logo from "@/assets/rozanapay-logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = store.getUser();
  const balance = store.getBalance();
  const todayIncome = store.getTodayIncome();
  const totalSavings = store.getTotalSavings();
  const activeLoans = store.getActiveLoans();
  const transactions = store.getTransactions().slice(0, 5);

  const quickActions = [
    { icon: Plus, label: "Add Income", color: "gradient-primary", path: "/income" },
    { icon: PiggyBank, label: "Save Money", color: "gradient-accent", path: "/savings" },
    { icon: Send, label: "Send Money", color: "gradient-warm", path: "/transactions" },
    { icon: CreditCard, label: "Get Loan", color: "gradient-primary", path: "/loans" },
  ];

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {user?.name?.charAt(0) || "R"}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Good morning</p>
              <p className="font-semibold text-foreground">{user?.name || "User"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="RozanaPay" className="h-6 w-6" />
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="gradient-hero rounded-2xl p-5 mb-6 shadow-elevated animate-fade-in">
          <p className="text-primary-foreground/70 text-sm mb-1">Available Balance</p>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            ₹{balance.toLocaleString("en-IN")}
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-primary-foreground/70" />
              <div>
                <p className="text-[10px] text-primary-foreground/60">Today's Income</p>
                <p className="text-sm font-semibold text-primary-foreground">₹{todayIncome.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary-foreground/70" />
              <div>
                <p className="text-[10px] text-primary-foreground/60">Total Savings</p>
                <p className="text-sm font-semibold text-primary-foreground">₹{totalSavings.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 animate-slide-up"
            >
              <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center shadow-card`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-medium text-foreground text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Credit Score</span>
            </div>
            <p className="text-xl font-bold text-foreground">{user?.creditScore || 300}</p>
            <div className="w-full h-1.5 rounded-full bg-muted mt-2">
              <div
                className="h-full rounded-full gradient-accent transition-all"
                style={{ width: `${((user?.creditScore || 300) / 900) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Active Loans</span>
            </div>
            <p className="text-xl font-bold text-foreground">{activeLoans.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{activeLoans.reduce((s, l) => s + l.amount, 0).toLocaleString("en-IN")} total
            </p>
          </div>
        </div>

        {/* Featured Services */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Explore Services</h3>
            <button onClick={() => navigate("/services")} className="text-sm text-primary font-medium">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { icon: Coins, label: "Digital Gold", path: "/gold", color: "gradient-warm" },
              { icon: Shield, label: "Insurance", path: "/insurance", color: "gradient-accent" },
              { icon: Gift, label: "Rewards", path: "/rewards", color: "gradient-primary" },
              { icon: LayoutGrid, label: "All Services", path: "/services", color: "gradient-hero" },
            ].map((s) => (
              <button key={s.path} onClick={() => navigate(s.path)} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center shadow-card`}>
                  <s.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <button onClick={() => navigate("/transactions")} className="text-sm text-primary font-medium">
              See All
            </button>
          </div>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No transactions yet</p>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.type === 'income' ? 'bg-success/10' :
                    txn.type === 'savings' ? 'bg-primary/10' :
                    txn.type === 'loan' ? 'bg-warning/10' : 'bg-muted'
                  }`}>
                    {txn.type === 'income' ? <ArrowDownLeft className="h-5 w-5 text-success" /> :
                     txn.type === 'savings' ? <PiggyBank className="h-5 w-5 text-primary" /> :
                     <CreditCard className="h-5 w-5 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
