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
  name: "log_income",
  title: "Log income",
  description: "Record a new income entry (in rupees) for the signed-in user.",
  inputSchema: {
    amount: z.number().positive().describe("Amount in rupees."),
    source: z.string().trim().min(1).describe("Where the income came from, e.g. 'Uber', 'Tips', 'Delivery'."),
    note: z.string().optional().describe("Optional note."),
    date: z.string().datetime().optional().describe("ISO timestamp. Defaults to now."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ amount, source, note, date }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("income_logs")
      .insert({ user_id: ctx.getUserId(), amount, source, note: note ?? null, date: date ?? new Date().toISOString() })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ₹${amount} from ${source}.` }],
      structuredContent: { entry: data },
    };
  },
});