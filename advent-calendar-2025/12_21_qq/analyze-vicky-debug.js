const puppeteer = require('puppeteer');
const path = require('path');

async function analyzeVicky() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Capture all console logs
    page.on('console', msg => console.log('PAGE:', msg.text()));

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Select Vicky (same as analyze-wide.js)
    await page.evaluate(() => {
        const card = document.querySelector('.char-card.vicky');
        if (card) card.click();
        else console.log('Card not found for vicky');
    });
    await new Promise(r => setTimeout(r, 300));

    // Start fight (same pattern)
    await page.evaluate(() => {
        document.getElementById('fight-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Move closer
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    // Check selected character
    const charInfo = await page.evaluate(() => {
        // Try to access game from global scope
        if (typeof game !== 'undefined') {
            return { char: game.selectedCharacter, playerX: game.playerX };
        }
        return { error: 'game not in scope' };
    });
    console.log('Character info:', charInfo);

    // Punch
    console.log('Pressing Z...');
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 120));

    await page.screenshot({
        path: path.join(__dirname, 'vicky-analyze-debug.png'),
        clip: { x: 50, y: 480, width: 300, height: 220 }
    });
    console.log('Saved screenshot');

    await browser.close();
    console.log('Done!');
}

analyzeVicky().catch(console.error);
