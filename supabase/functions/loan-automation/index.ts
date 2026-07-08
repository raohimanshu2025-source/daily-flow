// Nightly loan automation: accrue interest, apply late fees, attempt auto-debit via active UPI mandates.
// Called by pg_cron. Uses SUPABASE_SERVICE_ROLE_KEY.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Real UPI PSP integration is not wired yet. Until it is, we only *attempt*
  // debits when explicitly enabled, and we log every attempt as a simulation
  // so we never send fake "success" notifications in production.
  const UPI_SIMULATION_ENABLED = Deno.env.get("UPI_SIMULATION_ENABLED") === "true";

  const summary = { accrued: 0, lateFees: 0, autoDebits: 0, failures: 0, notified: 0 };
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, drives idempotency

  try {
    // Fetch active/disbursed loans
    const { data: loans, error } = await supabase
      .from("loans")
      .select("id, user_id, amount, repaid_amount, interest_rate, duration, due_date, status, applied_at, approved_at")
      .in("status", ["active", "disbursed", "approved"]);
    if (error) throw error;

    const now = new Date();

    for (const loan of loans || []) {
      const outstanding = Math.max(0, Number(loan.amount) - Number(loan.repaid_amount || 0));
      if (outstanding <= 0) continue;

      // 1. Daily interest accrual (rate is %/month → /30 for daily)
      // Deterministic reference so pg unique index blocks a double-post on retry.
      const dailyInterestPaise = Math.round((outstanding * Number(loan.interest_rate) / 100 / 30) * 100);
      if (dailyInterestPaise > 0) {
        const { error: e1 } = await supabase.rpc("post_loan_entry", {
          _loan_id: loan.id,
          _entry_type: "interest_accrual",
          _amount_paise: dailyInterestPaise,
          _description: `Daily interest accrual for ${today}`,
          _reference_id: `INT-${today}-${loan.id}`,
        });
        if (!e1) summary.accrued++;
        else if (!/duplicate key/i.test(e1.message)) console.warn("interest post failed", loan.id, e1.message);
      }

      // 2. Late fee if past due
      const due = loan.due_date ? new Date(loan.due_date) : null;
      if (due && due < now) {
        const { error: e2 } = await supabase.rpc("post_loan_entry", {
          _loan_id: loan.id,
          _entry_type: "late_fee",
          _amount_paise: 5000, // ₹50
          _description: "Late fee (overdue)",
          _reference_id: `LATE-${today}-${loan.id}`,
        });
        if (!e2) summary.lateFees++;
        else if (!/duplicate key/i.test(e2.message)) console.warn("late fee post failed", loan.id, e2.message);
      }

      // 3. Attempt UPI auto-debit if due today or overdue and active mandate exists.
      //    Skipped entirely unless the operator opts in with UPI_SIMULATION_ENABLED,
      //    because otherwise we would emit fake success notifications to users.
      if (UPI_SIMULATION_ENABLED && due && due <= now) {
        const { data: mandate } = await supabase
          .from("upi_mandates")
          .select("id, vpa, max_amount_paise, status")
          .eq("loan_id", loan.id)
          .eq("status", "active")
          .maybeSingle();

        if (mandate) {
          // Attempt = min(outstanding, max_amount)
          const attemptPaise = Math.min(outstanding * 100, Number(mandate.max_amount_paise));
          // Simulated debit outcome (in production this hits UPI PSP)
          const success = Math.random() > 0.15;
          if (success) {
            const { error: e3 } = await supabase.rpc("post_loan_entry", {
              _loan_id: loan.id,
              _entry_type: "repayment",
              _amount_paise: attemptPaise,
              _description: `[SIMULATED] Auto-debit from ${mandate.vpa}`,
              _reference_id: `AUTO-${today}-${loan.id}`,
            });
            if (!e3) {
              summary.autoDebits++;
              await supabase.from("loans").update({
                repaid_amount: Math.min(Number(loan.repaid_amount || 0) + attemptPaise / 100, Number(loan.amount)),
                last_payment_status: 'settled',
                last_payment_at: now.toISOString(),
                last_payment_ref: `AUTO-${today}-${loan.id}`,
              }).eq("id", loan.id);
              await supabase.from("notifications").insert({
                user_id: loan.user_id,
                title: "Auto-debit successful (simulated)",
                message: `Simulated ₹${(attemptPaise / 100).toFixed(0)} debit from ${mandate.vpa}. No real UPI transfer occurred.`,
                type: "success",
                icon: "check-circle",
              });
              summary.notified++;
            }
          } else {
            summary.failures++;
            await supabase.from("loans").update({
              last_payment_status: 'failed',
              last_payment_at: now.toISOString(),
              last_payment_ref: `AUTO-${today}-${loan.id}`,
            }).eq("id", loan.id);
            await supabase.from("notifications").insert({
              user_id: loan.user_id,
              title: "Auto-debit failed (simulated)",
              message: `Simulated auto-debit failure. Please repay manually.`,
              type: "warning",
              icon: "alert-circle",
            });
            summary.notified++;
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, upi_simulation: UPI_SIMULATION_ENABLED, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("loan-automation error:", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message, summary }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});