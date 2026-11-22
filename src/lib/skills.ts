// "Learn & Grow": short money lessons inside the app + links to free official
// courses. Lesson text lives in src/lib/i18n.ts under `sk.*` (Hindi + English).
// Re-check the course links and facts, then bump SKILLS_CHECKED_ON.

export const SKILLS_CHECKED_ON = "2026-11-22";

/** In-app lessons. Each has `sk.l.<id>.title`, `.why` and `.s1`…`.s<steps>` keys. */
export const LESSONS = [
  { id: "emergency", steps: 4, emoji: "🛟" },
  { id: "interest", steps: 4, emoji: "📊" },
  { id: "scams", steps: 4, emoji: "🛡️" },
  { id: "upi", steps: 4, emoji: "📱" },
  { id: "invest", steps: 4, emoji: "🌱" },
] as const;

export type LessonId = (typeof LESSONS)[number]["id"];

/** Free official courses. Each has `sk.c.<id>.name`, `.what` and `.how` keys. */
export const COURSES = [
  // Government skilling portal; PMKVY 4.0 courses are free and enrolled here.
  { id: "sidh", url: "https://www.skillindiadigital.gov.in/" },
  // NCFE (set up by RBI, SEBI, IRDAI, PFRDA): free e-learning course on money basics.
  { id: "ncfe", url: "https://ncfe.org.in/e-lms/" },
] as const;

const DONE_KEY = "rozanapay_lessons_done";

/** Which lessons this device has marked as read (a convenience only; may be empty). */
export function readDone(): LessonId[] {
  try {
    const v = JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveDone(ids: LessonId[]) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(ids));
  } catch {
    /* storage blocked: progress just isn't remembered */
  }
}
