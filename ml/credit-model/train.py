"""
Train the RozanaPay credit scorecard (and a gradient-boosting challenger).

Scorecard method (standard in retail lending):
  1. Bin each feature, merging bins until default rate is monotonic and every bin
     holds >= 5% of borrowers.
  2. Replace each value by its bin's Weight of Evidence  WoE = ln(%good / %bad).
  3. Fit logistic regression on the WoE features (target = default).
  4. Convert coefficients to integer points per bin; total points -> 300..900 score.
     Points per feature give reason codes ("what's lowering your score").

Challenger: sklearn HistGradientBoostingClassifier on raw features with monotonic
constraints, to measure how much accuracy the simple scorecard gives up.

Outputs:
  model/scorecard.json   bins, WoE, points — the deployable model
  reports/metrics.json   AUC / Gini / KS, calibration by band, IV per feature
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split

from generate_data import FEATURES

HERE = Path(__file__).parent
SEED = 7
MIN_BIN_SHARE = 0.05

# Score scaling: 700 points at 49:1 good:bad odds (2% default); every 50 points doubles the odds.
# With the app's bands this means: 800+ ≈ <0.5% default, 700+ ≈ <2%, 600+ ≈ <7.5%, 500+ ≈ <25%.
BASE_SCORE, BASE_ODDS, PDO = 700, 49.0, 50
FACTOR = PDO / math.log(2)
OFFSET = BASE_SCORE - FACTOR * math.log(BASE_ODDS)

# Direction each feature should move risk (+1: higher value = riskier). Used to keep
# bins monotonic and as GBM monotonic constraints. Domain-driven, not data-driven.
DIRECTION = {
    "income_days_30": -1, "income_total_30": -1, "active_weeks_12": -1, "expense_ratio_30": +1,
    "savings_balance": -1, "loans_repaid_on_time": -1, "loans_repaid_late": +1,
    "loans_overdue_now": +1, "bnpl_active": +1, "kyc_verified": -1, "account_age_days": -1,
}

LABELS = {
    "income_days_30": "Days with income (30d)",
    "income_total_30": "Income earned (30d)",
    "active_weeks_12": "Active weeks (12w)",
    "expense_ratio_30": "Spending vs income (30d)",
    "savings_balance": "Savings balance",
    "loans_repaid_on_time": "Loans repaid on time",
    "loans_repaid_late": "Loans repaid late",
    "loans_overdue_now": "Loans overdue now",
    "bnpl_active": "Active BNPL orders",
    "kyc_verified": "KYC verified",
    "account_age_days": "Account age",
}


def nice(x: float) -> float:
    """Round a cut point to something a human (and SQL) can read."""
    if x <= 1:
        return round(x, 2)
    if x < 20:
        return round(x)
    mag = 10 ** (len(str(int(x))) - 2)
    return round(x / mag) * mag


def initial_edges(s: pd.Series) -> list[float]:
    uniq = np.sort(s.unique())
    if len(uniq) <= 8:
        return [float(v) for v in uniq[1:]]  # one bin per distinct small value
    qs = s.quantile(np.linspace(0.1, 0.9, 9)).values
    return sorted({nice(float(q)) for q in qs if q > s.min()})


def bin_index(values: np.ndarray, edges: list[float]) -> np.ndarray:
    # bin k covers [edges[k-1], edges[k]); bin 0 is below edges[0]
    return np.searchsorted(np.asarray(edges), values, side="right")


def stats(x: pd.Series, y: pd.Series, edges: list[float]) -> pd.DataFrame:
    idx = bin_index(x.values, edges)
    df = pd.DataFrame({"b": idx, "y": y.values})
    g = df.groupby("b")["y"].agg(["size", "sum"]).reindex(range(len(edges) + 1), fill_value=0)
    g.columns = ["n", "bad"]
    g["good"] = g["n"] - g["bad"]
    return g


def monotone_edges(x: pd.Series, y: pd.Series, direction: int) -> list[float]:
    edges = initial_edges(x)
    # Rare-but-important flags (e.g. "loan overdue now", 3% of people) keep their own bin.
    min_share = 0.005 if x.nunique() <= 3 else MIN_BIN_SHARE
    while True:
        g = stats(x, y, edges)
        rate = (g["bad"] + 0.5) / (g["n"] + 1)
        share = g["n"] / g["n"].sum()
        bad_pair = None
        # merge empty/small bins first
        for k in range(len(g)):
            if share.iloc[k] < min_share and len(edges) > 0:
                bad_pair = k if k < len(edges) else k - 1
                break
        if bad_pair is None:
            for k in range(len(g) - 1):
                step = rate.iloc[k + 1] - rate.iloc[k]
                if step * direction < 0:  # risk moves the wrong way
                    bad_pair = k
                    break
        if bad_pair is None or not edges:
            return edges
        edges = edges[:bad_pair] + edges[bad_pair + 1:]


def woe_table(x, y, edges):
    g = stats(x, y, edges)
    tot_good, tot_bad = g["good"].sum(), g["bad"].sum()
    g["woe"] = np.log(((g["good"] + 0.5) / tot_good) / ((g["bad"] + 0.5) / tot_bad))
    g["iv"] = ((g["good"] / tot_good) - (g["bad"] / tot_bad)) * g["woe"]
    return g


def ks_stat(y, p):
    fpr, tpr, _ = roc_curve(y, p)
    return float(np.max(tpr - fpr))


def main():
    df = pd.read_csv(HERE / "data" / "synthetic_borrowers.csv")
    X, y = df[FEATURES], df["default"]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=SEED, stratify=y)

    # ---- 1-2. binning + WoE ----
    bins, tables, iv = {}, {}, {}
    for f in FEATURES:
        e = monotone_edges(Xtr[f], ytr, DIRECTION[f])
        t = woe_table(Xtr[f], ytr, e)
        bins[f], tables[f], iv[f] = e, t, float(t["iv"].sum())

    def to_woe(frame, feats):
        return pd.DataFrame({f: tables[f]["woe"].values[bin_index(frame[f].values, bins[f])] for f in feats})

    # keep features with some information; drop any with a wrong-signed coefficient
    feats = [f for f in FEATURES if iv[f] >= 0.02 and len(bins[f]) > 0]
    while True:
        lr = LogisticRegression(C=1.0, max_iter=1000)
        lr.fit(to_woe(Xtr, feats), ytr)
        coefs = dict(zip(feats, lr.coef_[0]))
        wrong = [f for f, c in coefs.items() if c >= 0]  # target=bad, WoE=ln(good/bad) -> coef must be < 0
        if not wrong:
            break
        drop = min(wrong, key=lambda f: iv[f])
        print(f"dropping {drop}: coefficient {coefs[drop]:+.3f} has the wrong sign given the other features")
        feats.remove(drop)

    b0, n = lr.intercept_[0], len(feats)

    # ---- 4. points ----
    card = []
    for f in feats:
        t, edges = tables[f], bins[f]
        rows = []
        for k in range(len(edges) + 1):
            lo = None if k == 0 else edges[k - 1]
            hi = None if k == len(edges) else edges[k]
            pts = -FACTOR * (coefs[f] * t["woe"].iloc[k] + b0 / n) + OFFSET / n
            rows.append({"min": lo, "max": hi, "woe": round(float(t["woe"].iloc[k]), 4),
                         "share": round(float(t["n"].iloc[k] / t["n"].sum()), 4),
                         "default_rate": round(float(t["bad"].iloc[k] / max(t["n"].iloc[k], 1)), 4),
                         "points": int(round(pts))})
        card.append({"feature": f, "label": LABELS[f], "coef": round(float(coefs[f]), 4),
                     "iv": round(iv[f], 4), "bins": rows})

    def score(frame):
        total = np.zeros(len(frame))
        for c in card:
            pts = np.array([b["points"] for b in c["bins"]])
            edges = [b["max"] for b in c["bins"][:-1]]
            total += pts[bin_index(frame[c["feature"]].values, edges)]
        return np.clip(np.round(total), 300, 900)

    s_te = score(Xte)
    p_lr = lr.predict_proba(to_woe(Xte, feats))[:, 1]

    # ---- challenger ----
    gbm = HistGradientBoostingClassifier(
        max_iter=300, learning_rate=0.05, max_leaf_nodes=15, l2_regularization=1.0,
        monotonic_cst=[DIRECTION[f] for f in FEATURES], random_state=SEED,
    ).fit(Xtr, ytr)
    p_gbm = gbm.predict_proba(Xte)[:, 1]

    # ---- bands & calibration ----
    band_edges = [(800, "excellent"), (700, "good"), (600, "fair"), (500, "poor"), (300, "very_poor")]
    def band(s):
        return next(name for lo, name in band_edges if s >= lo)
    te = pd.DataFrame({"score": s_te, "default": yte.values})
    te["band"] = te["score"].map(band)
    by_band = (te.groupby("band")["default"].agg(["size", "mean"])
               .reindex([b for _, b in band_edges]).fillna(0))

    metrics = {
        "dataset": {"rows": int(len(df)), "default_rate": round(float(y.mean()), 4),
                    "train_rows": int(len(Xtr)), "test_rows": int(len(Xte)), "synthetic": True},
        "scorecard": {
            "auc": round(roc_auc_score(yte, -s_te), 4),
            "gini": round(2 * roc_auc_score(yte, -s_te) - 1, 4),
            "ks": round(ks_stat(yte, -s_te), 4),
            "auc_probability_model": round(roc_auc_score(yte, p_lr), 4),
            "features_used": feats,
        },
        "challenger_gbm": {
            "auc": round(roc_auc_score(yte, p_gbm), 4),
            "gini": round(2 * roc_auc_score(yte, p_gbm) - 1, 4),
            "ks": round(ks_stat(yte, p_gbm), 4),
        },
        "information_value": {f: round(v, 4) for f, v in sorted(iv.items(), key=lambda kv: -kv[1])},
        "score_distribution": {
            "min": int(s_te.min()), "p10": int(np.percentile(s_te, 10)), "median": int(np.median(s_te)),
            "p90": int(np.percentile(s_te, 90)), "max": int(s_te.max()),
        },
        "default_rate_by_band": {b: {"share": round(r["size"] / len(te), 4), "default_rate": round(r["mean"], 4)}
                                 for b, r in by_band.iterrows()},
    }

    model = {
        "model_version": "scorecard-v1",
        "trained_on": "synthetic data (see generate_data.py) — retrain on real outcomes before real lending",
        "scaling": {"base_score": BASE_SCORE, "base_odds_good_bad": BASE_ODDS, "pdo": PDO,
                    "min_score": 300, "max_score": 900},
        "bands": [{"min": lo, "band": b} for lo, b in band_edges],
        "features": card,
    }
    (HERE / "model").mkdir(exist_ok=True)
    (HERE / "reports").mkdir(exist_ok=True)
    (HERE / "model" / "scorecard.json").write_text(json.dumps(model, indent=2, ensure_ascii=False))
    (HERE / "reports" / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
