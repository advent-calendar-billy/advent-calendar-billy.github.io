const puppeteer = require('puppeteer');
const path = require('path');

async function generateFrames() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Create a simple HTML page showing Frank in different poses
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                margin: 0;
                padding: 20px;
                background: #333;
                font-family: Arial, sans-serif;
                color: white;
            }
            .frame {
                display: inline-block;
                width: 200px;
                height: 250px;
                background: #222;
                margin: 10px;
                position: relative;
                border: 2px solid #666;
            }
            .frame-label {
                position: absolute;
                bottom: 5px;
                left: 5px;
                font-size: 12px;
                background: rgba(0,0,0,0.7);
                padding: 2px 5px;
            }
            .character {
                position: absolute;
                bottom: 50px;
                left: 80px;
                width: 50px;
                height: 80px;
            }
            /* Frank character - simplified representation */
            .frank-body {
                position: absolute;
                width: 40px;
                height: 50px;
                background: linear-gradient(180deg, #1a1a1a 0%, #333 100%);
                border-radius: 5px;
                left: 5px;
                top: 10px;
            }
            .frank-head {
                position: absolute;
                width: 30px;
                height: 30px;
                background: #ffd699;
                border-radius: 50%;
                left: 10px;
                top: -15px;
            }
            .frank-leg-left {
                position: absolute;
                width: 12px;
                height: 35px;
                background: #ffd699;
                border-radius: 6px;
                left: 5px;
                bottom: -30px;
            }
            .frank-leg-right {
                position: absolute;
                width: 12px;
                height: 35px;
                background: #ffd699;
                border-radius: 6px;
                right: 5px;
                bottom: -30px;
            }
            /* Kicking pose - right leg extended */
            .kick-right .frank-leg-right {
                transform: rotate(-60deg);
                transform-origin: top center;
                left: 35px;
            }
            /* High kick - leg goes up */
            .high-kick .frank-leg-right {
                transform: rotate(-90deg);
                transform-origin: top center;
                left: 40px;
                bottom: -15px;
            }
            /* The WRONG way I was doing it - detached leg */
            .wrong-kick .extra-leg {
                position: absolute;
                width: 14px;
                height: 60px;
                background: #ffd699;
                border-radius: 7px;
                left: 120px;  /* Far from body! */
                bottom: 60px;
                transform: rotate(-90deg);
                transform-origin: top center;
            }
        </style>
    </head>
    <body>
        <h2>Frank Character - Pose Reference</h2>

        <div class="frame">
            <div class="character">
                <div class="frank-body"></div>
                <div class="frank-head"></div>
                <div class="frank-leg-left"></div>
                <div class="frank-leg-right"></div>
            </div>
            <div class="frame-label">IDLE (standing)</div>
        </div>

        <div class="frame">
            <div class="character kick-right">
                <div class="frank-body"></div>
                <div class="frank-head"></div>
                <div class="frank-leg-left"></div>
                <div class="frank-leg-right"></div>
            </div>
            <div class="frame-label">KICK RIGHT (correct)</div>
        </div>

        <div class="frame">
            <div class="character high-kick">
                <div class="frank-body"></div>
                <div class="frank-head"></div>
                <div class="frank-leg-left"></div>
                <div class="frank-leg-right"></div>
            </div>
            <div class="frame-label">HIGH KICK (correct)</div>
        </div>

        <div class="frame">
            <div class="character wrong-kick">
                <div class="frank-body"></div>
                <div class="frank-head"></div>
                <div class="frank-leg-left"></div>
                <div class="frank-leg-right"></div>
                <div class="extra-leg"></div>
            </div>
            <div class="frame-label">WRONG - detached leg</div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html);
    await page.setViewport({ width: 900, height: 350 });

    const screenshotPath = path.join(__dirname, 'pose-reference.png');
    await page.screenshot({ path: screenshotPath });

    console.log('Screenshot saved to:', screenshotPath);

    await browser.close();
}

generateFrames().catch(console.error);
