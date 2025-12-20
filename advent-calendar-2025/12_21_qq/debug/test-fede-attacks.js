/**
 * Test Fede's basic attacks - Punch (Z) and Kick (X)
 * Verifies that combos are correctly configured
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testFedeAttacks() {
    console.log('\n=== Testing Fede Basic Attacks ===\n');

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('file://' + path.join(__dirname, '../index.html'), {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: 900, height: 600 });

    // Wait for game to initialize
    await new Promise(r => setTimeout(r, 2000));

    // Click start to begin fight
    await page.click('#start-btn');
    await new Promise(r => setTimeout(r, 2000));

    // Capture idle state
    await page.screenshot({ path: path.join(__dirname, 'fede-idle.png') });
    console.log('Captured: fede-idle.png');

    // Test PUNCH (Z key) - should be Hollow Knight plushie swing
    console.log('\nTesting PUNCH (Z key)...');
    await page.keyboard.press('z');

    for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 50));
        await page.screenshot({ path: path.join(__dirname, `fede-punch-${i}.png`) });
    }
    console.log('Captured: fede-punch-0 through fede-punch-5.png');

    await new Promise(r => setTimeout(r, 500));

    // Test KICK (X key) - should be Passport Throw (NOT a special!)
    console.log('\nTesting KICK (X key)...');
    await page.keyboard.press('x');

    for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 50));
        await page.screenshot({ path: path.join(__dirname, `fede-kick-${i}.png`) });
    }
    console.log('Captured: fede-kick-0 through fede-kick-7.png');

    await new Promise(r => setTimeout(r, 500));

    // Test a SPECIAL (down, down, X = The Split)
    console.log('\nTesting SPECIAL: The Split (↓↓X)...');
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 80));
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 80));
    await page.keyboard.press('x');

    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 60));
        await page.screenshot({ path: path.join(__dirname, `fede-split-${i}.png`) });
    }
    console.log('Captured: fede-split-0 through fede-split-9.png');

    await browser.close();
    console.log('\n=== Test Complete ===');
    console.log(`Screenshots saved to: ${path.join(__dirname)}/`);
}

testFedeAttacks().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
