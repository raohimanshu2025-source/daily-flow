import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/rozanapay-logo.png";

export default function VerifyEmail() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!user?.email) return;
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verification email resent!");
  };

  const handleCheckVerification = async () => {
    // Refresh the session to check if email is now verified
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      toast.error("Could not refresh session");
      return;
    }
    if (data.user?.email_confirmed_at) {
      toast.success("Email verified! 🎉");
      navigate("/dashboard");
    } else {
      toast.info("Email not verified yet. Check your inbox.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute inset-0 dots-pattern opacity-20" />

      <div className="h-36 gradient-hero animated-gradient relative">
        <button onClick={() => navigate("/")} className="absolute top-6 left-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[2rem]" />
      </div>

      <div className="px-6 -mt-4 flex-1 relative z-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            className="w-20 h-20 rounded-3xl gradient-accent flex items-center justify-center shadow-glow-accent mx-auto mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Mail className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="text-2xl font-black text-foreground mb-2">Verify Your Email 📧</h1>
          <p className="text-sm text-muted-foreground mb-2 font-medium">
            We sent a verification link to
          </p>
          <p className="text-base font-bold text-primary mb-6">{user?.email}</p>

          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 mb-5 text-left">
            <h3 className="text-sm font-bold text-foreground mb-3">Steps to verify:</h3>
            <div className="space-y-2">
              {[
                "Open your email inbox",
                "Find the email from RozanaPay",
                "Click the verification link",
                "Come back here and click 'I've Verified'",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCheckVerification}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-base shadow-glow relative overflow-hidden"
            >
              <div className="absolute inset-0 shimmer" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" /> I've Verified My Email
              </span>
            </motion.button>

            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full py-3 rounded-2xl border-2 border-primary/20 text-primary font-semibold text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Sending...</>
              ) : (
                <><RefreshCw className="h-4 w-4" /> Resend Verification Email</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
