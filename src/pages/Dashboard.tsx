import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useIncomeLogs, useSavingsGoals, useLoans, useTransactions, useNotifications } from "@/hooks/use-cloud-data";
import MobileLayout from "@/components/MobileLayout";
import { Plus, PiggyBank, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Bell, Coins, Shield, Gift, LayoutGrid, Moon, Sun, Minus, LogOut } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/rozanapay-logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { lang, toggle: toggleLang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const { data: profile } = useProfile();
  const { data: incomes = [] } = useIncomeLogs();
  const { data: savings = [] } = useSavingsGoals();
  const { data: loans = [] } = useLoans();
  const { data: transactions = [] } = useTransactions();
  const { data: notifications = [] } = useNotifications();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayIncome = incomes.filter(i => i.date.startsWith(todayStr)).reduce((s, i) => s + i.amount, 0);
  const totalSavings = savings.reduce((s, g) => s + g.current_amount, 0);
  const activeLoans = loans.filter(l => ['approved', 'active', 'pending'].includes(l.status || ''));
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalLoanBorrowed = loans.filter(l => ['approved', 'active'].includes(l.status || '')).reduce((s, l) => s + l.amount, 0);
  const totalLoanRepaid = loans.reduce((s, l) => s + l.repaid_amount, 0);
  const balance = totalIncome - totalSavings - totalLoanRepaid + totalLoanBorrowed;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const quickActions = [
    { icon: Plus, label: t('dash.addIncome'), color: "gradient-primary", path: "/income" },
    { icon: PiggyBank, label: t('dash.saveMoney'), color: "gradient-accent", path: "/savings" },
    { icon: Minus, label: t('expense.addExpense'), color: "gradient-warm", path: "/expenses" },
    { icon: CreditCard, label: t('dash.getLoan'), color: "gradient-primary", path: "/loans" },
  ];

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {profile?.name?.charAt(0) || "R"}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('dash.greeting')}</p>
              <p className="font-semibold text-foreground">{profile?.name || "User"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleLang} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{lang === 'en' ? 'हि' : 'En'}</span>
            </button>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              {theme === 'light' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-warning" />}
            </button>
            <button onClick={() => navigate('/notifications')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadNotifs > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-[9px] font-bold text-destructive-foreground">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                </div>
              )}
            </button>
            <button onClick={signOut} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center" title="Sign Out">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="gradient-hero rounded-2xl p-5 mb-6 shadow-elevated animate-fade-in">
          <p className="text-primary-foreground/70 text-sm mb-1">{t('dash.balance')}</p>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">₹{balance.toLocaleString("en-IN")}</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-primary-foreground/70" />
              <div>
                <p className="text-[10px] text-primary-foreground/60">{t('dash.todayIncome')}</p>
                <p className="text-sm font-semibold text-primary-foreground">₹{todayIncome.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary-foreground/70" />
              <div>
                <p className="text-[10px] text-primary-foreground/60">{t('dash.totalSavings')}</p>
                <p className="text-sm font-semibold text-primary-foreground">₹{totalSavings.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-2 animate-slide-up">
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
              <span className="text-xs text-muted-foreground">{t('dash.creditScore')}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{profile?.credit_score || 300}</p>
            <div className="w-full h-1.5 rounded-full bg-muted mt-2">
              <div className="h-full rounded-full gradient-accent transition-all" style={{ width: `${((profile?.credit_score || 300) / 900) * 100}%` }} />
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{t('dash.activeLoans')}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{activeLoans.length}</p>
            <p className="text-xs text-muted-foreground mt-1">₹{activeLoans.reduce((s, l) => s + l.amount, 0).toLocaleString("en-IN")} total</p>
          </div>
        </div>

        {/* Featured Services */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{t('dash.exploreServices')}</h3>
            <button onClick={() => navigate("/services")} className="text-sm text-primary font-medium">{t('common.seeAll')}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { icon: Coins, label: "Digital Gold", path: "/gold", color: "gradient-warm" },
              { icon: Shield, label: "Insurance", path: "/insurance", color: "gradient-accent" },
              { icon: Gift, label: "Rewards", path: "/rewards", color: "gradient-primary" },
              { icon: LayoutGrid, label: t('nav.services'), path: "/services", color: "gradient-hero" },
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
            <h3 className="font-semibold text-foreground">{t('dash.recentActivity')}</h3>
            <button onClick={() => navigate("/transactions")} className="text-sm text-primary font-medium">{t('common.seeAll')}</button>
          </div>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">{t('common.noData')}</p>
            ) : (
              transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.type === 'income' ? 'bg-success/10' : txn.type === 'savings' ? 'bg-primary/10' : txn.type === 'loan' ? 'bg-warning/10' : 'bg-muted'
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
