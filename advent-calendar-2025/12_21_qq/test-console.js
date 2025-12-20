const puppeteer = require('puppeteer');
const path = require('path');

async function test() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
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

    const afterSelect = await page.evaluate(() => ({
        selectedChar: window.game?.selectedCharacter,
        arenaVisible: document.getElementById('game-arena')?.style.display
    }));
    console.log('After select:', afterSelect);

    // Start fight
    await page.evaluate(() => {
        document.getElementById('fight-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const afterFight = await page.evaluate(() => ({
        selectedChar: window.game?.selectedCharacter,
        isAttacking: window.game?.isAttacking,
        fighterExists: !!document.getElementById('player-fighter')
    }));
    console.log('After fight:', afterFight);

    // Move
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    const beforePunch = await page.evaluate(() => ({
        selectedChar: window.game?.selectedCharacter,
        isAttacking: window.game?.isAttacking,
        playerX: window.game?.playerX
    }));
    console.log('Before punch:', beforePunch);

    console.log('--- Pressing Z ---');
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 200));

    const afterPunch = await page.evaluate(() => ({
        selectedChar: window.game?.selectedCharacter,
        isAttacking: window.game?.isAttacking
    }));
    console.log('After punch:', afterPunch);

    await browser.close();
    console.log('Done');
}
test().catch(console.error);
