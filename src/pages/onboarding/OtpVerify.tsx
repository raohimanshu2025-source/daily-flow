import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string })?.phone || "";

  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleChange = (idx: number, val: string) => {
    if (val.length > 1) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  const handleVerify = async () => {
    const token = otp.join('');
    if (token.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Verified!");
    navigate("/onboarding/profile");
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
          Enter the 6-digit code sent to +91 {phone.slice(0, 4)}****{phone.slice(-2)}
        </p>

        <div className="flex gap-3 justify-center mb-8">
          {otp.map((digit, i) => (
            <input key={i} ref={refs[i]} type="tel" maxLength={1} value={digit}
              onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          ))}
        </div>

        <button onClick={handleVerify} disabled={!otp.every(d => d) || loading}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all">
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Didn't receive? <span className="text-primary font-semibold cursor-pointer">Resend OTP</span>
        </p>
      </div>
    </div>
  );
}
