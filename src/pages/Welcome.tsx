import { useNavigate } from "react-router-dom";
import logo from "@/assets/rozanapay-logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gradient-hero text-primary-foreground">
      <div className="animate-fade-in flex flex-col items-center text-center max-w-sm">
        <div className="w-24 h-24 bg-card rounded-2xl flex items-center justify-center mb-6 shadow-elevated">
          <img src={logo} alt="RozanaPay" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-3xl font-bold mb-2">RozanaPay</h1>
        <p className="text-lg opacity-90 mb-1">Daily earnings. Better financial life.</p>
        <p className="text-sm opacity-70 mb-10">
          Manage your daily cash, save smartly, and access instant micro-loans.
        </p>

        <button
          onClick={() => navigate("/onboarding/phone")}
          className="w-full py-4 rounded-xl bg-card text-primary font-bold text-lg shadow-elevated active:scale-[0.98] transition-transform mb-3"
        >
          Get Started
        </button>

        <p className="text-xs opacity-60 mt-8">
          🔒 Your data is safe and encrypted
        </p>
      </div>
    </div>
  );
}
