import { test } from "node:test";
import assert from "node:assert/strict";
import { findBenefits, workFromOccupation, type BenefitAnswers } from "../src/lib/benefits.ts";

const base: BenefitAnswers = { age: 30, income: "10to15", work: "platform", bank: "yes", epf: "no", tax: "no" };
const ids = (a: BenefitAnswers) => findBenefits(a).map((r) => r.scheme.id);

test("low-income platform worker gets pension, accident, life and e-Shram", () => {
  const got = ids(base);
  for (const id of ["eshram", "pmsym", "apy", "pmsby", "pmjjby"]) assert.ok(got.includes(id), id);
  assert.ok(!got.includes("jandhan"), "has a bank account already");
  assert.ok(!got.includes("svanidhi"), "not a vendor");
});

test("tax payer or EPF member does not get PM-SYM or e-Shram", () => {
  assert.ok(!ids({ ...base, tax: "yes" }).includes("pmsym"));
  assert.ok(!ids({ ...base, epf: "yes" }).includes("eshram"));
});

test("'not sure' never rules a person out, it asks them to check", () => {
  const r = findBenefits({ ...base, epf: "unsure" }).find((x) => x.scheme.id === "eshram");
  assert.equal(r?.match, "check");
});

test("age limits are respected", () => {
  assert.ok(!ids({ ...base, age: 45 }).includes("pmsym"));
  assert.ok(!ids({ ...base, age: 55 }).includes("pmjjby"));
  assert.ok(ids({ ...base, age: 55 }).includes("pmsby"));
});

test("no bank account -> Jan Dhan is suggested first", () => {
  assert.equal(ids({ ...base, bank: "no" })[0], "jandhan");
});

test("street vendor sees SVANidhi near the top", () => {
  assert.ok(ids({ ...base, work: "vendor" }).slice(0, 2).includes("svanidhi"));
});

test("occupation mapping", () => {
  assert.equal(workFromOccupation("Delivery Partner"), "platform");
  assert.equal(workFromOccupation("Street Vendor"), "vendor");
  assert.equal(workFromOccupation(undefined), undefined);
});
