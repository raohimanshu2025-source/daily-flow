import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useIncomeLogs, useSavingsGoals, useLoans, useTransactions, useNotifications } from "@/hooks/use-cloud-data";
import MobileLayout from "@/components/MobileLayout";
import { Plus, PiggyBank, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Bell, Coins, Shield, Gift, LayoutGrid, Moon, Sun, Minus, LogOut, ChevronRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/rozanapay-logo.png";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } };

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
    { icon: Plus, label: t('dash.addIncome'), color: "gradient-primary", shadow: "shadow-glow", path: "/income" },
    { icon: PiggyBank, label: t('dash.saveMoney'), color: "gradient-accent", shadow: "shadow-glow-accent", path: "/savings" },
    { icon: Minus, label: t('expense.addExpense'), color: "gradient-warm", shadow: "", path: "/expenses" },
    { icon: CreditCard, label: t('dash.getLoan'), color: "gradient-primary", shadow: "shadow-glow", path: "/loans" },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === 'hi' ? 'सुप्रभात' : 'Good morning';
    if (hour < 17) return lang === 'hi' ? 'नमस्कार' : 'Good afternoon';
    return lang === 'hi' ? 'शुभ संध्या' : 'Good evening';
  };

  return (
    <MobileLayout>
      <motion.div className="px-5 pt-6" variants={stagger} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-sm">
                {profile?.name?.charAt(0) || "R"}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{greeting()}</p>
              <p className="font-bold text-foreground">{profile?.name || "User"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleLang} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <span className="text-[10px] font-extrabold text-foreground">{lang === 'en' ? 'हि' : 'En'}</span>
            </button>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              {theme === 'light' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-warning" />}
            </button>
            <button onClick={() => navigate('/notifications')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center relative hover:bg-muted/80 transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadNotifs > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-[9px] font-bold text-destructive-foreground">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                </motion.div>
              )}
            </button>
            <button onClick={signOut} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div variants={fadeUp}
          className="relative gradient-hero rounded-3xl p-6 mb-6 shadow-elevated overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-medium mb-1">{t('dash.balance')}</p>
            <h2 className="text-4xl font-extrabold text-white mb-5 tracking-tight">
              ₹{balance.toLocaleString("en-IN")}
            </h2>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <ArrowDownLeft className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">{t('dash.todayIncome')}</p>
                  <p className="text-sm font-bold text-white">₹{todayIncome.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">{t('dash.totalSavings')}</p>
                  <p className="text-sm font-bold text-white">₹{totalSavings.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2"
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <div className={`w-13 h-13 rounded-2xl ${action.color} flex items-center justify-center ${action.shadow}`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">{t('dash.creditScore')}</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">{profile?.credit_score || 300}</p>
            <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-accent"
                initial={{ width: 0 }}
                animate={{ width: `${((profile?.credit_score || 300) / 900) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">{t('dash.activeLoans')}</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">{activeLoans.length}</p>
            <p className="text-[11px] text-muted-foreground mt-1">₹{activeLoans.reduce((s, l) => s + l.amount, 0).toLocaleString("en-IN")} total</p>
          </div>
        </motion.div>

        {/* Services Carousel */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">{t('dash.exploreServices')}</h3>
            <button onClick={() => navigate("/services")} className="text-xs text-primary font-semibold flex items-center gap-0.5">
              {t('common.seeAll')} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { icon: Coins, label: "Digital Gold", path: "/gold", color: "gradient-warm" },
              { icon: Shield, label: "Insurance", path: "/insurance", color: "gradient-accent" },
              { icon: Gift, label: "Rewards", path: "/rewards", color: "gradient-primary" },
              { icon: LayoutGrid, label: t('nav.services'), path: "/services", color: "gradient-hero" },
            ].map((s, i) => (
              <motion.button
                key={s.path}
                onClick={() => navigate(s.path)}
                className="flex flex-col items-center gap-1.5 shrink-0"
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center shadow-card`}>
                  <s.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">{s.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">{t('dash.recentActivity')}</h3>
            <button onClick={() => navigate("/transactions")} className="text-xs text-primary font-semibold flex items-center gap-0.5">
              {t('common.seeAll')} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-muted-foreground text-sm">{t('common.noData')}</p>
                <button onClick={() => navigate('/income')} className="mt-3 text-sm text-primary font-semibold">
                  {t('dash.addIncome')} →
                </button>
              </div>
            ) : (
              transactions.slice(0, 5).map((txn, i) => (
                <motion.div
                  key={txn.id}
                  className="flex items-center gap-3 bg-card rounded-2xl p-3.5 shadow-card border border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.type === 'income' ? 'bg-success/10' : txn.type === 'savings' ? 'bg-primary/10' : txn.type === 'expense' ? 'bg-destructive/10' : 'bg-warning/10'
                  }`}>
                    {txn.type === 'income' ? <ArrowDownLeft className="h-5 w-5 text-success" /> :
                     txn.type === 'savings' ? <PiggyBank className="h-5 w-5 text-primary" /> :
                     txn.type === 'expense' ? <ArrowUpRight className="h-5 w-5 text-destructive" /> :
                     <CreditCard className="h-5 w-5 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{txn.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${txn.type === 'income' ? 'text-success' : txn.type === 'expense' ? 'text-destructive' : 'text-foreground'}`}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString("en-IN")}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </MobileLayout>
  );
}
