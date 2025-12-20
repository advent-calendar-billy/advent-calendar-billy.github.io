# Debug Tools

Automated testing and debugging tools for Family Fighter.

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Run unit tests (fast, no browser)
npm test

# Run fight simulator (browser-based tests)
npm run debug:fight

# Run visual tests for all characters
npm run test:visual

# Test a specific character's animations
npm run debug:animations -- fede punch
```

## Tools

### 1. Unit Tests (`npm test`)

Pure JavaScript tests for combat mechanics:
- Hit detection (range checks)
- Directional mechanics (facing, projectile direction)
- Damage calculation
- Energy system
- Arena boundaries
- Round/match logic
- Tournament ladder

**29 tests** - run in ~0.2 seconds.

### 2. Fight Simulator (`npm run debug:fight`)

Browser-based automated tests using Puppeteer:
- Hit detection (punch connects at close range, misses at far range)
- Directional mechanics (attacks work from both sides)
- Projectile direction (travels toward opponent from either side)
- Arena boundaries (cannot walk off-screen)
- NPC special functions exist

Usage:
```bash
node debug/fight-simulator.js all          # Run all tests
node debug/fight-simulator.js hit-detection  # Specific test
node debug/fight-simulator.js directional
node debug/fight-simulator.js projectile
node debug/fight-simulator.js boundaries
node debug/fight-simulator.js npc-specials
```

Output: Console results + screenshots in `debug/test-results/`

### 3. Animation Tester (`npm run debug:animations`)

Capture animation frames for visual inspection:

```bash
# Test punch from left side
node debug/animation-tester.js fede punch

# Test kick from right side
node debug/animation-tester.js fede kick --side=right

# Test special with more frames
node debug/animation-tester.js jonasl special --frames=20

# Test all characters
node debug/animation-tester.js all punch
```

Output: Screenshots in `debug/screenshots/`

### 4. Visual Test Runner (`npm run test:visual`)

Batch test all characters from both sides:

```bash
# Test all characters
node debug/visual-test-runner.js

# Test specific character
node debug/visual-test-runner.js fede
```

Output:
- Screenshots in `debug/visual-tests/[character]/`
- HTML report in `debug/visual-tests/report.html`

## What These Tests Catch

| Issue | Tool |
|-------|------|
| Attack only works from left side | Fight Simulator, Visual Test Runner |
| Projectile goes wrong direction | Fight Simulator |
| Hit detection too short/long | Fight Simulator |
| Animation looks wrong | Animation Tester |
| Character doesn't face opponent | Fight Simulator |
| Walk through arena boundary | Fight Simulator |
| Missing special attack function | Fight Simulator |
| Damage calculation wrong | Unit Tests |
| Energy system broken | Unit Tests |

## Current Known Issues

From Fight Simulator (`npm run debug:fight`):

1. **Kick at medium range doesn't connect** - Range may be too short
2. **Attack from RIGHT side doesn't work** - Directional bug

These need to be fixed in the refactored game.
