import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (phone.length === 10) {
      navigate("/onboarding/otp", { state: { phone } });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-6">
      <button onClick={() => navigate("/")} className="text-muted-foreground mb-8">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
          <Phone className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Enter your mobile number</h1>
        <p className="text-muted-foreground mb-8">We'll send you a verification code</p>

        <div className="flex items-center gap-3 mb-8">
          <div className="px-4 py-4 rounded-xl bg-muted text-foreground font-semibold text-lg">
            +91
          </div>
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="Mobile number"
            className="flex-1 px-4 py-4 rounded-xl bg-muted text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={phone.length !== 10}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
