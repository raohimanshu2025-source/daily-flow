import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { ArrowLeft, Phone, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function PhoneLogin() {
  const [mode, setMode] = useState<'phone' | 'email'>('email');
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      toast.success("Account created! Check email or continue to profile setup.");
      navigate("/onboarding/profile");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-6">
      <button onClick={() => navigate("/")} className="text-muted-foreground mb-8">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
          {mode === 'phone' ? <Phone className="h-7 w-7 text-primary-foreground" /> : <Mail className="h-7 w-7 text-primary-foreground" />}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {mode === 'phone' ? "We'll send you a verification code" : isSignUp ? 'Sign up with your email' : 'Sign in to continue'}
        </p>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('email')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'email' ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            Email
          </button>
          <button onClick={() => setMode('phone')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'phone' ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            Phone
          </button>
        </div>

        {mode === 'phone' ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-4 rounded-xl bg-muted text-foreground font-semibold text-lg">+91</div>
              <input type="tel" maxLength={10} value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Mobile number"
                className="flex-1 px-4 py-4 rounded-xl bg-muted text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus />
            </div>
            <button onClick={handlePhoneLogin} disabled={phone.length !== 10 || loading}
              className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-4 rounded-xl bg-muted text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <div className="relative">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-4 rounded-xl bg-muted text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <button onClick={handleEmailAuth} disabled={!email || !password || loading}
              className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all">
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-center text-sm text-primary font-medium mt-3">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google Sign In */}
        <button onClick={handleGoogleLogin}
          className="w-full py-3.5 rounded-xl border border-border bg-card text-foreground font-semibold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-card">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
