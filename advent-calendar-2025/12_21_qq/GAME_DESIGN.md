# Family Fighter: Tournament Edition
## Game Design Document

**Context**: This is a gift for the user's boyfriend. Quality matters. Every detail should be polished and thoughtfully crafted.

---

## 1. Game Overview

**Genre**: 2D Fighting Game (Tekken-style ladder tournament)
**Protagonist**: Fede
**Objective**: Fight through a ladder of family and friends to reach the final boss (Billy)
**Style**: Paper-sketch aesthetic with hand-drawn CSS characters

### Core Gameplay Loop
1. Player selects "FIGHT" from main menu
2. Tournament ladder is displayed (opponents shrouded until reached)
3. Best-of-3 rounds against each opponent
4. Victory advances to next opponent; defeat ends the run
5. Defeating Billy wins the tournament

---

## 2. Architecture

### Design Principles
- **Modular**: Each system in its own file
- **Testable**: Each module can be tested in isolation
- **Maintainable**: No 12K-line files; each file < 500 lines ideally
- **Animation-first**: Visual feedback before damage calculation

### File Structure

```
12_21_qq/
├── index.html              # Shell HTML with canvas/arena setup (~100 lines)
├── styles/
│   ├── base.css            # Paper background, fonts, colors
│   ├── arena.css           # Fight arena layout
│   ├── ui.css              # Health bars, menus, overlays
│   └── animations.css      # Keyframe animations
├── characters/
│   ├── character-base.js   # Base character class
│   ├── fede.js             # Player character definition
│   ├── fede.css            # Fede's CSS sprite
│   ├── timo.js             # NPC: The Baby
│   ├── timo.css
│   ├── madonna.js          # NPC: Material Girl
│   ├── madonna.css
│   ├── jonas-m.js          # NPC: The Coach
│   ├── jonas-m.css
│   ├── lucas.js            # NPC: Soccer Star
│   ├── lucas.css
│   ├── vicky.js            # NPC: Christmas Bride
│   ├── vicky.css
│   ├── jonas-l.js          # NPC: The Bassist
│   ├── jonas-l.css
│   ├── frank.js            # NPC: Sweet Transvestite
│   ├── frank.css
│   ├── charly.js           # NPC: The Biker
│   ├── charly.css
│   ├── audrey.js           # NPC: Mean Green Mother
│   ├── audrey.css
│   ├── pancho.js           # NPC: Superman
│   ├── pancho.css
│   ├── pato.js             # NPC: The Crypto Bro
│   ├── pato.css
│   └── billy.js            # FINAL BOSS: The Mathematical Mastermind
│       └── billy.css
├── systems/
│   ├── game-engine.js      # Main game loop, state management
│   ├── input-handler.js    # Keyboard input, combo detection
│   ├── combat-system.js    # Damage calculation, hit detection
│   ├── ai-controller.js    # NPC decision making
│   ├── tournament.js       # Ladder progression, best-of-3 logic
│   └── effects.js          # Particle systems, screen shake, flash
├── attacks/
│   ├── attack-base.js      # Base attack class with hit detection
│   ├── melee-attacks.js    # Punch, kick with range checks
│   ├── projectiles.js      # Projectile base with travel + collision
│   └── specials/
│       ├── fede-specials.js
│       ├── billy-specials.js
│       └── ... (one per character)
├── ui/
│   ├── health-bar.js       # Health bar component
│   ├── energy-bar.js       # Energy/super meter
│   ├── combo-display.js    # Combo input feedback
│   ├── tournament-ui.js    # Ladder display, transitions
│   └── victory-screen.js   # Win/lose screens
├── debug/
│   ├── animation-test.js   # Puppeteer screenshot script
│   └── hitbox-visualizer.js # Show attack ranges (dev mode)
└── main.js                 # Entry point, initializes everything
```

---

## 3. Character System

### Base Character Class

```javascript
class Character {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.title = config.title;
    this.color = config.color;

    // Stats
    this.maxHealth = config.hp || 100;
    this.health = this.maxHealth;
    this.energy = 0;
    this.maxEnergy = 100;

    // Position
    this.x = 0;
    this.y = 0;  // Ground level = 0
    this.facingRight = true;

    // State
    this.state = 'idle';  // idle, walking, attacking, stunned, jumping
    this.currentAttack = null;

    // Move list
    this.attacks = {
      punch: config.punch || new BasicPunch(),
      kick: config.kick || new BasicKick(),
      specials: config.specials || [],
      ultimate: config.ultimate || null
    };
  }

  // Must be implemented by subclass
  getSprite() { throw new Error('Implement in subclass'); }

  // Animation hooks
  onPunch() {}
  onKick() {}
  onSpecial(special) {}
  onUltimate() {}
  onHit(damage) {}
  onDeath() {}
}
```

### Character Roster

| ID | Name | Title | Theme | Difficulty |
|----|------|-------|-------|------------|
| timo | TIMO | The Baby | Crying, flags, drool | 1 (Tutorial) |
| madonna | MADONNA | Material Girl | Vogue, kisses, mic | 2 |
| jonas | JONAS M | The Coach | Post-its, corporate jargon | 3 |
| lucas | LUCAS | Soccer Star | Soccer balls, cats | 4 |
| vicky | VICKY | Christmas Bride | Aerial silks, holidays | 5 |
| jonasl | JONAS L | The Bassist | Coffee, bass guitar, paddle ball | 6 |
| frank | FRANK | Sweet Transvestite | Rocky Horror, lightning | 7 |
| charly | CHARLY | The Biker | Motorcycle, Excel | 8 |
| audrey | AUDREY II | Mean Green Mother | Venus flytrap, vines | 9 |
| pancho | PANCHO | Superman | Flight, heat vision, freeze breath | 10 |
| pato | PATO | The Crypto Bro | Bitcoin, camera, code | 11 |
| billy | BILLY | THE FINAL BOSS | Math, triangles, Q.E.D. | 12 |

---

## 4. Attack System

### CRITICAL: Hit Detection Constraint

**Every attack MUST require proper hit detection. No auto-damage.**

```javascript
// BAD - Auto-damage after timeout
setTimeout(() => dealDamage(damage), 500);

// GOOD - Projectile with real collision
class Projectile {
  update() {
    this.x += this.velocity;

    // Check collision with target's CURRENT position
    const target = this.getTarget();
    const distance = Math.abs(this.x - target.x);

    if (distance < this.hitboxWidth) {
      this.onHit(target);
      this.destroy();
    }

    // Destroy if off-screen
    if (this.x < 0 || this.x > ARENA_WIDTH) {
      this.destroy();
    }
  }
}

// GOOD - Melee with range check at impact frame
class MeleeAttack {
  onImpactFrame() {
    const target = this.getTarget();
    const distance = Math.abs(this.owner.x - target.x);

    if (distance < this.range) {
      target.takeDamage(this.damage);
      this.showHitEffect();
    } else {
      this.showWhiffEffect();  // Missed!
    }
  }
}
```

### Attack Types

#### 1. Basic Attacks
- **Punch (Z key)**: Fast, short range (~60px), 5-8 damage
- **Kick (X key)**: Slower, medium range (~80px), 8-12 damage
- **Jump (C key)**: Evasion, can combo into aerial attacks

#### 2. Special Attacks (Combo inputs)
- Require combo input (e.g., ↓ → Z)
- Cost energy (20-30)
- Unique visual effects per character
- Must still check hit detection

#### 3. Ultimate Attacks
- Require 100 energy
- Long combo input (e.g., ↓ → ↓ → Z)
- Cinematic visual effects
- High damage but STILL requires hit detection

### Example: Jonas L's Hot Coffee Special

```javascript
// From POC - the CORRECT implementation
class HotCoffeeAttack extends SpecialAttack {
  execute(owner, arena) {
    const canvas = this.createParticleCanvas(arena);
    const ctx = canvas.getContext('2d');
    const particles = [];
    const PARTICLE_COUNT = 800;

    // Create coffee particle class with physics
    class CoffeeParticle {
      constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.hasHitTarget = false;
      }

      update(gravity, target) {
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        // HIT DETECTION - check if particle hits target
        if (!this.hasHitTarget) {
          const targetBounds = target.getBounds();
          if (this.x >= targetBounds.left &&
              this.x <= targetBounds.right &&
              this.y >= targetBounds.top &&
              this.y <= targetBounds.bottom) {
            this.hasHitTarget = true;
            target.takeDamage(this.damagePerParticle);
          }
        }
      }
    }

    // Spawn particles, animate with requestAnimationFrame
    // Each particle individually checks collision
  }
}
```

---

## 5. AI Controller

### NPC Behavior States
- **idle**: Random small movements, face player
- **approach**: Move toward player
- **retreat**: Back away after attacking
- **attack**: Execute punch/kick/special

### Decision Making

```javascript
class AIController {
  constructor(character, difficulty) {
    this.character = character;
    this.difficulty = difficulty;  // 1-12

    // Scale aggression with difficulty
    this.attackChance = 0.05 + (difficulty * 0.015);
    this.specialChance = 0.10 + (difficulty * 0.012);
    this.reactionTime = 500 - (difficulty * 30);  // ms
  }

  update(playerX) {
    const distance = Math.abs(this.character.x - playerX);

    // Always face player
    this.character.facingRight = playerX > this.character.x;

    // Make decision
    if (distance < 90) {
      // Close range - attack or retreat
      if (Math.random() < this.attackChance) {
        this.executeAttack();
      }
    } else if (distance < 200) {
      // Medium range - approach
      this.approach(playerX);
    } else {
      // Far - approach or use ranged special
      if (Math.random() < this.specialChance) {
        this.useSpecial();
      } else {
        this.approach(playerX);
      }
    }
  }

  executeAttack() {
    // NPCs use their FULL special attack animations
    // Not simplified emoji versions!
    const attackType = Math.random();

    if (Math.random() < this.specialChance) {
      // Use character's actual special (same as player version)
      this.character.executeSpecial();
    } else if (attackType < 0.6) {
      this.character.punch();
    } else {
      this.character.kick();
    }
  }
}
```

---

## 6. Tournament System

### Ladder Progression
1. Best-of-3 rounds per match
2. Win 2 rounds to advance
3. Lose 2 rounds = Game Over
4. 12 opponents, Billy is final boss

### State Machine

```javascript
const TournamentState = {
  TITLE: 'title',
  LADDER_VIEW: 'ladder_view',
  PRE_FIGHT: 'pre_fight',      // "VS" screen
  FIGHTING: 'fighting',
  ROUND_END: 'round_end',      // "YOU WIN" / "YOU LOSE"
  MATCH_END: 'match_end',      // Transition to next opponent
  VICTORY: 'victory',          // Beat Billy!
  GAME_OVER: 'game_over'       // Lost the tournament
};
```

### Round Flow
```
PRE_FIGHT (2 sec) → FIGHTING → ROUND_END (2 sec) →
  ├── If match incomplete → FIGHTING (next round)
  └── If match complete → MATCH_END (3 sec) →
      ├── If more opponents → PRE_FIGHT (next opponent)
      ├── If beat Billy → VICTORY
      └── If lost → GAME_OVER
```

---

## 7. Animation Debugging Workflow

### Using the Animations Skill

Reference: `/Users/guillermomosse/Projects/advent/advent-calendar-billy.github.io/advent-calendar-2025/skills/animations/skill.md`

#### Setup
```bash
npm install puppeteer --save-dev
npx puppeteer browsers install chrome
```

#### Testing Individual Attacks

Create `debug/test-attack.js`:
```javascript
const puppeteer = require('puppeteer');
const path = require('path');

async function testAttack(characterId, attackType) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('file://' + path.join(__dirname, '../index.html'));
  await page.setViewport({ width: 900, height: 600 });

  // Select character and start fight
  await page.evaluate((charId) => {
    selectCharacter(charId);
    startFight();
  }, characterId);

  await new Promise(r => setTimeout(r, 2000));

  // Capture idle state
  await page.screenshot({ path: `debug/${characterId}-idle.png` });

  // Trigger attack
  if (attackType === 'punch') {
    await page.keyboard.press('z');
  } else if (attackType === 'kick') {
    await page.keyboard.press('x');
  } else if (attackType === 'special') {
    // Execute combo
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('z');
  }

  // Capture animation frames
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 50));
    await page.screenshot({ path: `debug/${characterId}-${attackType}-${i}.png` });
  }

  await browser.close();
  console.log(`Screenshots saved to debug/${characterId}-${attackType}-*.png`);
}

// Usage: node test-attack.js jonasl special
const [,, char, attack] = process.argv;
testAttack(char || 'fede', attack || 'punch');
```

#### Key Animation Principles (from skill.md)

1. **No detached body parts** - Don't spawn floating limbs
2. **Objects start at hand position** - `fighterX + 35, bottom: 100`
3. **Match character proportions** - ~50px width, ~90px height
4. **Lunge/tilt whole character** for melee impacts
5. **Use particles** for effects (dust, sparkles, motion lines)

---

## 8. Implementation Plan

### Phase 1: Core Engine
- [x] Set up file structure
- [x] Implement game-engine.js (game loop, state)
- [x] Implement input-handler.js (keyboard, combos)
- [x] Basic arena HTML/CSS

### Phase 2: Combat System
- [x] combat-system.js (damage calculation, hit effects)
- [x] Hit detection in character attack methods
- [x] Hitstun (brief stagger animation when hit)
- [x] Knockback (getting hit pushes character back)
- [x] Block mechanic (hold back to reduce damage)
- [x] Invincibility frames after getting hit

### Phase 3: Player Character (Fede)
- [x] fede.js character definition
- [x] fede.css sprite
- [x] Fede specials (The Split, Salmon Sashimi, Country Throw, WORLD TOUR!)
- [x] Correct combo inputs matching POC (↓↓X, →→Z, ↓←Z, ↓→↓→Z)
- [x] Test with animation debugging (verified via Puppeteer screenshots)

### Phase 4: NPCs (All 12 characters)
- [x] Billy (Final Boss) - Math theme
- [x] Jonas - Coaching theme
- [x] Vicky - Aerial silks/Christmas theme
- [x] Lucas - Soccer/Cats theme
- [x] JonasL - Bass/Coffee theme
- [x] Timo - Baby/Complainer theme
- [x] Pancho - Superman theme
- [x] Madonna - Pop star theme
- [x] Frank - Rocky Horror theme
- [x] Charly - Motorcycle/Excel theme
- [x] Audrey - Plant/Little Shop theme
- [x] Pato - Bitcoin/Director theme
- [x] AI controller for NPC behavior

### Phase 5: Tournament Mode
- [x] tournament.js - Ladder system with 12 opponents
- [x] tournament-ui.js - VS screens, ladder display
- [x] State machine (TITLE → LADDER_VIEW → PRE_FIGHT → FIGHTING → ROUND_END → etc)
- [x] Best-of-3 rounds per match
- [x] "ROUND 1... FIGHT!" announcer text
- [x] Victory/defeat screens
- [x] Opponent intro cards (name, title, difficulty)
- [x] Final victory celebration (beat Billy)
- [x] Game over / continue screen

### Phase 6: Visual Feedback & Polish
- [x] Hit sparks (basic)
- [x] Screen shake on heavy hits
- [x] Flash on hit (character briefly flashes white when damaged)
- [x] Combo counter (track consecutive hits)
- [x] Damage numbers display
- [x] Round win indicators (circles under health bar)
- [x] Victory pose after KO
- [ ] Sound effects (optional)
- [ ] Particle polish

### Phase 7: Testing & Balance
- [x] Verify all attacks work from both sides (player left/right of opponent)
- [x] Test all special moves with Puppeteer screenshots
- [x] 174 automated tests passing (combat mechanics, integration, regression)
- [x] Balance damage values across characters
- [x] Ensure no auto-hit attacks (all require proper hit detection)
- [ ] Performance testing (maintain 60fps)

---

## 9. Quality Checklist

Before marking any attack as complete:

- [ ] Animation plays correctly (verified with Puppeteer screenshots)
- [ ] Hit detection works - enemy can dodge by moving away
- [ ] Damage only applied when attack connects
- [ ] Visual feedback matches the character's theme
- [ ] Attack works in both directions (facing left/right)
- [ ] NPCs use the SAME attack visuals as player version
- [ ] No console errors
- [ ] Performance is smooth (60fps)

---

## 10. Fighting Game Mechanics Checklist

**These are MANDATORY requirements for a proper Tekken-style fighting game.**

### Directional Mechanics
- [x] **Auto-facing**: Characters always face their opponent
- [x] **Attacks work from either side**: Whether player is left or right of opponent, attacks function correctly
- [x] **Projectiles auto-target**: Thrown objects/projectiles automatically travel TOWARD the opponent
- [ ] **Mirrored animations**: Punch/kick animations mirror correctly when facing left vs right (needs verification)
- [x] **No hardcoded directions**: Uses `getDirectionToTarget()` helper method

### Movement
- [x] **Smooth walking**: Left/right arrow keys move character fluidly
- [x] **Cannot walk through opponent**: Collision detection prevents overlapping (50px)
- [x] **Arena boundaries**: Characters cannot walk off-screen
- [ ] **Jump arc**: C key triggers proper jump with gravity (basic implementation)
- [x] **No movement during attack**: Locked in place while attack animation plays

### Combat Feel
- [x] **Hitstun**: Brief stagger animation when hit (200-600ms based on attack)
- [x] **Knockback**: Getting hit pushes character back (15-50px based on attack)
- [x] **Block**: Hold back to reduce damage (75% reduction for basic, 50% for specials)
- [x] **Invincibility frames**: Brief i-frames after getting hit (200ms after hitstun)
- [ ] **Attack priority**: Some attacks beat others (anti-air, etc.)

### Visual Feedback
- [x] **Hit sparks**: Visual effect on impact (showHitEffect)
- [x] **Damage numbers**: Show damage dealt (floating numbers with animation)
- [x] **Screen shake**: On heavy hits/ultimates
- [x] **Flash on hit**: Character briefly flashes white when damaged
- [x] **Combo counter**: Track consecutive hits (shows after 2+ hits)

### Round/Match Flow
- [x] **Round timer**: 99 seconds per round
- [x] **Health depletion = KO**: Round ends when health reaches 0
- [x] **Round announcer**: "ROUND 1... FIGHT!"
- [x] **Victory pose**: Winner does animation after KO
- [x] **Best of 3**: First to 2 round wins takes the match
- [x] **Round win indicators**: Circles under health bar to show rounds won

### Testing Checklist Per Attack
For EVERY attack (punch, kick, special, ultimate):
- [ ] Works when player is LEFT of opponent
- [ ] Works when player is RIGHT of opponent
- [ ] Projectile travels toward opponent regardless of side
- [ ] Hit detection uses opponent's CURRENT position (not spawn position)
- [ ] Animation doesn't break when mirrored
- [ ] Particle effects spawn in correct direction

---

## 11. POC Attack Preservation Rules

### DO NOT RE-IMPLEMENT

The attacks in `POC_game_with_good_attacks/index.html` were carefully crafted and refined.

**Rules:**
1. **Extract, don't rewrite**: Copy attack code from POC into modular files
2. **Preserve complexity**: 800-particle coffee throw stays 800 particles
3. **Fix only if broken**: If animation debugging reveals issues, fix them
4. **Never simplify**: Do NOT replace canvas particles with emoji projectiles
5. **Same code for player and NPC**: NPCs use identical attack implementations

### What CAN be changed:
- Refactoring for modularity (extracting into separate files)
- Fixing directional bugs (attacks only working from one side)
- Adding missing hit detection if it was auto-damage
- Performance optimizations that don't reduce visual quality

### What CANNOT be changed:
- Reducing particle counts
- Replacing detailed effects with simpler versions
- Removing animation phases (wind-up, impact, recovery)
- Changing the fundamental visual style of an attack

### Reference: Key POC Attacks to Preserve

| Character | Attack | Location (approx lines) | Key Features |
|-----------|--------|-------------------------|--------------|
| Jonas L | Hot Coffee | 7748-8086 | 800 particles, steam, mug physics |
| Jonas L | Bass Solo! | search "BASS SOLO" | Sound wave visuals, bass swing |
| Billy | Whiteboard Slam | search "WHITEBOARD" | Triangle geometry, Q.E.D. |
| Pato | TO THE MOON! | search "TO THE MOON" | Bitcoin rocket, moon impact |
| Pancho | Freeze Breath | search "FREEZE BREATH" | Ice particles, freeze effect |
| Frank | Floor Show! | search "FLOOR SHOW" | Rocky Horror spectacle |
| Vicky | Silk Drop Miracle! | search "SILK DROP" | Aerial silk animation |
| Audrey | Mean Green Mother! | search "MEAN GREEN" | Vine attacks, plant horror |

---

## 12. Priority Roadmap (Remaining Work)

### HIGH PRIORITY - Core Game Loop

1. **Tournament Mode (Phase 5)** - This is the main game structure
   - Create `systems/tournament.js` with ladder progression
   - Create `ui/tournament-ui.js` for VS screens
   - Implement state machine flow
   - Best-of-3 rounds per match
   - All 12 opponents in order: Timo → Madonna → Jonas → Lucas → Vicky → JonasL → Frank → Charly → Audrey → Pancho → Pato → Billy

2. **Round System**
   - Round announcer: "ROUND 1... FIGHT!"
   - Round end detection (health = 0)
   - Round win tracking (2 wins = match win)
   - Victory/defeat screens per round

3. **Match Flow Screens**
   - Pre-fight VS screen (show opponent name, title, portrait)
   - Round end screen ("YOU WIN THIS ROUND!" / "YOU LOSE THIS ROUND!")
   - Match end screen (advance or game over)
   - Final victory (beat Billy = celebration!)

### MEDIUM PRIORITY - Combat Polish

4. **Combat Feel Improvements**
   - Hitstun (0.2s stagger on hit)
   - Knockback (push back 20-30px on hit)
   - Character flash white when damaged

5. **Visual Polish**
   - Victory pose animations
   - Round win indicators under health bars
   - Better hit effect particles

### LOWER PRIORITY - Nice to Have

6. **Additional Features**
   - Block mechanic (hold back)
   - Invincibility frames
   - Combo counter
   - Sound effects
   - Jump with proper gravity arc

---

## 13. File Structure Status

```
12_21_qq/
├── index.html                    ✅ Created
├── GAME_DESIGN.md               ✅ This document
├── CLAUDE.md                    ✅ Development constraints
├── styles/
│   ├── base.css                 ✅ Paper background, fonts
│   ├── arena.css                ✅ Fight arena layout
│   ├── ui.css                   ✅ Health bars, menus
│   ├── animations.css           ✅ Keyframe animations
│   └── characters/
│       ├── fede.css             ✅
│       ├── billy.css            ✅
│       ├── jonas.css            ✅
│       ├── vicky.css            ✅
│       ├── lucas.css            ✅
│       ├── jonasl.css           ✅
│       ├── timo.css             ✅
│       ├── pancho.css           ✅
│       ├── madonna.css          ✅
│       ├── frank.css            ✅
│       ├── charly.css           ✅
│       ├── audrey.css           ✅
│       └── pato.css             ✅
├── characters/
│   ├── character-base.js        ✅ Base class
│   ├── fede.js                  ✅ Player character
│   ├── billy.js                 ✅ Final boss
│   ├── jonas.js                 ✅
│   ├── vicky.js                 ✅
│   ├── lucas.js                 ✅
│   ├── jonasl.js                ✅
│   ├── timo.js                  ✅
│   ├── pancho.js                ✅
│   ├── madonna.js               ✅
│   ├── frank.js                 ✅
│   ├── charly.js                ✅
│   ├── audrey.js                ✅
│   └── pato.js                  ✅
├── systems/
│   ├── game-engine.js           ✅ Game loop, state, collision
│   ├── input-handler.js         ✅ Keyboard, combos, blocking
│   ├── combat-system.js         ✅ Hit effects, damage, hitstun, knockback, combos
│   ├── ai-controller.js         ✅ NPC behavior
│   └── tournament.js            ✅ Ladder system, best-of-3
├── ui/
│   ├── tournament-ui.js         ✅ VS screens, ladder display
│   └── victory-screen.js        ✅ Win/lose screens
└── debug/
    ├── animation-tester.js      ✅ Puppeteer screenshots
    └── test-fede-attacks.js     ✅ Attack verification
```

---

*This document is the source of truth for Family Fighter development. When in doubt, refer here.*
