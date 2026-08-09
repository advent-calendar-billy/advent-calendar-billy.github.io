#!/usr/bin/env python3
"""Nudge each floor's `diff` dial toward a target bot win rate.

    python3 tools/sweep.py --trials 12 --floors 1-31 --out /tmp/s.json
    python3 tools/tune.py /tmp/s.json --target 0.45

The bot is much worse than a human, so aim well below 100%: a floor the bot
clears every time is a floor a person sleeps through.
"""
import argparse, json, re, sys

ap = argparse.ArgumentParser()
ap.add_argument("sweep")
ap.add_argument("--target", type=float, default=0.45)
ap.add_argument("--gain", type=float, default=0.5, help="how hard to correct (0-1)")
ap.add_argument("--max-step", type=float, default=0.35)
ap.add_argument("--file", default="index.html")
a = ap.parse_args()

rates = {int(k): v for k, v in json.load(open(a.sweep)).items()}
src = open(a.file).read()
lines = src.split("\n")

# find each room's opening line, in order
starts = [i for i, l in enumerate(lines) if re.match(r"\s*\{ name: '[^']+',.*(hpMul|chips)", l)]
if not starts:
    sys.exit("could not find room definitions")

changed = []
for idx, li in enumerate(starts, start=1):
    if idx not in rates: continue
    r = rates[idx]["rate"]
    cur = 1.0
    m = re.search(r"diff:\s*([\d.]+)", lines[li])
    if m: cur = float(m.group(1))
    # win rate too high -> stiffen; too low -> ease
    err = r - a.target
    step = max(-a.max_step, min(a.max_step, err * a.gain))
    new = round(max(0.5, min(3.0, cur * (1 + step))), 3)
    if abs(new - cur) < 0.02: continue
    if m:
        lines[li] = lines[li].replace(m.group(0), f"diff: {new}")
    else:
        lines[li] = re.sub(r"(\{ name: '[^']+',)", rf"\1 diff: {new},", lines[li], count=1)
    changed.append((idx, r, cur, new))

open(a.file, "w").write("\n".join(lines))
print(f"{'floor':>5} {'win':>6} {'diff':>16}")
for i, r, c, n in changed:
    print(f"{i:>5} {r*100:>5.0f}%   {c:>5.2f} -> {n:<5.2f}  {'stiffer' if n > c else 'easier'}")
print(f"\n{len(changed)} floors adjusted")
