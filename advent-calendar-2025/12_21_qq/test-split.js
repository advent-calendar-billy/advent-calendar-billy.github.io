const puppeteer = require('puppeteer');
const path = require('path');

async function testSplit() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('file://' + path.join(__dirname, 'index.html'), {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: 1200, height: 800 });

    // Wait for load
    await new Promise(r => setTimeout(r, 1000));

    // Click on Fede to select in practice mode (skip tournament)
    // First, let's manually select Fede in the original character select
    await page.evaluate(() => {
        // Hide tournament ladder, show character select
        const ladder = document.getElementById('tournament-ladder');
        const charSelect = document.getElementById('character-select');
        if (ladder) ladder.style.display = 'none';
        if (charSelect) charSelect.style.display = 'flex';
    });

    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'split-1-charselect.png' });

    // Select Fede
    await page.evaluate(() => {
        if (typeof selectCharacter === 'function') {
            selectCharacter('fede');
        }
    });

    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'split-2-ingame.png' });

    // Execute the split (down, down, x)
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 100));
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 100));
    await page.keyboard.press('x');

    // Capture frames of split animation
    for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 100));
        await page.screenshot({ path: `split-frame-${i}.png` });
    }

    console.log('Screenshots saved!');
    await browser.close();
}

testSplit().catch(console.error);
