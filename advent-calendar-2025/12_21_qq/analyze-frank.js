const puppeteer = require('puppeteer');
const path = require('path');

async function analyzeFrank() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Select Frank
    await page.evaluate(() => {
        document.querySelector('.char-card.frank')?.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Start fight
    await page.evaluate(() => {
        document.getElementById('fight-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Move closer to enemy
    for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    // CLOSE-UP of Frank idle - crop tightly around character
    await page.screenshot({
        path: path.join(__dirname, 'frank-idle-closeup.png'),
        clip: { x: 100, y: 520, width: 150, height: 180 }
    });
    console.log('Saved: frank-idle-closeup.png');

    // PUNCH animation - capture every 40ms for detail
    console.log('Capturing PUNCH frames...');
    await page.keyboard.press('z');
    for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 40));
        await page.screenshot({
            path: path.join(__dirname, `frank-punch-${i}.png`),
            clip: { x: 100, y: 520, width: 150, height: 180 }
        });
    }
    console.log('Saved punch frames 0-11');

    await new Promise(r => setTimeout(r, 600));

    // KICK animation - capture every 40ms for detail
    console.log('Capturing KICK frames...');
    await page.keyboard.press('x');
    for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 40));
        await page.screenshot({
            path: path.join(__dirname, `frank-kick-${i}.png`),
            clip: { x: 100, y: 520, width: 150, height: 180 }
        });
    }
    console.log('Saved kick frames 0-11');

    await browser.close();
    console.log('Done! Analyze the frames.');
}

analyzeFrank().catch(console.error);
