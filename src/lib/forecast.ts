// "Safe to spend" — next-7-day income forecast and spare-money calculation.
// Runs on the phone from the user's own logs. Method and constants come from the backtest in
// ml/cashflow-forecast (see MODEL_CARD.md); keep them in sync with backtest.py (weekday_profile, weekly_cv).
// No imports on purpose: parity-tested in Node against the Python version.

export const FORECAST = {
  version: "cashflow-v1",
  halfLifeWeeks: 4, // recent weeks count more
  shrinkK: 2, // pull rare weekdays towards the overall daily average
  popCv: 0.3, // typical week-to-week variation (simulated population median)
  floor: 0.25, // cautious estimate never below 25% of typical
  // Caution factor by full weeks of history (fewer weeks -> more caution). Calibrated so the
  // user's real income beats the cautious estimate in ~80% of weeks.
  zByWeeks: { 2: 1.152, 3: 1.014, 4: 0.956, 8: 0.861 } as Record<number, number>,
  maxWeeks: 8,
  minWeeks: 2,
  minLoggedDays: 4,
};

/** Expected income for each weekday (0 = Sunday … 6 = Saturday, JS convention). */
export function weekdayProfile(hist: number[], startDow: number, halfLife = FORECAST.halfLifeWeeks, k = FORECAST.shrinkK): number[] {
  const n = hist.length;
  const w = hist.map((_, i) => 0.5 ** (Math.floor((n - 1 - i) / 7) / halfLife));
  const sw = w.reduce((a, b) => a + b, 0);
  const overall = sw > 0 ? hist.reduce((a, x, i) => a + w[i] * x, 0) / sw : 0;
  const prof: number[] = [];
  for (let d = 0; d < 7; d++) {
    let cnt = 0, num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      if ((startDow + i) % 7 !== d) continue;
      cnt++; num += w[i] * hist[i]; den += w[i];
    }
    const wd = cnt && den > 0 ? num / den : overall;
    prof.push((cnt * wd + k * overall) / (cnt + k));
  }
  return prof;
}

/** Coefficient of variation of the last full weeks' totals (sample std / mean). */
export function weeklyCv(hist: number[]): number {
  const k = Math.floor(hist.length / 7);
  if (k < 2) return 0.6;
  const start = hist.length - 7 * k;
  const weeks: number[] = [];
  for (let j = 0; j < k; j++) {
    let s = 0;
    for (let i = 0; i < 7; i++) s += hist[start + 7 * j + i];
    weeks.push(s);
  }
  const mu = weeks.reduce((a, b) => a + b, 0) / k;
  if (mu <= 0) return 0.6;
  const v = weeks.reduce((a, x) => a + (x - mu) ** 2, 0) / (k - 1);
  return Math.sqrt(v) / mu;
}

export function zForWeeks(weeks: number): number {
  if (weeks >= 8) return FORECAST.zByWeeks[8];
  if (weeks >= 4) return FORECAST.zByWeeks[4];
  return FORECAST.zByWeeks[Math.max(2, weeks)];
}

/** Core forecast on a daily series ending yesterday. Returns typical & cautious next-7-day totals. */
export function forecastCore(hist: number[], startDow: number) {
  const weeks = Math.floor(hist.length / 7);
  const profile = weekdayProfile(hist, startDow);
  const typical = profile.reduce((a, b) => a + b, 0);
  const cv = weeklyCv(hist);
  const ratio = Math.max(FORECAST.floor, 1 - zForWeeks(weeks) * (0.5 * cv + 0.5 * FORECAST.popCv));
  return { profile, typical, cautious: typical * ratio, ratio, cv, weeks };
}

// ---------------------------------------------------------------------------------------------

const DAY = 86_400_000;
/** Local calendar day as YYYY-MM-DD. */
export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const toLocalDay = (s: string) => {
  // Plain dates ("2026-10-03") are calendar days; timestamps are converted to the phone's day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  return isNaN(d.getTime()) ? s.slice(0, 10) : dayKey(d);
};
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const ESSENTIAL_CATEGORIES = ["rent", "food", "transport", "medical", "utilities", "education"];

export interface SafeToSpendInput {
  incomes: { amount: number; date: string }[];
  expenses: { amount: number; date: string; category: string }[];
  /** Open loans with what is still owed (₹) and due date. */
  loans: { id: string; owed: number; dueDate: string | null; overdue: boolean }[];
  savings: { autoSavePerDay: number; remaining: number }[];
  today?: Date;
}

export type SafeToSpend =
  | { ready: false; daysLogged: number; daysNeeded: number; historyDays: number }
  | {
      ready: true;
      weeks: number;
      days: { date: string; dow: number; typical: number; cautious: number }[];
      typical: number;
      cautious: number;
      loansDue: number;
      loansDueList: { id: string; owed: number; dueDate: string | null; overdue: boolean }[];
      autoSave: number;
      essentials: number;
      spare: number;
      perDay: number;
    };

export function safeToSpend(input: SafeToSpendInput): SafeToSpend {
  const today = midnight(input.today ?? new Date());
  const byDay = new Map<string, number>();
  let first: string | null = null;
  for (const i of input.incomes) {
    const k = toLocalDay(i.date);
    byDay.set(k, (byDay.get(k) ?? 0) + Number(i.amount || 0));
    if (!first || k < first) first = k;
  }
  const todayKey = dayKey(today);
  // Full days of history before today, since the first income log, capped at 8 weeks.
  const historyDays = first && first < todayKey
    ? Math.round((today.getTime() - midnight(new Date(first + "T00:00:00")).getTime()) / DAY)
    : 0;
  const weeks = Math.min(FORECAST.maxWeeks, Math.floor(historyDays / 7));
  const n = weeks * 7;
  const hist: number[] = [];
  for (let i = n; i >= 1; i--) hist.push(byDay.get(dayKey(new Date(today.getTime() - i * DAY + 12 * 3600_000))) ?? 0);
  const daysLogged = hist.filter((x) => x > 0).length;

  if (weeks < FORECAST.minWeeks || daysLogged < FORECAST.minLoggedDays) {
    return {
      ready: false,
      daysLogged: Math.max(daysLogged, [...byDay.keys()].filter((k) => k < todayKey).length),
      daysNeeded: Math.max(0, FORECAST.minWeeks * 7 - historyDays),
      historyDays,
    };
  }

  const startDow = new Date(today.getTime() - n * DAY + 12 * 3600_000).getDay();
  const f = forecastCore(hist, startDow);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() + i * DAY + 12 * 3600_000);
    const typical = f.profile[d.getDay()];
    return { date: dayKey(d), dow: d.getDay(), typical, cautious: typical * f.ratio };
  });

  const windowEnd = dayKey(new Date(today.getTime() + 6 * DAY + 12 * 3600_000));
  const loansDueList = input.loans.filter((l) => l.owed > 0 && (l.overdue || (l.dueDate && toLocalDay(l.dueDate) <= windowEnd)));
  const loansDue = loansDueList.reduce((a, l) => a + l.owed, 0);

  const autoSave = input.savings.reduce((a, g) => a + Math.min(g.remaining, g.autoSavePerDay * 7), 0);

  // Typical weekly essential spending, from up to the last 28 days of expense logs.
  const cutoff = dayKey(new Date(today.getTime() - 28 * DAY + 12 * 3600_000));
  let firstExp: string | null = null, essTotal = 0;
  for (const e of input.expenses) {
    const k = toLocalDay(e.date);
    if (k < cutoff || k >= todayKey) continue;
    if (!firstExp || k < firstExp) firstExp = k;
    if (ESSENTIAL_CATEGORIES.includes(e.category)) essTotal += Number(e.amount || 0);
  }
  const expDays = firstExp ? Math.max(7, Math.round((today.getTime() - midnight(new Date(firstExp + "T00:00:00")).getTime()) / DAY)) : 0;
  const essentials = expDays ? (essTotal / expDays) * 7 : 0;

  const r = (x: number) => Math.round(x);
  const spare = f.cautious - loansDue - autoSave - essentials;
  return {
    ready: true,
    weeks,
    days: days.map((d) => ({ ...d, typical: r(d.typical), cautious: r(d.cautious) })),
    typical: r(f.typical),
    cautious: r(f.cautious),
    loansDue: r(loansDue),
    loansDueList,
    autoSave: r(autoSave),
    essentials: r(essentials),
    spare: r(spare),
    perDay: spare > 0 ? Math.floor(spare / 7 / 10) * 10 : 0, // round down to ₹10
  };
}
