import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, TrendingUp, PiggyBank, LayoutGrid, BarChart3 } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

const navItems = [
  { path: "/dashboard", icon: Home, labelKey: "nav.home", emoji: "🏠" },
  { path: "/income", icon: TrendingUp, labelKey: "nav.income", emoji: "💰" },
  { path: "/services", icon: LayoutGrid, labelKey: "nav.services", emoji: "📱" },
  { path: "/savings", icon: PiggyBank, labelKey: "nav.savings", emoji: "🐷" },
  { path: "/analytics", icon: BarChart3, labelKey: "nav.insights", emoji: "📊" },
];

export default function MobileLayout({ children }: { children: ReactNode }) {
  useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <motion.div
        className="flex-1 overflow-y-auto pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Bottom Navigation - Bold Floating Style */}
      <div className="fixed bottom-0 left-0 right-0 px-3 pb-2 z-50 safe-bottom">
        <nav className="max-w-md mx-auto bg-card/98 backdrop-blur-2xl rounded-2xl shadow-elevated border border-border/40 px-1 py-1">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all"
                  whileTap={{ scale: 0.85 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 gradient-primary rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary-foreground stroke-[2.5]" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-[9px] relative z-10 transition-colors ${isActive ? "font-black text-primary-foreground" : "font-semibold text-muted-foreground"}`}>
                    {t(item.labelKey)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
