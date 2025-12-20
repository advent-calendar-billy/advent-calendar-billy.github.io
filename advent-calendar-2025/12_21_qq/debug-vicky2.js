const puppeteer = require('puppeteer');
const path = require('path');

async function debugVicky2() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Select Vicky
    await page.evaluate(() => {
        document.querySelector('.char-card.vicky')?.click();
    });
    await new Promise(r => setTimeout(r, 300));

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

    // Add debug marker at where bag should spawn
    await page.evaluate(() => {
        const arena = document.getElementById('arena');
        const fighter = document.getElementById('player-fighter');
        const fighterRect = fighter.getBoundingClientRect();
        const arenaRect = arena.getBoundingClientRect();
        const actualFighterX = fighterRect.left - arenaRect.left;

        console.log('Fighter rect:', fighterRect);
        console.log('Arena rect:', arenaRect);
        console.log('Actual fighter X:', actualFighterX);
        console.log('game.playerX:', window.game ? window.game.playerX : 'undefined');

        // Add a big red marker where bag should be
        const marker = document.createElement('div');
        marker.style.cssText = `position: absolute; left: ${actualFighterX + 35}px; bottom: 100px; width: 50px; height: 50px; background: red; z-index: 999; border: 3px solid yellow;`;
        marker.textContent = 'BAG';
        arena.appendChild(marker);
    });

    // Screenshot with marker
    await page.screenshot({
        path: path.join(__dirname, 'vicky-debug-marker.png'),
        fullPage: false
    });

    // Get console output
    page.on('console', msg => console.log('PAGE:', msg.text()));

    await browser.close();
    console.log('Done!');
}

debugVicky2().catch(console.error);
