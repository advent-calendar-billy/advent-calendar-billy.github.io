const puppeteer = require('puppeteer');
const path = require('path');

async function debugKick() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('file://' + path.join(__dirname, 'index.html'), {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await page.setViewport({ width: 900, height: 600 });
    await new Promise(r => setTimeout(r, 2000));

    // Click FIGHT
    await page.evaluate(() => {
        const fightBtn = document.querySelector('.fight-btn');
        if (fightBtn) fightBtn.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    await page.screenshot({ path: 'kick-test-idle.png' });

    // Press X for kick
    await page.keyboard.press('x');
    await new Promise(r => setTimeout(r, 80));
    await page.screenshot({ path: 'kick-test-active.png' });

    console.log('Done - check kick-test-*.png');
    await browser.close();
}

debugKick().catch(console.error);
