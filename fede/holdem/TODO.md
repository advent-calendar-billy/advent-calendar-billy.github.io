# Hold'Em — playtest TODO (Billy, Aug 7–8)

Tracking every piece of playtest feedback. Checked = shipped & pushed.

## Done
- [x] 5 lives was far too few → **20 per floor**, shown as a **counter** (not star glyphs), resets each floor
- [x] Layout: **MAP | TABLES** — floor fills the left, tower rack is a vertical column pinned right
- [x] Rack cards no longer cut off (all five fit; fade hints when it scrolls)
- [x] Tapping a table opens its dossier (nothing used to happen)
- [x] **Rack scrolls with a finger drag** — one gesture handler: vertical swipe scrolls,
      horizontal pull places, tap informs (needs confirming on a real phone)
- [x] **Responsive overlays** — every overlay is `max-height: calc(100dvh - 16px)` + `overflow-y: auto`,
      fonts/padding/sprites on `clamp()`. Nothing hardcoded to a screen size any more.
- [x] **Dossier = a real upgrade tree** — base table, then a drawn fork into two branches,
      each tier showing its own name, its real numbers and its chip cost
- [x] **Role tag on every table** — SINGLE TARGET / AREA SPLASH / SLOW FIELD / SUPPORT / INCOME
- [x] Killed the "needs MASTERY" copy
- [x] **Upgrading changes the table's NAME and its LOOK** — new name per tier, and the dressing
      grows (ring, brass studs, glow, scale). Path A runs hot brass, path B runs cold steel,
      so you can read a built floor at a glance.
- [x] **Tougher guests cost more reputation**, and their dossier says how much
- [x] **A table's dossier opens even when you can't afford it** (plan ahead)
- [x] **Clicking a placed table shows its CURRENT attack** — live stat line at the top of its menu
- [x] **BRANCHING UPGRADE PATHS** (the big one) — see below

## Branching upgrade paths — how it works now
- Every table has **two named branches**, two tiers deep (e.g. Card Dealer → *Aflame* → Blazing
  Dealer → The Firestarter, or *Cold Deck* → Cold Deck → The Deep Freeze).
- A branch is **unlocked permanently with comps**, on the floor map, between rooms.
- Inside a floor you spend **chips** to walk a branch you already own. Once a table commits to a
  branch it stays on it.
- **Floor 1 has no upgrades at all** — you haven't banked any comps yet. Floor 1 leaves ~40 comps
  and the Dealer's first branch costs 35, so your first path unlock lands right after it.
- The tower menu shows **one button per possible upgrade**, in three honest states:
  **buyable** (gold), **can't afford** (price in red, tap says how much more you need),
  **not unlocked** (says "buy with comps", tap says when).

## Fable session (Aug 8, 2h block)
- [x] **Every branch is now 3 tiers deep** (Billy: "add 1 level... level 3 should be creative/weird/awesome")
      Tier 3 breaks flavor on purpose: THE INFERNO (fireball cards, real AoE burns), ABSOLUTE ZERO
      (cards hard-freeze guests mid-stride), THE WRECKING BALL (each hit shoves the crowd),
      PERPETUAL MOTION (lightning arcs between 16 bounces), THE VELVET WALL (the bouncer ROARS —
      full stop), THE ENDLESS QUEUE (340 reach), THE MONEY PRINTER (gold fountain payouts),
      DEATH & TAXES (+22/kill nearby), PREDATORY LENDING (fees drain HP), TOO BIG TO FAIL,
      THE EARTHQUAKE (screen shakes, crowd stunned), SEVEN OUT (a giant die rolls up the lane),
      PATIENT ZERO PRAWN (poison spreads guest to guest), THE FOOD COMA (eaters pass out mid-lane),
      LAST CALL (buffed tables spark white hot), CHAMPAGNE SUPERNOVA (cork pops stun the crowd),
      THE JACKPOT, MAKE IT RAIN (shots split into 5 more)
- [x] **Rope has a VISIBLE effect now**: red velvet QUEUE tag over every slowed guest (says STOPPED
      when fully held), gait drops to a crawl, and the rope's aura lights up bright while it's
      actually holding someone
- [x] Max-level tables get a breathing glow + orbiting light ring (path-colored)
- [x] Guests dress for the depth: floors 11-20 wear high-roller shades + gold chains, floors 21+
      wear feather boas (calibrated in a review gallery, `?gallery=flair`)
- [x] Fixed: map was drawing up to 20 ★ per cleared floor (leftover from the 5-star era) — now a
      1-5 rating derived from reputation kept

### Same block, second half
- [x] Tier-3 SFX: fire whoosh, ice tinkle, quake rumble, die-roll clatter, cork pop (spam-guarded)
- [x] Rack cards show **two branch pips** (gold/steel when bought, dark when locked) so you can
      see your unlocks without opening a dossier
- [x] Theater spotlights were reading as grey puddles (they even cast shadows) — now warm,
      breathing pools of light with glitter motes, no shadow
- [x] Endless guests wear tiny crooked crowns; SEVEN OUT's die is properly giant
- [x] Fixed 31/30 FLOORS HELD at campaign end; map stars capped at 5

- [x] **NEW BOSS: THE MAGICIAN** (greenlit roster) — headlines floor 17 and the endless pit.
      Every 6s he vanishes FORWARD in a puff of smoke and takes nearby guests with him — the
      anti-chokepoint boss. Tall hat, red-lined cape, wand sparkle. PRESTO!

- [x] **NEW BOSS: THE HOUSE PHOTOGRAPHER** (greenlit roster) — works THE BALCONY (floor 24) and
      the endless pit. Every 8s: "SMILE!", a full-screen flash, and every table in frame is
      frozen blind for 1.6s. The anti-tower boss to the Magician's anti-chokepoint.

- [x] **NEW BOSS: THE HEALTH INSPECTOR** (floor 27 + deep endless) — hairnet, clipboard, no
      mercy. While she walks, every buffet is CLOSED BY ORDER and she cures the food poisoning
      of anyone she passes. The anti-buffet boss.
- [x] **NEW MINI-BOSS PAIR: THE WHALE'S WIFE** (floor 27 + deep endless) — arrives on the
      Whale's arm; they heal each other like the honeymooners; widow either one and the
      survivor RAGES. Fur stole, big hair, cocktail.

- [x] **NEW BOSS: THE REGULATOR** (floor 19 + deep endless) — gray suit, lanyard, tablet of
      paperwork. Every 7s she cites your nearest table for a VIOLATION (red notice taped on,
      half damage). Notices stack until she dies — then all DISMISSED at once.
      **7 of your 8 greenlit bosses now exist.** Only THE OWNER remains, saved for his own
      endgame floor (pitch in questions.txt).

## Playtest feedback round 2 (Aug 8, after Billy's first branch playtest)
- [x] **Less popups** — no doors-open modal, floor lands ready; new guests are non-blocking
      bottom-left toasts (tap one for the full dossier); waves start immediately
- [x] **Tier I unlocked by default** — chips-only from floor 1; comps buy tiers II & III
- [x] **"Only 5 towers?"** — there were always 10; the rack now SHOWS the five unhired ones
      (grayed, priced in comps, tap for dossier) so the roster is visible from minute one
- [x] **Roulette rework** — slow + heavy anti-elite: full dmg to the STRONGEST, ricochets to the
      next-strongest (never repeats), halving each hop; targets STRONGEST by default
- NOTE for Billy: with tier I free, the blind bot now clears most of the campaign without any
  comps (dies only at the floor-20 finale). If it plays too easy in hand, the levers are enemy
  HP (+X%/floor) or tier-I prices — say the word.

## Playtest feedback round 3 (Aug 8, same evening)
- [x] **No meta commentary in-game** — treeNote gone, "comps first" gone, section headers terse,
      lock explanations live in one place (the comps shop) instead of everywhere
- [x] **"reach N" renamed "range N"** everywhere
- [x] **Tiny version tag** top-right (v65) so we always know which build you're on
- [x] **Two taps to play, literally** — cold start: one tap on the title lands you ON your current
      floor, ready to place. No map, no elevator, no doors modal. The map appears only where it
      matters: after cashing out (comps shop) or via QUIT TO MAP. Retry/restart skip the title
      entirely and drop you straight back in.
- [x] **DRAG A TABLE / DEAL THEM IN hints deleted** — Fede knows how to play
- [x] **Guest mini-popups (toasts) removed** — replaced by a small (i) next to DEAL THEM IN that
      opens "THIS WAVE · The Guest List" on demand

- [x] **In-level rack shows only hired tables** — unhired ones appear solely in the map's comps
      shop (round-3 revert of the grayed rack cards, per Billy)

## Playtest feedback round 4 (Aug 8, night) — the honesty pass
- [x] **THE BIG ONE: the balance bot was cheating.** Its opening towers were never paid for
      (~1400 chips of free tables on a 380 budget), so every "floor N clears" was fantasy —
      which is why the game felt impossible. The bot now pays for towers AND upgrades.
- [x] Rebalanced against honest numbers: floor 1 starts at 560 chips (your "half an extra cage"),
      early floors funded up, kills pay +35%, wave-clear pays 45, block-1 HP ladder flattened,
      per-wave HP ramp softened, whale trimmed to 900, familiarity capped at 2x (it was silently
      QUADRUPLING deep-floor fodder), deeper floors get depth-scaled bankrolls (+6%/floor)
- [x] **ATM redesign (your spec): prints money per second in its area** — base rate always,
      plus a cut per guest in range; branches = print faster vs cover more floor
- [x] **Layout & decor are seeded per floor** — restarting can never reroll a luckier start
- [x] **×2 is the default speed**
- [x] **Tap near two towers now opens the closest one** (dead zone gone)
- [x] **NEXT pill is the wave info** — tap it for the guest list; the (i) button is gone
- [x] **Upgrade descriptions are flavor, not arithmetic** — "the queue crawls slower" vs
      "the queue reaches further"; branches read distinct in plain words
- [ ] NEXT: per-branch tower ART (your "halo is lazy" note) — real design changes per branch+tier
- Probe status (honest bot): floors 1, 4-30 all clear; forked floors 2-3 reach wave 4-7 (the
  fixed-spot bot is worst exactly there — humans place the join). Re-test 2-3 in hand please.

## Playtest feedback round 5 (Aug 8, late night)
- [x] **BRANCH ART, for real this time** — upgrading changes the table itself, mid-wave:
      Aflame dealers grow flames on the felt, Cold Deck felts frost over and throw ice-blue
      cards; Steel roulette gets a bolted industrial rim, Ivory adds balls in flight; the
      Guest List rope gets its clipboard + red carpet, the Cordon grows extra stanchions;
      the cage window fills with coin stacks (A) or a counting-house shade + lamps (B);
      craps stacks glowing red dice vs one growing snake-eyes die; buffet steams harder vs
      adds a tray tier; waitress fills her tray vs champagne bucket; catapult iron band +
      chip ammo vs extra cups; security rolls out a velvet lane + ejection lamp vs radios.
      Review sheets: `?arttest=<type>`.
- [x] **ATM benched** (disabled, not deleted) — off the rack, shop, and starting set
- [x] **Slots feel like slots** — row pairs now pay small (~half of spins return something);
      full lines unchanged. The old odds: ~18% per spin, so 10 dry spins were genuinely possible.
- [x] **Purchases appear right after the slot cash-out** — a focused spend screen (hire /
      paths / house) with one big NEXT FLOOR button. No map scroll. "full map" is a small link.
- ANSWER: dying on a floor is NOT game over — TRY AGAIN restarts that floor; comps, hires and
  unlocked floors all persist.

## Playtest feedback round 6 (Aug 8)
- [x] **Full sprite transformations per branch** (your "don't be lazy" — you were right, and the
      roulette's runtime-built pockets were exactly the kind of shortcut you suspected; they now
      generate per-variant palettes). Every table has two complete alternate designs: burning
      table ringed in flame vs frozen table with icicles; gunmetal bolted wheel with hot-metal
      pockets vs ivory-gold wheel; the waitress herself changes uniform and gear (she was a shared
      sprite before — the "recolor" wasn't touching her at all); armored iron mortar vs
      triple-cup thrower; red-coat captain with peaked cap, epaulettes and velvet lane vs
      surveillance op with monitor, antenna and headset; and so on for all nine tables.
      Review any of them: `?arttest=dealer` etc.
- [x] **TIER IV added to every branch** (your "add a tier 4") — 20 new top rungs, 2000-3200 chips:
      THE SUPERNOVA, HEAT DEATH, THE METEOR, THE IRON CURTAIN, THE MINT, THE RECKONING,
      THE BIG ONE, LOADED DICE, THE OUTBREAK, PERPETUAL HAPPY HOUR, THE HOUSE LIMIT,
      PERSONA NON GRATA, THE PANOPTICON... each with its own flavor line.
- [x] **Halos removed** — the design change IS the upgrade indicator now. No rings, no glow.

## Playtest feedback round 7 (Aug 8)
- [x] **Tower balance, finally MEASURED** (`?dpstest=<type>`): one table vs a standard 80-guest
      stream, kills counted. You were right about both suspects:
      the buffet's lure budget starved it (it could eat ONE guest in some situations) and the
      catapult's per-shot ammo tax made it the most expensive damage in the game. Buffed:
      buffet lure .05→.08 base + dps up across the ladder; catapult damage up ~30% and ammo
      cost down ~30% at every tier. After: catapult 10/45 kills (base/tier-III, was 6/37),
      buffet from ~0 to real numbers plus its wave-stalling. Dealer's tier-III fire remains the
      dense-crowd king by design; roulette is the elite-killer, not a crowd tower.
- [x] **NEW TABLE: THE DOUBLE ACT** (your Penn & Teller idea) — two magicians, one salary; the
      tall one works the wand, the short one says nothing. Pure control, no damage: guests
      VANISH and reappear far back up the lane. Branch A "The Showstopper" (red curtain, star,
      footlights): victims come back as RABBITS (slower, weaker, adorable). Branch B "Smoke &
      Mirrors" (purple suits, fog, floating mirror): vanishes up to six at once and leaves them
      CONFUSED — walking backward. 75 comps to hire.
- [x] **Slot free-games JACKPOT moment** — golden rays sweep the whole screen far past the
      cabinet, "10 FREE GAMES!" explodes over everything, coins rain across the viewport, the
      cabinet rumbles, fanfare plays.

- [x] **Spend screen de-confused**: upgrade paths segmented under each table's name; every hire
      and every path says what it does in 3-4 plain words ("shoves crowds back", "ice, slows
      guests", "turns guests to rabbits")

- [x] **Spend screen = list + confirmation step**: rows carry only name + price (3 per row, far
      less scrolling); tapping any row opens a confirm card with the 3-4 word description,
      the price, and BUY / BACK. Items you can't afford still open — they show the price in red
      next to your balance, with CLOSE instead of BUY, so you can plan ahead.

## Playtest feedback round 8 (Aug 9) — the big balance + roster pass
- [x] **Cold Deck was a trivial win and you under-guessed it**: the freeze was NOT 60%, it was
      100% — every card froze, so 9 cards every 0.75s locked the floor solid. Now a per-hit ROLL
      (30% → 40% by tier) with a thaw-immunity window, and the dossier states the odds.
- [x] **Bounce falloff is now a per-tier stat**: halving made hops 4+ pointless, so Ivory Ball
      upgrades raise the ratio 50% → 60 → 68 → 76 → 84%. ORBITAL DECAY's 14 bounces finally mean
      something. Steel Ball stays punchy (55%) — the branches now feel different on purpose.
- [x] **Craps can no longer wall a lane**: a shove is a ROLL (50% → 80% by tier) and a shoved
      guest is immune for 1.8s, so four tables in a row can't freeze the crowd in place.
- [x] **THE RED CARPET** (was Velvet Rope): its area of effect is now an actual red carpet rolled
      down every lane it covers, with brass posts and rope swags, brightening while it works.
- [x] **The shrimp buffet no longer moves anyone** — it just poisons the room it stands in, and
      the poisoned go visibly green. Branch B is now **Bad Oysters**: the sick stop for half a
      second to be spectacularly ill, and the puddle stays 2s slowing everyone who steps in it.
- [x] **Chip Catapult reworked**: no more lobbing at a point. It's slow and enormous now, and the
      chip PIERCES the whole room in a straight line through everyone it touches. Scattershot
      fires a fan of them.
- [x] **Names grounded**: "Nobody Gets In"/"The Whole Wing"/"The Whole Room"/"PERPETUAL HAPPY
      HOUR" → Door Policy, The Long Walk, The Corner Booth, The Lock-In, etc.
- [x] **THE BOUNCER replaces Casino Security** — a huge man with a shotgun; a cone of buckshot,
      brutal up close. Branches: Double-Barrel (slugs + knockback) / Crowd Control (wider, more
      pellets).
- [x] **THE HOUSE MARKSMAN** — prone in a dinner jacket behind a sandbag; enormous range, very
      slow, very strong. Branches: The Long Shot (further, harder) / The Called Shot (×2→×4 on
      BOSSES).
- [x] **PENN & TELLER** (was The Double Act) — now strictly pointed, one volunteer at a time, and
      **+1 reputation for the floor just for standing there**. Branch A *Teller's Menagerie*:
      turns a guest into a rabbit/dove/frog — weaker and with every special power stripped.
      Branch B *Penn's Patter*: strips ARMOUR and leaves them exposed (+25→55% damage taken).
- [x] **Enemies have armour now** — only the Coupon Clipper did, so armour-stripping had nothing
      to strip. Tough guests and bosses carry 1-3 pips (each eats one hit).

- [x] **Armour stays, floor 20 is winnable again**: its finale stacked FOUR bosses plus a whale
      pack (and the Pit Boss already headlines waves 4 and 8 of that floor). Dropped him from the
      finale, whales 4→3, hpMul 2.14→2.08, bankroll 1020→1180. Three probe runs, three wins.
- [x] **THE ENDLESS PIT OPENS AT FLOOR 20** — no need to clear all 31 first. The map node reads
      "HOLD FLOOR 20" until you do.
- [x] **THE AUDITOR reworked** (your pick): he no longer freezes a table. He IMPOUNDS the till —
      every chip earned while he walks is held in escrow (shown live in the HUD, kill floats go
      red with ⊘). Drop him and it all pays out in a shower of chips; let him reach the desk and
      the house keeps the lot.
- [x] **THE HOUSE PHOTOGRAPHER reworked** (your pick): the flash no longer blinds towers. Every
      guest caught in frame gets a PRINT — a half-health copy that walks in a few seconds behind.
      He doesn't stop the floor, he doubles it.
- Entertainer / Regulator / Lady Luck left exactly as they were, per your call.

## Boss rework round 2 (Aug 9) — your three picks
- [x] **LADY LUCK dodges every 3rd projectile** (your call) — the damage jinx is gone entirely.
      She floats "NOT TONIGHT" when she slips one. Same machinery as the Card Counter's every-4th.
- [x] **THE ENTERTAINER TAKES AN ENCORE** — killing him is act one: he gets back up at half
      health, 35% faster, and the band changes key. The second death is final. Verified by probe:
      hp 8296→4148, pace 1.00→1.35, new song flag set, stays dead the second time.
- [x] **THE REGULATOR SUSPENDS OPERATIONS** — the moment she walks in, no placing and no
      upgrading, and per your note it lasts **until the end of that wave** whether she dies or
      reaches the desk ("the paperwork is already filed"). A red banner sits under the HUD while
      it's in force; the citation/half-damage system is deleted.
- [x] Auditor escrow softened 100% → **65%** after the probe showed floor 10 (which has him at
      waves 4 AND 8) starving to death: a total freeze meant the bot could never rebuild.
      He still holds most of the take, and it still all pays out when he drops.
- Shop Steward / Fire Marshal / Hen Party: dropped, per your call.

- [x] **The walk-back tower is back for Fede, as THE ESCORT.** Clearing up the name tangle: the
      tower that *threw guests back up the lane* was **Casino Security**, which Billy disliked and
      which I replaced with **The Bouncer** (the shotgun guy — he's a different table and is still
      in). Casino Security hadn't just been benched, its TTYPES entry had been deleted outright,
      though its mechanic, sprite, branch art and both variants all survived. It's restored as
      **The Escort** ("walks them back out"), 65 comps to hire, branch A renamed The Heavies so it
      no longer collides with the Bouncer's name.

- [x] **THE EYE IN THE SKY replaces the House Marksman** (your call) — a security camera on a
      post whose head **pans back and forth on patrol** like the real thing (IR ring, blinking
      red record light), and it kills with a **thunderbolt**: a jagged three-layer arc, sparks,
      and an electrical crack. Branches renamed to suit: High Voltage (transformer, arcing
      terminals) and Facial Recognition (monitor with a face-detection box, tally of flagged
      faces). Probe-verified: 5 bolts fired in 8 seconds.
- [x] **SLOT MACHINE: you were right, the math was off.** One scatter in an 18-symbol strip meant
      **1.12% per spin, 10.6% per visit, and a 4-in-5 chance of two dry visits in a row** — you
      hit the likely case, not bad luck. Added a second scatter: now **6% per spin, 46% per
      visit**, and two dry visits is down to 29%. Two scatters now says "one off the free games!"
      so the rule is legible. (45% of spins already return something after the pair-pays change.)

## Next playtest questions for Billy
- With 20 lives, do floors 1–10 feel too easy now?
- Does the rack actually scroll with your thumb on your phone? (can't test that headlessly)
- Two branches per table × 9 tables = 18 unlocks at 35–60 comps each. Too slow to unlock, or right?
- Floors 2–4 with **no** paths bought are genuinely tight (blind bot reaches wave 7–9 of 10).
  Does that read as "I need to go buy an upgrade" or as "this is unfair"?
- Casino Security: is walking guests backward fun or annoying to watch? Is 70 comps right?
