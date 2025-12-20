const puppeteer = require('puppeteer');
const path = require('path');

async function debugVicky4() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE:', msg.text()));

    const gamePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(gamePath, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    await new Promise(r => setTimeout(r, 1000));

    // Click on Vicky
    await page.evaluate(() => {
        const card = document.querySelector('.char-card.vicky');
        console.log('Vicky card found:', !!card);
        if (card) card.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Check fighter container
    const containerInfo = await page.evaluate(() => {
        const container = document.getElementById('player-fighter-container');
        const fighter = document.getElementById('player-fighter');
        return {
            containerExists: !!container,
            containerHTML: container ? container.innerHTML.substring(0, 200) : 'not found',
            fighterExists: !!fighter,
            fighterClass: fighter ? fighter.className : 'not found'
        };
    });
    console.log('Container info:', containerInfo);

    // Move and punch
    for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 200));

    // Try to punch and log what happens
    await page.evaluate(() => {
        console.log('About to press Z');
        // Manually trigger keydown
        const event = new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ' });
        document.dispatchEvent(event);
    });
    await new Promise(r => setTimeout(r, 100));

    // Check for bag element
    const bagCheck = await page.evaluate(() => {
        const arena = document.getElementById('arena');
        const allDivs = arena.querySelectorAll('div');
        const potentialBags = Array.from(allDivs).filter(d =>
            d.style.background && d.style.background.includes('c41e3a')
        );
        return {
            totalDivs: allDivs.length,
            bagFound: potentialBags.length > 0,
            bagStyles: potentialBags.map(b => b.style.cssText.substring(0, 100))
        };
    });
    console.log('Bag check:', bagCheck);

    await page.screenshot({
        path: path.join(__dirname, 'vicky-debug4.png'),
        fullPage: false
    });

    await browser.close();
    console.log('Done!');
}

debugVicky4().catch(console.error);
