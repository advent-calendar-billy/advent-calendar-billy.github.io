const puppeteer = require('puppeteer');
const path = require('path');

async function testCombatVisuals() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Click Practice Mode directly (id="practice-btn")
    await page.click('#practice-btn');
    console.log('Clicked practice mode');

    // Wait for arena to load
    await new Promise(r => setTimeout(r, 2500));

    // Screenshot arena
    await page.screenshot({ path: 'combat-idle.png' });
    console.log('Saved: combat-idle.png');

    // Move closer to opponent
    for (let i = 0; i < 15; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }

    await new Promise(r => setTimeout(r, 200));

    // Do multiple punches to build combo
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({ path: 'combat-punch-1.png' });
    console.log('Saved: combat-punch-1.png');

    await new Promise(r => setTimeout(r, 350));

    // Second punch
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({ path: 'combat-punch-2.png' });
    console.log('Saved: combat-punch-2.png');

    await new Promise(r => setTimeout(r, 350));

    // Third punch (should show combo)
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({ path: 'combat-combo.png' });
    console.log('Saved: combat-combo.png');

    await new Promise(r => setTimeout(r, 350));

    // Kick
    await page.keyboard.press('x');
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({ path: 'combat-kick.png' });
    console.log('Saved: combat-kick.png');

    await browser.close();
    console.log('Done!');
}

testCombatVisuals().catch(console.error);
