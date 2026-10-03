// Delete the signed-in user's account (DPDP Act right to erasure).
// 1. Refuses while a loan has money owed (prepare_account_deletion raises OUTSTANDING_LOAN).
// 2. Removes data with no retention need (UPI mandates, never-disbursed loans, score history).
// 3. Deletes the user's KYC files from private storage.
// 4. Deletes the auth user; profile, income, expenses, savings, notifications, etc. cascade.
// Loan records that moved money, the loan ledger and the audit log are kept, as the law requires.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await asCaller.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== "DELETE") return json({ error: "Confirmation missing" }, 400);

    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1–2. Check for money owed and clear data with no retention need.
    const { data: prep, error: prepErr } = await service.rpc("prepare_account_deletion", { _user_id: user.id });
    if (prepErr) {
      if (prepErr.message?.includes("OUTSTANDING_LOAN")) {
        return json({ error: "OUTSTANDING_LOAN", message: prepErr.message.replace(/^.*OUTSTANDING_LOAN:\s*/, "") }, 409);
      }
      throw prepErr;
    }

    // 3. KYC files live under kyc-documents/<user id>/
    const bucket = service.storage.from("kyc-documents");
    const { data: files } = await bucket.list(user.id, { limit: 1000 });
    if (files && files.length) {
      const { error: rmErr } = await bucket.remove(files.map((f) => `${user.id}/${f.name}`));
      if (rmErr) console.error("KYC file removal failed:", rmErr.message);
    }

    // 4. Delete the login; personal tables cascade from auth.users.
    const { error: delErr } = await service.auth.admin.deleteUser(user.id);
    if (delErr) throw delErr;

    return json({ ok: true, ...(prep ?? {}) });
  } catch (e) {
    console.error("delete-account error:", e);
    return json({ error: "Could not delete account" }, 500);
  }
});
