# Hold'Em — Backlog

> Source of truth for remaining work. Multi-session. Check items off as they land.
> Decisions live in `APPROVED.md` — anything new/ambiguous gets asked before building.

## NOW (current session focus)
- [x] Free tower placement: drag from shop bar onto any spot off-path, collision-checked (no predefined pads)
- [ ] Playtest & balance pass on Room 1 with free placement
- [x] Velvet Rope: placeable ON the lane, always-visible slow aura
- [x] ×4 speed
- [x] AUTO wave start toggle
- [x] Next-wave preview (enemy icons + counts)

## CORE MECHANICS
- [ ] Tower placement polish: snap-back animation on invalid drop, subtle grid magnetism (maybe), placement while paused
- [ ] Tower targeting modes (first/last/strong) — tap tower to cycle? (ask user first)
- [ ] Sell/upgrade UX: floating mini-menu at the tower instead of bottom sheet? (bottom sheet conflicts with shop bar)
- [x] Wave preview: show icons of what's coming next wave
- [ ] Early-wave-call bonus chips (call next wave while current still alive)
- [x] Auto-start toggle for waves (mobile QoL)
- [ ] Game save: resume mid-room after closing tab (localStorage)
- [ ] Endless mode after campaign finale (approved)

## TOWERS — approved, not yet built
- [ ] ATM Row — skims fee from enemies walking past; wants dangerous placement
- [ ] Old Shrimp Buffet — lure capped at 5% of enemies (20% with powerups) + poison stacks
- [ ] The Waitress — attack-speed aura on a circuit (renamed from Bottle Service)
- [ ] Craps Table — periodic AoE cheer knockback
- [ ] Chip Stack Catapult — spends chips as ammo, late-game dump
- [ ] Tower upgrade paths (2 paths each, à la Bloons) instead of single ★ upgrade — big system
- [ ] Capstone towers (design doc has Fountain/Magician/Vault/Don Fortunato — NONE approved yet, re-pitch to user)

## ENEMIES — approved, not yet built
- [ ] The Honeymooners — pair, heal each other, survivor rages
- [x] The Influencer — speed aura for nearby enemies
- [ ] Drunk — staggering walk, hard to hit (dodge chance?)
- [ ] Mojito Guy — first hit spills drink → red, angry, faster
- [x] Coupon Clipper — visible coupon armor, shreds per hit
- [ ] The Regular — skips path segments via staff doors
- [ ] Card Counter (elite) — dodges every Nth projectile
- [ ] Tier-scaling system: earlier bosses become later fodder (approved) — needs stat curves per floor
- [ ] Enemy walk animations (waddle/groove) lost in gameplay port — sprites are static; re-add per-enemy gait

## BOSSES (every 5th room — need ~10 distinct across campaign)
- [x] The Whale (mini-boss, room 1 wave 5)
- [x] Loan Shark (room 1 wave 10)
- [ ] The Auditor — disables most expensive tower while alive
- [ ] Lady Luck — jinx aura: towers roll minimum damage
- [ ] 6+ more bosses to brainstorm WITH USER (interview style)

## CAMPAIGN / META
- [ ] Between-floor SLOT MACHINE (approved spec): costs chips, ≤10 plays/intermission, EV low but positive,
      "10 FREE GAMES!" with retriggers, hard-capped at mid-size jackpot, NO infinite glitch
- [ ] Campaign map screen — the map is part of the aesthetic; ~50 rooms in theme blocks
      (classic gambling climb + amenity floors, weird floors between blocks)
- [ ] Room progression: fresh build per room, leftover chips → meta-currency (approved)
- [ ] Meta-currency permanent upgrades shop (design with user)
- [ ] Rooms 2-10 (Slots Pit block): new lane layouts, escalating waves, decor variations
- [ ] Later theme blocks: blackjack rooms, roulette halls, poker room, buffet, pool deck, theater, high-roller suite, vault finale
- [ ] Branching floors (1 → 2a/2b → 3) — later, approved as eventual
- [ ] localStorage campaign save (which room, meta-currency, unlocks)

## AESTHETIC / JUICE
- [ ] Per-room decor sets (slot bank, blackjack tables, ropes already exist as style-sample code — port into game rooms)
- [ ] Death animations (poof of chips, grandma drops coin cup)
- [ ] Hit flashes, knockback wiggle
- [ ] Wave-start banner animation ("WAVE 3 — THE BUS ARRIVES")
- [ ] Boss intro: screen shake + name plate
- [ ] Vault door creaks open on leak (visual)
- [ ] Sound: slot dings, card whips, roulette clacks, grandma "tsk tsk" — WebAudio, all synthesized/embedded (offline!)
- [ ] Music: light lounge loop, boss theme (embedded/synth — offline)
- [ ] App icon + PWA manifest (installable to home screen)
- [ ] Title screen with marquee art (reuse style-samples header)

## MOBILE / TECH
- [x] Landscape lock + rotate overlay
- [x] Service worker offline cache
- [ ] PWA manifest.json + icons (real installability)
- [ ] Performance audit on real phone (SVG entity count at wave 9+)
- [ ] Prevent double-tap zoom / scroll bleed on iOS Safari
- [ ] Test on Fede's actual phone model before the flight
- [ ] sw.js cache version bump discipline (bump CACHE on every deploy!)

## BALANCE (living list)
- [ ] Room 1 first-pass numbers are guesses — playtest: tower costs, enemy HP curve (+10%/wave), income rates
- [ ] Grandma stun: 6s cd / 2.5s stun — feels?
- [ ] Whale at wave 5 beatable with ~2-3 towers?
- [ ] Loan Shark steal (120) — punishing enough without being run-ending?

## CONSTRAINTS (never violate)
- NO oxygen tanks/masks/breathing apparatus on any character
- Fully offline at runtime — no CDNs, no external fonts, no network calls
- Nothing is approved unless it's in APPROVED.md
