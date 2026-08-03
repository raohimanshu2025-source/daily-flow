import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { QrCode, ShoppingBag, Coins, Shield, Gift, Smartphone, MessageCircle, Users, Award, Brain, Receipt, LifeBuoy } from "lucide-react";

const services = [
  { icon: QrCode, label: "UPI QR Pay", desc: "Receive payments via QR", path: "/upi-qr", color: "bg-primary/10 text-primary" },
  { icon: ShoppingBag, label: "Buy Now Pay Later", desc: "Essentials on credit", path: "/bnpl", color: "bg-warning/10 text-warning" },
  { icon: Coins, label: "Digital Gold", desc: "Save in gold from ₹10", path: "/gold", color: "bg-accent/10 text-accent" },
  { icon: Shield, label: "Micro Insurance", desc: "Coverage from ₹1/day", path: "/insurance", color: "bg-destructive/10 text-destructive" },
  { icon: Gift, label: "Rewards", desc: "Earn coins & cashback", path: "/rewards", color: "bg-primary/10 text-primary" },
  { icon: Smartphone, label: "Bill Payments", desc: "Recharge & pay bills", path: "/bills", color: "bg-accent/10 text-accent" },
  { icon: MessageCircle, label: "Chat Assistant", desc: "Voice & text banking", path: "/chatbot", color: "bg-info/10 text-info" },
  { icon: Users, label: "Group Savings", desc: "Digital chit fund", path: "/group-savings", color: "bg-warning/10 text-warning" },
  { icon: Award, label: "Credit Score", desc: "Export financial identity", path: "/credit-export", color: "bg-success/10 text-success" },
  { icon: Brain, label: "Smart Nudges", desc: "AI spending insights", path: "/smart-nudges", color: "bg-primary/10 text-primary" },
  { icon: Receipt, label: "Expense Tracker", desc: "Track daily spending", path: "/expenses", color: "bg-destructive/10 text-destructive" },
  { icon: LifeBuoy, label: "Help & Grievance", desc: "Raise & track complaints", path: "/support", color: "bg-info/10 text-info" },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">All Services</h1>
        <p className="text-sm text-muted-foreground mb-5">Everything you need in one place</p>

        <div className="grid grid-cols-2 gap-3">
          {services.map((s) => (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className="flex items-start gap-3 bg-card rounded-xl p-4 shadow-card text-left transition-all active:scale-[0.98]"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{s.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
