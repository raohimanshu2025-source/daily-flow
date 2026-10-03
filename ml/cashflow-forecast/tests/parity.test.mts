// node --experimental-strip-types ml/cashflow-forecast/tests/parity.test.mts
import { readFileSync } from "node:fs";
import { forecastCore } from "../../../src/lib/forecast.ts";

const cases = JSON.parse(readFileSync(new URL("./parity_cases.json", import.meta.url), "utf8"));
let ok = 0;
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
for (const c of cases) {
  const f = forecastCore(c.hist, c.dow);
  const good = close(f.typical, c.typical) && close(f.cautious, c.cautious) && close(f.cv, c.cv)
    && f.profile.every((p: number, i: number) => close(p, c.profile[i]));
  if (good) ok++; else console.log("MISMATCH", { ts: f, py: c });
}
console.log(`${ok}/${cases.length} identical`);
process.exit(ok === cases.length ? 0 : 1);
