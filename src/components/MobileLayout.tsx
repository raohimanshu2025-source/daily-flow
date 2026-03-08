import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, PiggyBank, LayoutGrid, BarChart3 } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

const navItems = [
  { path: "/dashboard", icon: Home, labelKey: "nav.home" },
  { path: "/income", icon: TrendingUp, labelKey: "nav.income" },
  { path: "/services", icon: LayoutGrid, labelKey: "nav.services" },
  { path: "/savings", icon: PiggyBank, labelKey: "nav.savings" },
  { path: "/analytics", icon: BarChart3, labelKey: "nav.insights" },
];

export default function MobileLayout({ children }: { children: ReactNode }) {
  useLanguage(); // re-render on lang change
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
