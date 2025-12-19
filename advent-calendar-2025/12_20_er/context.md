# El Departamento - Implementation Context

## Quick Reference

When resuming work on this project, read this file and `PUZZLE_DESIGN.md` first.

---

## Project Overview

**Day 20 of Advent Calendar 2025** - A pixel art escape room horror game.

**Story**: Fede is cleaning his apartment on a Sunday. His front door auto-locked. Behind the fridge is a hidden passage to the neighbor's apartment. The neighbor is a serial killer (blond twink). Player must escape through the neighbor's front door.

**Language**: All in-game text is in Spanish (Argentinian - vos form, no heavy modisms).

---

## Technical Stack

- **Single HTML file**: `/12_20_er/index.html`
- **Canvas-based rendering**: 384x512 pixels, TILE=32
- **Web Audio API**: For all sounds (generated, not files)
- **Pixel art style**: Similar to Lucky Pixel Casino (12_15)
- **Font**: "Press Start 2P" and "VT323"

---

## Design Skill

Use the **frontend-design skill** for UI elements. Key principles:
- Pixel art aesthetic throughout
- Dark, moody color palette
- No emojis - use canvas/SVG for icons
- Atmospheric lighting effects

---

## Current Game State Structure

```javascript
const game = {
    currentScreen: 'home', // 'home', 'neighbor', 'upstairs'
    player: { x, y, width, height, speed, direction, frame, ... },
    inventory: [],
    equipped: null,
    tv: { on, channel, focused, static },
    piano: { focused, activeKeys },
    combinationLock: { active, digits, selectedDigit, correctCode },
    flags: {
        screwdriverTaken, keyTaken, cabinetOpened, flashlightTaken,
        triedDoor, noteTaken, toolboxOpened, ...
    }
};
```

---

## Screens/Rooms

### Fede's Apartment (1st Floor - 'home')
- Bathroom (top-left)
- Hallway (middle-left, has front door)
- Office (top-right)
- Bedroom (middle-right)
- Tools area (bottom, full width, has spiral staircase)

### Fede's Apartment (2nd Floor - 'upstairs')
- Window area (left)
- Stairs area (bottom-left)
- Living area (top-right, has piano)
- Kitchen area (bottom-right, has fridge with secret passage)

### Neighbor's Apartment ('neighbor')
- Kitchen (enters from fridge)
- Living room
- Hallway (front door - escape route)
- Bedroom (has bed to hide under)

---

## Key Puzzle Chain

```
Plant → Small Key → Cabinet → Flashlight → Mirror → Code 1987 →
Toolbox → Document + Screwdriver → Fridge Panel → Neighbor's Apartment →
Hide Under Bed → Wait for Audio → Killer Arrives → Bloody Keys → Escape
```

---

## Four Endings

| Ending | Trigger | Final Fede Message |
|--------|---------|-------------------|
| A - ESCAPE | Unlock door in time | "Ahora te llamo" |
| B - REVENGE | Push furniture, take knife, kill killer | "Te cuento despues" |
| C - CAUGHT | Too slow fumbling keys at door | (none - basement scene) |
| D - DISCOVERED | Exit hiding before killer enters bathroom | (none - basement scene) |

---

## Characters

### Fede (Player)
- Speaks Spanish (Argentinian)
- Mutters observations: "Que raro...", "Que carajo?"
- Has boyfriend Billy in another country

### Billy (Boyfriend)
- Texts via Telegram throughout game
- Messages escalate from casual to worried
- Calls while Fede is hiding (max tension)

### The Killer (Neighbor)
- Blond twink, attractive, normal-looking
- Says nothing - just smiles
- Moves VERY slowly when approaching
- Hums casually when entering apartment

---

## Audio Design

All sounds generated via Web Audio API:
- Footsteps, doors, keys jingling
- Humming (killer)
- Water running (bathroom)
- Phone vibrating
- Piano notes (already implemented)

---

## Files

- `index.html` - Main game file
- `DESIGN.md` - Original design document
- `PUZZLE_DESIGN.md` - Detailed puzzle flow and mechanics
- `context.md` - This file
- `next_features.md` - Minor feature ideas for later review

---

## Implementation Priority

1. **Phase 1 puzzles** - Plant, key, flashlight, mirror, toolbox, document
2. **Fridge passage mechanic** - Requires screwdriver + document read
3. **Neighbor's apartment layout** - New screen with disturbing details
4. **Hiding mechanic** - Under bed, audio sequence, timing
5. **Killer AI** - Enters, walks around, goes to bathroom
6. **Keys mini-game** - Keyring with 5 keys, rotation animation
7. **Chase/endings** - Run to door, push furniture, basement scene
8. **Billy's messages** - Telegram notifications throughout

---

## Show Don't Tell

- Multiple wallets = multiple victims
- Clothes in many sizes = multiple victims
- Empty key hook = killer has keys
- Bloody keys = just came from "work"
- Killer says nothing = scarier
- Basement scene = implies everything, shows nothing
