// Partner NBFC integration stub.
// Simulates the loan disbursement handshake with a downstream NBFC/Bank partner API.
// Endpoints:
//   POST /  { action: "disburse", loan_id }  → simulate partner disbursement + mark loan disbursed
//   POST /  { action: "status",   loan_id }  → fetch partner-side status for a loan
//   POST /  { action: "kyc_push", user_id }  → simulate KYC push to partner
// Auth: user JWT (admin-only for disburse/kyc_push).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARTNER_NAME = "RozanaPay-Partner-NBFC";

async function simulatePartnerApi(payload: unknown) {
  // In production this hits partner sandbox (BankOpen / M2P / decentro / etc.).
  await new Promise((r) => setTimeout(r, 400));
  return {
    partner: PARTNER_NAME,
    reference_id: `NBFC-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    status: "success",
    echoed: payload,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    // Check admin for privileged actions
    const { data: isAdminRow } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    const isAdmin = !!isAdminRow;

    if (action === "disburse") {
      if (!isAdmin) throw new Error("Admin only");
      const loanId = String(body.loan_id || "");
      if (!loanId) throw new Error("loan_id required");

      const { data: loan, error: le } = await service
        .from("loans").select("*").eq("id", loanId).single();
      if (le || !loan) throw new Error("Loan not found");

      // Call partner
      const partnerResp = await simulatePartnerApi({
        loan_id: loanId, user_id: loan.user_id, amount: loan.amount, tenor_days: loan.duration,
      });

      // Use built-in disburse RPC (does ledger + status update)
      const { data: ledgerId, error: de } = await service.rpc("disburse_loan", { _loan_id: loanId });
      if (de) throw de;

      // Set due_date if missing
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Number(loan.duration || 30));
      await service.from("loans").update({ due_date: dueDate.toISOString() }).eq("id", loanId);

      // Audit
      await service.rpc("log_audit_event", {
        _action: "loan.partner_disbursement",
        _entity_type: "loan",
        _entity_id: loanId,
        _metadata: { partner: PARTNER_NAME, partner_ref: partnerResp.reference_id, ledger_id: ledgerId },
      });

      // Notify borrower
      await service.from("notifications").insert({
        user_id: loan.user_id,
        title: "Loan disbursed",
        message: `₹${loan.amount} disbursed by ${PARTNER_NAME}. Ref: ${partnerResp.reference_id}`,
        type: "success",
        icon: "check-circle",
      });

      return new Response(JSON.stringify({ ok: true, partner: partnerResp, ledger_id: ledgerId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const loanId = String(body.loan_id || "");
      const { data: loan } = await supabase.from("loans").select("id, status, amount, repaid_amount, due_date").eq("id", loanId).single();
      if (!loan) throw new Error("Loan not found");
      const partnerResp = await simulatePartnerApi({ loan_id: loanId });
      return new Response(JSON.stringify({ ok: true, loan, partner: partnerResp }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "kyc_push") {
      if (!isAdmin) throw new Error("Admin only");
      const userId = String(body.user_id || "");
      const { data: profile } = await service.from("profiles").select("*").eq("user_id", userId).single();
      if (!profile) throw new Error("Profile not found");
      const partnerResp = await simulatePartnerApi({ user_id: userId, kyc_status: profile.kyc_status });
      await service.rpc("log_audit_event", {
        _action: "kyc.partner_push",
        _entity_type: "user",
        _entity_id: userId,
        _metadata: { partner: PARTNER_NAME, partner_ref: partnerResp.reference_id },
      });
      return new Response(JSON.stringify({ ok: true, partner: partnerResp }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("partner-nbfc error:", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});