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
- [x] Per-tower targeting priority (FIRST/STRONGEST/LAST pills in the tower sheet) — Billy approved
- [ ] Sell/upgrade UX: floating mini-menu at the tower instead of bottom sheet? (bottom sheet conflicts with shop bar)
- [x] Wave preview: show icons of what's coming next wave
- [ ] Early-wave-call bonus chips (call next wave while current still alive)
- [x] Auto-start toggle for waves (mobile QoL)
- [x] Mid-room save/resume: autosaves every wave, map shows a resume node
- [x] Endless mode: genuinely endless (waves generated on demand, HUD reads WAVE n/∞), banks comps when the run ends, tracks best wave

## TOWERS — approved, not yet built
- [x] ATM Row — skims fee from enemies walking past; wants dangerous placement
- [x] Old Shrimp Buffet — lure capped at 5%/20% of the wave + food-poisoning DoT
- [x] The Waitress — attack-speed aura tower (+25%/40%)
- [x] Craps Table — periodic AoE cheer knockback
- [x] Chip Stack Catapult — 8/12 chips per lobbed AoE shot
- [ ] Tower upgrade paths (2 paths each, à la Bloons) instead of single ★ upgrade — big system
- [ ] Capstone towers (design doc has Fountain/Magician/Vault/Don Fortunato — NONE approved yet, re-pitch to user)

## ENEMIES — approved, not yet built
- [x] The Honeymooners — pair, heal each other, survivor rages
- [x] The Influencer — speed aura for nearby enemies
- [x] Drunk — staggering walk, hard to hit (dodge chance?)
- [x] Mojito Guy — first hit spills drink → red, angry, faster
- [x] Coupon Clipper — visible coupon armor, shreds per hit
- [x] The Regular — staff-door skips with door-flash fx
- [x] Card Counter (elite) — dodges every 4th hit (COUNTED)
- [x] Tier-scaling first pass: Auditor returns as wave-8 elite in Room 5
- [x] Enemy walk animations (waddle/groove) lost in gameplay port — sprites are static; re-add per-enemy gait

## BOSSES (every 5th room — need ~10 distinct across campaign)
- [x] The Whale (mini-boss, room 1 wave 5)
- [x] Loan Shark (room 1 wave 10)
- [x] The Auditor — boss, freezes priciest tower (UNDER AUDIT), room 4 wave 10
- [x] Lady Luck — boss, jinx aura (towers deal 30% dmg inside), Room 5 finale
- [x] The Pit Boss — comp aura halves damage to nearby guests
- [x] The Entertainer — SHOWTIME! freezes nearby towers, plays his own synthesized showtune while alive
- [ ] 4+ more bosses (greenlit: Magician, House Photographer, Health Inspector, The Whale's Wife, The Regulator, The Owner)

## CAMPAIGN / META
- [x] Between-floor SLOT MACHINE (approved spec): costs chips, ≤10 plays/intermission, EV low but positive,
      "10 FREE GAMES!" with retriggers, hard-capped at mid-size jackpot, NO infinite glitch
- [x] Campaign map screen — the map is part of the aesthetic; ~50 rooms in theme blocks
      (classic gambling climb + amenity floors, weird floors between blocks)
- [x] Room progression: fresh build per room, leftover chips → meta-currency (approved)
- [x] Comps shop v1 on map (Bigger Bankroll, House Discount) — PROVISIONAL, needs user approval
- [x] Rooms 2-10 built — SLOTS PIT BLOCK COMPLETE (triple-fork R7, forked-serpentine R8, RNG-layout R9, gauntlet R10)
- [x] THE THEATER block started (floors 21-25: Showroom, Aisles, Backstage, Balcony, Main Stage) w/ own decor set (velvet seat rows, TONIGHT posters, spotlights) — 26-30 pending
- [x] ROULETTE HALLS BLOCK COMPLETE (floors 11-20: twin-loop, crossing X, wheel ring, split hall, 3-way converge, spiral, finale) + 18A/18B Counting Room fork — later blocks (poker room, buffet, pool deck, THEATER for the Entertainer, suite, vault) pending
- [x] Branching floors: 4A/4B (Main Floor vs Service Corridor) and 8A/8B (Main vs Mezzanine) fork and rejoin; map draws the fork
- [x] localStorage campaign save (which room, meta-currency, unlocks)

## AESTHETIC / JUICE
- [x] BILLY FEEDBACK ROUND (Aug 4): soft-shadow depth (exp B), background overhaul (border/skirting/
      sheen/weave), NPC familiarity +5%/floor with recompensated ladder, bank-vault redesign THEN
      replaced by GUEST SERVICES front desk (complaints = reputation flavor, live star placard, bell
      ring on leak), SHOWTIME! musical 3x3 slot machine (Rocky/Hedwig/Hair/LittleShop/Wicked symbols,
      5 paylines), full emoji purge, pause RESTART, endless copy rewrite, per-tower targeting
- [x] POLISH SWEEP (Aug 3 night): entrance marquee doorway, casino-directory map board
      (bulbs, YOU ARE HERE, backdrop blur), LUCKY 7s cabinet (payline, win flash, cash-out
      preview), pause menu w/ quit-to-map, boss HP bar, hidden-till-hit health bars, lvl2 ★
      badges, impact rings, tour bus arrivals w/ honk, tourist camera-flash blind (approved
      mechanic), leak screen flash, lounge chord pad, rolling chip counter, victory beat,
      FINAL WAVE banner, drag hint, sprite pass (Mojito/Drunk/Shark), LOOSE SLOTS sign +
      cocktail decor, mirrored layout variants for rooms 1-6, apple-touch-icon, dev README
- [x] Randomized per-room decor (slot banks, blackjack tables, plants) — doubles as placement obstacles
- [x] Forked lanes with per-enemy branch RNG (rooms 2-3) + random layout variants (room 1)
- [x] Rope visual overhaul: bars the lane, marching aura, queue dots + slowed gait on victims
- [x] Ambient roaming waitress
- [x] Death animations (poof of chips, grandma drops coin cup)
- [x] Hit flashes on enemies; grounding shadows + rim light on every guest
- [x] Wave-start banner animation ("WAVE 3 — THE BUS ARRIVES")
- [x] Boss intro: screen shake + name plate
- [ ] Vault door creaks open on leak (visual)
- [x] SFX v1: synthesized WebAudio (cards, balls, kills, leaks, TILT, wave fanfare, boss sting, slot bells) + mute toggle
- [x] Music v1: lounge chord pad + tense boss vamp that takes over while a boss is on the floor
- [x] App icon + PWA manifest + apple-touch-icon PNG
- [x] Title screen: marquee sign with chasing bulbs, sunburst rays, scattered chips/cards

## MOBILE / TECH
- [x] Landscape lock + rotate overlay
- [x] Service worker offline cache
- [x] PWA manifest.json + icons (real installability)
- [x] Perf pass: live scene ~560 SVG elements at a heavy wave; enemy rim light limited to bosses so fodder never renders its sprite twice
- [ ] Confirm frame rate on Fede's actual phone (headless can't measure it)
- [x] Prevent double-tap zoom / scroll bleed on iOS Safari
- [ ] Verify mid-room RESUME on a real device (headless test env fights virtual time)
- [ ] Test on Fede's actual phone model before the flight
- [ ] sw.js cache version bump discipline (bump CACHE on every deploy!)

## BALANCE (living list)
- [x] Probe harness: ?autotest reports progress through document.title, so a headless sweep of all
      20 floors yields a wave-reached table (scratchpad/probe-results.txt)
- [x] Aug 5 rebalance: enemy scale was compounding hpMul x familiarity(1.05^floor) to ~11x by floor 20
      while towers only reached ~4x — late floors were mathematically unwinnable. hpMul is now a flat
      1 + 0.06*floor curve, and every room opens with a ramp (45/62/80/92% counts for waves 1-4).
      Bot results on the worst floors went from wave 1-2 to wave 6-10.
- [x] Probe data v2 (Aug 3 night): fodder-first openers fixed wave-1 walls in r6-r10; blind bot now
      reaches r3:w10, r5:w9, r10:w4, endless:w15. R7 triple-fork stays hard for the bot (hub-placement
      puzzle) — trimmed to 3.4x, needs human validation
- [x] Probe data (Aug 3): reinvesting bot clears R1 easily, dies at R3 wave-10 gauntlet — softened hpMul ladder lands in the right zone; human playtest still needed
- [ ] roomPow(): towers gain +16% dmg per room to track the hp curve — crude, replace with real per-room tuning
- [ ] Room 1 first-pass numbers are guesses — playtest: tower costs, enemy HP curve (+10%/wave), income rates
- [ ] Grandma stun: 6s cd / 2.5s stun — feels?
- [ ] Whale at wave 5 beatable with ~2-3 towers?
- [ ] Loan Shark steal (120) — punishing enough without being run-ending?

## CONSTRAINTS (never violate)
- NO oxygen tanks/masks/breathing apparatus on any character
- Fully offline at runtime — no CDNs, no external fonts, no network calls
- Nothing is approved unless it's in APPROVED.md
