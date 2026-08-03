# Casino Tower Defense — Design Document

## Core Loop

Chips are the single currency and the central tension: everything in the game tempts the player to gamble resources they should be spending on defense. Enemies are intruders trying to rob or beat the casino.

---

## Core Towers (available from start)

### 1. Dice Roller — Baseline DPS
Hurls oversized dice down the lane. Damage equals the face it lands on (1–6), giving every shot a small jackpot feel.

| Path | Effect |
|---|---|
| **Loaded Dice** | Always lands 6. Consistent damage build. |
| **Snake Eyes** | Rolls two dice; matching faces trigger a crit explosion. |

### 2. Roulette Wheel — Ricochet AoE
Spins up and releases the ivory ball, which ricochets between enemies until it runs out of momentum.

| Path | Effect |
|---|---|
| **Ivory Ball** | More bounces per launch. |
| **Steel Ball** | Pierces through enemies and staggers them. |

### 3. The Cage — Income
Barred cashier window. Pays a chip dividend each round.

| Path | Effect |
|---|---|
| **House Edge** | Dividend scales with unspent chips. Rewards hoarding; competes with the slot machine for your balance. |
| **The Count** | Skims bonus chips from kills near it. Wants risky placement. |

### 4. ATM Row — Traffic Income
Bolt-on ATMs that skim a "convenience fee" from every enemy walking past. Income scales with traffic, so it wants dangerous placement — the opposite philosophy of the Cage.

### 5. Bottle Service — Buff
A cocktail waitress running a circuit between towers.

| Path | Effect |
|---|---|
| **Open Bar** | Attack speed aura for all towers in range. |
| **VIP Host** | Dedicates to the single most expensive tower in range: large damage and range buff for your carry. |

### 6. Eye in the Sky — Detection + Heavy Single Target
Ceiling camera dome. Reveals disguised enemies in radius, locks onto the biggest threat, and dispatches a plainclothes security takedown — one slow, brutal hit.

| Path | Effect |
|---|---|
| **Facial Recognition** | Locked targets stay marked and take bonus damage from all towers. |
| **Banned for Life** | When a takedown kills, that enemy type is blacklisted: every tower deals bonus damage to that face for the rest of the round. |

### 7. Old Shrimp Buffet — Lure + Poison
Heat lamps flickering over week-old shrimp cocktail. Enemies drift off-path to eat, then take stacking poison damage as food poisoning sets in.

| Path | Effect |
|---|---|
| **Expired Mayo Station** | Stronger poison that spreads between nearby enemies (shared serving spoons). |
| **Bottomless Trough** | Bigger lure radius; victims are also heavily slowed (doubled over). |

---

## Capstone Towers (unlockable, late game)

One capstone per role: damage, utility, defense, power.

### 8. The Fountain — Damage Capstone
Choreographed water-cannon volleys down the lane: huge AoE damage plus knockback. Soaked enemies take bonus damage from all sources.

| Path | Effect |
|---|---|
| **Grand Finale** | Periodic mega-blast that pushes an entire wave backward. |
| **Frozen Show** | Winter program: soaked enemies freeze solid. |

**Unlock:** campaign progress.

### 9. The Magician — Utility Capstone (limit 1)
Base: every few seconds, performs a trick on the closest dangerous enemy. Then commits to one of three Acts — a build-defining choice.

**Act I: The Vanishing** (removal)
- *Now You See Me* — teleports a group of enemies backward along the path.
- Then choose:
  - *The Grand Vanish* — deletes one non-boss enemy per round outright.
  - *Misdirection* — teleported enemies lose their armor/special traits (a Cheater reappears visible, a Card Counter loses count).

**Act II: The Transformation** (polymorph)
- *Dove Trick* — periodically turns an enemy into a 1-HP dove.
- Then choose:
  - *Rabbit Season* — polymorphs whole clusters into rabbits that hop off the path.
  - *White Tiger* — the transformed animal turns hostile and mauls other enemies briefly.

**Act III: Stagecraft** (control)
- *Smoke Bomb* — recurring blind field; enemies inside wander in circles.
- Then choose:
  - *Sawed in Half* — halves current HP of everything in range on a long cooldown.
  - *Straitjacket Escape* — chains the strongest enemy in place for several seconds while he "escapes."

**Unlock:** slot-machine Jackpot only.

### 10. The Vault — Defense Capstone
A massive steel vault door placed directly on the path. Enemies must batter it down before advancing; everything piles up in front of it — your kill-zone anchor. No income.

| Path | Effect |
|---|---|
| **Reinforced Steel** | More HP; self-repairs between rounds. |
| **Time Lock** | Once destroyed, slams shut again mid-round after a delay, sealing the breach once more. |

**Unlock:** banking milestone (hold 10k chips at once).

### 11. Don Fortunato's Table — Power Capstone (limit 1)
A private back-room booth, curtains drawn, espresso on the table. The Don doesn't attack — once per round he calls in a favor: the strongest enemy on the map simply stops existing. No projectile. The enemy pauses, looks at something off-screen, and drops.

**Passive aura:** security towers (Eye in the Sky) act faster.

| Path | Effect |
|---|---|
| **An Offer Refused** | The execution terrifies nearby enemies into fleeing backward down the path. |
| **The Family Business** | Executed enemies pay out 5x chips, delivered in an unmarked envelope. |

**Unlock:** survive a Loan Shark wave without losing a single chip. You protected the family's money; now the family protects you.

---

## Enemies

| Enemy | Behavior |
|---|---|
| **Tourist** | Fodder. Drops small chips. |
| **Card Counter** | Dodges every Nth projectile (he counts them). Roulette's randomness ignores his pattern — built-in soft counter. |
| **Cheater** | Invisible to towers until revealed by the Eye in the Sky. |
| **Loan Shark** | On leak, doesn't just cost a life — steals chips. Economic damage. |
| **Whale** | Tanky mini-boss; huge chip payout on death. Risk/reward: dangerous, but you want him deep in your maze. |
| **The Auditor** (boss) | Disables your highest-value tower while alive. Forces diversification. |

---

## Slot Machine (between rounds)

Three-reel machine with visible, honest odds. Capped at 3 spins per intermission so it's a decision, not a chore.

**Prizes:**
- Chip multipliers
- A free random tower
- One-round global buffs
- **Jackpot** (rare) — permanent upgrade; also the only way to unlock the Magician

**Bad outcome — Snake Eyes:** spawns a bonus mini-wave next round with extra chip rewards. Losing is interesting, not just wasted chips.

---

## Double or Nothing

Before any round, wager chips that you'll take zero leaks. Win = double the wager. Your defense quality itself becomes something you bet on.
