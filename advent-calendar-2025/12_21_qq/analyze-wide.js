const puppeteer = require('puppeteer');
const path = require('path');

const CHARACTER = process.argv[2] || 'jonas';

async function analyzeWide() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Select character via direct function call (more reliable than card click)
    await page.evaluate((char) => {
        selectCharacter(char);
    }, CHARACTER);
    await new Promise(r => setTimeout(r, 300));

    // Move closer
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    // Execute punch directly (more reliable than keyboard)
    await page.evaluate(() => {
        executePunch();
    });
    await new Promise(r => setTimeout(r, 120));
    await page.screenshot({
        path: path.join(__dirname, `${CHARACTER}-wide-punch.png`),
        clip: { x: 50, y: 480, width: 300, height: 220 }
    });
    console.log(`Saved: ${CHARACTER}-wide-punch.png`);

    await new Promise(r => setTimeout(r, 500));

    // Execute kick directly
    await page.evaluate(() => {
        executeKick();
    });
    await new Promise(r => setTimeout(r, 120));
    await page.screenshot({
        path: path.join(__dirname, `${CHARACTER}-wide-kick.png`),
        clip: { x: 50, y: 480, width: 300, height: 220 }
    });
    console.log(`Saved: ${CHARACTER}-wide-kick.png`);

    await browser.close();
    console.log('Done!');
}

analyzeWide().catch(console.error);
