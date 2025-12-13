# Advent Calendar 2025 - Billy's Gift for Fede

## Overview
This is a personalized advent calendar created by Billy for their boyfriend Fede. The calendar contains games from December 15th to December 24th (10 days of games). Each day reveals a special game or interactive experience.

Billy is in **Boston**, Fede is in **Berlin** - 5,904 km apart but never far.

## Technical Details
- Hosted on GitHub Pages
- Pure HTML/CSS/JS (no frameworks)
- SVG icons throughout (NO EMOJIS - real icons only)
- Desktop-first design (keyboard controls)
- **Focus on visuals** - everything should be beautiful and polished

## Design Theme
- **Diagonal split background**: Boston (blue tones, left) / Berlin (purple tones, right)
- City skylines as subtle backgrounds (Zakim Bridge, State House for Boston; TV Tower, Brandenburg Gate for Berlin)
- Line art drawings of landmarks (from downloaded images, converted to SVG)
- Elegant typography using Playfair Display and Inter fonts
- Starry night sky effects

## Structure
```
advent-calendar-2025/
├── index.html              # Main calendar UI with diagonal Boston/Berlin split
├── styles.css              # Calendar styles with city themes
├── context.md              # This file
├── berlin-tower.svg        # Berlin TV Tower line drawing (from image)
├── state-house.svg         # MA State House line drawing (from image)
└── 12_15/                  # December 15th game: "Fede's Falling Dream"
    ├── index.html          # Game entry point
    ├── css/
    │   └── game.css        # Game styles
    ├── js/
    │   └── game.js         # Game logic
    └── icons/              # SVG assets (separate file per icon)
        ├── character-sleeping.svg      # Sleeping character (neutral)
        ├── character-sleeping-smile.svg # Sleeping character (happy, win state)
        ├── character-falling.svg       # Falling character with pajamas
        ├── bed.svg                     # Cozy bed with blanket/pillow
        ├── asteroid-1.svg              # Rocky asteroid
        ├── asteroid-2.svg              # Brown asteroid
        ├── asteroid-3.svg              # Elongated asteroid
        ├── cloud-1.svg                 # Large fluffy cloud
        ├── cloud-2.svg                 # Medium cloud
        ├── cloud-3.svg                 # Small wispy cloud
        ├── plane.svg                   # Commercial airplane
        ├── helicopter.svg              # Helicopter
        ├── bird-1.svg                  # Bird wings up
        ├── bird-2.svg                  # Bird wings down
        ├── earth.svg                   # Earth from space
        ├── trampoline.svg              # Bouncing trampoline
        ├── casino.svg                  # Casino entrance building
        └── stars.svg                   # Star pattern
```

## Games (Dec 15 - Dec 24)

### December 15 - "Fede's Falling Dream"

**Concept:** A split-screen view showing:
1. **Bedroom section (top):** Fede sleeping in bed with warm lamp lighting
2. **Dream section (bottom):** The falling dream - descending from outer space to Earth

**Visual Layout:**
- Top 30%: Cozy bedroom with sleeping character
- Bottom 70%: The falling game with scrolling background

**Gameplay Mechanics:**
- **Controls:** Arrow keys LEFT/RIGHT
- Moving left/right controls the falling dream character
- The same movement causes the sleeping character to shift subtly in bed
- Background transitions through phases:
  - **Space (99,000-70,000m):** Dark purple/blue, stars, asteroids
  - **Atmosphere (70,000-40,000m):** Gradient transition, mix of asteroids and clouds
  - **Sky (40,000-10,000m):** Blue sky, clouds, planes, helicopters
  - **Ground (10,000-0m):** Light sky, birds, approach to landing
- Avoid obstacles as you fall
- **Win condition:** Reach altitude 0 and land on the trampoline at the casino entrance
- **Win animation:** The sleeping Fede smiles in his sleep

**Technical Implementation:**
- Altitude decreases over time, displayed in UI
- Game speed increases as you descend (slows near landing)
- Obstacle spawn rate adjusts per phase
- Earth image grows as you approach
- Landing zone appears in final phase
- Collision detection with forgiving hitboxes

**Visual Style:**
- Dreamy gradient backgrounds transitioning through phases
- Twinkling star animations in space
- Smooth CSS transitions
- Wobble animation on falling character
- Bouncing trampoline animation

## Color Palette
- **Boston (blue theme):** #0a1628, #1a2d4a, #2a4a6a, #7eb8da
- **Berlin (purple theme):** #1a0a28, #2d1a4a, #4a2a6a, #c9a0dc
- **Space:** #0a0020, #1a0a3a, #2a1a5a
- **Sky:** #5a8aca, #7ab0ea, #87CEEB
- **Accents:** #ffd700 (gold), #ff6b6b (coral)

## Design Principles
1. **Visuals first** - everything should look beautiful
2. **No emojis** - only proper SVG icons
3. **Separate files** - each icon in its own .svg file
4. **Smooth animations** - polished feel
5. **Desktop controls** - keyboard (arrow keys)
6. **Personal touch** - it's a gift for Fede from Billy
7. **Long distance theme** - Boston/Berlin connection throughout

## Future Games (Dec 16-24)
- Will be added in folders: 12_16, 12_17, etc.
- Each should maintain visual quality and personal touch
- Ideas can reference shared memories, inside jokes, etc.
- Consistent styling with main calendar theme
