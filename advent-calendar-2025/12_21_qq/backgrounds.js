// Arena Backgrounds for Family Fighter
// Detailed city-themed backgrounds - no emojis

const Backgrounds = {
    // Available arena backgrounds
    arenas: [
        {
            id: 'berlin',
            name: 'Berlin - Brandenburg Gate',
            css: `
                background: linear-gradient(180deg, #87CEEB 0%, #E0F4FF 40%, #98d1f5 100%);
                position: relative;
            `,
            elements: `
                <!-- Ground - cobblestone plaza -->
                <div class="bg-element" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 68px;
                    background: repeating-linear-gradient(90deg,
                        #8b8b8b 0px, #8b8b8b 30px,
                        #6b6b6b 30px, #6b6b6b 32px,
                        #9a9a9a 32px, #9a9a9a 60px,
                        #6b6b6b 60px, #6b6b6b 62px);
                    border-top: 3px solid #555;
                "></div>
                <!-- Brandenburg Gate - Left Column -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 30px; width: 25px; height: 130px;
                    background: linear-gradient(90deg, #d4c4a8 0%, #e8dcc4 50%, #c9b896 100%);
                    border: 2px solid #a08060;
                "></div>
                <!-- Brandenburg Gate - Center Left Column -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 70px; width: 25px; height: 130px;
                    background: linear-gradient(90deg, #d4c4a8 0%, #e8dcc4 50%, #c9b896 100%);
                    border: 2px solid #a08060;
                "></div>
                <!-- Brandenburg Gate - Center Right Column -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 110px; width: 25px; height: 130px;
                    background: linear-gradient(90deg, #d4c4a8 0%, #e8dcc4 50%, #c9b896 100%);
                    border: 2px solid #a08060;
                "></div>
                <!-- Brandenburg Gate - Top beam -->
                <div class="bg-element" style="
                    position: absolute; bottom: 195px; left: 20px; width: 130px; height: 25px;
                    background: linear-gradient(180deg, #e8dcc4 0%, #d4c4a8 100%);
                    border: 2px solid #a08060;
                "></div>
                <!-- Gate roof structure -->
                <div class="bg-element" style="
                    position: absolute; bottom: 218px; left: 40px; width: 90px; height: 20px;
                    background: linear-gradient(180deg, #b8a888 0%, #d4c4a8 100%);
                    border: 2px solid #a08060;
                    clip-path: polygon(10% 100%, 0% 0%, 100% 0%, 90% 100%);
                "></div>
                <!-- TV Tower in distance -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 80px; width: 8px; height: 200px;
                    background: linear-gradient(90deg, #888 0%, #aaa 50%, #777 100%);
                "></div>
                <!-- TV Tower sphere -->
                <div class="bg-element" style="
                    position: absolute; bottom: 230px; right: 65px; width: 35px; height: 35px;
                    background: radial-gradient(circle at 30% 30%, #ccc, #888);
                    border-radius: 50%;
                "></div>
                <!-- Background buildings -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 140px; width: 50px; height: 80px;
                    background: linear-gradient(90deg, #c4b8a0 0%, #d8ccb4 100%);
                    border: 1px solid #a08060;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 200px; width: 40px; height: 60px;
                    background: linear-gradient(90deg, #b8a888 0%, #c4b8a0 100%);
                    border: 1px solid #a08060;
                "></div>
                <!-- Trees -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 180px; width: 40px; height: 60px;
                    background: radial-gradient(ellipse at center, #3a5f3a 0%, #2d4a2d 100%);
                    border-radius: 50% 50% 40% 40%;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 185px; width: 6px; height: 20px;
                    background: #4a3520;
                "></div>
            `
        },
        {
            id: 'boston',
            name: 'Boston - Freedom Trail',
            css: `
                background: linear-gradient(180deg, #6b8cae 0%, #9eb8d4 40%, #c4d4e4 100%);
                position: relative;
            `,
            elements: `
                <!-- Brick sidewalk -->
                <div class="bg-element" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 68px;
                    background: repeating-linear-gradient(90deg,
                        #a0522d 0px, #a0522d 20px,
                        #8b4513 20px, #8b4513 22px,
                        #cd853f 22px, #cd853f 42px,
                        #8b4513 42px, #8b4513 44px);
                    border-top: 4px solid #654321;
                "></div>
                <!-- Freedom Trail red line -->
                <div class="bg-element" style="
                    position: absolute; bottom: 25px; left: 0; right: 0; height: 8px;
                    background: #8b0000;
                    border: 1px solid #5c0000;
                "></div>
                <!-- Old State House style building -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 40px; width: 100px; height: 140px;
                    background: linear-gradient(90deg, #cd853f 0%, #daa520 50%, #b8860b 100%);
                    border: 3px solid #8b4513;
                "></div>
                <!-- Building windows -->
                <div class="bg-element" style="
                    position: absolute; bottom: 120px; left: 55px; width: 20px; height: 30px;
                    background: #87CEEB; border: 2px solid #654321;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 120px; left: 95px; width: 20px; height: 30px;
                    background: #87CEEB; border: 2px solid #654321;
                "></div>
                <!-- Tower on building -->
                <div class="bg-element" style="
                    position: absolute; bottom: 205px; left: 65px; width: 50px; height: 40px;
                    background: linear-gradient(90deg, #cd853f 0%, #daa520 100%);
                    border: 2px solid #8b4513;
                "></div>
                <!-- Spire -->
                <div class="bg-element" style="
                    position: absolute; bottom: 243px; left: 85px; width: 10px; height: 35px;
                    background: #daa520;
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                "></div>
                <!-- Modern building in back -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 50px; width: 80px; height: 180px;
                    background: linear-gradient(90deg, #4682b4 0%, #5f9ea0 50%, #4682b4 100%);
                    border: 2px solid #2f4f4f;
                "></div>
                <!-- Glass windows pattern -->
                <div class="bg-element" style="
                    position: absolute; bottom: 80px; right: 55px; width: 70px; height: 160px;
                    background: repeating-linear-gradient(0deg,
                        transparent 0px, transparent 18px,
                        #87CEEB 18px, #87CEEB 20px);
                "></div>
                <!-- Faneuil Hall style building -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 160px; width: 70px; height: 90px;
                    background: linear-gradient(90deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
                    border: 2px solid #654321;
                "></div>
                <!-- Grasshopper weathervane -->
                <div class="bg-element" style="
                    position: absolute; bottom: 155px; right: 185px; width: 20px; height: 6px;
                    background: #daa520;
                    border-radius: 3px;
                "></div>
                <!-- Tree -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 170px; width: 35px; height: 50px;
                    background: radial-gradient(ellipse at center, #228b22 0%, #006400 100%);
                    border-radius: 50% 50% 40% 40%;
                "></div>
            `
        },
        {
            id: 'argentina',
            name: 'Buenos Aires - La Boca',
            css: `
                background: linear-gradient(180deg, #87CEEB 0%, #98d1f5 50%, #b0e0f6 100%);
                position: relative;
            `,
            elements: `
                <!-- Colorful cobblestone street -->
                <div class="bg-element" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 68px;
                    background: repeating-linear-gradient(90deg,
                        #666 0px, #666 25px,
                        #555 25px, #555 27px,
                        #777 27px, #777 52px,
                        #555 52px, #555 54px);
                    border-top: 3px solid #444;
                "></div>
                <!-- La Boca House 1 - Yellow -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 20px; width: 60px; height: 100px;
                    background: linear-gradient(90deg, #ffd700 0%, #ffec8b 50%, #ffd700 100%);
                    border: 3px solid #b8860b;
                "></div>
                <!-- Window -->
                <div class="bg-element" style="
                    position: absolute; bottom: 120px; left: 35px; width: 25px; height: 30px;
                    background: #4169e1; border: 3px solid #8b4513;
                "></div>
                <!-- Shutters -->
                <div class="bg-element" style="
                    position: absolute; bottom: 120px; left: 28px; width: 7px; height: 30px;
                    background: #228b22; border: 1px solid #006400;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 120px; left: 60px; width: 7px; height: 30px;
                    background: #228b22; border: 1px solid #006400;
                "></div>
                <!-- La Boca House 2 - Blue -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 85px; width: 55px; height: 110px;
                    background: linear-gradient(90deg, #4169e1 0%, #6495ed 50%, #4169e1 100%);
                    border: 3px solid #191970;
                "></div>
                <!-- La Boca House 3 - Red -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 145px; width: 50px; height: 95px;
                    background: linear-gradient(90deg, #dc143c 0%, #ff6b6b 50%, #dc143c 100%);
                    border: 3px solid #8b0000;
                "></div>
                <!-- La Boca House 4 - Green -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 120px; width: 55px; height: 105px;
                    background: linear-gradient(90deg, #32cd32 0%, #90ee90 50%, #32cd32 100%);
                    border: 3px solid #228b22;
                "></div>
                <!-- La Boca House 5 - Orange -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 50px; width: 60px; height: 90px;
                    background: linear-gradient(90deg, #ff8c00 0%, #ffa500 50%, #ff8c00 100%);
                    border: 3px solid #cc7000;
                "></div>
                <!-- Balcony on blue house -->
                <div class="bg-element" style="
                    position: absolute; bottom: 130px; left: 88px; width: 50px; height: 5px;
                    background: #333; border: 1px solid #111;
                "></div>
                <!-- Tango poster on wall -->
                <div class="bg-element" style="
                    position: absolute; bottom: 100px; right: 65px; width: 30px; height: 35px;
                    background: #f5f0e1; border: 2px solid #333;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 105px; right: 72px;
                    font-family: serif; font-size: 10px; color: #333;
                ">TANGO</div>
            `
        },
        {
            id: 'japan',
            name: 'Tokyo - Shibuya Crossing',
            css: `
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 80%, #1a1a3e 100%);
                position: relative;
            `,
            elements: `
                <!-- Neon-lit street -->
                <div class="bg-element" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 68px;
                    background: linear-gradient(90deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
                    border-top: 3px solid #555;
                "></div>
                <!-- Zebra crossing lines -->
                <div class="bg-element" style="
                    position: absolute; bottom: 10px; left: 50px; right: 50px; height: 45px;
                    background: repeating-linear-gradient(90deg,
                        #fff 0px, #fff 40px,
                        transparent 40px, transparent 60px);
                    opacity: 0.8;
                "></div>
                <!-- Building 1 with neon -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 20px; width: 70px; height: 180px;
                    background: linear-gradient(90deg, #1a1a2e 0%, #2a2a3e 50%, #1a1a2e 100%);
                    border: 2px solid #333;
                "></div>
                <!-- Neon sign 1 -->
                <div class="bg-element" style="
                    position: absolute; bottom: 200px; left: 25px; width: 60px; height: 25px;
                    background: #ff0080; border: 2px solid #cc0066;
                    box-shadow: 0 0 15px #ff0080, 0 0 30px #ff0080;
                    border-radius: 3px;
                "></div>
                <!-- Building 2 -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 100px; width: 60px; height: 150px;
                    background: linear-gradient(90deg, #2a2a3e 0%, #3a3a4e 50%, #2a2a3e 100%);
                    border: 2px solid #444;
                "></div>
                <!-- Neon sign 2 - cyan -->
                <div class="bg-element" style="
                    position: absolute; bottom: 180px; left: 105px; width: 50px; height: 20px;
                    background: #00ffff; border: 2px solid #00cccc;
                    box-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff;
                    border-radius: 3px;
                "></div>
                <!-- 109 Building style -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 40px; width: 90px; height: 200px;
                    background: linear-gradient(90deg, #1a1a2e 0%, #2a2a3e 50%, #1a1a2e 100%);
                    border: 2px solid #333;
                    border-radius: 10px 10px 0 0;
                "></div>
                <!-- 109 neon -->
                <div class="bg-element" style="
                    position: absolute; bottom: 220px; right: 55px; width: 60px; height: 30px;
                    background: #ff4500; border: 2px solid #cc3600;
                    box-shadow: 0 0 20px #ff4500, 0 0 40px #ff4500;
                    border-radius: 5px;
                    display: flex; align-items: center; justify-content: center;
                    font-family: sans-serif; font-weight: bold; font-size: 16px; color: #fff;
                ">109</div>
                <!-- Street lamp -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 180px; width: 6px; height: 100px;
                    background: #444;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 165px; left: 170px; width: 25px; height: 8px;
                    background: radial-gradient(ellipse at center, #fffacd 0%, #ffd700 100%);
                    box-shadow: 0 0 20px #ffd700;
                    border-radius: 50%;
                "></div>
                <!-- Vending machine glow -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 150px; width: 30px; height: 50px;
                    background: linear-gradient(180deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
                    border: 2px solid #333;
                    box-shadow: 0 0 10px rgba(255,107,107,0.5);
                "></div>
            `
        },
        {
            id: 'switzerland',
            name: 'Swiss Alps - Matterhorn',
            css: `
                background: linear-gradient(180deg, #4a90d9 0%, #87CEEB 30%, #98d1f5 60%, #e8f4ff 100%);
                position: relative;
            `,
            elements: `
                <!-- Snowy ground -->
                <div class="bg-element" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 68px;
                    background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 50%, #fff 100%);
                    border-top: 3px solid #ddd;
                "></div>
                <!-- Snow texture -->
                <div class="bg-element" style="
                    position: absolute; bottom: 5px; left: 20px; width: 15px; height: 8px;
                    background: #fff; border-radius: 50%;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 8px; left: 80px; width: 20px; height: 10px;
                    background: #fff; border-radius: 50%;
                "></div>
                <!-- Matterhorn mountain -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 50%;
                    transform: translateX(-50%);
                    width: 0; height: 0;
                    border-left: 120px solid transparent;
                    border-right: 120px solid transparent;
                    border-bottom: 200px solid #6b7b8c;
                "></div>
                <!-- Snow cap on Matterhorn -->
                <div class="bg-element" style="
                    position: absolute; bottom: 220px; left: 50%;
                    transform: translateX(-50%);
                    width: 0; height: 0;
                    border-left: 40px solid transparent;
                    border-right: 40px solid transparent;
                    border-bottom: 50px solid #fff;
                "></div>
                <!-- Secondary mountain left -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 0;
                    width: 0; height: 0;
                    border-left: 80px solid transparent;
                    border-right: 80px solid transparent;
                    border-bottom: 130px solid #5a6a7a;
                "></div>
                <!-- Snow on left mountain -->
                <div class="bg-element" style="
                    position: absolute; bottom: 165px; left: 50px; width: 60px; height: 15px;
                    background: #fff; border-radius: 50%;
                "></div>
                <!-- Secondary mountain right -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: -20px;
                    width: 0; height: 0;
                    border-left: 90px solid transparent;
                    border-right: 90px solid transparent;
                    border-bottom: 140px solid #4a5a6a;
                "></div>
                <!-- Swiss chalet -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; left: 40px; width: 60px; height: 50px;
                    background: linear-gradient(90deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
                    border: 2px solid #654321;
                "></div>
                <!-- Chalet roof -->
                <div class="bg-element" style="
                    position: absolute; bottom: 115px; left: 30px; width: 80px; height: 30px;
                    background: #654321;
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                "></div>
                <!-- Snow on roof -->
                <div class="bg-element" style="
                    position: absolute; bottom: 135px; left: 45px; width: 50px; height: 8px;
                    background: #fff; border-radius: 3px;
                "></div>
                <!-- Pine tree 1 -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 80px;
                    width: 0; height: 0;
                    border-left: 20px solid transparent;
                    border-right: 20px solid transparent;
                    border-bottom: 50px solid #228b22;
                "></div>
                <div class="bg-element" style="
                    position: absolute; bottom: 100px; right: 85px;
                    width: 0; height: 0;
                    border-left: 15px solid transparent;
                    border-right: 15px solid transparent;
                    border-bottom: 35px solid #228b22;
                "></div>
                <!-- Pine tree trunk -->
                <div class="bg-element" style="
                    position: absolute; bottom: 68px; right: 95px; width: 10px; height: 15px;
                    background: #4a3520;
                "></div>
                <!-- Snow on pine -->
                <div class="bg-element" style="
                    position: absolute; bottom: 110px; right: 88px; width: 25px; height: 5px;
                    background: #fff; border-radius: 50%;
                "></div>
                <!-- Clouds -->
                <div class="bg-element" style="
                    position: absolute; top: 30px; left: 60px; width: 60px; height: 25px;
                    background: rgba(255,255,255,0.8); border-radius: 50%;
                "></div>
                <div class="bg-element" style="
                    position: absolute; top: 35px; left: 90px; width: 40px; height: 20px;
                    background: rgba(255,255,255,0.8); border-radius: 50%;
                "></div>
            `
        }
    ],

    currentIndex: 0,

    // Get current background
    getCurrent() {
        return this.arenas[this.currentIndex];
    },

    // Move to next background
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.arenas.length;
        return this.getCurrent();
    },

    // Get background for specific match number
    getForMatch(matchNumber) {
        const index = (matchNumber - 1) % this.arenas.length;
        return this.arenas[index];
    },

    // Apply background to arena element
    applyToArena(arenaElement, matchNumber) {
        const bg = this.getForMatch(matchNumber);

        // Remove old background elements
        arenaElement.querySelectorAll('.bg-element').forEach(el => el.remove());

        // Apply CSS
        arenaElement.style.cssText += bg.css;

        // Add elements
        arenaElement.insertAdjacentHTML('afterbegin', bg.elements);

        return bg;
    },

    // Reset to first background
    reset() {
        this.currentIndex = 0;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Backgrounds;
}
