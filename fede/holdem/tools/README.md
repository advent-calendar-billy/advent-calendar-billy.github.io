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
