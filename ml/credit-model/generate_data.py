"""
Synthetic training data for the RozanaPay credit scorecard.

WHY SYNTHETIC: RozanaPay has no real repayment outcomes yet. This simulator encodes
plausible behaviour of Indian gig / daily-wage workers so the full pipeline
(features -> model -> points -> database) can be built and tested now, then
retrained on real outcomes once loans are actually repaid or defaulted.

Every feature below is one the database can compute today (see compute_credit_score
in supabase/migrations). Names must match exactly.

Generative story (per worker):
  reliability  r ~ N(0, 1)          hidden; drives behaviour and repayment
  income level   ~ log-normal        daily earnings, varies by worker
  shock          ~ Bernoulli         a life event (illness, lost work) in the loan window
Observed behaviour depends on r plus noise; the default label depends on r, the shock,
debt load and a little pure noise, so no single feature determines the outcome.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

FEATURES = [
    "income_days_30",        # distinct days with income logged, last 30 days
    "income_total_30",       # ₹ income logged, last 30 days
    "active_weeks_12",       # of the last 12 weeks, how many had any income
    "expense_ratio_30",      # expenses / income, last 30 days (2.0 if no income logged)
    "savings_balance",       # ₹ across savings goals
    "loans_repaid_on_time",  # past loans repaid by the due date
    "loans_repaid_late",     # past loans repaid after the due date
    "loans_overdue_now",     # disbursed loans currently past due
    "bnpl_active",           # active BNPL orders
    "kyc_verified",          # 0/1
    "account_age_days",      # days since sign-up
]


def simulate(n: int, seed: int = 7) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    r = rng.normal(0, 1, n)                                   # hidden reliability
    daily_income = rng.lognormal(mean=np.log(550), sigma=0.45, size=n)  # ₹/working day
    account_age = rng.gamma(shape=1.6, scale=70, size=n).clip(0, 720).round()

    # How many of the last 30 days the worker logged income: reliable people log more,
    # very new accounts can't have logged 30 days yet.
    log_rate = 1 / (1 + np.exp(-(0.2 + 0.9 * r)))             # 0..1
    max_days = np.minimum(30, account_age + 1)
    income_days = rng.binomial(max_days.astype(int), 0.15 + 0.75 * log_rate)

    # Earnings on logged days, with day-to-day noise.
    income_total = np.round(income_days * daily_income * rng.lognormal(0, 0.25, n), -1)

    # Weeks active out of 12 (bounded by account age).
    max_weeks = np.minimum(12, np.floor(account_age / 7) + 1).astype(int)
    active_weeks = rng.binomial(max_weeks, 0.2 + 0.75 * log_rate)

    # Spending relative to income: less reliable workers run closer to (or above) 100%.
    # No income logged -> ratio can't be computed; treated as the riskiest value (2.0),
    # exactly as the database does, so a brand-new account never looks "thrifty".
    expense_ratio = np.where(
        income_total > 0,
        np.clip(rng.normal(0.78 - 0.12 * r, 0.18, n), 0.15, 2.0),
        2.0,
    )

    # Savings: driven by surplus, discipline and time on the app.
    surplus = np.clip(1 - np.minimum(expense_ratio, 1), 0, None) * income_total
    saves = rng.random(n) < (0.3 + 0.5 * log_rate)
    savings = np.where(saves, surplus * rng.uniform(0.2, 1.6, n) * np.minimum(account_age / 60, 3), 0)
    savings = np.round(savings, -1)

    # Past loan history: most workers are "thin file" (no loans yet).
    n_past = rng.poisson(np.clip(account_age / 120, 0, 4) * (0.6 + 0.3 * (rng.random(n) < 0.5)))
    p_on_time = 1 / (1 + np.exp(-(1.6 + 1.3 * r)))
    on_time = rng.binomial(n_past, p_on_time)
    late = n_past - on_time
    overdue_now = rng.binomial(1, np.clip(0.03 + 0.10 / (1 + np.exp(2.0 * r)), 0, 1)) * (n_past > 0)

    bnpl = rng.poisson(np.clip(0.4 - 0.15 * r, 0.05, None))
    kyc = (rng.random(n) < np.clip(0.35 + 0.15 * r + account_age / 900, 0, 0.95)).astype(int)

    # ---- Outcome: default on the next ₹500–10,000 loan within 30 days of due date ----
    shock = rng.random(n) < 0.08
    logit = (
        -3.05
        - 1.05 * r
        + 1.3 * shock
        + 0.9 * (expense_ratio > 1.05)
        + 0.25 * np.minimum(bnpl, 3)
        + 1.0 * overdue_now
        - 0.25 * kyc
        + rng.normal(0, 0.55, n)          # things nobody can observe
    )
    default = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)

    return pd.DataFrame(
        {
            "income_days_30": income_days.astype(int),
            "income_total_30": income_total.astype(int),
            "active_weeks_12": active_weeks.astype(int),
            "expense_ratio_30": np.round(expense_ratio, 3),
            "savings_balance": savings.astype(int),
            "loans_repaid_on_time": on_time.astype(int),
            "loans_repaid_late": late.astype(int),
            "loans_overdue_now": overdue_now.astype(int),
            "bnpl_active": bnpl.astype(int),
            "kyc_verified": kyc,
            "account_age_days": account_age.astype(int),
            "default": default,
        }
    )


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=60_000)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--out", default=str(Path(__file__).parent / "data" / "synthetic_borrowers.csv"))
    a = ap.parse_args()
    df = simulate(a.n, a.seed)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(a.out, index=False)
    print(f"wrote {len(df):,} rows to {a.out}; default rate {df['default'].mean():.1%}")
    print(df.describe().T[["mean", "50%", "max"]].round(2))
