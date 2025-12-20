const puppeteer = require('puppeteer');
const path = require('path');

async function debugVicky() {
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

    // Full screenshot before punch
    await page.screenshot({
        path: path.join(__dirname, 'vicky-debug-before.png'),
        fullPage: false
    });

    // Punch and capture IMMEDIATELY
    await page.keyboard.press('z');
    await new Promise(r => setTimeout(r, 50)); // Much shorter delay
    await page.screenshot({
        path: path.join(__dirname, 'vicky-debug-punch.png'),
        fullPage: false
    });

    await browser.close();
    console.log('Done!');
}

debugVicky().catch(console.error);
