# Hold'Em — dev notes

Casino tower defense for Fede. Single-file game (`index.html`), offline PWA.

- **APPROVED.md** — every design decision Billy has signed off. Nothing else is approved.
- **BACKLOG.md** — multi-session work queue and balance notes.
- **style-samples.html** — the approved "Saturday Morning" art-direction reference scene.
- **sw.js** — service worker. **Bump `CACHE` version on every deploy** or clients keep the old build.

## Dev URL params
- `?gallery` — renders every sprite large for visual review
- `?room=N` — jump straight into room N (1-10)
- `?autotest` — self-playing probe: lane-relative tower placement, reinvests chips, ×4 speed
- `?slottest` — jump to the slot machine, auto-spin 3×
- `?unlockall` — unlock all rooms + Endless
- `?nosw` — skip service-worker registration
- `&cb=<anything>` — cache-buster for headless tests

## Headless testing gotchas (macOS Chrome)
- rAF doesn't advance under `--virtual-time-budget`; autotest drives `update()` off timers
- WebAudio, service workers, and fresh `--user-data-dir` profiles can pin virtual time
  (audio + SW are gated out of test modes — keep it that way)
- `location.reload()` resets the virtual-time budget → autotest never reloads

Local dev: `python3 -m http.server 8765` from the repo root, open `/fede/holdem/`.
