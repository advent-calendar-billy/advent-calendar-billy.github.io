/**
 * Visual Test Runner - Batch test all characters and generate comparison images
 *
 * This tool:
 * 1. Tests each character's punch, kick, and specials from BOTH sides
 * 2. Generates comparison images showing left vs right attack directions
 * 3. Flags any visual anomalies for manual review
 *
 * Usage:
 *   node debug/visual-test-runner.js           # Full test suite
 *   node debug/visual-test-runner.js fede      # Test one character
 *   node debug/visual-test-runner.js --quick   # Quick test (fewer frames)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CONFIG = {
    viewportWidth: 900,
    viewportHeight: 600,
    gameFile: path.join(__dirname, '../POC_game_with_good_attacks/index.html'),
    outputDir: path.join(__dirname, 'visual-tests'),
    framesPerAction: 8,
    frameDelay: 60
};

const CHARACTERS = [
    'fede', 'timo', 'madonna', 'jonas', 'lucas', 'vicky',
    'jonasl', 'frank', 'charly', 'audrey', 'pancho', 'pato', 'billy'
];

const ACTIONS = ['punch', 'kick'];

// Results tracking
const testResults = {
    characters: {},
    summary: { passed: 0, failed: 0, warnings: 0 }
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Capture an action from both sides and compare
async function testActionFromBothSides(page, character, action, charDir) {
    const results = { left: null, right: null, comparison: null };

    // Test from LEFT side (normal position)
    await page.evaluate(() => {
        game.playerX = 200;
        game.dummyX = 650;
        game.dummyHealth = 1000;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '200px';
        if (dummy) dummy.style.left = '650px';
    });
    await new Promise(r => setTimeout(r, 300));

    // Capture idle from left
    await page.screenshot({
        path: path.join(charDir, `${action}-left-idle.png`)
    });

    // Execute action
    const key = action === 'punch' ? 'z' : 'x';
    await page.keyboard.press(key);

    // Capture peak action frame
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({
        path: path.join(charDir, `${action}-left-active.png`)
    });

    const leftHealth = await page.evaluate(() => game.dummyHealth);
    results.left = {
        hit: leftHealth < 1000,
        damage: 1000 - leftHealth
    };

    await new Promise(r => setTimeout(r, 500));  // Wait for action to complete

    // Test from RIGHT side
    await page.evaluate(() => {
        game.playerX = 700;
        game.dummyX = 250;
        game.dummyHealth = 1000;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '700px';
        if (dummy) dummy.style.left = '250px';
    });
    await new Promise(r => setTimeout(r, 300));

    // Capture idle from right
    await page.screenshot({
        path: path.join(charDir, `${action}-right-idle.png`)
    });

    // Execute action
    await page.keyboard.press(key);

    // Capture peak action frame
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({
        path: path.join(charDir, `${action}-right-active.png`)
    });

    const rightHealth = await page.evaluate(() => game.dummyHealth);
    results.right = {
        hit: rightHealth < 1000,
        damage: 1000 - rightHealth
    };

    await new Promise(r => setTimeout(r, 500));

    // Comparison
    results.comparison = {
        bothHit: results.left.hit && results.right.hit,
        damageMatch: results.left.damage === results.right.damage,
        status: 'unknown'
    };

    if (results.comparison.bothHit && results.comparison.damageMatch) {
        results.comparison.status = 'PASS';
    } else if (results.comparison.bothHit) {
        results.comparison.status = 'WARNING';  // Different damage
    } else if (!results.left.hit && !results.right.hit) {
        results.comparison.status = 'WARNING';  // Neither hit (might be range issue)
    } else {
        results.comparison.status = 'FAIL';  // One side doesn't work
    }

    return results;
}

// Test special move (with combo input)
async function testSpecialFromBothSides(page, character, charDir) {
    const results = { left: null, right: null, comparison: null };

    // Give energy
    await page.evaluate(() => {
        game.playerEnergy = 50;
        if (typeof updateUI === 'function') updateUI();
    });

    // Test from LEFT side
    await page.evaluate(() => {
        game.playerX = 200;
        game.dummyX = 650;
        game.dummyHealth = 1000;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '200px';
        if (dummy) dummy.style.left = '650px';
    });
    await new Promise(r => setTimeout(r, 300));

    await page.screenshot({
        path: path.join(charDir, 'special-left-idle.png')
    });

    // Generic special combo: down, right, z
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('z');

    // Capture multiple frames to catch the special effect
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 100));
        await page.screenshot({
            path: path.join(charDir, `special-left-frame-${i}.png`)
        });
    }

    await new Promise(r => setTimeout(r, 800));
    const leftHealth = await page.evaluate(() => game.dummyHealth);
    results.left = {
        hit: leftHealth < 1000,
        damage: 1000 - leftHealth
    };

    // Test from RIGHT side
    await page.evaluate(() => {
        game.playerX = 700;
        game.dummyX = 250;
        game.dummyHealth = 1000;
        game.playerEnergy = 50;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '700px';
        if (dummy) dummy.style.left = '250px';
        if (typeof updateUI === 'function') updateUI();
    });
    await new Promise(r => setTimeout(r, 300));

    await page.screenshot({
        path: path.join(charDir, 'special-right-idle.png')
    });

    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('z');

    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 100));
        await page.screenshot({
            path: path.join(charDir, `special-right-frame-${i}.png`)
        });
    }

    await new Promise(r => setTimeout(r, 800));
    const rightHealth = await page.evaluate(() => game.dummyHealth);
    results.right = {
        hit: rightHealth < 1000,
        damage: 1000 - rightHealth
    };

    // Comparison
    results.comparison = {
        bothHit: results.left.hit && results.right.hit,
        status: results.left.hit && results.right.hit ? 'PASS' :
            (!results.left.hit && !results.right.hit) ? 'WARNING' : 'FAIL'
    };

    return results;
}

// Test a single character
async function testCharacter(browser, character) {
    console.log(`\n  Testing ${character.toUpperCase()}...`);

    const charDir = path.join(CONFIG.outputDir, character);
    ensureDir(charDir);

    const page = await browser.newPage();
    await page.goto('file://' + CONFIG.gameFile, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: CONFIG.viewportWidth, height: CONFIG.viewportHeight });

    // Select character
    await page.evaluate((char) => selectCharacter(char), character);
    await new Promise(r => setTimeout(r, 1000));

    const charResults = {
        punch: null,
        kick: null,
        special: null,
        overall: 'PASS'
    };

    // Test punch and kick
    for (const action of ACTIONS) {
        charResults[action] = await testActionFromBothSides(page, character, action, charDir);

        const status = charResults[action].comparison.status;
        console.log(`    ${action}: ${status} (L: ${charResults[action].left.damage} dmg, R: ${charResults[action].right.damage} dmg)`);

        if (status === 'FAIL') charResults.overall = 'FAIL';
        else if (status === 'WARNING' && charResults.overall !== 'FAIL') charResults.overall = 'WARNING';
    }

    // Test special
    charResults.special = await testSpecialFromBothSides(page, character, charDir);
    const specialStatus = charResults.special.comparison.status;
    console.log(`    special: ${specialStatus} (L: ${charResults.special.left.damage} dmg, R: ${charResults.special.right.damage} dmg)`);

    if (specialStatus === 'FAIL') charResults.overall = 'FAIL';
    else if (specialStatus === 'WARNING' && charResults.overall !== 'FAIL') charResults.overall = 'WARNING';

    console.log(`    Overall: ${charResults.overall}`);

    await page.close();

    testResults.characters[character] = charResults;

    if (charResults.overall === 'PASS') testResults.summary.passed++;
    else if (charResults.overall === 'FAIL') testResults.summary.failed++;
    else testResults.summary.warnings++;

    return charResults;
}

// Generate HTML report
function generateReport() {
    const reportPath = path.join(CONFIG.outputDir, 'report.html');

    let html = `<!DOCTYPE html>
<html>
<head>
    <title>Visual Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: #eee; }
        h1 { color: #fff; }
        .summary { background: #16213e; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .pass { color: #00ff88; }
        .fail { color: #ff4444; }
        .warning { color: #ffaa00; }
        .character { background: #0f3460; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .character h3 { margin-top: 0; }
        .images { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .images img { max-width: 200px; border: 2px solid #333; border-radius: 4px; }
        .images .label { font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <h1>Visual Test Report</h1>

    <div class="summary">
        <h2>Summary</h2>
        <p class="pass">Passed: ${testResults.summary.passed}</p>
        <p class="fail">Failed: ${testResults.summary.failed}</p>
        <p class="warning">Warnings: ${testResults.summary.warnings}</p>
    </div>
`;

    for (const [char, results] of Object.entries(testResults.characters)) {
        const statusClass = results.overall.toLowerCase();
        html += `
    <div class="character">
        <h3>${char.toUpperCase()} - <span class="${statusClass}">${results.overall}</span></h3>
        <p>Punch: ${results.punch.comparison.status} | Kick: ${results.kick.comparison.status} | Special: ${results.special.comparison.status}</p>
        <div class="images">
            <div>
                <img src="${char}/punch-left-active.png" alt="Punch Left">
                <div class="label">Punch (Left)</div>
            </div>
            <div>
                <img src="${char}/punch-right-active.png" alt="Punch Right">
                <div class="label">Punch (Right)</div>
            </div>
            <div>
                <img src="${char}/kick-left-active.png" alt="Kick Left">
                <div class="label">Kick (Left)</div>
            </div>
            <div>
                <img src="${char}/kick-right-active.png" alt="Kick Right">
                <div class="label">Kick (Right)</div>
            </div>
        </div>
    </div>
`;
    }

    html += `
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`\nReport saved to: ${reportPath}`);
}

// Main runner
async function runVisualTests(characterFilter = null) {
    console.log('\n========================================');
    console.log('Visual Test Runner');
    console.log('========================================');

    ensureDir(CONFIG.outputDir);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });

    try {
        const characters = characterFilter
            ? CHARACTERS.filter(c => c === characterFilter)
            : CHARACTERS;

        if (characters.length === 0) {
            console.error(`Character not found: ${characterFilter}`);
            return 1;
        }

        for (const character of characters) {
            await testCharacter(browser, character);
        }

        generateReport();

    } finally {
        await browser.close();
    }

    console.log('\n========================================');
    console.log('Summary');
    console.log('========================================');
    console.log(`Passed:   ${testResults.summary.passed}`);
    console.log(`Failed:   ${testResults.summary.failed}`);
    console.log(`Warnings: ${testResults.summary.warnings}`);
    console.log('========================================\n');

    return testResults.summary.failed === 0 ? 0 : 1;
}

// Run if called directly
if (require.main === module) {
    const arg = process.argv[2];
    const characterFilter = arg && !arg.startsWith('--') ? arg : null;

    runVisualTests(characterFilter).then(exitCode => {
        process.exit(exitCode);
    }).catch(err => {
        console.error('Visual test runner failed:', err);
        process.exit(1);
    });
}

module.exports = { runVisualTests };
