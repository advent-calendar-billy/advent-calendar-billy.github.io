/**
 * Animation Tester - Generic tool for debugging character animations
 *
 * Usage:
 *   node debug/animation-tester.js [character] [action] [options]
 *
 * Examples:
 *   node debug/animation-tester.js fede punch
 *   node debug/animation-tester.js fede kick --frames=15
 *   node debug/animation-tester.js jonasl special --special="Hot Coffee"
 *   node debug/animation-tester.js billy ultimate --side=right
 *   node debug/animation-tester.js all punch  # Test all characters
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
    viewportWidth: 900,
    viewportHeight: 600,
    defaultFrames: 12,
    frameDelay: 50,  // ms between frames
    outputDir: path.join(__dirname, 'screenshots'),
    gameFile: path.join(__dirname, '../POC_game_with_good_attacks/index.html')
};

// All available characters
const CHARACTERS = [
    'fede', 'timo', 'madonna', 'jonas', 'lucas', 'vicky',
    'jonasl', 'frank', 'charly', 'audrey', 'pancho', 'pato', 'billy'
];

// Action types
const ACTIONS = {
    idle: { key: null, description: 'Standing idle' },
    punch: { key: 'z', description: 'Basic punch (Z key)' },
    kick: { key: 'x', description: 'Basic kick (X key)' },
    jump: { key: 'c', description: 'Jump (C key)' },
    special: { key: 'combo', description: 'Special move (combo input)' },
    ultimate: { key: 'combo', description: 'Ultimate move (full energy + combo)' },
    walk_left: { key: 'ArrowLeft', description: 'Walk left' },
    walk_right: { key: 'ArrowRight', description: 'Walk right' }
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        character: args[0] || 'fede',
        action: args[1] || 'idle',
        frames: CONFIG.defaultFrames,
        side: 'left',  // Player position: left or right of opponent
        special: null,
        verbose: false
    };

    for (const arg of args.slice(2)) {
        if (arg.startsWith('--frames=')) {
            options.frames = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--side=')) {
            options.side = arg.split('=')[1];
        } else if (arg.startsWith('--special=')) {
            options.special = arg.split('=')[1];
        } else if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        }
    }

    return options;
}

// Ensure output directory exists
function ensureOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
}

// Take screenshots of an animation sequence
async function captureAnimation(page, character, action, options) {
    const screenshots = [];
    const prefix = `${character}-${action}-${options.side}`;

    // Capture initial state
    const idlePath = path.join(CONFIG.outputDir, `${prefix}-idle.png`);
    await page.screenshot({ path: idlePath });
    screenshots.push(idlePath);
    console.log(`  Captured: ${prefix}-idle.png`);

    // Trigger the action
    const actionConfig = ACTIONS[action];
    if (!actionConfig) {
        console.error(`Unknown action: ${action}`);
        return screenshots;
    }

    if (actionConfig.key === 'combo') {
        // For special/ultimate, we need combo input
        await executeCombo(page, character, action, options);
    } else if (actionConfig.key) {
        await page.keyboard.press(actionConfig.key);
    }

    // Capture animation frames
    for (let i = 0; i < options.frames; i++) {
        await new Promise(r => setTimeout(r, CONFIG.frameDelay));
        const framePath = path.join(CONFIG.outputDir, `${prefix}-frame-${i.toString().padStart(2, '0')}.png`);
        await page.screenshot({ path: framePath });
        screenshots.push(framePath);

        if (options.verbose) {
            console.log(`  Captured: ${prefix}-frame-${i.toString().padStart(2, '0')}.png`);
        }
    }

    console.log(`  Captured ${options.frames} animation frames`);
    return screenshots;
}

// Execute combo input for special moves
async function executeCombo(page, character, action, options) {
    // Common combo patterns - can be customized per character
    const combos = {
        special: ['ArrowDown', 'ArrowRight', 'z'],
        ultimate: ['ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowRight', 'z']
    };

    // For ultimate, first max out energy
    if (action === 'ultimate') {
        await page.evaluate(() => {
            if (typeof game !== 'undefined') {
                game.playerEnergy = 100;
                if (typeof updateUI === 'function') updateUI();
            }
        });
        await new Promise(r => setTimeout(r, 100));
    }

    const combo = combos[action] || combos.special;

    for (const key of combo) {
        await page.keyboard.press(key);
        await new Promise(r => setTimeout(r, 50));
    }
}

// Set up the game state for testing
async function setupGame(page, character, options) {
    // Wait for page to load
    await page.goto('file://' + CONFIG.gameFile, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({
        width: CONFIG.viewportWidth,
        height: CONFIG.viewportHeight
    });

    // Select character and start game
    await page.evaluate((char) => {
        if (typeof selectCharacter === 'function') {
            selectCharacter(char);
        }
    }, character);

    await new Promise(r => setTimeout(r, 1000));

    // Position player based on 'side' option
    if (options.side === 'right') {
        await page.evaluate(() => {
            if (typeof game !== 'undefined') {
                // Swap positions: player on right, dummy on left
                game.playerX = 650;
                game.dummyX = 150;
                const fighter = document.getElementById('player-fighter');
                const dummy = document.getElementById('npc-dummy');
                if (fighter) fighter.style.left = '650px';
                if (dummy) dummy.style.left = '150px';
            }
        });
        await new Promise(r => setTimeout(r, 200));
    }

    await new Promise(r => setTimeout(r, 500));
}

// Main test runner
async function runTest(options) {
    console.log('\n========================================');
    console.log('Animation Tester');
    console.log('========================================\n');

    ensureOutputDir();

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });

    try {
        const characters = options.character === 'all' ? CHARACTERS : [options.character];

        for (const character of characters) {
            console.log(`\nTesting: ${character.toUpperCase()}`);
            console.log(`  Action: ${options.action}`);
            console.log(`  Side: ${options.side}`);
            console.log(`  Frames: ${options.frames}`);

            const page = await browser.newPage();

            // Enable console logging from the page
            if (options.verbose) {
                page.on('console', msg => console.log('  [PAGE]', msg.text()));
            }

            await setupGame(page, character, options);
            const screenshots = await captureAnimation(page, character, options.action, options);

            await page.close();

            console.log(`  Output: ${CONFIG.outputDir}/`);
        }

        console.log('\n========================================');
        console.log('Test Complete!');
        console.log(`Screenshots saved to: ${CONFIG.outputDir}/`);
        console.log('========================================\n');

    } finally {
        await browser.close();
    }
}

// Run if called directly
if (require.main === module) {
    const options = parseArgs();
    runTest(options).catch(err => {
        console.error('Test failed:', err);
        process.exit(1);
    });
}

module.exports = { runTest, captureAnimation, setupGame, CHARACTERS, ACTIONS };
