import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useIncomeLogs, useSavingsGoals, useLoans, useTransactions, useNotifications } from "@/hooks/use-cloud-data";
import MobileLayout from "@/components/MobileLayout";
import { Plus, PiggyBank, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Bell, Coins, Shield, Gift, LayoutGrid, Moon, Sun, Minus, LogOut, ChevronRight, Wallet, Zap } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/rozanapay-logo.png";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
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
  const creditScore = profile?.credit_score || 300;
  const creditPercent = (creditScore / 900) * 100;

  const quickActions = [
    { icon: Plus, label: t('dash.addIncome'), emoji: "💰", bg: "gradient-primary", shadow: "shadow-glow", path: "/income" },
    { icon: PiggyBank, label: t('dash.saveMoney'), emoji: "🐷", bg: "gradient-success", shadow: "shadow-glow-success", path: "/savings" },
    { icon: Minus, label: t('expense.addExpense'), emoji: "💸", bg: "gradient-warm", shadow: "shadow-glow-secondary", path: "/expenses" },
    { icon: CreditCard, label: t('dash.getLoan'), emoji: "⚡", bg: "gradient-cool", shadow: "", path: "/loans" },
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
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center shadow-glow"
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white font-black text-base">
                {profile?.name?.charAt(0) || "R"}
              </span>
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{greeting()} 👋</p>
              <p className="font-black text-foreground text-lg">{profile?.name || "User"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleLang} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
              <span className="text-[10px] font-extrabold text-foreground">{lang === 'en' ? 'हि' : 'En'}</span>
            </button>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
              {theme === 'light' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-accent" />}
            </button>
            <button onClick={() => navigate('/notifications')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center relative hover:bg-primary/10 transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadNotifs > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-secondary flex items-center justify-center border-2 border-background">
                  <span className="text-[8px] font-black text-secondary-foreground">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                </motion.div>
              )}
            </button>
            <button onClick={signOut} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Balance Card - Bold Gradient */}
        <motion.div variants={fadeUp}
          className="relative gradient-hero animated-gradient rounded-3xl p-6 mb-5 shadow-elevated overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/8 rounded-full -translate-y-1/2 translate-x-1/4 animate-spin-slow" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-4 right-5 text-2xl animate-bounce-gentle">💎</div>
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-white/60" />
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{t('dash.balance')}</p>
            </div>
            <h2 className="text-4xl font-black text-white mb-5 tracking-tight">
              ₹{balance.toLocaleString("en-IN")}
            </h2>
            <div className="flex gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <ArrowDownLeft className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50 font-semibold">{t('dash.todayIncome')}</p>
                  <p className="text-sm font-extrabold text-white">₹{todayIncome.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50 font-semibold">{t('dash.totalSavings')}</p>
                  <p className="text-sm font-extrabold text-white">₹{totalSavings.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3 mb-5">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2"
              whileTap={{ scale: 0.85 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center ${action.shadow} relative`}>
                <action.icon className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 text-sm">{action.emoji}</span>
              </div>
              <span className="text-[10px] font-bold text-foreground text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats Row - Credit Score + Active Loans */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-5">
          {/* Credit Score with ring */}
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 relative overflow-hidden">
            <div className="absolute -top-2 -right-2 text-3xl opacity-10">📊</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg gradient-success flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[11px] text-muted-foreground font-bold">{t('dash.creditScore')}</span>
            </div>
            {/* SVG Ring */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <motion.circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke="url(#creditGrad)" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${creditPercent * 1.508} 150.8`}
                    initial={{ strokeDasharray: "0 150.8" }}
                    animate={{ strokeDasharray: `${creditPercent * 1.508} 150.8` }}
                    transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="creditGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(152 69% 45%)" />
                      <stop offset="100%" stopColor="hsl(187 92% 46%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-foreground">{creditScore}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold">out of 900</p>
                <p className={`text-xs font-bold ${creditScore >= 700 ? 'text-success' : creditScore >= 500 ? 'text-warning' : 'text-destructive'}`}>
                  {creditScore >= 700 ? '🟢 Good' : creditScore >= 500 ? '🟡 Fair' : '🔴 Poor'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Loans */}
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 relative overflow-hidden">
            <div className="absolute -top-2 -right-2 text-3xl opacity-10">💳</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[11px] text-muted-foreground font-bold">{t('dash.activeLoans')}</span>
            </div>
            <p className="text-3xl font-black text-foreground">{activeLoans.length}</p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              ₹{activeLoans.reduce((s, l) => s + l.amount, 0).toLocaleString("en-IN")} total
            </p>
            {activeLoans.length > 0 && (
              <button onClick={() => navigate('/loans')} className="mt-2 text-xs text-primary font-bold flex items-center gap-0.5">
                View <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Services Carousel */}
        <motion.div variants={fadeUp} className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-foreground">{t('dash.exploreServices')}</h3>
            <button onClick={() => navigate("/services")} className="text-xs text-primary font-bold flex items-center gap-0.5">
              {t('common.seeAll')} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { icon: Coins, label: "Digital Gold", path: "/gold", bg: "gradient-accent", emoji: "🪙" },
              { icon: Shield, label: "Insurance", path: "/insurance", bg: "gradient-success", emoji: "🛡️" },
              { icon: Gift, label: "Rewards", path: "/rewards", bg: "gradient-secondary", emoji: "🎁" },
              { icon: Zap, label: "BNPL", path: "/bnpl", bg: "gradient-warm", emoji: "⚡" },
              { icon: LayoutGrid, label: t('nav.services'), path: "/services", bg: "gradient-primary", emoji: "📱" },
            ].map((s, i) => (
              <motion.button
                key={s.path}
                onClick={() => navigate(s.path)}
                className="flex flex-col items-center gap-1.5 shrink-0"
                whileTap={{ scale: 0.85 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shadow-card relative`}>
                  <s.icon className="h-6 w-6 text-white" />
                  <span className="absolute -top-1 -right-1 text-xs">{s.emoji}</span>
                </div>
                <span className="text-[10px] font-bold text-foreground whitespace-nowrap">{s.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-foreground">{t('dash.recentActivity')}</h3>
            <button onClick={() => navigate("/transactions")} className="text-xs text-primary font-bold flex items-center gap-0.5">
              {t('common.seeAll')} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 text-center border border-border/50 shadow-card">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-muted-foreground text-sm font-semibold">{t('common.noData')}</p>
                <motion.button
                  onClick={() => navigate('/income')}
                  className="mt-4 text-sm text-primary-foreground font-bold gradient-primary px-6 py-2.5 rounded-xl shadow-glow"
                  whileTap={{ scale: 0.95 }}
                >
                  {t('dash.addIncome')} 💰
                </motion.button>
              </div>
            ) : (
              transactions.slice(0, 5).map((txn, i) => (
                <motion.div
                  key={txn.id}
                  className="flex items-center gap-3 bg-card rounded-2xl p-3.5 shadow-card border border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    txn.type === 'income' ? 'gradient-success' : txn.type === 'savings' ? 'gradient-cool' : txn.type === 'expense' ? 'gradient-warm' : 'gradient-primary'
                  }`}>
                    {txn.type === 'income' ? <ArrowDownLeft className="h-5 w-5 text-white" /> :
                     txn.type === 'savings' ? <PiggyBank className="h-5 w-5 text-white" /> :
                     txn.type === 'expense' ? <ArrowUpRight className="h-5 w-5 text-white" /> :
                     <CreditCard className="h-5 w-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{txn.description}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {new Date(txn.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <p className={`text-sm font-black ${txn.type === 'income' ? 'text-success' : txn.type === 'expense' ? 'text-destructive' : 'text-foreground'}`}>
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
