# housebook

`housebook.html` is a generated reference sheet: every table with both of its
branches (all tiers, real stats, real costs) and every guest and boss.

It is generated FROM `index.html`, never hand-written — so it cannot drift from
the game. Regenerate after changing TSPEC / TTYPES / ETYPES / sprites:

    cd fede/holdem
    python3 tools/housebook-extract.py   # pulls data tables + sprite defs (needs node)
    python3 tools/housebook-build.py     # writes housebook.html

The extractor scans for `const TSPEC = …` etc. with a quote/comment-aware
brace matcher, hands the literals to node for JSON, and lifts the `<defs>`
sprite block plus the `specStats` / `statLine` / `artFor` sources verbatim —
so the report renders the same sprites and prints the same numbers the game does.

# sweep.py — balance measurement

One bot run tells you almost nothing: enemies pick lanes at random, dodges roll,
the Magician blinks. Single runs disagree with each other constantly. This runs
the `?autotest` bot many times per floor across parallel headless Chromes and
reports a WIN RATE.

    python3 tools/sweep.py --trials 20 --floors 1-31 --jobs 11
    python3 tools/sweep.py --trials 50 --floors 10,20 --baseline

    --trials N     runs per floor (20 gives a usable rate; 50 for a close call)
    --floors       "1-31" or "5,10,20" or a mix
    --baseline     fresh-player build (five tables, no comps spent)
    --jobs         parallel Chromes (11 is comfortable on a 12-core machine)
    --out FILE     write the rates as JSON, to diff against a later sweep

Needs `python3 -m http.server 8799` running in fede/holdem.
20 runs x 13 floors takes about five minutes.

## how to read it

The bot is deliberately stupid — fixed placement, never repositions, never
retargets, cannot focus a boss. So its win rate is a LOWER BOUND, not a
prediction of human difficulty.

  100%  the floor is free. A human will be bored. (This is what "I'm winning
        non-stop" looked like in the data: floors 5/8/13/18/23/25/28/30 were
        all 20/20 before the Aug 9 pass.)
  ~0%   something is broken, not hard — investigate the floor rather than
        nerfing the game. Floor 3 sat at 0/20 because one of its two lanes was
        868 long against the other's 1298, and seeded layouts meant it rolled
        that variant every time.
  30-70% is the healthy band for a normal floor; block finales can sit lower.

A floor where the bot reaches wave 10 every run and dies there is FINE — Billy's
call, and a sound one: the bot cannot retarget, reposition or focus a boss, so a
person has a great deal more room than its win rate suggests. What is not fine is
a floor it never wins at all, or one it dies on by wave 5.
