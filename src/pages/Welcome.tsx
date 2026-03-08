import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, PiggyBank, TrendingUp, Star } from "lucide-react";
import logo from "@/assets/rozanapay-logo.png";

const features = [
  { icon: TrendingUp, title: "Track Income", desc: "Log daily earnings instantly", color: "gradient-primary" },
  { icon: PiggyBank, title: "Smart Savings", desc: "Auto-save goals that work", color: "gradient-accent" },
  { icon: Zap, title: "Instant Loans", desc: "Micro-loans in minutes", color: "gradient-warm" },
  { icon: Shield, title: "Secure & Safe", desc: "Bank-grade encryption", color: "gradient-primary" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-hero animated-gradient" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto w-full">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center text-center flex-1 justify-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="relative mb-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-elevated animate-float">
              <img src={logo} alt="RozanaPay" className="w-12 h-12 object-contain" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 gradient-accent rounded-full flex items-center justify-center shadow-glow-accent">
              <Star className="h-3 w-3 text-accent-foreground" />
            </div>
          </motion.div>

          <motion.h1 variants={item} className="text-4xl font-extrabold text-white mb-3 tracking-tight">
            RozanaPay
          </motion.h1>
          <motion.p variants={item} className="text-lg text-white/85 font-medium mb-1">
            Daily earnings. Better financial life.
          </motion.p>
          <motion.p variants={item} className="text-sm text-white/60 max-w-xs mb-10">
            Track income, save smartly, access micro-loans — all designed for daily wage earners.
          </motion.p>

          {/* Feature Cards */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3 w-full mb-10">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card rounded-2xl p-3.5 flex items-start gap-3 border border-white/10"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
                  <f.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{f.title}</p>
                  <p className="text-[10px] text-white/60 mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, type: "spring" }}
        >
          <button
            onClick={() => navigate("/onboarding/phone")}
            className="w-full py-4 rounded-2xl bg-white text-primary font-bold text-lg shadow-elevated active:scale-[0.97] transition-all flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Shield className="h-3.5 w-3.5 text-white/50" />
            <p className="text-xs text-white/50">Secured with bank-grade encryption</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
