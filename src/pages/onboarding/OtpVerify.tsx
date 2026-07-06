import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const RESEND_SECONDS = 30;

export default function OtpVerify() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [lang, setLang] = useState<'en' | 'hi'>(() => (localStorage.getItem('rozanapay_lang') as 'en' | 'hi') || 'en');
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string })?.phone || "";
  const nextPath = (location.state as { next?: string | null })?.next || null;
  const safeNext = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;

  const tt = (en: string, hi: string) => (lang === 'hi' ? hi : en);

  useEffect(() => { refs[0].current?.focus(); }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const verifyToken = useCallback(async (token: string) => {
    if (token.length !== 6 || loading) return;
    setLoading(true);
    setError(false);
    const { error: err } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    });
    setLoading(false);
    if (err) {
      setError(true);
      toast.error(err.message);
      setTimeout(() => { setOtp(["", "", "", "", "", ""]); setError(false); refs[0].current?.focus(); }, 600);
      return;
    }
    setVerified(true);
    toast.success(tt("Verified!", "सत्यापित!"));
    setTimeout(() => {
      if (safeNext) window.location.href = safeNext;
      else navigate("/onboarding/profile");
    }, 700);
  }, [phone, loading, navigate, lang, safeNext]);

  const handleChange = (idx: number, val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) {
      const next = [...otp]; next[idx] = ""; setOtp(next);
      return;
    }
    // Paste support: fill multiple boxes
    if (digits.length > 1) {
      const next = [...otp];
      for (let i = 0; i < digits.length && idx + i < 6; i++) next[idx + i] = digits[i];
      setOtp(next);
      const lastIdx = Math.min(idx + digits.length, 5);
      refs[lastIdx].current?.focus();
      const joined = next.join('');
      if (joined.length === 6 && next.every(Boolean)) verifyToken(joined);
      return;
    }
    const next = [...otp];
    next[idx] = digits[0];
    setOtp(next);
    if (idx < 5) refs[idx + 1].current?.focus();
    if (next.every(Boolean)) verifyToken(next.join(''));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
    if (e.key === "ArrowLeft" && idx > 0) refs[idx - 1].current?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending || !phone) return;
    setResending(true);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    setResending(false);
    if (err) { toast.error(err.message); return; }
    setSecondsLeft(RESEND_SECONDS);
    setOtp(["", "", "", "", "", ""]);
    refs[0].current?.focus();
    toast.success(tt("New OTP sent!", "नया OTP भेजा गया!"));
  };

  const toggleLang = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    localStorage.setItem('rozanapay_lang', next);
    window.dispatchEvent(new Event('langchange'));
  };

  const filledCount = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-6 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <button onClick={toggleLang}
          className="px-3 py-1.5 rounded-full bg-muted text-xs font-bold text-foreground active:scale-95 transition-transform">
          {lang === 'en' ? '🇬🇧 EN' : '🇮🇳 हिं'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <motion.div
          className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mb-6 shadow-glow"
          animate={verified ? { scale: [1, 1.15, 1], rotate: [0, 360] } : {}}
          transition={{ duration: 0.6 }}
        >
          {verified ? <CheckCircle2 className="h-7 w-7 text-accent-foreground" /> : <Shield className="h-7 w-7 text-accent-foreground" />}
        </motion.div>
        <h1 className="text-2xl font-black text-foreground mb-2">
          {tt('Verify OTP', 'OTP सत्यापित करें')} 🔐
        </h1>
        <p className="text-muted-foreground mb-2 text-sm">
          {tt('Enter the 6-digit code sent to', '6 अंकों का कोड दर्ज करें')}
        </p>
        <p className="text-foreground font-bold mb-8">+91 {phone.slice(0, 4)}****{phone.slice(-2)}</p>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(filledCount / 6) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>

        <motion.div
          className="flex gap-2 justify-center mb-8"
          animate={error ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={i === 0 ? 6 : 1}
              value={digit}
              disabled={verified || loading}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-14 text-center text-xl font-black rounded-xl text-foreground transition-all border-2 focus:outline-none ${
                error
                  ? 'bg-destructive/10 border-destructive'
                  : verified
                  ? 'bg-success/10 border-success'
                  : digit
                  ? 'bg-card border-primary shadow-glow'
                  : 'bg-muted border-transparent focus:border-primary/50 focus:bg-card'
              }`}
            />
          ))}
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => verifyToken(otp.join(''))}
          disabled={!otp.every(d => d) || loading || verified}
          className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-base disabled:opacity-40 transition-all shadow-glow relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {tt('Verifying...', 'सत्यापन हो रहा है...')}</>
            ) : verified ? (
              <><CheckCircle2 className="h-5 w-5" /> {tt('Verified!', 'सत्यापित!')}</>
            ) : (
              <>✅ {tt('Verify', 'सत्यापित करें')}</>
            )}
          </span>
        </motion.button>

        <div className="text-center mt-6">
          <AnimatePresence mode="wait">
            {secondsLeft > 0 ? (
              <motion.p key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground text-sm">
                {tt('Resend OTP in', 'OTP पुनः भेजें')}{' '}
                <span className="font-bold text-foreground tabular-nums">{secondsLeft}s</span>
              </motion.p>
            ) : (
              <motion.button
                key="resend"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {resending ? tt('Sending...', 'भेजा जा रहा है...') : `🔄 ${tt('Resend OTP', 'OTP पुनः भेजें')}`}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8">
          🔒 {tt('Your data is encrypted & secure', 'आपका डेटा सुरक्षित और एन्क्रिप्टेड है')}
        </p>
      </motion.div>
    </div>
  );
}
