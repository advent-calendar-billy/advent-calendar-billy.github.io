#!/usr/bin/env python3
"""Parallel balance sweep.

Runs the ?autotest bot N times per floor across many headless Chromes and reports
a win RATE per floor instead of a one-run anecdote.

  python3 tools/sweep.py --trials 30 --floors 1-31
  python3 tools/sweep.py --trials 50 --floors 5,10,20 --baseline

Needs a local server on :8799 serving this directory.
"""
import argparse, json, random, re, statistics, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TITLE = re.compile(r"<title>([^<]*)</title>")
RESULT = re.compile(r"wave=(\d+)/(\d+).*?(WIN|LOSE|running)")

def one(args):
    floor, baseline, budget, extra = args
    url = (f"http://localhost:8799/?room={floor}&autotest"
           f"{'&baseline' if baseline else ''}"
           f"{'&' + extra if extra else ''}&nosw&cb={random.randrange(10**9)}")
    try:
        out = subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--no-sandbox",
             f"--virtual-time-budget={budget}", "--window-size=1280,600",
             "--dump-dom", url],
            capture_output=True, text=True, timeout=240).stdout
    except subprocess.TimeoutExpired:
        return floor, None, None
    m = TITLE.search(out)
    if not m: return floor, None, None
    r = RESULT.search(m.group(1))
    if not r: return floor, None, None
    return floor, int(r.group(1)), r.group(3)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trials", type=int, default=20)
    ap.add_argument("--floors", default="1-31")
    ap.add_argument("--baseline", action="store_true")
    ap.add_argument("--jobs", type=int, default=10)
    ap.add_argument("--budget", type=int, default=200000)
    ap.add_argument("--out", default="")
    ap.add_argument("--extra", default="", help="extra query params, e.g. dhp=0.03")
    a = ap.parse_args()

    floors = []
    for part in a.floors.split(","):
        if "-" in part:
            lo, hi = part.split("-"); floors += list(range(int(lo), int(hi) + 1))
        else:
            floors.append(int(part))

    jobs = [(f, a.baseline, a.budget, a.extra) for f in floors for _ in range(a.trials)]
    random.shuffle(jobs)                      # spread each floor across the pool
    t0 = time.time()
    res = {f: [] for f in floors}
    done = 0
    with ThreadPoolExecutor(max_workers=a.jobs) as ex:
        for floor, wave, verdict in ex.map(one, jobs):
            if verdict: res[floor].append((wave, verdict))
            done += 1
            if done % 25 == 0:
                print(f"  {done}/{len(jobs)} runs, {time.time()-t0:.0f}s", file=sys.stderr)

    print(f"\n{a.trials} runs/floor {a.extra}{'  (fresh-player build)' if a.baseline else ''}"
          f"   {time.time()-t0:.0f}s wall\n")
    print(f"{'floor':>5} {'win rate':>9}  {'median wave':>11}   {'':<22}")
    rows = {}
    for f in floors:
        rs = res[f]
        if not rs:
            print(f"{f:>5} {'no data':>9}"); continue
        wins = sum(1 for _, v in rs if v == "WIN")
        rate = wins / len(rs)
        med = statistics.median(w for w, _ in rs)
        bar = "█" * round(rate * 20)
        rows[f] = {"n": len(rs), "wins": wins, "rate": rate, "median_wave": med}
        print(f"{f:>5} {wins:>3}/{len(rs):<5} {rate*100:>3.0f}%  {med:>11.0f}   {bar}")
    if a.out:
        json.dump(rows, open(a.out, "w"), indent=1)
        print(f"\nwrote {a.out}")

if __name__ == "__main__":
    main()
