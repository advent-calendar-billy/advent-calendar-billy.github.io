name: Visual Animation Verification
description: Use this skill when writing CSS/HTML animations and you need to visually verify what the rendered output looks like. Enables Claude to "see" animations by generating PNG screenshots with Puppeteer and reading them back.

## Instructions

### Setup (One-time per project)

```bash
npm install puppeteer --save-dev
npx puppeteer browsers install chrome
```

### Workflow

1. **Create screenshot script** - Write a Node.js script using Puppeteer to capture the game/page
2. **Run the script** - Execute with `node script.js` to generate PNG files
3. **Read the PNGs** - Use the Read tool on the PNG files to see what rendered
4. **Fix issues** - Adjust CSS/positions based on what you see
5. **Re-capture** - Take new screenshots to verify fixes

### Basic Screenshot Script Template

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('file://' + path.join(__dirname, 'index.html'), {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(r => setTimeout(r, 1000));

    // Capture idle state
    await page.screenshot({ path: 'idle.png' });

    // Trigger action and capture mid-animation
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({ path: 'action.png' });

    await browser.close();
}

screenshot().catch(console.error);
```

### Capturing Animation Frames

To see full animation sequence, capture multiple frames:

```javascript
await page.keyboard.press('x');
for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 50));
    await page.screenshot({ path: `frame-${i}.png` });
}
```

### What Claude Can Read

- **PNG**: Yes (full support)
- **JPG**: Yes (full support)
- **GIF**: Static first frame only (no animation playback)
- **Raw HTML**: No (must render to image first)

### Key Learnings: Animation Positioning

**Problem: Detached Body Parts**
When creating attack animations, DON'T spawn new body parts (legs, arms) floating in space.

**What goes wrong:**
- Creating a leg `<div>` at `fighterX + 50` disconnected from character
- Oversized limbs (3x bigger than character's actual limbs)
- Elements rotating toward character instead of away
- Character body stays static while detached parts animate

**Correct approach for kicks:**
1. Show impact effects (swoosh arcs, bursts) - no fake limbs
2. Lunge/tilt the whole character sprite
3. Use particles (dust, sparkles, motion lines)
4. If showing limbs, match character's actual proportions and connect to body

**Correct approach for object attacks:**
1. Object starts at hand position (`fighterX + 35, bottom: 100`)
2. Arc traces from body outward
3. Scale matches character size
4. Never float disconnected in space

### Character Reference Points

For character at `fighterX`:
- Body center: `fighterX + 25`
- Right hand: `fighterX + 35, bottom: 100`
- Hip: `fighterX + 25, bottom: 85`
- Typical width: ~50px
- Typical height: ~90px
