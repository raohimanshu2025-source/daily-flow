import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Brain, TrendingUp, PiggyBank, AlertTriangle, Target, Lightbulb, ArrowRight, RefreshCw, Loader2, ArrowLeft, BellPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

interface Nudge {
  title: string;
  message: string;
  type: 'tip' | 'alert' | 'goal' | 'reward';
  emoji: string;
  action_label?: string;
  action_route?: string;
}

const typeStyles: Record<string, string> = {
  tip: 'bg-primary/10 border-primary/20',
  alert: 'bg-destructive/10 border-destructive/20',
  goal: 'bg-success/10 border-success/20',
  reward: 'bg-warning/10 border-warning/20',
};

const typeIcons: Record<string, any> = {
  tip: Lightbulb,
  alert: AlertTriangle,
  goal: Target,
  reward: PiggyBank,
};

export default function SmartNudges() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const fetchNudges = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-nudges');
      if (error) throw error;
      if (data?.nudges) {
        setNudges(data.nudges);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Could not load smart nudges");
      // Fallback nudges
      setNudges([
        { title: "Start Tracking", message: "Log your daily income to unlock personalized insights!", type: "tip", emoji: "📝" },
        { title: "Save Daily", message: "Even ₹10/day adds up to ₹3,650/year. Start small!", type: "goal", emoji: "🎯" },
        { title: "Build Credit", message: "Timely loan repayments boost your credit score significantly.", type: "tip", emoji: "📈" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNudges(); }, [user]);

  const saveToFeed = async () => {
    if (!user || nudges.length === 0) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-nudges', { body: { persist: true } });
      if (error) throw error;
      if (data?.nudges) setNudges(data.nudges);
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Saved ${data?.persisted ?? 0} nudges to your feed`);
    } catch (e) {
      console.error(e);
      toast.error("Could not save to feed");
    }
    setSaving(false);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-black text-foreground">Smart Insights 🧠</h1>
              <p className="text-xs text-muted-foreground">AI-powered tips for your finances</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveToFeed} disabled={loading || saving || nudges.length === 0}
              className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellPlus className="h-3.5 w-3.5" />}
              Save to feed
            </button>
            <button onClick={fetchNudges} disabled={loading}
              className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 text-primary ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="h-7 w-7 text-primary-foreground animate-pulse" />
            </div>
            <p className="text-sm font-bold text-foreground">Analyzing your finances...</p>
            <p className="text-xs text-muted-foreground">AI is generating personalized insights</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {nudges.map((nudge, i) => {
              const Icon = typeIcons[nudge.type] || Lightbulb;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-2xl p-4 border shadow-card ${typeStyles[nudge.type] || typeStyles.tip}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{nudge.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground mb-1">{nudge.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{nudge.message}</p>
                      {nudge.action_label && nudge.action_route && (
                        <button onClick={() => navigate(nudge.action_route!)}
                          className="mt-2 text-xs font-bold text-primary flex items-center gap-1">
                          {nudge.action_label} <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
