"""Backtest for the "Safe to spend" income forecast.

RozanaPay has no real income history yet, so this simulates 6 months of daily income for
3,000 gig / daily-wage workers and checks which simple forecast of NEXT WEEK's income works best.

We need two numbers per user:
  * typical  – best guess of next 7 days' income (judged by mean absolute % error)
  * cautious – a low estimate the user beats ~80% of weeks (judged by coverage + pinball loss at q=0.2)
The app only promises money from the CAUTIOUS number, so it should rarely over-promise.

Run:  python backtest.py   ->  reports/backtest.json  (+ prints a table)
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

RNG = np.random.default_rng(7)
N_USERS = 3000
N_DAYS = 182  # day 0 is a Monday
WEEKS_HISTORY = 8
FLOOR = 0.25  # cautious estimate never drops below 25% of typical

# Weekday multipliers (Mon..Sun) by kind of work.
ARCHETYPES = {
    "delivery":     dict(mult=[0.9, 0.85, 0.9, 0.95, 1.1, 1.25, 1.2], p_work=(0.75, 0.95), share=0.35),
    "construction": dict(mult=[1, 1, 1, 1, 1, 1, 0.3],             p_work=(0.55, 0.85), share=0.25),
    "vendor":       dict(mult=[0.9, 0.9, 0.9, 0.95, 1.0, 1.25, 1.35], p_work=(0.8, 0.97), share=0.2),
    "driver":       dict(mult=[1, 1, 1, 1, 1.05, 1.05, 0.9],       p_work=(0.7, 0.95), share=0.2),
}


def simulate() -> tuple[np.ndarray, list[str]]:
    kinds = list(ARCHETYPES)
    shares = np.array([ARCHETYPES[k]["share"] for k in kinds])
    out = np.zeros((N_USERS, N_DAYS))
    labels = []
    for u in range(N_USERS):
        kind = kinds[RNG.choice(len(kinds), p=shares / shares.sum())]
        a = ARCHETYPES[kind]
        labels.append(kind)
        base = RNG.lognormal(np.log(650), 0.35)          # typical working-day income, ₹
        p_work = RNG.uniform(*a["p_work"])
        noise = RNG.uniform(0.2, 0.55)                    # day-to-day volatility
        level = np.cumsum(RNG.normal(0, 0.012, N_DAYS))   # slow drift (demand, season)
        for d in range(N_DAYS):
            week = d // 7
            if d % 7 == 0:
                sick = RNG.random() < 0.03                # a week lost to illness / travel
                slow = RNG.random() < 0.08                # a bad week (rain, strike, no site work)
            if sick or RNG.random() > p_work:
                continue
            m = a["mult"][d % 7] * (0.55 if slow else 1.0)
            out[u, d] = round(base * m * np.exp(level[d] + RNG.normal(0, noise)) / 10) * 10
            _ = week
    return out, labels


# ---------- forecast methods (the chosen one is ported 1:1 to src/lib/forecast.ts) ----------

def weekday_profile(hist: np.ndarray, start_dow: int, half_life_weeks: float, shrink_k: float) -> np.ndarray:
    """Expected income for each weekday (Mon..Sun) from the last 8 weeks.

    hist[-1] is yesterday. Recent weeks weigh more (exponential decay); each weekday's average is
    pulled towards the overall daily average when it has few observations (shrinkage)."""
    n = len(hist)
    ages = (n - 1 - np.arange(n)) // 7                     # 0 = last 7 days
    w = 0.5 ** (ages / half_life_weeks) if half_life_weeks > 0 else (ages == 0).astype(float)
    overall = float((w * hist).sum() / w.sum())
    dows = (start_dow + np.arange(n)) % 7
    prof = np.empty(7)
    for d in range(7):
        m = dows == d
        cnt = m.sum()
        wd = float((w[m] * hist[m]).sum() / w[m].sum()) if cnt and w[m].sum() > 0 else overall
        prof[d] = (cnt * wd + shrink_k * overall) / (cnt + shrink_k)
    return prof


def weekly_cv(hist: np.ndarray) -> float:
    """Coefficient of variation of the last full weeks' totals (how bumpy income is)."""
    k = len(hist) // 7
    weeks = hist[len(hist) - 7 * k:].reshape(k, 7).sum(axis=1)
    mu = weeks.mean()
    return float(weeks.std(ddof=1) / mu) if k >= 2 and mu > 0 else 0.6


def forecast(hist: np.ndarray, start_dow: int, method: str):
    """Returns (typical next-7-day income, weekly CV)."""
    if method == "last7":
        typ = hist[-7:].sum()
    elif method == "mean28":
        typ = hist[-28:].mean() * 7
    elif method.startswith("ewm"):
        hl = float(method[3:])
        typ = weekday_profile(hist, start_dow, hl, 2.0).sum()
    else:
        raise ValueError(method)
    return float(typ), weekly_cv(hist)


def pinball(y, q_hat, q=0.2):
    d = y - q_hat
    return float(np.mean(np.maximum(q * d, (q - 1) * d)))


def calibrate(make, y, target=0.8, lo=0.0, hi=4.0, higher_param_lowers_estimate=True):
    """Bisection on one parameter so that actual >= cautious in `target` share of weeks."""
    for _ in range(50):
        mid = (lo + hi) / 2
        cov = float((y >= make(mid)).mean())
        if (cov < target) == higher_param_lowers_estimate:
            lo = mid
        else:
            hi = mid
    return round((lo + hi) / 2, 3)


def run():
    income, labels = simulate()
    origins = list(range(7 * WEEKS_HISTORY, N_DAYS - 7 + 1, 7))
    methods = ["last7", "mean28", "ewm2", "ewm4", "ewm6", "ewm8"]
    recs = {m: {"y": [], "typ": [], "cv": [], "user": []} for m in methods}
    kinds = np.array(labels)
    for u in range(N_USERS):
        for o in origins:
            hist = income[u, o - 7 * WEEKS_HISTORY:o]
            y = income[u, o:o + 7].sum()
            for m in methods:
                typ, cv = forecast(hist, (o - 7 * WEEKS_HISTORY) % 7, m)
                r = recs[m]
                r["y"].append(y); r["typ"].append(typ); r["cv"].append(cv); r["user"].append(u)

    report = {"users": N_USERS, "weeks_forecast": len(origins), "target_coverage": 0.8, "floor": FLOOR, "methods": {}}
    print(f"{'method':7} {'WAPE':>6} {'bias':>6} | {'cautious rule':22} {'cover':>6} {'pinball':>8} {'users<60%':>9}")
    for m in methods:
        r = {k: np.array(v) for k, v in recs[m].items()}
        y, typ, cv, user = r["y"], r["typ"], r["cv"], r["user"]
        wape = float(np.abs(y - typ).sum() / y.sum())
        bias = float((typ - y).sum() / y.sum())
        pop_cv = float(np.median(cv))
        rules = {
            "fixed": lambda p: typ * (1 - p),
            "user_cv": lambda p: np.maximum(FLOOR, 1 - p * cv) * typ,
            "shrunk_cv": lambda p: np.maximum(FLOOR, 1 - p * (0.5 * cv + 0.5 * pop_cv)) * typ,
        }
        res = {"wape": wape, "bias": bias, "pop_cv": pop_cv, "rules": {}}
        for name, make in rules.items():
            p = calibrate(make, y, hi=1.0 if name == "fixed" else 4.0)
            caut = make(p)
            hit = y >= caut
            per_user = np.bincount(user, weights=hit) / np.bincount(user)
            rr = dict(param=p, coverage=float(hit.mean()), pinball=pinball(y, caut),
                      users_below_60pct=float((per_user < 0.6).mean()))
            res["rules"][name] = rr
            print(f"{m:7} {wape:6.1%} {bias:+6.1%} | {name + ' p=' + str(p):22} {rr['coverage']:6.1%} {rr['pinball']:8.1f} {rr['users_below_60pct']:9.1%}")
        report["methods"][m] = res

    # Choice: a "safe to spend" number must not over-promise for any group, so among rules that leave
    # <= 0.5% of users badly over-promised (their own coverage < 60%), take the lowest pinball loss.
    # ewm4..ewm8 are within 0.2% of each other; ewm4 reacts faster to a change in work, so prefer it.
    best_m, best_r = "ewm4", "shrunk_cv"
    chosen = report["methods"][best_m]["rules"][best_r]
    pop_cv = round(report["methods"][best_m]["pop_cv"], 2)
    z = chosen["param"]
    report["chosen"] = {"method": best_m, "half_life_weeks": 4, "shrink_k": 2, "cautious_rule": best_r,
                        "z": z, "pop_cv": pop_cv, "floor": FLOOR, **chosen}
    r = {k: np.array(v) for k, v in recs[best_m].items()}
    caut = np.maximum(FLOOR, 1 - z * (0.5 * r["cv"] + 0.5 * pop_cv)) * r["typ"]
    k = kinds[r["user"]]
    report["chosen_coverage_by_work"] = {w: float((r["y"][k == w] >= caut[k == w]).mean()) for w in ARCHETYPES}

    # New users have less history, so forecasts are noisier: calibrate z separately for 2, 3, 4+ weeks.
    report["z_by_history_weeks"] = {}
    for weeks in (2, 3, 4, 8):
        ys, ts, cvs_ = [], [], []
        for u in range(0, N_USERS, 2):
            for o in origins:
                hist = income[u, o - 7 * weeks:o]
                typ, cv = forecast(hist, (o - 7 * weeks) % 7, best_m)
                ys.append(income[u, o:o + 7].sum()); ts.append(typ); cvs_.append(cv)
        ys, ts, cvs_ = map(np.array, (ys, ts, cvs_))
        make = lambda zz: np.maximum(FLOOR, 1 - zz * (0.5 * cvs_ + 0.5 * pop_cv)) * ts
        zw = calibrate(make, ys)
        report["z_by_history_weeks"][weeks] = {"z": zw, "coverage": float((ys >= make(zw)).mean()),
                                               "coverage_with_8wk_z": float((ys >= make(z)).mean()),
                                               "wape": float(np.abs(ys - ts).sum() / ys.sum())}
    print("by history:", report["z_by_history_weeks"])
    print("chosen:", report["chosen"])
    print("coverage by work:", {w: f"{v:.0%}" for w, v in report["chosen_coverage_by_work"].items()})
    Path("reports").mkdir(exist_ok=True)
    Path("reports/backtest.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    run()
