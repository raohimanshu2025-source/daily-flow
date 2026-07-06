import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_income",
  title: "List recent income",
  description: "List the signed-in user's recent income entries. Defaults to the last 30 days.",
  inputSchema: {
    days: z.number().int().positive().max(365).optional().describe("How many trailing days to include. Default 30."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const d = days ?? 30;
    const since = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb(ctx)
      .from("income_logs")
      .select("id, amount, source, note, date, created_at")
      .gte("date", since)
      .order("date", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const total = (data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
    return {
      content: [{ type: "text", text: `Found ${data?.length ?? 0} entries totalling ₹${total.toLocaleString("en-IN")} in the last ${d} days.` }],
      structuredContent: { total_rupees: total, count: data?.length ?? 0, entries: data },
    };
  },
});