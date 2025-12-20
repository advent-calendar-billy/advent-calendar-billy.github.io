// Arena Backgrounds for Family Fighter
// Rotates through different themed backgrounds for each fight

const Backgrounds = {
    // Available arena backgrounds
    arenas: [
        {
            id: 'dojo',
            name: 'The Dojo',
            css: `
                background: linear-gradient(180deg, #8b7355 0%, #654321 100%);
                position: relative;
            `,
            elements: `
                <div class="bg-element dojo-floor" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
                    background: repeating-linear-gradient(90deg, #deb887 0px, #deb887 60px, #c4a574 60px, #c4a574 62px);
                    border-top: 4px solid #333;
                "></div>
                <div class="bg-element dojo-wall" style="
                    position: absolute; top: 20px; left: 50px; width: 150px; height: 100px;
                    background: #f5f0e1; border: 3px solid #333;
                    display: flex; align-items: center; justify-content: center;
                    font-family: serif; font-size: 24px;
                ">道場</div>
                <div class="bg-element dojo-lantern left" style="
                    position: absolute; top: 30px; left: 15px; width: 25px; height: 35px;
                    background: #cc0000; border: 2px solid #333; border-radius: 5px;
                "></div>
                <div class="bg-element dojo-lantern right" style="
                    position: absolute; top: 30px; right: 15px; width: 25px; height: 35px;
                    background: #cc0000; border: 2px solid #333; border-radius: 5px;
                "></div>
            `
        },
        {
            id: 'street',
            name: 'Back Alley',
            css: `
                background: linear-gradient(180deg, #2c3e50 0%, #1a252f 60%, #34495e 100%);
            `,
            elements: `
                <div class="bg-element street-ground" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
                    background: #333; border-top: 4px solid #555;
                "></div>
                <div class="bg-element dumpster" style="
                    position: absolute; bottom: 65px; left: 20px; width: 60px; height: 50px;
                    background: #27ae60; border: 3px solid #1a5c34; border-radius: 3px;
                "></div>
                <div class="bg-element crates" style="
                    position: absolute; bottom: 65px; right: 30px; width: 45px; height: 40px;
                    background: #8b7355; border: 3px solid #654321;
                "></div>
                <div class="bg-element crates-2" style="
                    position: absolute; bottom: 100px; right: 40px; width: 30px; height: 30px;
                    background: #8b7355; border: 3px solid #654321;
                "></div>
                <div class="bg-element graffiti" style="
                    position: absolute; top: 40px; right: 100px;
                    font-family: 'Finger Paint', cursive; font-size: 18px; color: #e74c3c;
                    transform: rotate(-5deg);
                ">FIGHT!</div>
                <div class="bg-element streetlight" style="
                    position: absolute; top: 0; left: 150px; width: 8px; height: 120px;
                    background: #333;
                "></div>
                <div class="bg-element light-glow" style="
                    position: absolute; top: 115px; left: 140px; width: 30px; height: 30px;
                    background: radial-gradient(circle, #f1c40f 0%, transparent 70%);
                    border-radius: 50%;
                "></div>
            `
        },
        {
            id: 'rooftop',
            name: 'City Rooftop',
            css: `
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            `,
            elements: `
                <div class="bg-element rooftop-floor" style="
                    position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
                    background: #4a4a4a; border-top: 4px solid #333;
                "></div>
                <div class="bg-element skyline-1" style="
                    position: absolute; bottom: 60px; left: 0; width: 80px; height: 150px;
                    background: #2d2d2d; border: 2px solid #1a1a1a;
                "></div>
                <div class="bg-element skyline-2" style="
                    position: absolute; bottom: 60px; left: 90px; width: 60px; height: 100px;
                    background: #3d3d3d; border: 2px solid #2a2a2a;
                "></div>
                <div class="bg-element skyline-3" style="
                    position: absolute; bottom: 60px; right: 0; width: 100px; height: 180px;
                    background: #2d2d2d; border: 2px solid #1a1a1a;
                "></div>
                <div class="bg-element skyline-4" style="
                    position: absolute; bottom: 60px; right: 110px; width: 50px; height: 120px;
                    background: #3d3d3d; border: 2px solid #2a2a2a;
                "></div>
                <div class="bg-element moon" style="
                    position: absolute; top: 20px; right: 40px; width: 50px; height: 50px;
                    background: #f5f0e1; border-radius: 50%;
                    box-shadow: 0 0 20px #f5f0e1;
                "></div>
                <div class="bg-element stars" style="
                    position: absolute; top: 10px; left: 100px; width: 4px; height: 4px;
                    background: #fff; border-radius: 50%;
                "></div>
                <div class="bg-element stars-2" style="
                    position: absolute; top: 35px; left: 200px; width: 3px; height: 3px;
                    background: #fff; border-radius: 50%;
                "></div>
                <div class="bg-element stars-3" style="
                    position: absolute; top: 20px; left: 350px; width: 3px; height: 3px;
                    background: #fff; border-radius: 50%;
                "></div>
                <div class="bg-element water-tower" style="
                    position: absolute; bottom: 60px; left: 200px; width: 40px; height: 80px;
                    background: #5d4e37; border: 2px solid #3d2e17; border-radius: 5px 5px 0 0;
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
