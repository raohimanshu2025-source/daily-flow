// Loan automation: admin-only "run now" for the nightly loan charges.
// The real nightly run happens inside the database (pg_cron -> public.run_daily_loan_charges()),
// so this endpoint is only for an admin who wants to trigger it manually.
// Interest accrues only on disbursed loans; late fees are capped (see app_settings).
// Simulated UPI auto-debit was removed: real auto-debit must come from a payment gateway webhook.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await asCaller.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);
    const { data: isAdmin } = await asCaller.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await service.rpc("run_daily_loan_charges");
    if (error) throw error;
    return json({ ok: true, summary: data });
  } catch (e) {
    console.error("loan-automation error:", e);
    return json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
