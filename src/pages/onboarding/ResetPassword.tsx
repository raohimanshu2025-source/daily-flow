import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/rozanapay-logo.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setValidToken(true);
    }
    // Also listen for auth state changes (recovery event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidToken(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  if (!validToken && !window.location.hash.includes('type=recovery')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔗</p>
          <h2 className="text-xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-muted-foreground mb-4">This link is expired or invalid. Please request a new one.</p>
          <button onClick={() => navigate("/forgot-password")} className="text-primary font-bold text-sm">
            Request New Link →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute inset-0 dots-pattern opacity-20" />

      <div className="h-36 gradient-hero animated-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[2rem]" />
      </div>

      <div className="px-6 -mt-4 flex-1 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <img src={logo} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">New Password 🔐</h1>
              <p className="text-sm text-muted-foreground font-medium">Choose a strong password</p>
            </div>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-success/10 rounded-2xl p-6 text-center border border-success/20">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-2">Password Updated! ✅</h2>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full pl-14 pr-14 py-4 rounded-2xl bg-muted text-foreground text-base font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border-2 border-transparent focus:border-primary/30 transition-all" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-secondary" />
                </div>
                <input type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-muted text-foreground text-base font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border-2 border-transparent focus:border-primary/30 transition-all" />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleUpdate}
                disabled={!password || !confirm || loading}
                className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-base disabled:opacity-40 shadow-glow relative overflow-hidden">
                <div className="absolute inset-0 shimmer" />
                <span className="relative z-10">
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</span> : 'Update Password 🚀'}
                </span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
