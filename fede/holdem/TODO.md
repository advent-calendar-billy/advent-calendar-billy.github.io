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

## Next playtest questions for Billy
- With 20 lives, do floors 1–10 feel too easy now?
- Does the rack actually scroll with your thumb on your phone? (can't test that headlessly)
- Two branches per table × 9 tables = 18 unlocks at 35–60 comps each. Too slow to unlock, or right?
- Floors 2–4 with **no** paths bought are genuinely tight (blind bot reaches wave 7–9 of 10).
  Does that read as "I need to go buy an upgrade" or as "this is unfair"?
- Casino Security: is walking guests backward fun or annoying to watch? Is 70 comps right?
