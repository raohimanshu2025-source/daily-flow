// Pilot event tracking. Fire-and-forget: never blocks the UI, never throws.
// Store only event names and small, non-sensitive properties — never money
// amounts the user typed, document numbers, chat text or voice audio.
import { supabase } from "@/integrations/supabase/client";

type Props = Record<string, string | number | boolean | null>;

export function track(name: string, props: Props = {}) {
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) return;
      await (supabase as any).from("app_events").insert({ user_id: uid, name, props });
    } catch {
      /* tracking must never break the app */
    }
  })();
}

const OPEN_KEY = "rozanapay_last_open_day";

/** Record at most one app_open per calendar day on this device. */
export function trackDailyOpen() {
  try {
    const today = new Date().toLocaleDateString("en-CA");
    if (localStorage.getItem(OPEN_KEY) === today) return;
    localStorage.setItem(OPEN_KEY, today);
  } catch {
    /* storage blocked: still record */
  }
  track("app_open");
}

let errorsSent = 0;

/**
 * Lightweight crash reporting with no extra service: uncaught errors are stored
 * as `client_error` events (signed-in users only). Only a short error message,
 * the page path and the app build are kept — never form contents.
 */
export function installErrorReporting() {
  const send = (kind: string, message: unknown) => {
    if (errorsSent >= 5) return; // at most 5 per page load
    errorsSent++;
    const msg = String((message as any)?.message ?? message ?? "unknown")
      .replace(/\b\d{6,}\b/g, "#")          // drop long digit runs (phone, account, OTP)
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "@") // drop email addresses
      .slice(0, 160);
    track("client_error", { kind, msg, page: window.location.pathname.slice(0, 60) });
  };
  window.addEventListener("error", (e) => send("error", e.error ?? e.message));
  window.addEventListener("unhandledrejection", (e) => send("promise", e.reason));
}
