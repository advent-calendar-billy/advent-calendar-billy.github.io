const puppeteer = require('puppeteer');
const path = require('path');

async function screenshotGame() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Load the actual game
    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    // Wait a bit for page to settle
    await new Promise(r => setTimeout(r, 1000));

    // Screenshot the character select screen
    await page.screenshot({ path: path.join(__dirname, 'game-select.png') });
    console.log('Saved: game-select.png');

    // Click on Frank to select him
    await page.evaluate(() => {
        const frank = document.querySelector('.char-card.frank');
        if (frank) frank.click();
    });

    await new Promise(r => setTimeout(r, 500));

    // Click fight button
    await page.evaluate(() => {
        const btn = document.getElementById('fight-btn');
        if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Screenshot the arena with Frank idle
    await page.screenshot({ path: path.join(__dirname, 'game-frank-idle.png') });
    console.log('Saved: game-frank-idle.png');

    // Move closer to enemy
    for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 50));
    }

    await new Promise(r => setTimeout(r, 300));

    // Press Z (punch) and capture mid-animation
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 150)); // Capture mid-animation
    await page.screenshot({ path: path.join(__dirname, 'game-frank-punch.png') });
    console.log('Saved: game-frank-punch.png');

    await new Promise(r => setTimeout(r, 500));

    // Press X (kick) and capture mid-animation
    await page.keyboard.press('x');
    await new Promise(r => setTimeout(r, 150)); // Capture mid-animation
    await page.screenshot({ path: path.join(__dirname, 'game-frank-kick.png') });
    console.log('Saved: game-frank-kick.png');

    await browser.close();
    console.log('Done!');
}

screenshotGame().catch(console.error);
