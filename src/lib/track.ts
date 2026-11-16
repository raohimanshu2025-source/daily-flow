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
