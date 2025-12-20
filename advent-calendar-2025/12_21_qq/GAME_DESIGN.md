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
- [ ] Set up file structure
- [ ] Implement game-engine.js (game loop, state)
- [ ] Implement input-handler.js (keyboard, combos)
- [ ] Basic arena HTML/CSS

### Phase 2: Combat System
- [ ] attack-base.js with hit detection
- [ ] melee-attacks.js (punch, kick)
- [ ] projectiles.js base class
- [ ] combat-system.js (damage, stun, knockback)

### Phase 3: Player Character (Fede)
- [ ] fede.js character definition
- [ ] fede.css sprite
- [ ] fede-specials.js (The Split, Salmon Sashimi, Country Throw, WORLD TOUR!)
- [ ] Test with animation debugging

### Phase 4: NPCs (One at a time)
For each NPC:
- [ ] [name].js character definition
- [ ] [name].css sprite
- [ ] [name]-specials.js with FULL visual effects (not simplified)
- [ ] ai-controller integration
- [ ] Animation debugging verification

### Phase 5: Tournament Mode
- [ ] tournament.js ladder system
- [ ] tournament-ui.js displays
- [ ] Transitions and screens
- [ ] Victory celebration

### Phase 6: Polish
- [ ] Sound effects (optional)
- [ ] Screen shake, flash effects
- [ ] Particle polish
- [ ] Balance testing

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

## 10. Reference: POC Attack Examples

The `POC_game_with_good_attacks/index.html` contains the detailed, correct implementations of special attacks. Key examples to preserve:

### Jonas L - Hot Coffee (lines 7748-8086)
- Canvas-based particle system
- 800 individual coffee particles with physics
- Steam particle effects
- Per-particle hit detection
- Mug wind-up and drop animation

### Billy - WHITEBOARD SLAM (search in POC)
- Triangle geometry attack
- Mathematical symbols flying out
- Q.E.D. finale

### Pato - TO THE MOON! (search in POC)
- Bitcoin rocket launch
- Moon impact
- Crypto chart animation

These are the GOLD STANDARD implementations. NPC versions MUST match player versions in visual quality.

---

*This document is the source of truth for Family Fighter development. When in doubt, refer here.*
