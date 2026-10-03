import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Mic, Square, Loader2, Keyboard, Check, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAddIncome, useAddExpense } from "@/hooks/use-cloud-data";
import { t } from "@/lib/i18n";

type Draft = {
  kind: "income" | "expense" | "unknown";
  amount: number;
  source: string;
  category: string;
  note: string;
  payment_type: "cash" | "upi";
  transcript: string;
};

const MAX_SECONDS = 15;
const CATEGORIES = ["food", "transport", "rent", "medical", "education", "shopping", "utilities", "other"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported?.(m));
}

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

/** Bottom sheet: speak (or type) one money entry, review the draft, tap Save. */
export default function VoiceLogSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<"idle" | "recording" | "thinking" | "review">("idle");
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const addIncome = useAddIncome();
  const addExpense = useAddExpense();
  const canRecord = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && !!pickMimeType();

  const stopTracks = () => recRef.current?.stream.getTracks().forEach((tr) => tr.stop());
  const clearTimer = () => { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = null; };

  const reset = () => {
    clearTimer(); stopTracks(); recRef.current = null;
    setStage("idle"); setDraft(null); setText(""); setSeconds(0); setTyping(!canRecord);
  };

  useEffect(() => { if (open) reset(); return () => { clearTimer(); stopTracks(); }; }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (payload: { audio?: string; mimeType?: string; text?: string }) => {
    setStage("thinking");
    const { data, error } = await supabase.functions.invoke("voice-log", { body: payload });
    if (error || !data || data.error) {
      let code = data?.error ?? "";
      try { code = code || (await (error as any)?.context?.json())?.error || ""; } catch { /* ignore */ }
      toast.error(code === "BUSY" ? t("voice.busy") : code === "NOT_CONFIGURED" ? t("voice.notReady") : t("voice.failed"));
      setStage("idle");
      return;
    }
    if (data.kind === "unknown") {
      toast.error(t("voice.unclear"));
    }
    setDraft({ ...data, kind: data.kind === "unknown" ? "income" : data.kind });
    setStage("review");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        clearTimer(); stopTracks();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || mimeType || "audio/webm" });
        if (blob.size < 1200) { toast.error(t("voice.tooShort")); setStage("idle"); return; }
        await send({ audio: await blobToBase64(blob), mimeType: blob.type });
      };
      recRef.current = rec;
      rec.start();
      setSeconds(0);
      setStage("recording");
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) rec.state === "recording" && rec.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error(t("voice.micDenied"));
      setTyping(true);
    }
  };

  const stopRecording = () => recRef.current?.state === "recording" && recRef.current.stop();

  const save = async () => {
    if (!draft || draft.amount <= 0) return;
    try {
      if (draft.kind === "income") {
        await addIncome.mutateAsync({ amount: draft.amount, source: draft.source || "Work", payment_type: draft.payment_type });
      } else {
        await addExpense.mutateAsync({ amount: draft.amount, category: draft.category, note: draft.note || draft.transcript.slice(0, 60) });
      }
      toast.success(draft.kind === "income" ? t("voice.savedIncome") : t("voice.savedExpense"));
      onClose();
    } catch (e: any) {
      toast.error(e?.message || t("voice.failed"));
    }
  };

  if (!open) return null;
  const saving = addIncome.isPending || addExpense.isPending;

  // Portal to <body> so animated (transformed) parents can't break fixed positioning.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => stage !== "thinking" && onClose()}>
      <motion.div
        initial={{ y: 300 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="w-full max-w-md bg-card rounded-t-3xl p-5 pb-8 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={t("voice.title")}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-black text-foreground">{t("voice.title")}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center" aria-label={t("delete.cancel")}>
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-5">{t("voice.example")}</p>

        {stage !== "review" && !typing && (
          <div className="flex flex-col items-center gap-3 py-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={stage === "recording" ? stopRecording : startRecording}
              disabled={stage === "thinking"}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-glow ${stage === "recording" ? "bg-destructive animate-pulse" : "gradient-hero"} disabled:opacity-60`}
              aria-label={stage === "recording" ? t("voice.stop") : t("voice.tapToSpeak")}
            >
              {stage === "thinking" ? <Loader2 className="h-9 w-9 text-white animate-spin" /> :
                stage === "recording" ? <Square className="h-8 w-8 text-white fill-current" /> : <Mic className="h-10 w-10 text-white" />}
            </motion.button>
            <p className="text-sm font-bold text-foreground">
              {stage === "recording" ? `${t("voice.listening")} ${MAX_SECONDS - seconds}s` : stage === "thinking" ? t("voice.thinking") : t("voice.tapToSpeak")}
            </p>
            {stage === "idle" && (
              <button onClick={() => setTyping(true)} className="flex items-center gap-1.5 text-xs font-semibold text-primary py-2">
                <Keyboard className="h-4 w-4" /> {t("voice.typeInstead")}
              </button>
            )}
          </div>
        )}

        {stage !== "review" && typing && (
          <div className="space-y-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && text.trim() && send({ text })}
              placeholder={t("voice.typePlaceholder")}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
              disabled={stage === "thinking"}
              autoFocus
            />
            <button
              onClick={() => send({ text })}
              disabled={!text.trim() || stage === "thinking"}
              className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {stage === "thinking" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {stage === "thinking" ? t("voice.thinking") : t("voice.understand")}
            </button>
            {canRecord && (
              <button onClick={() => setTyping(false)} className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary py-1">
                <Mic className="h-4 w-4" /> {t("voice.speakInstead")}
              </button>
            )}
          </div>
        )}

        {stage === "review" && draft && (
          <div className="space-y-4">
            {draft.transcript && (
              <p className="text-xs text-muted-foreground italic bg-muted rounded-xl px-3 py-2">“{draft.transcript}”</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setDraft({ ...draft, kind: k })}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-colors ${draft.kind === k
                    ? k === "income" ? "border-success bg-success/10 text-success" : "border-destructive bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground"}`}
                >
                  {k === "income" ? t("voice.income") : t("voice.expense")}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">{t("voice.amount")}</span>
              <div className="flex items-center gap-2 mt-1 px-4 py-3 rounded-xl border-2 border-border bg-background focus-within:border-primary">
                <span className="text-xl font-black text-foreground">₹</span>
                <input
                  type="number" inputMode="numeric" min={1} max={100000}
                  value={draft.amount || ""}
                  onChange={(e) => setDraft({ ...draft, amount: Math.max(0, Math.min(100000, Math.round(Number(e.target.value) || 0))) })}
                  className="flex-1 bg-transparent text-2xl font-black text-foreground focus:outline-none"
                />
              </div>
            </label>
            {draft.kind === "income" ? (
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">{t("voice.source")}</span>
                <input
                  value={draft.source}
                  onChange={(e) => setDraft({ ...draft, source: e.target.value.slice(0, 60) })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">{t("voice.category")}</span>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{t(`voice.cat.${c}`)}</option>)}
                </select>
              </label>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={reset} className="px-4 py-3.5 rounded-xl bg-muted text-foreground font-bold flex items-center gap-1.5" disabled={saving}>
                <RotateCcw className="h-4 w-4" /> {t("voice.again")}
              </button>
              <button
                onClick={save}
                disabled={saving || draft.amount <= 0}
                className="flex-1 py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-glow disabled:opacity-40"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                {t("voice.save")} ₹{draft.amount.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}
