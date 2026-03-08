import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, PiggyBank, TrendingUp, Star, Wallet, Gift, ChevronRight } from "lucide-react";
import logo from "@/assets/rozanapay-logo.png";

const features = [
  { icon: TrendingUp, title: "Track Income", desc: "Log daily earnings", emoji: "💰", bg: "gradient-primary", shadow: "shadow-glow" },
  { icon: PiggyBank, title: "Smart Savings", desc: "Auto-save goals", emoji: "🐷", bg: "gradient-success", shadow: "shadow-glow-success" },
  { icon: Zap, title: "Instant Loans", desc: "Micro-loans fast", emoji: "⚡", bg: "gradient-warm", shadow: "shadow-glow-secondary" },
  { icon: Gift, title: "Earn Rewards", desc: "Coins & cashback", emoji: "🎁", bg: "gradient-cool", shadow: "" },
];

const floatingEmojis = ["💸", "🏦", "📊", "🎯", "💎", "🔐"];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        {/* Large gradient orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full bg-secondary/8 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl animate-float-slow" />
        {/* Dots pattern */}
        <div className="absolute inset-0 dots-pattern opacity-40" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-12 pb-8 max-w-md mx-auto w-full">
        {/* Floating emojis */}
        {floatingEmojis.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl pointer-events-none"
            style={{
              top: `${15 + (i * 13) % 60}%`,
              left: `${5 + (i * 17) % 85}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1, y: [0, -10, 0] }}
            transition={{ delay: 1 + i * 0.2, duration: 3 + i * 0.5, repeat: Infinity, repeatType: "reverse" }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Logo + Brand */}
        <motion.div
          className="flex flex-col items-center mb-8 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
        >
          <div className="relative mb-5">
            {/* Pulse ring behind logo */}
            <div className="absolute inset-0 rounded-3xl gradient-primary animate-pulse-ring" />
            <motion.div
              className="relative w-20 h-20 rounded-3xl gradient-hero shadow-glow flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={logo} alt="RozanaPay" className="w-12 h-12 object-contain" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-glow-accent border-2 border-background"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <Star className="h-3.5 w-3.5 text-accent-foreground fill-current" />
            </motion.div>
          </div>

          <motion.h1
            className="text-4xl font-black text-foreground tracking-tight mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Rozana<span className="text-primary">Pay</span>
          </motion.h1>
          <motion.p
            className="text-base text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Daily earnings. Better life. ✨
          </motion.p>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          className="w-full gradient-hero rounded-3xl p-5 mb-6 shadow-elevated relative overflow-hidden animated-gradient"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-3 right-4 text-3xl animate-bounce-gentle">🚀</div>
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Built for</p>
            <h2 className="text-xl font-extrabold text-white mb-1">Daily Wage Earners</h2>
            <p className="text-white/60 text-xs mb-4">Track income, save smartly, access micro-loans — all in one app</p>
            <div className="flex gap-4">
              {[
                { label: "10L+", sub: "Users" },
                { label: "₹50Cr+", sub: "Disbursed" },
                { label: "4.8★", sub: "Rating" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <p className="text-lg font-extrabold text-white">{stat.label}</p>
                  <p className="text-[10px] text-white/50">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-card rounded-2xl p-4 shadow-card border border-border/50 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute -top-2 -right-2 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">{f.emoji}</div>
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-2 ${f.shadow}`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-bold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="w-full mt-auto space-y-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, type: "spring" }}
        >
          <motion.button
            onClick={() => navigate("/onboarding/phone")}
            className="w-full py-4 rounded-2xl gradient-hero text-white font-bold text-lg shadow-glow active:scale-[0.97] transition-all flex items-center justify-center gap-2 group animated-gradient relative overflow-hidden"
            whileTap={{ scale: 0.97 }}
          >
            <div className="absolute inset-0 shimmer" />
            <span className="relative z-10 flex items-center gap-2">
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          <button
            onClick={() => navigate("/onboarding/phone")}
            className="w-full py-3 rounded-2xl border-2 border-primary/20 text-primary font-semibold text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            Already have an account? Sign In
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Shield className="h-3.5 w-3.5 text-success" />
            <p className="text-xs text-muted-foreground">RBI Licensed • Bank-grade encryption 🔒</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
