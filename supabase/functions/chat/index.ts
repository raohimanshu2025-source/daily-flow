// RozanaPay AI assistant.
// Requires a signed-in user (their access token), so the AI key can't be used by strangers.
// Works with any OpenAI-compatible chat API. Defaults to Google Gemini's endpoint.
//   Secrets: AI_API_KEY (required), AI_BASE_URL (optional), AI_MODEL (optional)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;

const SYSTEM_PROMPT = `You are RozanaPay's AI financial assistant for daily wage workers and gig workers in India.
You speak Hindi and English naturally. Keep answers concise and actionable.
You help with:
- Understanding finances (income, expenses, savings)
- Tips for saving money on a daily income
- Explaining loan terms simply
- Budgeting advice for irregular income
- Explaining BNPL, insurance, gold investment in simple terms
Use emojis sparingly. Be warm, encouraging, and practical.
Format responses with markdown when helpful (bold, lists, etc).
Always address users respectfully. Use ₹ for currency.
You give general financial education, not personalised investment advice.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // 1. Who is asking?
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Please sign in to use the assistant." }, 401);

    // 2. Validate input
    const body = await req.json().catch(() => null);
    const raw = Array.isArray(body?.messages) ? body.messages : null;
    if (!raw || raw.length === 0) return json({ error: "No message sent." }, 400);
    const messages = raw
      .slice(-MAX_MESSAGES)
      .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MESSAGE) }));
    if (messages.length === 0) return json({ error: "No valid message sent." }, 400);

    // 3. Call the AI provider
    const apiKey = Deno.env.get("AI_API_KEY");
    if (!apiKey) return json({ error: "The assistant isn't set up yet. Please try again later." }, 503);
    const baseUrl = Deno.env.get("AI_BASE_URL") ?? "https://generativelanguage.googleapis.com/v1beta/openai";
    const model = Deno.env.get("AI_MODEL") ?? "gemini-2.5-flash";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json({ error: "Too many requests. Please wait a moment and try again." }, 429);
      console.error("AI provider error:", response.status, await response.text());
      return json({ error: "AI service unavailable" }, 502);
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return json({ error: "Something went wrong" }, 500);
  }
});
