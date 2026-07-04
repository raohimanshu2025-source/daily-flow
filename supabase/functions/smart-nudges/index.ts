import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    let persist = false;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        persist = body?.persist === true;
      } catch { /* no body */ }
    }

    // Fetch user data
    const [incomeRes, expenseRes, savingsRes, loansRes, profileRes] = await Promise.all([
      supabase.from('income_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
      supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
      supabase.from('savings_goals').select('*').eq('user_id', user.id),
      supabase.from('loans').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    ]);

    const userData = {
      income: incomeRes.data || [],
      expenses: expenseRes.data || [],
      savings: savingsRes.data || [],
      loans: loansRes.data || [],
      profile: profileRes.data,
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const totalIncome = userData.income.reduce((s: number, i: any) => s + i.amount, 0);
    const totalExpenses = userData.expenses.reduce((s: number, e: any) => s + e.amount, 0);
    const totalSavings = userData.savings.reduce((s: number, g: any) => s + g.current_amount, 0);
    const activeLoans = userData.loans.filter((l: any) => l.status === 'active' || l.status === 'approved');

    const prompt = `Analyze this Indian daily wage worker's financial data and give exactly 5 personalized, actionable financial nudges. Each nudge should be specific to their data.

User profile: ${userData.profile?.name || 'User'}, ${userData.profile?.occupation || 'Worker'}, ${userData.profile?.city || 'India'}
Last 30 days income: ₹${totalIncome} from ${userData.income.length} entries
Last 30 days expenses: ₹${totalExpenses} from ${userData.expenses.length} entries  
Top expense categories: ${[...new Set(userData.expenses.map((e: any) => e.category))].join(', ') || 'None'}
Savings goals: ${userData.savings.length} goals, ₹${totalSavings} saved
Active loans: ${activeLoans.length}, total ₹${activeLoans.reduce((s: number, l: any) => s + l.amount, 0)}
Credit score: ${userData.profile?.credit_score || 300}

Return JSON array with exactly 5 nudges.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a financial advisor for Indian daily wage workers. Return ONLY valid JSON." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_nudges",
            description: "Return personalized financial nudges",
            parameters: {
              type: "object",
              properties: {
                nudges: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      message: { type: "string" },
                      type: { type: "string", enum: ["tip", "alert", "goal", "reward"] },
                      emoji: { type: "string" },
                      action_label: { type: "string" },
                      action_route: { type: "string" },
                    },
                    required: ["title", "message", "type", "emoji"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["nudges"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_nudges" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI request failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let nudges = [];
    if (toolCall) {
      nudges = JSON.parse(toolCall.function.arguments).nudges;
    }

    let persisted = 0;
    if (persist && Array.isArray(nudges) && nudges.length > 0) {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const rows = nudges.slice(0, 5).map((n: any) => ({
        user_id: user.id,
        title: String(n.title || "Smart tip").slice(0, 120),
        message: String(n.message || "").slice(0, 500),
        type: n.type === "alert" ? "reminder" : n.type === "goal" ? "milestone" : n.type === "reward" ? "reward" : "tip",
        icon: String(n.emoji || "💡").slice(0, 8),
        read: false,
      }));
      const { error: insErr, data: insData } = await admin.from("notifications").insert(rows).select("id");
      if (insErr) console.error("persist notifications error:", insErr);
      else persisted = insData?.length ?? 0;
    }

    return new Response(JSON.stringify({ nudges, persisted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-nudges error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
