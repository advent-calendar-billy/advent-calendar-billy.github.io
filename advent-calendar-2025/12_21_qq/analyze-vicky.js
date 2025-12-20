const puppeteer = require('puppeteer');
const path = require('path');

async function analyzeVicky() {
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

    // Move closer to enemy
    for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 300));

    // Wider capture for punch - including area to right of character
    console.log('Capturing PUNCH frames...');
    await page.keyboard.press('z');
    for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 35));
        await page.screenshot({
            path: path.join(__dirname, `vicky-punch-wide-${i}.png`),
            clip: { x: 50, y: 500, width: 350, height: 200 }
        });
    }
    console.log('Saved punch frames');

    await new Promise(r => setTimeout(r, 600));

    // Wider capture for kick
    console.log('Capturing KICK frames...');
    await page.keyboard.press('x');
    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 28));
        await page.screenshot({
            path: path.join(__dirname, `vicky-kick-wide-${i}.png`),
            clip: { x: 50, y: 500, width: 350, height: 200 }
        });
    }
    console.log('Saved kick frames');

    await browser.close();
    console.log('Done!');
}

analyzeVicky().catch(console.error);
