const puppeteer = require('puppeteer');
const path = require('path');

async function captureFrames() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Select Frank
    await page.evaluate(() => {
        const frank = document.querySelector('.char-card.frank');
        if (frank) frank.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Start fight
    await page.evaluate(() => {
        document.getElementById('fight-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Move closer
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 200));

    // Capture kick animation frames - clip around the character area
    // Character is at bottom left, around x:100-250, y:500-700 based on previous screenshots
    await page.keyboard.press('x');

    for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 50));
        await page.screenshot({
            path: path.join(__dirname, `frame-${i}.png`),
            clip: { x: 80, y: 500, width: 250, height: 200 }
        });
        console.log(`Captured frame-${i}.png`);
    }

    await browser.close();
    console.log('Done!');
}

captureFrames().catch(console.error);
