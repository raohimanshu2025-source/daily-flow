import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string })?.phone || "XXXXXXXXXX";

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (val.length > 1) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.every(d => d)) {
      navigate("/onboarding/profile", { state: { phone } });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-6">
      <button onClick={() => navigate(-1)} className="text-muted-foreground mb-8">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mb-6">
          <Shield className="h-7 w-7 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Verify OTP</h1>
        <p className="text-muted-foreground mb-8">
          Enter the 4-digit code sent to +91 {phone.slice(0, 4)}****{phone.slice(-2)}
        </p>

        <div className="flex gap-4 justify-center mb-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-16 h-16 text-center text-2xl font-bold rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={!otp.every(d => d)}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          Verify
        </button>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Didn't receive? <span className="text-primary font-semibold cursor-pointer">Resend OTP</span>
        </p>
        <p className="text-center text-xs text-muted-foreground mt-2">
          💡 For demo, enter any 4 digits
        </p>
      </div>
    </div>
  );
}
