import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_summary",
  title: "Get financial summary",
  description: "High-level snapshot for the signed-in user: 30-day income and expenses, savings balance, active loans and credit score.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const client = sb(ctx);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [incomeRes, expRes, savRes, loansRes, profRes] = await Promise.all([
      client.from("income_logs").select("amount").gte("date", since),
      client.from("expenses").select("amount").gte("date", since),
      client.from("savings_goals").select("current_amount, target_amount, title"),
      client.from("loans").select("id, amount, status, due_date").in("status", ["disbursed", "approved", "pending"]),
      client.from("profiles").select("credit_score, kyc_status").eq("user_id", ctx.getUserId()).maybeSingle(),
    ]);

    const err = incomeRes.error || expRes.error || savRes.error || loansRes.error || profRes.error;
    if (err) return { content: [{ type: "text", text: err.message }], isError: true };

    const income30 = (incomeRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
    const expense30 = (expRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
    const savings = (savRes.data ?? []).reduce((s: number, r: any) => s + Number(r.current_amount ?? 0), 0);
    const activeLoans = loansRes.data ?? [];

    const summary = {
      income_30d_rupees: income30,
      expense_30d_rupees: expense30,
      net_30d_rupees: income30 - expense30,
      savings_total_rupees: savings,
      savings_goals: savRes.data,
      active_loans: activeLoans,
      credit_score: profRes.data?.credit_score ?? null,
      kyc_status: profRes.data?.kyc_status ?? null,
    };

    return {
      content: [{
        type: "text",
        text: `Last 30 days: earned ₹${income30.toLocaleString("en-IN")}, spent ₹${expense30.toLocaleString("en-IN")} (net ₹${(income30 - expense30).toLocaleString("en-IN")}). Savings: ₹${savings.toLocaleString("en-IN")}. Active loans: ${activeLoans.length}. Credit score: ${profRes.data?.credit_score ?? "n/a"}.`,
      }],
      structuredContent: summary,
    };
  },
});