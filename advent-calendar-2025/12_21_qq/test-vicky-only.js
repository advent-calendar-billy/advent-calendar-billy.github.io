const puppeteer = require('puppeteer');
const path = require('path');

async function test() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(r => setTimeout(r, 1000));

    // Select Vicky via direct function call
    console.log('Selecting Vicky via selectCharacter...');
    await page.evaluate(() => {
        selectCharacter('vicky');
    });
    await new Promise(r => setTimeout(r, 800));

    // Check state via evaluate injection
    const state = await page.evaluate(() => {
        // Return the actual game state by accessing from window
        return typeof game !== 'undefined' ? game.selectedCharacter : 'game undefined';
    });
    console.log('Selected character:', state);

    // Move
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    // Directly call executePunch from page context
    console.log('Calling executePunch directly...');
    await page.evaluate(() => {
        if (typeof executePunch === 'function') {
            executePunch();
        } else {
            console.log('executePunch not defined');
        }
    });
    await new Promise(r => setTimeout(r, 300));

    // Take screenshot
    await page.screenshot({
        path: path.join(__dirname, 'vicky-direct-test.png'),
        fullPage: false
    });

    await browser.close();
    console.log('Done!');
}
test().catch(console.error);
