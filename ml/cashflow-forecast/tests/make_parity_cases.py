"""Writes tests/parity_cases.json: random histories + the Python forecast, for the Node parity test."""
import json, sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backtest import weekday_profile, weekly_cv  # noqa: E402

Z = {2: 1.152, 3: 1.014, 4: 0.956, 8: 0.861}
rng = np.random.default_rng(1)
cases = []
for c in range(300):
    weeks = int(rng.integers(2, 9))
    hist = [float(x) for x in np.where(rng.random(weeks * 7) < rng.uniform(0.3, 1), np.round(rng.lognormal(6.4, 0.5, weeks * 7) / 10) * 10, 0)]
    if c % 50 == 0:
        hist = [0.0] * (weeks * 7)  # all zero
    dow = int(rng.integers(0, 7))
    h = np.array(hist)
    prof = weekday_profile(h, dow, 4, 2.0)
    cv = weekly_cv(h)
    z = Z[8] if weeks >= 8 else Z[4] if weeks >= 4 else Z[weeks]
    typ = float(prof.sum())
    cases.append({"hist": hist, "dow": dow, "profile": list(map(float, prof)), "cv": cv, "typical": typ,
                  "cautious": typ * max(0.25, 1 - z * (0.5 * cv + 0.5 * 0.3))})
Path(__file__).with_name("parity_cases.json").write_text(json.dumps(cases))
print(len(cases), "cases")
