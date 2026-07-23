# El Secuestro de Maxim — web suite

Digital layer for a home escape room ("El Secuestro de Maxim"), served at
`thebilly.dev/fede/escaperoom/...`. Pure static GitHub Pages — no backend.
Shared game state (happiness level, 10FA progress, CCTV frame, chat log)
lives in a Google Sheet, read/written client-side via a service account.
See `.claude/skills/gsheet-service-account/SKILL.md` (repo root) for the
credential pattern used by every page here.

## Pages

| Folder | What it is |
|---|---|
| `escritorio/` | **Fede's entry point**: Windows 2000 desktop replica. Every player page opens from its "Acceso directo" icons inside a maximized IE-style window (fake URL bar, taskbar, Inicio menu). App list/labels/fake URLs: `APPS` at the top of `escritorio/script.js`. `?open=<id>` pre-opens an app |
| `grindr/` | Faithful Grindr-style chat replica; empty until the console reveals the backstory |
| `happiness/` | The flower — petals fall with real gravity/wind physics as the level drains |
| `cctv/` | Rooftop security-camera feed, 10-frame slideshow with CCTV overlay |
| `board/` | Static condo bulletin board; one post is the real clue |
| `10fa/` | "Verificación Reforzada" bank-verification app, Chase-style chrome |
| `consola/` | Billy's one-handed director console (stealth clock mode included) |
| `buscaminas/` | Fully functional classic Minesweeper (decoy app on the desktop; opens as a native program window, not IE) |
| `youtube/` | 2008-era YouTube replica with a single video (the FNG lockpicking tutorial) and canned comments |
| `shared/` | Common Sheets client, config, fullscreen button |
| `audio/`, `video/` | Media assets referenced by the pages above |

All game content (chat script, board posts, 10FA factor answers/ads,
CCTV photos) lives in data files or the Sheet, not in the page code —
see each folder's own data file (`factors.js`, `posts.js`, `script-data.js`).

## `planning/` — not in git

`planning/` holds the production bible, prop lists, and other local
planning docs (currently `el-secuestro-de-maxim-v5.html` is the canonical
one — check its own "v" number for the latest). It also holds:

- `duck_phone_tree.py` + `.bland_pathway.json` — the bank phone tree,
  BUILT on Bland.ai. Outbound: it *calls Fede's phone*; no inbound
  number is needed, ever. `python3 duck_phone_tree.py build | call | show`.
- `cctv-prompts.html` — generator for the ChatGPT prompts that produce
  the CCTV frames (and the 10FA captcha tiles + gym-card headshot).

`cctv/img/` currently contains 10 labeled PLACEHOLDER frames so the
feed runs end-to-end; replace with the real AI frames when ready. It's gitignored on purpose:
these are personal/spoiler-heavy notes for the game itself, not code, and
don't belong in version control. The folder exists locally on Billy's
machine; if you're reading this from a fresh clone, `planning/` will be
empty or absent.
