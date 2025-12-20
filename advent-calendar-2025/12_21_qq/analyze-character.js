const puppeteer = require('puppeteer');
const path = require('path');

const CHARACTER = process.argv[2] || 'billy';

async function analyzeCharacter() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Select character
    await page.evaluate((char) => {
        const card = document.querySelector(`.char-card.${char}`);
        if (card) card.click();
    }, CHARACTER);
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

    // Idle closeup
    await page.screenshot({
        path: path.join(__dirname, `${CHARACTER}-idle.png`),
        clip: { x: 100, y: 520, width: 150, height: 180 }
    });
    console.log(`Saved: ${CHARACTER}-idle.png`);

    // Punch frames
    console.log('Capturing PUNCH...');
    await page.keyboard.press('z');
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 40));
        await page.screenshot({
            path: path.join(__dirname, `${CHARACTER}-punch-${i}.png`),
            clip: { x: 100, y: 520, width: 150, height: 180 }
        });
    }

    await new Promise(r => setTimeout(r, 500));

    // Kick frames
    console.log('Capturing KICK...');
    await page.keyboard.press('x');
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 40));
        await page.screenshot({
            path: path.join(__dirname, `${CHARACTER}-kick-${i}.png`),
            clip: { x: 100, y: 520, width: 150, height: 180 }
        });
    }

    await browser.close();
    console.log('Done!');
}

analyzeCharacter().catch(console.error);
