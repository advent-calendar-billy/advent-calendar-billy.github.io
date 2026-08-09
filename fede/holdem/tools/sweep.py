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
    ap.add_argument("--target", type=float, default=0.10,
                    help="win rate we are tuning toward; used to decide when a floor is settled")
    ap.add_argument("--flat", action="store_true",
                    help="run every trial on every floor instead of stopping early")
    a = ap.parse_args()

    floors = []
    for part in a.floors.split(","):
        if "-" in part:
            lo, hi = part.split("-"); floors += list(range(int(lo), int(hi) + 1))
        else:
            floors.append(int(part))

    t0 = time.time()
    res = {f: [] for f in floors}
    spent = 0

    def wilson(k, n, z=1.64):
        """90% interval — good enough to tell 'settled' from 'needs more runs'."""
        if n == 0: return 0.0, 1.0
        p = k / n
        d = 1 + z*z/n
        c = (p + z*z/(2*n)) / d
        h = z * ((p*(1-p)/n + z*z/(4*n*n)) ** .5) / d
        return max(0.0, c - h), min(1.0, c + h)

    def settled(rs):
        """Stop sampling a floor once more runs cannot change what we would do to it."""
        n = len(rs)
        if n < 10: return False
        k = sum(1 for _, v in rs if v == "WIN")
        med = statistics.median(w for w, _ in rs)
        lo, hi = wilson(k, n)
        if k == 0 and med <= 5: return True        # dead early every time — broken, ease it
        if lo > a.target + 0.05: return True       # clearly too easy — stiffen it
        if hi < a.target and med >= 7: return True # clearly hard but alive — leave it
        return False

    # sample in rounds, dropping floors that have made up their mind
    live = list(floors)
    for size in (10, 10, 15, 15):
        if not live: break
        batch = [(f, a.baseline, a.budget, a.extra) for f in live for _ in range(size)]
        if not a.flat:
            batch = [j for j in batch if len(res[j[0]]) + size <= a.trials or True]
        random.shuffle(batch)
        with ThreadPoolExecutor(max_workers=a.jobs) as ex:
            for floor, wave, verdict in ex.map(one, batch):
                if verdict: res[floor].append((wave, verdict))
                spent += 1
        live = [f for f in live
                if len(res[f]) < a.trials and not (settled(res[f]) and not a.flat)]
        print(f"  {spent} runs, {time.time()-t0:.0f}s, {len(live)} floors still open",
              file=sys.stderr)
    done = spent

    print(f"\nup to {a.trials} runs/floor {a.extra}"
          f"{'  (fresh-player build)' if a.baseline else ''}"
          f"   {spent} runs, {time.time()-t0:.0f}s wall\n")
    print(f"{'floor':>5} {'win rate':>9} {'n':>4}  {'med':>4} {'deaths':>7}  {'on w10':>6}\n")
    rows = {}
    for f in floors:
        rs = res[f]
        if not rs:
            print(f"{f:>5} {'no data':>9}"); continue
        wins = sum(1 for _, v in rs if v == "WIN")
        rate = wins / len(rs)
        waves = sorted(w for w, v in rs if v != "WIN")
        med = statistics.median(w for w, _ in rs)
        lo = waves[0] if waves else 10
        hi = waves[-1] if waves else 10
        # how many of the losses happen on the very last wave: 1.0 means a cliff
        last = (sum(1 for w in waves if w >= 10) / len(waves)) if waves else 0
        rows[f] = {"n": len(rs), "wins": wins, "rate": rate, "median_wave": med,
                   "death_lo": lo, "death_hi": hi, "cliff": round(last, 2)}
        flag = "CLIFF" if last > .8 and wins == 0 else ("shut" if med < 7 and wins == 0 else "")
        print(f"{f:>5} {wins:>3}/{len(rs):<5} {rate*100:>3.0f}% {len(rs):>4}  "
              f"{med:>4.0f} {('' if not waves else f'{lo}-{hi}'):>7}  {last*100:>4.0f}%  {flag:<5} {'█' * round(rate*20)}")
    if a.out:
        json.dump(rows, open(a.out, "w"), indent=1)
        print(f"\nwrote {a.out}")

if __name__ == "__main__":
    main()
