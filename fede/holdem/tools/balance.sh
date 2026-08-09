#!/bin/bash
# Iterate sweep -> tune until the campaign settles.
# A floor is BALANCED when the bot rarely wins (<=~15%) but still reaches the late
# waves (median >= 7). A floor at 0% dying on wave 3 is broken, not hard.
set -u
ROUNDS=${1:-4}
for i in $(seq 1 "$ROUNDS"); do
  echo "=== round $i: sweeping ==="
  python3 tools/sweep.py --trials 50 --floors 1-31 --jobs 11 --target 0.10 \
      --budget 260000 --out "/tmp/bal$i.json" 2>/dev/null | tail -35
  read BLOCKED SOFT <<< "$(python3 - "/tmp/bal$i.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
# BLOCKED is the one that matters: a floor nobody clears ends the campaign, so it is
# never an acceptable leftover. Too-easy floors are only an annoyance.
blocked = [k for k, v in d.items()
           if v["wins"] == 0 or v["median_wave"] < 7
           or (v.get("cliff", 0) > 0.8 and v["rate"] < 0.05)]
soft = [k for k, v in d.items() if v["rate"] > 0.15]
print(len(blocked), len(soft))
print("  blocked:", " ".join(sorted(blocked, key=int)) or "none", file=sys.stderr)
print("  too easy:", " ".join(sorted(soft, key=int)) or "none", file=sys.stderr)
PY
)"
  echo "--- blocked: $BLOCKED   too easy: $SOFT ---"
  if [ "$BLOCKED" -eq 0 ] && [ "$SOFT" -le 2 ]; then echo "SETTLED after round $i"; break; fi
  [ "$i" -lt "$ROUNDS" ] && python3 tools/tune.py "/tmp/bal$i.json" --target 0.10 \
      --gain 0.6 --max-step 0.6 --floor-wave 7 | tail -3
done
