import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import logo from "@/assets/rozanapay-logo.png";

export default function ForgotPassword() {
  useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  const sentMsg = t("fp.sentMsg").split("{email}");

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute inset-0 dots-pattern opacity-20" />

      <div className="h-36 gradient-hero animated-gradient relative">
        <button onClick={() => navigate("/onboarding/phone")} aria-label={t("fp.back")} className="absolute top-6 left-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <LangToggle variant="glass" className="absolute top-6 right-5" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[2rem]" />
      </div>

      <div className="px-6 -mt-4 flex-1 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center shadow-glow-secondary">
              <img src={logo} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">{t("fp.title")}</h1>
              <p className="text-sm text-muted-foreground font-medium">{t("fp.subtitle")}</p>
            </div>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-success/10 rounded-2xl p-6 text-center border border-success/20"
            >
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-2">{t("fp.checkEmail")}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {sentMsg[0]}<strong>{email}</strong>{sentMsg.slice(1).join("")}
              </p>
              <button onClick={() => navigate("/onboarding/phone")} className="text-sm text-primary font-bold">
                {t("fp.backToSignIn")}
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("fp.emailPh")}
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-muted text-foreground text-base font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-card border-2 border-transparent focus:border-primary/30 transition-all"
                  autoFocus
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                disabled={!email || loading}
                className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-base disabled:opacity-40 transition-all shadow-glow relative overflow-hidden"
              >
                <div className="absolute inset-0 shimmer" />
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t("fp.sending")}
                    </span>
                  ) : t("fp.sendLink")}
                </span>
              </motion.button>
              <button onClick={() => navigate("/onboarding/phone")} className="w-full text-center text-sm font-bold py-2">
                <span className="text-muted-foreground">{t("fp.remember")} </span>
                <span className="text-primary">{t("fp.signIn")}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
