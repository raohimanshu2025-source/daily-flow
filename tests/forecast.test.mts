import { test } from "node:test";
import assert from "node:assert/strict";
import { safeToSpend, dayKey } from "../src/lib/forecast.ts";

const today = new Date(2026, 10, 22);
const day = (n: number) => dayKey(new Date(2026, 10, 22 - n));

test("new user is not ready and needs 14 days", () => {
  const r = safeToSpend({ incomes: [], expenses: [], loans: [], savings: [], today });
  assert.equal(r.ready, false);
  if (!r.ready) assert.equal(r.daysNeeded, 14);
});

test("steady income gives a cautious estimate below the usual week", () => {
  const incomes = Array.from({ length: 56 }, (_, i) => ({ amount: 600, date: day(i + 1) }));
  const r = safeToSpend({ incomes, expenses: [], loans: [], savings: [], today });
  assert.ok(r.ready);
  if (r.ready) {
    assert.equal(r.typical, 4200);
    assert.ok(r.cautious < r.typical && r.cautious > 3000);
    assert.equal(r.perDay % 10, 0);
  }
});

test("a big overdue loan means no safe spending", () => {
  const incomes = Array.from({ length: 56 }, (_, i) => ({ amount: 600, date: day(i + 1) }));
  const r = safeToSpend({ incomes, expenses: [], loans: [{ id: "x", owed: 9000, dueDate: day(5), overdue: true }], savings: [], today });
  assert.ok(r.ready && r.spare < 0 && r.perDay === 0);
});
