import { useNavigate } from "react-router-dom";
import { store } from "@/lib/store";
import logo from "@/assets/rozanapay-logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/onboarding/phone");
  };

  const handleDemo = () => {
    const demoUser = {
      id: "demo-user",
      name: "Ramesh Kumar",
      phone: "9876543210",
      age: 32,
      occupation: "Auto Driver",
      city: "Delhi",
      incomeType: "daily" as const,
      createdAt: new Date().toISOString(),
      creditScore: 450,
    };
    store.setUser(demoUser);
    store.seedDemoData();
    store.setOnboarded(true);
    navigate("/dashboard");
  };

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
          onClick={handleGetStarted}
          className="w-full py-4 rounded-xl bg-card text-primary font-bold text-lg shadow-elevated active:scale-[0.98] transition-transform mb-3"
        >
          Get Started
        </button>
        <button
          onClick={handleDemo}
          className="w-full py-3 rounded-xl border-2 border-primary-foreground/30 text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform"
        >
          Try Demo
        </button>

        <p className="text-xs opacity-60 mt-8">
          🔒 Your data is safe and encrypted
        </p>
      </div>
    </div>
  );
}
