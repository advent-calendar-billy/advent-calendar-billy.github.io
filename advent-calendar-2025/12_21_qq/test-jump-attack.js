const puppeteer = require('puppeteer');
const path = require('path');

async function testJumpAttack() {
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

    await page.screenshot({ path: 'jump-attack-idle.png' });

    // Test 1: Jump then kick at peak
    console.log('Testing: Jump + Kick...');
    await page.keyboard.press('c'); // jump
    await new Promise(r => setTimeout(r, 200)); // closer to peak (jump is 500ms)
    await page.keyboard.press('x'); // kick
    await new Promise(r => setTimeout(r, 60));
    await page.screenshot({ path: 'jump-kick.png' });

    // Wait for animations to complete
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'jump-kick-after.png' });

    // Test 2: Jump then punch at peak
    console.log('Testing: Jump + Punch...');
    await page.keyboard.press('c'); // jump
    await new Promise(r => setTimeout(r, 200)); // closer to peak (jump is 500ms)
    await page.keyboard.press('z'); // punch
    await new Promise(r => setTimeout(r, 60));
    await page.screenshot({ path: 'jump-punch.png' });

    // Wait for animations to complete
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'jump-punch-after.png' });

    console.log('Done - check jump-*.png files');
    await browser.close();
}

testJumpAttack().catch(console.error);
