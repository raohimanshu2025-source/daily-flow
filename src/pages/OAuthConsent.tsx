import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shield, Check, X } from "lucide-react";
import logo from "@/assets/rozanapay-logo.png";

// Local wrapper around the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};
const oauthApi = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/onboarding/phone?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauthApi.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauthApi.approveAuthorization(authorizationId)
      : await oauthApi.denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("No redirect returned by the authorization server."); }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full bg-card rounded-3xl shadow-elevated p-6 border border-border">
          <p className="text-sm text-destructive font-semibold">Could not load this authorization request: {error}</p>
        </div>
      </main>
    );
  }
  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-lg font-black">Loading…</div>
      </main>
    );
  }

  const clientName = details.client?.name ?? "an app";
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-3xl shadow-elevated p-6 border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <img src={logo} alt="" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black text-foreground">Connect {clientName}</h1>
            <p className="text-xs text-muted-foreground font-medium">to your RozanaPay account</p>
          </div>
        </div>

        <div className="bg-muted rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground font-semibold leading-relaxed">
              {clientName} will act as you — reading your income, expenses, savings, loans and credit score, and logging new entries you approve.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 py-3 rounded-2xl border-2 border-border bg-card text-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Deny
          </button>
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 py-3 rounded-2xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Approve
          </button>
        </div>
      </motion.div>
    </main>
  );
}