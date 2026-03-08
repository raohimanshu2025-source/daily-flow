import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/rozanapay-logo.png";

export default function PhoneLogin() {
  const [mode, setMode] = useState<'phone' | 'email'>('email');
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneLogin = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("OTP sent!");
    navigate("/onboarding/otp", { state: { phone } });
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Account created!");
      navigate("/onboarding/profile");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top gradient bar */}
      <div className="h-32 gradient-hero relative">
        <button onClick={() => navigate("/")} className="absolute top-6 left-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-3xl" />
      </div>

      <div className="px-6 -mt-4 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
          {/* Logo + Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <img src={logo} alt="" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
              <p className="text-xs text-muted-foreground">{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-6">
            {(['email', 'phone'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === m ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`}>
                {m === 'email' ? '✉️ Email' : '📱 Phone'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: mode === 'email' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: mode === 'email' ? 20 : -20 }} transition={{ duration: 0.2 }}>
              {mode === 'phone' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-base">+91</div>
                    <input type="tel" maxLength={10} value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="Mobile number"
                      className="flex-1 px-4 py-3.5 rounded-2xl bg-muted text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      autoFocus />
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handlePhoneLogin} disabled={phone.length !== 10 || loading}
                    className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-base disabled:opacity-40 transition-all shadow-glow">
                    {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span> : 'Send OTP'}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-muted text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-muted text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                    </button>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleEmailAuth} disabled={!email || !password || loading}
                    className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-base disabled:opacity-40 transition-all shadow-glow">
                    {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</span> : isSignUp ? 'Sign Up' : 'Sign In'}
                  </motion.button>
                  <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-sm text-primary font-semibold py-2">
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleGoogleLogin}
            className="w-full py-3.5 rounded-2xl border border-border bg-card text-foreground font-semibold flex items-center justify-center gap-3 transition-all shadow-card hover:shadow-elevated">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
