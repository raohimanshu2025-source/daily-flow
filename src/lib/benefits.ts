// Government benefits finder — rules run entirely on the phone; answers are never saved or sent.
// All visible text lives in src/lib/i18n.ts under `ben.*`.
// Rules can change: re-check every scheme against its official site and update BENEFITS_CHECKED_ON.

export const BENEFITS_CHECKED_ON = "2026-10-03";

export type Work = "platform" | "driver" | "vendor" | "construction" | "shop" | "other";
export type IncomeBand = "lt10" | "10to15" | "15to25" | "gt25";
export type YesNo = "yes" | "no" | "unsure";

export interface BenefitAnswers {
  age: number;
  income: IncomeBand;
  work: Work;
  bank: YesNo;
  epf: YesNo; // covered by EPF / ESIC / NPS
  tax: YesNo; // pays income tax
}

export type Match = "yes" | "check" | "no";

export interface Scheme {
  id: string;
  url: string;
  /** How well the user matches. "check" = probably yes, but a detail must be confirmed. */
  match: (a: BenefitAnswers) => Match;
}

const between = (a: BenefitAnswers, lo: number, hi: number) => a.age >= lo && a.age <= hi;
const lowIncome = (a: BenefitAnswers) => a.income === "lt10" || a.income === "10to15";
// "unsure" never rules a person out — it turns "yes" into "check".
const notCovered = (a: BenefitAnswers): Match => (a.epf === "yes" ? "no" : a.epf === "unsure" ? "check" : "yes");
const notTaxPayer = (a: BenefitAnswers): Match => (a.tax === "yes" ? "no" : a.tax === "unsure" ? "check" : "yes");
const all = (...m: Match[]): Match => (m.includes("no") ? "no" : m.includes("check") ? "check" : "yes");

export const SCHEMES: Scheme[] = [
  {
    id: "jandhan",
    url: "https://pmjdy.gov.in/",
    match: (a) => (a.age >= 18 && a.bank !== "yes" ? "yes" : "no"),
  },
  {
    id: "eshram",
    url: "https://eshram.gov.in/",
    match: (a) => all(between(a, 16, 59) ? "yes" : "no", notCovered(a), notTaxPayer(a)),
  },
  {
    id: "ayushman",
    url: "https://beneficiary.nha.gov.in/",
    // Platform workers: ₹5 lakh cover announced for e-Shram-registered workers (Budget 2025-26).
    // Others: depends on family being in the beneficiary list — always "check".
    match: (a) => (a.work === "platform" || lowIncome(a) || a.age >= 70 ? "check" : "no"),
  },
  {
    id: "pmsym",
    url: "https://maandhan.in/",
    match: (a) => all(between(a, 18, 40) ? "yes" : "no", lowIncome(a) ? "yes" : "no", notCovered(a), notTaxPayer(a)),
  },
  {
    id: "apy",
    url: "https://www.pfrda.org.in/",
    match: (a) => all(between(a, 18, 40) ? "yes" : "no", notTaxPayer(a), a.bank === "yes" ? "yes" : "check"),
  },
  {
    id: "pmsby",
    url: "https://www.jansuraksha.gov.in/",
    match: (a) => all(between(a, 18, 70) ? "yes" : "no", a.bank === "yes" ? "yes" : "check"),
  },
  {
    id: "pmjjby",
    url: "https://www.jansuraksha.gov.in/",
    match: (a) => all(between(a, 18, 50) ? "yes" : "no", a.bank === "yes" ? "yes" : "check"),
  },
  {
    id: "svanidhi",
    url: "https://pmsvanidhi.mohua.gov.in/",
    match: (a) => (a.work === "vendor" && a.age >= 18 ? "yes" : "no"),
  },
  {
    id: "bocw",
    url: "https://www.myscheme.gov.in/",
    // State construction-worker welfare boards: usually 18–60 and 90 days of building work in the last year.
    match: (a) => (a.work === "construction" && between(a, 18, 60) ? "check" : "no"),
  },
];

export function findBenefits(a: BenefitAnswers) {
  const results = SCHEMES.map((s) => ({ scheme: s, match: s.match(a) })).filter((r) => r.match !== "no");
  // Sure matches first, then "check".
  return results.sort((x, y) => (x.match === y.match ? 0 : x.match === "yes" ? -1 : 1));
}

/** Map the profile's occupation (set during onboarding) to a quiz answer. */
export function workFromOccupation(occupation?: string | null): Work | undefined {
  switch (occupation) {
    case "Delivery Partner": return "platform";
    case "Auto Driver": return "driver";
    case "Street Vendor": return "vendor";
    case "Construction Worker": return "construction";
    case "Shop Worker": return "shop";
    case "Other": return "other";
    default: return undefined;
  }
}
