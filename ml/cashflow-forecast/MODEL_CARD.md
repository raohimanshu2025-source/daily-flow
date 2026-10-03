# Model card — "Safe to spend" income forecast (`cashflow-v1`)

## What it does
Forecasts a user's income for the **next 7 days** from their own income logs and turns it into
**money free to spend per day** after this week's loan dues, auto-save and essential spending.
Runs on the phone (`src/lib/forecast.ts`); nothing new is stored.

```
spare this week = careful income estimate − loan due within 7 days (or overdue)
                  − auto-save (₹/day × 7, capped at what each goal still needs)
                  − essentials (rent, food, transport, medical, utilities, education; weekly average of last 28 days)
safe per day    = spare ÷ 7, rounded down to ₹10 (0 if spare is negative → "this week looks tight")
```

## ⚠️ Most important limitation
**Chosen and calibrated on simulated data.** There is no real income history yet, so the method was picked
with 6 months of simulated daily income for 3,000 workers (delivery, construction, vendor, driver patterns;
off days, bad weeks, sick weeks, slow drift). Re-run the backtest on real logs once users have 8+ weeks of
history and update the constants. Days with no log count as ₹0, so users who forget to log get a lower
(safer) forecast.

## Method
1. **Weekday profile** from up to the last 8 weeks (ending yesterday): each weekday's average, with recent
   weeks weighted more (half-life 4 weeks) and pulled towards the overall daily average (shrinkage k = 2).
   Typical next-7-day income = sum of the 7 weekday values.
2. **Careful estimate** = typical × max(0.25, 1 − z × (½ · user's week-to-week CV + ½ · 0.30)).
   z depends on how many full weeks of history the user has (fewer weeks → more caution):

   | Weeks of history | z | Share of weeks where real income ≥ careful estimate |
   |---|---|---|
   | 2–3 | 1.152 / 1.014 | 80% |
   | 4–7 | 0.956 | 80% (at 4 weeks) |
   | 8 | 0.861 | 80% |

3. Needs at least **2 full weeks** since the first income log and **4 days with income**; before that the app
   shows "log N more days".

## Backtest (3,000 simulated users × 17 forecast weeks, 8 weeks of history)
Typical-forecast error (WAPE) and the careful estimate calibrated to 80% coverage, scored by pinball loss
(q = 0.2) and by the share of users whose own coverage is under 60% (badly over-promised):

| Method | WAPE | Fixed multiplier: pinball / users <60% | User CV: pinball / users <60% | **Shrunk CV**: pinball / users <60% |
|---|---|---|---|---|
| Last 7 days | 36.1% | 461 / 0.7% | 475 / 0.1% | 461 / 0.07% |
| 4-week mean | 28.9% | 414 / 1.0% | 437 / 0.1% | 421 / 0.3% |
| Weighted weekday, half-life 2 wk | 28.1% | 409 / 1.0% | 434 / 0.0% | 416 / 0.3% |
| **Weighted weekday, half-life 4 wk** | **27.6%** | 406 / 1.1% | 431 / 0.2% | **414 / 0.4%** |
| Weighted weekday, half-life 8 wk | 27.4% | 405 / 1.1% | 431 / 0.3% | 413 / 0.3% |

**Choice:** half-life 4 weeks + shrunk CV. A fixed multiplier scores slightly better on average but
over-promises to ~3× more users (those with bumpy income); for a "safe to spend" number that is the
wrong trade. Half-life 4 is within 0.2% of 8 and reacts faster when someone's work changes.

Coverage by kind of work (chosen method): delivery 81%, driver 80%, vendor 82%, **construction 77%**
(more irregular work days — slightly over-promised; watch this on real data).

## Parity & tests
- `tests/make_parity_cases.py` + `tests/parity.test.mts`: 300/300 random histories give identical results
  in Python and TypeScript.
- `tests/safe.test.mts`: end-to-end checks (new user, 10 days, steady income, loan only if due this week,
  auto-save cap, essentials, shortfall, weekday pattern).

## Reproduce
```sh
cd ml/cashflow-forecast
python backtest.py                         # -> reports/backtest.json
python tests/make_parity_cases.py
cd ../.. && node --experimental-strip-types ml/cashflow-forecast/tests/parity.test.mts
node --experimental-strip-types ml/cashflow-forecast/tests/safe.test.mts
```
Requires Python 3.10+ with numpy, and Node 22+.
