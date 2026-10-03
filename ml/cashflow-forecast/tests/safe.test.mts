// node --experimental-strip-types ml/cashflow-forecast/tests/safe.test.mts
import { safeToSpend, dayKey } from "../../../src/lib/forecast.ts";
const today = new Date(2026, 9, 3); // Sat 3 Oct 2026
const day = (n: number) => dayKey(new Date(2026, 9, 3 - n));
let fails = 0;
const check = (name: string, cond: boolean, extra?: unknown) => { if (!cond) { fails++; console.log("FAIL", name, extra ?? ""); } else console.log("ok  ", name); };

// 1) brand-new user
const r0 = safeToSpend({ incomes: [], expenses: [], loans: [], savings: [], today });
check("new user not ready", !r0.ready && r0.daysNeeded === 14, r0);

// 2) 10 days of logs -> not ready, needs 4 more days
const inc10 = Array.from({ length: 10 }, (_, i) => ({ amount: 600, date: day(i + 1) }));
const r1 = safeToSpend({ incomes: inc10, expenses: [], loans: [], savings: [], today });
check("10 days not ready", !r1.ready && r1.daysNeeded === 4, r1);

// 3) steady ₹600/day for 8 weeks, timestamps instead of dates, no commitments
const inc = Array.from({ length: 56 }, (_, i) => ({ amount: 600, date: new Date(2026, 9, 3 - (i + 1), 14, 30).toISOString() }));
const r2 = safeToSpend({ incomes: inc, expenses: [], loans: [], savings: [], today });
check("steady typical = 4200", r2.ready && r2.typical === 4200, r2);
check("steady cautious < typical", r2.ready && r2.cautious < 4200 && r2.cautious > 3000, r2.ready && r2.cautious);

// 4) commitments: loan due in 3 days, auto-save, essentials (rent 2800 over 28 days = 700/week)
const r3 = safeToSpend({
  incomes: inc,
  expenses: [{ amount: 2800, date: day(20), category: "rent" }, { amount: 500, date: day(5), category: "shopping" }, { amount: 10, date: day(28), category: "food" }],
  loans: [{ id: "a", owed: 1050, dueDate: day(-3), overdue: false }, { id: "b", owed: 900, dueDate: day(-20), overdue: false }],
  savings: [{ autoSavePerDay: 20, remaining: 100 }, { autoSavePerDay: 10, remaining: 5000 }],
  today,
});
if (r3.ready) {
  check("only loan due this week counted", r3.loansDue === 1050, r3.loansDue);
  check("auto-save capped by goal", r3.autoSave === 100 + 70, r3.autoSave);
  check("essentials weekly from 28 days, shopping excluded", r3.essentials === Math.round(2810 / 28 * 7), r3.essentials);
  check("spare = cautious - commitments", r3.spare === r3.cautious - 1050 - 170 - r3.essentials, r3);
  check("perDay rounded down to ₹10", r3.perDay % 10 === 0 && r3.perDay <= r3.spare / 7, r3.perDay);
  check("7 days starting today", r3.days.length === 7 && r3.days[0].date === dayKey(today), r3.days[0]);
} else check("r3 ready", false, r3);

// 5) overdue loan bigger than income -> spare negative, perDay 0
const r4 = safeToSpend({ incomes: inc, expenses: [], loans: [{ id: "x", owed: 9000, dueDate: day(10), overdue: true }], savings: [], today });
check("shortfall", r4.ready && r4.spare < 0 && r4.perDay === 0, r4.ready && r4.spare);

// 6) Sunday-off worker: Sunday forecast lower than weekdays
const sundayOff = Array.from({ length: 56 }, (_, i) => { const d = new Date(2026, 9, 3 - (i + 1)); return { amount: d.getDay() === 0 ? 0 : 700, date: dayKey(d) }; }).filter(x => x.amount > 0);
const r5 = safeToSpend({ incomes: sundayOff, expenses: [], loans: [], savings: [], today });
if (r5.ready) { const sun = r5.days.find(d => d.dow === 0)!; const mon = r5.days.find(d => d.dow === 1)!; check("weekday pattern", sun.typical < mon.typical / 2, { sun, mon }); }
console.log(fails ? `${fails} failed` : "all passed"); process.exit(fails ? 1 : 0);
