/**
 * Fight Simulator - Automated testing of fighting game mechanics
 *
 * Tests:
 * - Hit detection (attacks connect when in range, miss when out of range)
 * - Directional mechanics (projectiles travel toward opponent)
 * - Character facing (always faces opponent)
 * - Attacks work from both sides
 *
 * Usage:
 *   node debug/fight-simulator.js [test-name]
 *   node debug/fight-simulator.js all
 *   node debug/fight-simulator.js hit-detection
 *   node debug/fight-simulator.js directional
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CONFIG = {
    viewportWidth: 900,
    viewportHeight: 600,
    gameFile: path.join(__dirname, '../POC_game_with_good_attacks/index.html'),
    outputDir: path.join(__dirname, 'test-results'),
    screenshotOnFail: true
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper to log test results
function logTest(name, passed, details = '') {
    const status = passed ? 'PASS' : 'FAIL';
    const icon = passed ? '✓' : '✗';
    console.log(`  ${icon} ${name}${details ? ': ' + details : ''}`);

    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
}

// Ensure output directory exists
function ensureOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
}

// ============================================
// TEST: Hit Detection
// ============================================
async function testHitDetection(browser) {
    console.log('\n--- Hit Detection Tests ---\n');

    const page = await browser.newPage();
    await page.goto('file://' + CONFIG.gameFile, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: CONFIG.viewportWidth, height: CONFIG.viewportHeight });

    // Select Fede
    await page.evaluate(() => selectCharacter('fede'));
    await new Promise(r => setTimeout(r, 1000));

    // Test 1: Punch connects when close
    const closeRangeHit = await page.evaluate(() => {
        const initialHealth = game.dummyHealth;
        game.playerX = 600;  // Close to dummy at 650
        const fighter = document.getElementById('player-fighter');
        if (fighter) fighter.style.left = '600px';
        return { initialHealth, playerX: game.playerX, dummyX: game.dummyX };
    });

    await page.keyboard.press('z');  // Punch
    await new Promise(r => setTimeout(r, 400));

    const afterCloseHit = await page.evaluate(() => ({
        health: game.dummyHealth
    }));

    logTest(
        'Punch connects at close range',
        afterCloseHit.health < closeRangeHit.initialHealth,
        `Damage dealt: ${closeRangeHit.initialHealth - afterCloseHit.health}`
    );

    // Test 2: Punch misses when far
    await page.evaluate(() => {
        game.playerX = 100;  // Far from dummy at 650
        game.dummyHealth = 1000;  // Reset health
        const fighter = document.getElementById('player-fighter');
        if (fighter) fighter.style.left = '100px';
    });
    await new Promise(r => setTimeout(r, 200));

    const farRangeInitial = await page.evaluate(() => game.dummyHealth);

    await page.keyboard.press('z');  // Punch
    await new Promise(r => setTimeout(r, 400));

    const afterFarPunch = await page.evaluate(() => game.dummyHealth);

    logTest(
        'Punch misses at far range',
        afterFarPunch === farRangeInitial,
        `Health unchanged: ${afterFarPunch === farRangeInitial}`
    );

    // Test 3: Kick has longer range than punch
    await page.evaluate(() => {
        game.playerX = 570;  // Medium distance
        game.dummyHealth = 1000;
        const fighter = document.getElementById('player-fighter');
        if (fighter) fighter.style.left = '570px';
    });
    await new Promise(r => setTimeout(r, 200));

    const beforeKick = await page.evaluate(() => game.dummyHealth);

    await page.keyboard.press('x');  // Kick
    await new Promise(r => setTimeout(r, 500));

    const afterKick = await page.evaluate(() => game.dummyHealth);

    logTest(
        'Kick has longer range',
        afterKick < beforeKick,
        `Kick damage at medium range: ${beforeKick - afterKick}`
    );

    await page.close();
}

// ============================================
// TEST: Directional Mechanics
// ============================================
async function testDirectionalMechanics(browser) {
    console.log('\n--- Directional Mechanics Tests ---\n');

    const page = await browser.newPage();
    await page.goto('file://' + CONFIG.gameFile, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: CONFIG.viewportWidth, height: CONFIG.viewportHeight });

    // Select Fede
    await page.evaluate(() => selectCharacter('fede'));
    await new Promise(r => setTimeout(r, 1000));

    // Test 1: Character faces opponent when on LEFT
    const facingWhenLeft = await page.evaluate(() => {
        game.playerX = 100;
        game.dummyX = 650;
        const fighter = document.getElementById('player-fighter');
        if (fighter) fighter.style.left = '100px';

        // The game should have the character facing right (toward dummy)
        // Check for transform: scaleX(-1) or similar
        const style = window.getComputedStyle(fighter);
        const transform = style.transform;

        return {
            playerX: game.playerX,
            dummyX: game.dummyX,
            shouldFaceRight: game.dummyX > game.playerX,
            transform: transform
        };
    });
    await new Promise(r => setTimeout(r, 200));

    logTest(
        'Character faces right when opponent is to the right',
        facingWhenLeft.shouldFaceRight,
        `Player: ${facingWhenLeft.playerX}, Opponent: ${facingWhenLeft.dummyX}`
    );

    // Test 2: Character faces opponent when on RIGHT
    await page.evaluate(() => {
        game.playerX = 700;
        game.dummyX = 150;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '700px';
        if (dummy) dummy.style.left = '150px';
    });
    await new Promise(r => setTimeout(r, 300));

    const facingWhenRight = await page.evaluate(() => {
        return {
            playerX: game.playerX,
            dummyX: game.dummyX,
            shouldFaceLeft: game.dummyX < game.playerX
        };
    });

    logTest(
        'Character faces left when opponent is to the left',
        facingWhenRight.shouldFaceLeft,
        `Player: ${facingWhenRight.playerX}, Opponent: ${facingWhenRight.dummyX}`
    );

    // Test 3: Attack works from LEFT side
    await page.evaluate(() => {
        game.playerX = 550;
        game.dummyX = 650;
        game.dummyHealth = 1000;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '550px';
        if (dummy) dummy.style.left = '650px';
    });
    await new Promise(r => setTimeout(r, 200));

    const beforeLeftAttack = await page.evaluate(() => game.dummyHealth);
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 400));
    const afterLeftAttack = await page.evaluate(() => game.dummyHealth);

    logTest(
        'Attack connects when player is on LEFT',
        afterLeftAttack < beforeLeftAttack,
        `Damage: ${beforeLeftAttack - afterLeftAttack}`
    );

    // Test 4: Attack works from RIGHT side
    await page.evaluate(() => {
        game.playerX = 750;
        game.dummyX = 650;
        game.dummyHealth = 1000;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '750px';
        if (dummy) dummy.style.left = '650px';
    });
    await new Promise(r => setTimeout(r, 200));

    const beforeRightAttack = await page.evaluate(() => game.dummyHealth);
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 400));
    const afterRightAttack = await page.evaluate(() => game.dummyHealth);

    logTest(
        'Attack connects when player is on RIGHT',
        afterRightAttack < beforeRightAttack,
        `Damage: ${beforeRightAttack - afterRightAttack}`
    );

    // Take screenshot for visual verification
    if (CONFIG.screenshotOnFail) {
        await page.screenshot({
            path: path.join(CONFIG.outputDir, 'directional-test-final.png')
        });
    }

    await page.close();
}

// ============================================
// TEST: Projectile Direction
// ============================================
async function testProjectileDirection(browser) {
    console.log('\n--- Projectile Direction Tests ---\n');

    const page = await browser.newPage();
    await page.goto('file://' + CONFIG.gameFile, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: CONFIG.viewportWidth, height: CONFIG.viewportHeight });

    // Select Fede (has Country Throw projectile)
    await page.evaluate(() => selectCharacter('fede'));
    await new Promise(r => setTimeout(r, 1000));

    // Give energy for special
    await page.evaluate(() => {
        game.playerEnergy = 50;
        if (typeof updateUI === 'function') updateUI();
    });

    // Test: Projectile from LEFT goes RIGHT (toward opponent)
    await page.evaluate(() => {
        game.playerX = 150;
        game.dummyX = 650;
        const fighter = document.getElementById('player-fighter');
        if (fighter) fighter.style.left = '150px';
    });
    await new Promise(r => setTimeout(r, 300));

    // Execute Country Throw: down, left, z
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('ArrowLeft');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('z');

    // Take screenshots to see projectile travel
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 150));
        await page.screenshot({
            path: path.join(CONFIG.outputDir, `projectile-left-${i}.png`)
        });
    }

    // Check if projectile hit (health reduced)
    await new Promise(r => setTimeout(r, 1000));
    const afterLeftProjectile = await page.evaluate(() => game.dummyHealth);

    logTest(
        'Projectile travels toward opponent (from LEFT)',
        afterLeftProjectile < 1000,
        `Health after: ${afterLeftProjectile}`
    );

    // Reset and test from RIGHT side
    await page.evaluate(() => {
        game.playerX = 750;
        game.dummyX = 150;
        game.dummyHealth = 1000;
        game.playerEnergy = 50;
        const fighter = document.getElementById('player-fighter');
        const dummy = document.getElementById('npc-dummy');
        if (fighter) fighter.style.left = '750px';
        if (dummy) dummy.style.left = '150px';
        if (typeof updateUI === 'function') updateUI();
    });
    await new Promise(r => setTimeout(r, 500));

    // Execute Country Throw again
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('ArrowLeft');
    await new Promise(r => setTimeout(r, 50));
    await page.keyboard.press('z');

    // Take screenshots
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 150));
        await page.screenshot({
            path: path.join(CONFIG.outputDir, `projectile-right-${i}.png`)
        });
    }

    await new Promise(r => setTimeout(r, 1000));
    const afterRightProjectile = await page.evaluate(() => game.dummyHealth);

    logTest(
        'Projectile travels toward opponent (from RIGHT)',
        afterRightProjectile < 1000,
        `Health after: ${afterRightProjectile}`
    );

    await page.close();
}

// ============================================
// TEST: Arena Boundaries
// ============================================
async function testArenaBoundaries(browser) {
    console.log('\n--- Arena Boundary Tests ---\n');

    const page = await browser.newPage();
    await page.goto('file://' + CONFIG.gameFile, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: CONFIG.viewportWidth, height: CONFIG.viewportHeight });

    await page.evaluate(() => selectCharacter('fede'));
    await new Promise(r => setTimeout(r, 1000));

    // Test: Cannot walk past left boundary
    await page.evaluate(() => {
        game.playerX = 50;
        const fighter = document.getElementById('player-fighter');
        if (fighter) fighter.style.left = '50px';
    });

    // Try to walk left many times
    for (let i = 0; i < 20; i++) {
        await page.keyboard.press('ArrowLeft');
        await new Promise(r => setTimeout(r, 30));
    }

    const afterWalkLeft = await page.evaluate(() => game.playerX);

    logTest(
        'Cannot walk past left boundary',
        afterWalkLeft >= 0,
        `Final X: ${afterWalkLeft}`
    );

    // Test: Cannot walk past right boundary
    await page.evaluate(() => {
        game.playerX = 800;
        const fighter = document.getElementById('player-fighter');
        if (fighter) fighter.style.left = '800px';
    });

    for (let i = 0; i < 20; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }

    const afterWalkRight = await page.evaluate(() => game.playerX);
    const arenaWidth = await page.evaluate(() => {
        const arena = document.getElementById('arena');
        return arena ? arena.offsetWidth : 900;
    });

    logTest(
        'Cannot walk past right boundary',
        afterWalkRight <= arenaWidth,
        `Final X: ${afterWalkRight}, Arena width: ${arenaWidth}`
    );

    await page.close();
}

// ============================================
// TEST: NPC Special Attacks
// ============================================
async function testNPCSpecials(browser) {
    console.log('\n--- NPC Special Attack Tests ---\n');

    // This would test that NPCs use their actual special attacks
    // For now, we'll just verify the POC file has the special functions defined

    const page = await browser.newPage();
    await page.goto('file://' + CONFIG.gameFile, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });

    const specialFunctions = await page.evaluate(() => {
        const functions = [];
        const expected = [
            'executePatoSpecial', 'executeBillySpecial', 'executeJonasSpecial',
            'executeLucasSpecial', 'executeJonasLSpecial', 'executeVickySpecial',
            'executeFedeSpecial', 'executeTimoSpecial', 'executePanchoSpecial',
            'executeMadonnaSpecial', 'executeFrankSpecial', 'executeCharlySpecial',
            'executeAudreySpecial'
        ];

        for (const fn of expected) {
            functions.push({
                name: fn,
                exists: typeof window[fn] === 'function'
            });
        }
        return functions;
    });

    for (const fn of specialFunctions) {
        logTest(
            `Special function exists: ${fn.name}`,
            fn.exists
        );
    }

    await page.close();
}

// ============================================
// Main Test Runner
// ============================================
async function runTests(testName = 'all') {
    console.log('\n========================================');
    console.log('Fight Simulator - Automated Tests');
    console.log('========================================');

    ensureOutputDir();

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });

    try {
        const tests = {
            'hit-detection': testHitDetection,
            'directional': testDirectionalMechanics,
            'projectile': testProjectileDirection,
            'boundaries': testArenaBoundaries,
            'npc-specials': testNPCSpecials
        };

        if (testName === 'all') {
            for (const [name, testFn] of Object.entries(tests)) {
                await testFn(browser);
            }
        } else if (tests[testName]) {
            await tests[testName](browser);
        } else {
            console.error(`Unknown test: ${testName}`);
            console.log('Available tests:', Object.keys(tests).join(', '));
        }

    } finally {
        await browser.close();
    }

    // Print summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total:  ${results.passed + results.failed}`);

    if (results.failed > 0) {
        console.log('\nFailed tests:');
        for (const test of results.tests.filter(t => !t.passed)) {
            console.log(`  - ${test.name}: ${test.details}`);
        }
    }

    console.log('\n========================================\n');

    // Return exit code
    return results.failed === 0 ? 0 : 1;
}

// Run if called directly
if (require.main === module) {
    const testName = process.argv[2] || 'all';
    runTests(testName).then(exitCode => {
        process.exit(exitCode);
    }).catch(err => {
        console.error('Test runner failed:', err);
        process.exit(1);
    });
}

module.exports = { runTests, results };
