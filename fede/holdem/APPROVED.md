# Hold'Em — Approved Decisions

> Only things in this file are approved. The design doc (`casino-tower-defense-design.md`) is raw brainstorm material, NOT approved.

## Identity
- **Name:** Hold'Em (final spelling TBD confirmation)
- Casino-themed tower defense, 2D, mobile friendly, fully offline (playable on a plane)
- Target feel: addictive long game with scaling builds, à la Bloons TD

## Structure
- **Campaign of floors** with a visible progression map — the map is part of the aesthetic ("progression is an important part of addiction")
- Single traversal for now; later may branch temporarily (floor 1 → 2a or 2b, both rejoin at 3 as different challenges)
- Each floor/room must **feel different** (backgrounds, paths); background decoration objects can be reused across floors
- **Think BIG: ~50 rooms**, grouped by theme (e.g. 10 slot pits, 10 blackjack rooms, …)
- Themes capped at: **classic gambling climb + amenity floors**; sprinkle occasional **weird/surreal floors** between theme blocks as palate cleansers
- **After the campaign finale: an Endless mode option**

## Enemies
- **Mixed roster**: zombie-fied casino goers as the base, plus other casino figures for bosses/specials
- **Tier scaling like Bloons**: variety within "normal" NPCs so a floor-2 boss can become floor-7 fodder
- **Approved archetypes:**
  - **Slot Grandma** — lucky visor, fanny pack, taps towers compulsively to "make them pay out" (stun/drain attack). **NO oxygen tank or mask** (see constraints)
  - **The Whale** — tanky high-roller mini-boss, bathrobe, decorated with dollar signs, big chip payout on death
  - **The Regular** — knows the floor; skips path segments via staff doors (weakly approved — "fine I guess")
  - **Bus Tour Tourist** — arrives in waves of 10 when the tour bus pulls up; camera flash briefly blinds a tower; chip piñata
  - **Penny Slot Retiree** — ultra-cheap slow swarm unit with a cup of coins, drops almost nothing (the "red bloon")
  - **The Honeymooners** — spawn as a hand-holding pair; heal each other while both alive; the survivor speeds up in grief-rage
  - **The Influencer** — ring light + selfie stick; aura makes nearby enemies walk faster ("followers rushing in"); priority target
  - **Drunk** (user idea, to develop) — staggering walk makes him hard to hit
  - **Mojito Guy** (user idea, to develop) — when shot, the mojito spills; he turns red, angry, and slightly faster
  - **Elvis Impersonators** — spawn in groups, ALL are impersonators (no "real one"); they dance while walking
  - **Coupon Clipper** — fistful of comp coupons absorb hits; each hit visibly shreds one coupon before she takes damage
- **Elite/boss tier approved:**
  - **Card Counter** — dodges every Nth projectile (he's counting); random-damage towers ignore his pattern
  - **Loan Shark** — literal shark in a suit; on leak he steals chips instead of costing a life
  - **The Auditor** (boss) — disables your single most expensive tower while alive; forces diversification
  - **Lady Luck** (boss) — jinx aura: towers inside roll minimum damage (dice land 1, roulette misses)
- **Rejected:** Bachelor Party conga-line enemy, Superstitious Gambler (first-hit-misses), Jet-lagged Sleepwalker
- Still want MORE archetypes — keep pitching

## Towers (approved)
- **Roulette Wheel** — attacker; ivory ball ricochets between enemies
- **The Cage** — income; cashier window paying per-round dividends (scales with hoarded chips)
- **ATM Row** — income; skims a fee from enemies walking past, wants dangerous placement
- **The Waitress** — attack-speed-buff waitress circuit (renamed from "Bottle Service")
- **Old Shrimp Buffet** — lure + food-poisoning stacks; lure capped at ~5% of enemies (up to ~20% with powerups)
- **Card Dealer** — razor card fan, multishot/pierce; "52 Pickup" full-deck burst upgrade
- **Craps Table** — periodic crowd-cheer AoE shockwave knocks enemies backward
- **Chip Stack Catapult** — loads your chips as ammo; huge damage per chip spent (late-game chip dump)
- **Velvet Rope** — expensive; SLOWS enemies by making them queue politely (not a hard blocker)
- **Rejected towers:** Eye in the Sky, Dice Roller

## Tower placement (approved)
- **Free placement, no predefined slots**: drag a tower from the shop bar onto any open floor
- Valid anywhere off the path as long as towers don't collide with each other (also excluded: the vault, screen edges)
- Shop bar sits along the bottom edge; green/red footprint shows validity while dragging

## Combat rules (approved)
- Towers cannot be destroyed by NPCs
- NPCs march; they can batter path obstacles (Velvet Rope's bouncer, future walls)
- **Special NPCs may temporarily DISRUPT towers** (never destroy): Slot Grandma's tap-stun, the Auditor's disable

## Pacing & loss condition (approved)
- **Boss every 5th room** — needs ~10 distinct bosses or heavy variants across the campaign
- **Reputation meter**: leaks damage the casino's star rating; at zero stars the room fails

## Comps shop (PROVISIONAL — not yet user-approved)
- Map screen sells permanent upgrades for comps: Bigger Bankroll (+60 start chips, ×3) and House Discount (towers 5% cheaper, ×2)
- Placeholder design to make comps mean something; revisit with Billy

## Economy (approved)
- **Fresh build per room** (Bloons-style): build from scratch each room with starting chips
- Leftover chips convert to a **meta-currency** for permanent upgrades between rooms

## NPC Infobox system (approved)
- When a new NPC type first appears: **flashy infobox** explaining it, which Fede must accept/dismiss before play continues
- Tapping any NPC in-game re-opens its infobox and **pauses the game**

## Between-floor mechanic
- **Rejected:** Double or Nothing wagers
- **Approved concept:** a slot machine between floors, tuned to *feel* like a real slot machine
  - Costs chips to play, max ~10 plays per round
  - Expected value: low but **positive**
  - Must NOT allow any infinite-money glitch
  - **"10 FREE GAMES!" bonus round with retriggers**: during free games, landing a new star/scatter resets/extends the free-game counter (real-slot feel), and small jackpots can hit during them
  - Anti-exploit rule: total bonus payout is **hard-capped at a mid-size jackpot** so retriggers can never compound infinitely

## Art direction (APPROVED)
- **"Saturday Morning": fat-outline cartoon vector (Kingdom-Rush-like), top-down**
- Camera at gameplay zoom: serpentine lane with multiple runs, small squashed-perspective walkers, towers ~1.5–2.5× lane width
- Detail bar set by the final `style-samples.html` scene: patterned carpet + vignette + light pools, layered walkway strokes, full-detail characters rendered small, drop shadows for "a bit of depth" on big towers/bosses
- 2D only; slight pseudo-3D depth (shadows/plinths) allowed on bosses and great towers
- **Orientation: landscape** (horizontal), with a rotate-your-phone overlay in portrait
- Offline-capable: no runtime network (system fonts in-game, service worker cache)

## Hard constraints
- **No oxygen tanks / oxygen masks / breathing-apparatus imagery on any character.** (Personal: Fede's mom had breathing problems.)
- Offline: no network calls at runtime
