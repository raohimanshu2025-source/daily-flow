# Model card — RozanaPay credit scorecard v1 (`scorecard-v1`)

## What it does
Estimates how likely a gig / daily-wage worker is to repay a ₹500–10,000 micro-loan, and turns that into a **300–900 RozanaPay score** with **reason codes** ("what's helping / hurting your score" and how many points each fix is worth).

## ⚠️ Most important limitation
**Trained on simulated data.** RozanaPay has no real repayment outcomes yet, so the model was trained on 60,000 synthetic borrowers from `generate_data.py`, whose behaviour rules are assumptions. The metrics below show the *pipeline* works; they say nothing yet about real-world accuracy. **Do not use this score to make real lending decisions** until it is retrained and validated on real repayment outcomes (see "Retraining").

## Method
Standard retail-credit **scorecard**:
1. **Binning** — each feature is cut into bins; adjacent bins are merged until default risk moves in one direction (monotonic) and each bin holds ≥ 5% of borrowers (≥ 0.5% for rare yes/no flags such as "loan overdue now").
2. **Weight of Evidence** — each bin gets WoE = ln(% good / % bad).
3. **Logistic regression** on the WoE features (target = default). Features whose coefficient has the wrong sign given the others are dropped.
4. **Points** — coefficients become integer points per bin. Scaling: **700 points = 49:1 good:bad odds (≈2% default); every 50 points doubles the odds.** Clamped to 300–900.

A **gradient-boosting challenger** (scikit-learn `HistGradientBoostingClassifier`, monotonic constraints) is trained on the same split to measure how much accuracy the simple, explainable scorecard gives up.

## Features (all computed in the database by `compute_credit_score`)
| Feature | Meaning | Information value | In model |
|---|---|---|---|
| `income_days_30` | Days with income logged, last 30 days | 0.65 | ✅ |
| `expense_ratio_30` | Expenses ÷ income, last 30 days (2.0 if no income logged) | 0.47 | ✅ |
| `active_weeks_12` | Weeks with any income, last 12 weeks | 0.30 | ✅ |
| `income_total_30` | ₹ income, last 30 days | 0.22 | ✅ |
| `savings_balance` | ₹ across savings goals | 0.21 | ❌ no extra signal once income & spending are known |
| `kyc_verified` | KYC approved by admin | 0.14 | ✅ |
| `loans_repaid_late` | Past loans repaid after due date | 0.11 | ✅ |
| `bnpl_active` | Active BNPL orders | 0.10 | ✅ |
| `loans_overdue_now` | Loans past due with money owed | 0.05 | ✅ |
| `loans_repaid_on_time` | Past loans repaid by due date | 0.03 | ✅ |
| `account_age_days` | Days since sign-up | 0.00 | ❌ |

Only loans that actually paid out (have a disbursal entry in the immutable ledger) count, so fake loan history cannot raise a score.

**Not used, on purpose:** name, age, gender, religion, caste, city, occupation or any other personal attribute — to avoid discrimination and keep the score about behaviour only.

## Results (30% holdout, 18,000 synthetic borrowers)
| Model | AUC | Gini | KS |
|---|---|---|---|
| **Scorecard v1 (deployed)** | **0.766** | **0.532** | **0.410** |
| Gradient-boosting challenger | 0.771 | 0.542 | 0.412 |

The explainable scorecard gives up only ~0.5 AUC points versus the black-box model.

**Calibration by band** (holdout):
| Band | Score | Share of borrowers | Default rate |
|---|---|---|---|
| Excellent | 800+ | 0% | — |
| Good | 700–799 | 11.7% | 1.6% |
| Fair | 600–699 | 38.8% | 4.5% |
| Poor | 500–599 | 39.2% | 13.6% |
| Very poor | < 500 | 10.2% | 33.9% |

Score distribution: min 349 · 10th pct 499 · median 601 · 90th pct 706 · max 765. A brand-new user with no data scores ≈ 480.

## Deployment
- Bins and points live in `public.scorecard_bins`; the active model is `app_settings.credit_model_version`.
- `compute_credit_score(user)` computes features, adds points, stores the score, band, feature values and **per-feature points + best possible points** in `credit_score_history.factors`. The app shows the biggest point gaps as reason codes with a tip.
- Recomputed nightly (pg_cron) and on demand from the Loans page.
- **Parity test:** 120/120 holdout borrowers scored identically in Python and in the database.

## Retraining on real data
1. Label every disbursed loan: `default = 1` if not fully repaid within 30 days of the due date.
2. Snapshot the features **as of the disbursal date** (not today) to avoid leakage.
3. Replace `generate_data.py` output with that table, run `train.py`, review `reports/metrics.json`.
4. Bump `model_version` (e.g. `scorecard-v2`) in `train.py`, run `export_sql.py` into a new migration, apply, then switch `credit_model_version` — old scores keep their version for audit.
5. Monitor monthly: population stability (PSI) of scores and each feature, default rate per band, approval rate.

## Reproduce
```sh
cd ml/credit-model
python generate_data.py        # -> data/synthetic_borrowers.csv
python train.py                # -> model/scorecard.json, reports/metrics.json
python export_sql.py > ../../supabase/migrations/<timestamp>_credit_scorecard_vN.sql
```
Requires Python 3.10+, numpy, pandas, scikit-learn.
