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
  name: "log_expense",
  title: "Log expense",
  description: "Record a new expense (in rupees) for the signed-in user.",
  inputSchema: {
    amount: z.number().positive().describe("Amount in rupees."),
    category: z.string().trim().min(1).describe("Expense category, e.g. 'Food', 'Fuel', 'Rent'."),
    note: z.string().optional(),
    date: z.string().datetime().optional().describe("ISO timestamp. Defaults to now."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ amount, category, note, date }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("expenses")
      .insert({ user_id: ctx.getUserId(), amount, category, note: note ?? null, date: date ?? new Date().toISOString() })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ₹${amount} expense on ${category}.` }],
      structuredContent: { entry: data },
    };
  },
});