// Voice / free-text logging: "आज डिलीवरी से 650 कमाए" -> { kind: "income", amount: 650, source: "Delivery" }.
// Returns a DRAFT only — the app shows it and the user taps Save. Nothing is written here.
// Uses Google Gemini directly (audio understanding). Secrets: AI_API_KEY (Gemini key),
// optional VOICE_MODEL / VOICE_FALLBACK_MODEL.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_AUDIO_B64 = 2_000_000; // ~1.5 MB of audio ≈ 1–2 minutes of speech; we ask for ≤ 15 s
const MAX_TEXT = 300;
const AUDIO_TYPES: Record<string, string> = {
  "audio/webm": "audio/webm", "audio/ogg": "audio/ogg", "audio/mp4": "audio/m4a", "audio/m4a": "audio/m4a",
  "audio/mpeg": "audio/mpeg", "audio/mp3": "audio/mp3", "audio/wav": "audio/wav", "audio/aac": "audio/aac",
};
const EXPENSE_CATEGORIES = ["food", "transport", "rent", "medical", "education", "shopping", "utilities", "other"];

const PROMPT = `You help Indian daily-wage and gig workers record money in a finance app.
The user speaks or types ONE short entry, in Hindi, English or Hinglish. Examples:
- "aaj delivery se 650 kamaye" -> income 650 from Delivery
- "आज मज़दूरी के 800 रुपये मिले, UPI से" -> income 800 from Labour work, paid by upi
- "chai aur nashta 60" -> expense 60, category food
- "auto ka kiraya sau rupaye" -> expense 100, category transport
- "साढ़े छह सौ" means 650; "डेढ़ सौ" means 150; "हज़ार" means 1000.
Rules:
- kind is "income" for money earned/received, "expense" for money spent, "unknown" if unclear.
- amount is whole rupees (integer). If no amount is said, use 0 and kind "unknown".
- For income, source is a short English label with a capital first letter (e.g. Delivery, Driving, Labour work, Shop sales, Tips). Default "Work".
- For expense, category must be one of: ${EXPENSE_CATEGORIES.join(", ")}; note is a few words describing it.
- payment_type is "upi" only if UPI/online/PhonePe/GPay/Paytm is mentioned, otherwise "cash".
- transcript is what the user said, in the language they said it.`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    kind: { type: "STRING", enum: ["income", "expense", "unknown"] },
    amount: { type: "INTEGER" },
    source: { type: "STRING" },
    category: { type: "STRING", enum: EXPENSE_CATEGORIES },
    note: { type: "STRING" },
    payment_type: { type: "STRING", enum: ["cash", "upi"] },
    transcript: { type: "STRING" },
  },
  required: ["kind", "amount", "transcript"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);

    const apiKey = Deno.env.get("AI_API_KEY");
    if (!apiKey) return json({ error: "NOT_CONFIGURED" }, 503);

    const body = await req.json().catch(() => ({}));
    const parts: unknown[] = [{ text: PROMPT }];
    if (typeof body?.audio === "string" && body.audio.length > 0) {
      if (body.audio.length > MAX_AUDIO_B64) return json({ error: "TOO_LONG" }, 413);
      const base = String(body.mimeType ?? "").split(";")[0].trim().toLowerCase();
      const mime = AUDIO_TYPES[base];
      if (!mime) return json({ error: "UNSUPPORTED_AUDIO" }, 415);
      parts.push({ text: "The user's voice message:" }, { inlineData: { mimeType: mime, data: body.audio } });
    } else if (typeof body?.text === "string" && body.text.trim()) {
      parts.push({ text: `The user typed: """${body.text.trim().slice(0, MAX_TEXT)}"""` });
    } else {
      return json({ error: "EMPTY" }, 400);
    }

    const models = [Deno.env.get("VOICE_MODEL") ?? "gemini-3.8-flash", Deno.env.get("VOICE_FALLBACK_MODEL") ?? "gemini-3.5-flash-lite"];
    let res: Response | null = null;
    for (const [i, model] of [models[0], models[0], models[1]].entries()) {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0 },
        }),
      });
      if (res.ok || ![429, 500, 503].includes(res.status) || i === 2) break;
      await res.body?.cancel();
      await new Promise((r) => setTimeout(r, 700));
    }
    if (!res || !res.ok) {
      const status = res?.status ?? 0;
      console.error("voice-log AI error:", status, res ? await res.text() : "");
      return json({ error: status === 429 || status === 503 ? "BUSY" : "AI_ERROR" }, 502);
    }

    const out = await res.json();
    const raw = out?.candidates?.[0]?.content?.parts?.find((p: any) => typeof p.text === "string")?.text ?? "{}";
    let d: any;
    try { d = JSON.parse(raw); } catch { d = {}; }

    // Never trust the model blindly: clamp and validate everything.
    const amount = Math.max(0, Math.min(100000, Math.round(Number(d.amount) || 0)));
    let kind = ["income", "expense"].includes(d.kind) ? d.kind : "unknown";
    if (amount <= 0) kind = "unknown";
    return json({
      kind,
      amount,
      source: String(d.source || "Work").slice(0, 60),
      category: EXPENSE_CATEGORIES.includes(d.category) ? d.category : "other",
      note: String(d.note || "").slice(0, 120),
      payment_type: d.payment_type === "upi" ? "upi" : "cash",
      transcript: String(d.transcript || "").slice(0, 300),
    });
  } catch (e) {
    console.error("voice-log error:", e);
    return json({ error: "AI_ERROR" }, 500);
  }
});
