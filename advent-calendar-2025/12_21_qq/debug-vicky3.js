const puppeteer = require('puppeteer');
const path = require('path');

async function debugVicky3() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Capture console logs
    page.on('console', msg => console.log('PAGE:', msg.text()));

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Select Vicky
    await page.evaluate(() => {
        document.querySelector('.char-card.vicky')?.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Check selected character
    const selectedChar = await page.evaluate(() => {
        return window.game ? window.game.selectedCharacter : 'game not found';
    });
    console.log('Selected character:', selectedChar);

    // Start fight
    await page.evaluate(() => {
        document.getElementById('fight-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Move closer
    for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    // Check game state before punch
    const gameState = await page.evaluate(() => {
        return {
            selectedCharacter: window.game?.selectedCharacter,
            playerX: window.game?.playerX,
            isAttacking: window.game?.isAttacking
        };
    });
    console.log('Game state before punch:', gameState);

    // Punch
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 80));

    // Check what elements exist in arena
    const arenaElements = await page.evaluate(() => {
        const arena = document.getElementById('arena');
        return Array.from(arena.children).map(el => ({
            tag: el.tagName,
            id: el.id,
            class: el.className,
            style: el.style.cssText.substring(0, 100)
        }));
    });
    console.log('Arena elements:', JSON.stringify(arenaElements, null, 2));

    await page.screenshot({
        path: path.join(__dirname, 'vicky-debug3.png'),
        fullPage: false
    });

    await browser.close();
    console.log('Done!');
}

debugVicky3().catch(console.error);
