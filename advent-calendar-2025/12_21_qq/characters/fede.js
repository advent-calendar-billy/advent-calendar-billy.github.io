/**
 * Fede - The Globetrotting Gentleman
 *
 * Punch: Hollow Knight Plushie swing
 * Kick: Passport Throw (projectile)
 * Specials: The Split, Salmon Sashimi, Country Throw, WORLD TOUR!
 *
 * Attacks extracted from POC_game_with_good_attacks
 */

// Fede's sprite template (CSS-based)
const FEDE_SPRITE = `
    <div class="fighter fede idle" id="player-fighter">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <div class="collar-left"></div>
            <div class="collar-right"></div>
            <div class="buttons">
                <div class="button"></div>
                <div class="button"></div>
                <div class="button"></div>
            </div>
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="legs">
            <div class="leg left"></div>
            <div class="leg right"></div>
        </div>
        <div class="feet"><div class="foot"></div><div class="foot"></div></div>
    </div>
`;

// Countries for throwing attacks
const FEDE_COUNTRIES = [
    { name: 'France', color: '#0055A4', shape: 'hexagon' },
    { name: 'Japan', color: '#BC002D', shape: 'circle' },
    { name: 'Brazil', color: '#009739', shape: 'diamond' },
    { name: 'Italy', color: '#008C45', shape: 'boot' },
    { name: 'Australia', color: '#FFCD00', shape: 'blob' },
    { name: 'Mexico', color: '#006847', shape: 'curved' },
    { name: 'Egypt', color: '#C8102E', shape: 'triangle' },
    { name: 'Norway', color: '#BA0C2F', shape: 'long' }
];

/**
 * Create a simple country SVG
 */
function createCountrySVG(country, size) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 40 40');

    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    shape.setAttribute('cx', '20');
    shape.setAttribute('cy', '20');
    shape.setAttribute('rx', '15');
    shape.setAttribute('ry', '12');
    shape.setAttribute('fill', country.color);
    shape.setAttribute('stroke', '#333');
    shape.setAttribute('stroke-width', '2');

    svg.appendChild(shape);
    return svg;
}

/**
 * Fede Character Class
 */
class FedeCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'fede',
            name: 'FEDE',
            color: '#4a90d9',
            punchDamage: 8,
            kickDamage: 10,
            spriteTemplate: FEDE_SPRITE,
            specialMoves: [
                {
                    name: 'The Split',
                    combo: ['down', 'down', 'x'],
                    damage: 25,
                    energyCost: 20,
                    execute: function(move) { return this.executeTheSplit(move); }
                },
                {
                    name: 'Salmon Sashimi',
                    combo: ['right', 'right', 'z'],
                    damage: 20,
                    energyCost: 25,
                    execute: function(move) { return this.executeSalmonSashimi(move); }
                },
                {
                    name: 'Country Throw',
                    combo: ['down', 'left', 'z'],
                    damage: 18,
                    energyCost: 20,
                    execute: function(move) { return this.executeCountryThrow(move); }
                },
                {
                    name: 'WORLD TOUR!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 45,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeWorldTour(move); }
                }
            ]
        });

        this.countries = FEDE_COUNTRIES;
    }

    /**
     * Fede's Punch: Hollow Knight Plushie Swing
     * Extracted from POC lines 4697-4788
     */
    animatePunch() {
        const fighter = this.element;
        const arena = this.arena;
        const fighterX = this.x;

        const rightArm = fighter.querySelector('.arm.right');
        const originalArmTransform = rightArm ? rightArm.style.transform : '';

        // Create hand at end of arm
        const hand = document.createElement('div');
        hand.style.cssText = `
            position: absolute; right: -8px; bottom: -5px;
            width: 8px; height: 8px;
            background: var(--paper, #ffeedd); border: 1px solid var(--ink, #333);
            border-radius: 50%; z-index: 151;
        `;

        // Create Hollow Knight plushie held by hand
        const plushie = document.createElement('div');
        plushie.innerHTML = `
            <div style="width: 28px; height: 32px; position: relative;">
                <div style="width: 28px; height: 24px; background: #1a1a2e; border-radius: 50% 50% 45% 45%; position: relative;">
                    <div style="position: absolute; top: -6px; left: 2px; width: 6px; height: 12px; background: #fff; border-radius: 50% 50% 30% 30%; transform: rotate(-15deg);"></div>
                    <div style="position: absolute; top: -6px; right: 2px; width: 6px; height: 12px; background: #fff; border-radius: 50% 50% 30% 30%; transform: rotate(15deg);"></div>
                    <div style="position: absolute; top: 8px; left: 6px; width: 5px; height: 8px; background: #000; border-radius: 50%;"></div>
                    <div style="position: absolute; top: 8px; right: 6px; width: 5px; height: 8px; background: #000; border-radius: 50%;"></div>
                </div>
                <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 16px; height: 10px; background: #2a2a4e; border-radius: 0 0 6px 6px;"></div>
            </div>
        `;
        plushie.style.cssText = `
            position: absolute; right: -25px; bottom: -8px;
            transform: rotate(-20deg); transform-origin: left center;
            z-index: 150;
        `;
        hand.appendChild(plushie);

        if (rightArm) {
            rightArm.appendChild(hand);
            rightArm.style.transition = 'transform 0.04s linear';
            rightArm.style.transformOrigin = 'top center';
        }

        let frame = 0;
        const swing = setInterval(() => {
            frame++;
            const armAngle = -15 + frame * 9;
            if (rightArm) {
                rightArm.style.transform = `rotate(${armAngle}deg)`;
            }
            const wobble = Math.sin(frame * 1.5) * 5;
            plushie.style.transform = `rotate(${-20 + frame * 4 + wobble}deg)`;

            // Cute dust puffs trail
            if (frame % 3 === 0 && arena) {
                const puff = document.createElement('div');
                puff.style.cssText = `
                    position: absolute; left: ${fighterX + 35 + frame * 3}px; bottom: ${95 + Math.random() * 10}px;
                    width: 8px; height: 8px;
                    background: rgba(255,255,255,0.6);
                    border-radius: 50%; z-index: 149;
                `;
                arena.appendChild(puff);
                let puffSize = 8;
                const expand = setInterval(() => {
                    puffSize += 2;
                    puff.style.width = puffSize + 'px';
                    puff.style.height = puffSize + 'px';
                    puff.style.opacity = 1 - puffSize / 25;
                    if (puffSize > 20) { clearInterval(expand); puff.remove(); }
                }, 30);
            }

            if (armAngle >= 70) {
                clearInterval(swing);
                // Squish effect on impact
                plushie.style.transition = 'transform 0.1s';
                plushie.style.transform = `rotate(50deg) scale(1.2, 0.7)`;
                setTimeout(() => {
                    plushie.style.transform = `rotate(50deg) scale(0.9, 1.1)`;
                    setTimeout(() => {
                        if (rightArm) {
                            rightArm.style.transition = 'transform 0.15s ease-out';
                            rightArm.style.transform = originalArmTransform || '';
                            setTimeout(() => {
                                hand.remove();
                                rightArm.style.transition = '';
                            }, 150);
                        }
                    }, 100);
                }, 100);
            }
        }, 28);
    }

    /**
     * Fede's Kick: Passport Throw
     * Extracted from POC lines 5519-5557
     */
    animateKick() {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        // Passport projectile (spinning)
        const passport = document.createElement('div');
        passport.innerHTML = `
            <div style="width: 24px; height: 32px; background: linear-gradient(180deg, #1a3a5c 0%, #0d2840 100%); border-radius: 2px; position: relative; border: 2px solid #0a1f33; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                <div style="position: absolute; top: 4px; left: 50%; transform: translateX(-50%); width: 14px; height: 14px; border: 2px solid #ffd700; border-radius: 50%;"></div>
                <div style="position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); width: 16px; height: 5px; background: #ffd700; border-radius: 1px;"></div>
            </div>
        `;

        let passportX = fighterX + (direction > 0 ? 40 : -40);
        let passportY = 105;
        let rotation = 0;
        passport.style.cssText = `position: absolute; left: ${passportX}px; bottom: ${passportY}px; z-index: 150;`;
        arena.appendChild(passport);

        const speed = 12 * direction;
        const fly = setInterval(() => {
            passportX += speed;
            passportY -= 0.5; // Slight arc down
            rotation += 25 * direction;
            passport.style.left = passportX + 'px';
            passport.style.bottom = passportY + 'px';
            passport.style.transform = `rotate(${rotation}deg)`;

            // Check for hit - PROPER HIT DETECTION
            if (Math.abs(passportX - targetX) < 40) {
                clearInterval(fly);
                // Deal damage through combat system
                this.gameEngine.damageOpponent(this.kickDamage);
                this.gameEngine.addPlayerEnergy(10);
                this.combatSystem.showHitEffect(targetX, 'STAMPED!', '#1a3a5c');

                passport.style.transition = 'transform 0.1s, opacity 0.2s';
                passport.style.transform = `rotate(${rotation}deg) scale(1.3)`;
                passport.style.opacity = '0';
                setTimeout(() => passport.remove(), 200);
            }

            // Off screen
            if (passportX > 900 || passportX < -50) {
                clearInterval(fly);
                passport.remove();
            }
        }, 25);
    }

    /**
     * The Split - Drop into splits with extending legs
     * Extracted from POC lines 9460-9526
     */
    executeTheSplit(move) {
        const fighter = this.element;
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();

        fighter.classList.add('split');

        // Show text
        const splitText = document.createElement('div');
        splitText.textContent = 'THE SPLIT!';
        splitText.style.cssText = `
            position: absolute;
            left: ${fighterX}px;
            bottom: 180px;
            font-family: 'Bangers', cursive;
            font-size: 28px;
            color: #e74c3c;
            text-shadow: 2px 2px 0 #000, 0 0 10px rgba(231,76,60,0.5);
            z-index: 200;
            animation: splitTextPop 0.5s ease-out;
        `;
        arena.appendChild(splitText);
        setTimeout(() => splitText.remove(), 800);

        // Create extending leg visuals that reach toward NPC
        const legReach = 100;
        const leftLegEnd = fighterX - legReach;
        const rightLegEnd = fighterX + 50 + legReach;

        // Right leg kick effect (toward NPC)
        setTimeout(() => {
            // Shockwave from the split
            const wave = document.createElement('div');
            wave.style.cssText = `
                position: absolute;
                left: ${fighterX - 80}px;
                bottom: 55px;
                width: 200px;
                height: 20px;
                background: radial-gradient(ellipse, rgba(231,76,60,0.6) 0%, rgba(231,76,60,0.2) 50%, transparent 70%);
                z-index: 50;
                animation: shockwaveExpand 0.3s ease-out;
            `;
            arena.appendChild(wave);
            setTimeout(() => wave.remove(), 300);

            // Check if right leg hits the NPC (NPC is to the right)
            if (targetX >= fighterX && targetX <= rightLegEnd + 30) {
                this.gameEngine.damageOpponent(move.damage);
                this.combatSystem.showHitEffect(targetX, 'SPLIT KICK!', '#e74c3c');
            }
            // Check if left leg hits (if NPC is to the left)
            else if (targetX <= fighterX && targetX >= leftLegEnd - 30) {
                this.gameEngine.damageOpponent(move.damage);
                this.combatSystem.showHitEffect(targetX, 'SPLIT KICK!', '#e74c3c');
            }
        }, 200);

        setTimeout(() => {
            fighter.classList.remove('split');
            fighter.classList.add('idle');
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: true, damage: move.damage };
    }

    /**
     * Salmon Sashimi - Throw 5 salmon pieces
     * Extracted from POC lines 9528-9571
     */
    executeSalmonSashimi(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sashimi = document.createElement('div');
                sashimi.style.cssText = `
                    position: absolute;
                    left: ${fighterX + (direction > 0 ? 40 : -40)}px;
                    bottom: ${100 + (i - 2) * 15}px;
                    width: 32px;
                    height: 14px;
                    background: linear-gradient(170deg, #ff8c7a 0%, #fa8072 20%, #ffb4a8 22%, #fa8072 24%, #ff8c7a 40%, #ffb4a8 42%, #fa8072 44%, #e76f5a 60%, #ffb4a8 62%, #fa8072 64%, #ff8c7a 80%, #ffb4a8 82%, #e76f5a 100%);
                    border: 2px solid #d85a4a;
                    border-radius: 4px 12px 12px 4px;
                    z-index: 100;
                `;
                arena.appendChild(sashimi);

                let progress = 0;
                const startX = fighterX + (direction > 0 ? 40 : -40);
                const fly = setInterval(() => {
                    progress += 0.08;
                    const x = startX + (targetX - startX) * progress;
                    const wobble = Math.sin(progress * Math.PI * 4) * 5;
                    sashimi.style.left = x + 'px';
                    sashimi.style.bottom = (100 + (i - 2) * 15 + wobble) + 'px';
                    sashimi.style.transform = `rotate(${progress * 180 * direction}deg)`;

                    if (progress >= 1) {
                        clearInterval(fly);
                        // Each sashimi deals damage - PROPER HIT CHECK
                        if (Math.abs(parseFloat(sashimi.style.left) - targetX) < 50) {
                            this.gameEngine.damageOpponent(4);
                            if (i === 2) {
                                this.combatSystem.showHitEffect(targetX, 'OISHI!', '#fa8072');
                            }
                        }
                        sashimi.remove();
                    }
                }, 20);
            }, i * 80);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: true, damage: move.damage };
    }

    /**
     * Country Throw - Throw a random country
     * Extracted from POC lines 9573-9625
     */
    executeCountryThrow(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        const country = this.countries[Math.floor(Math.random() * this.countries.length)];

        const countryEl = document.createElement('div');
        countryEl.style.cssText = `
            position: absolute;
            left: ${fighterX + (direction > 0 ? 40 : -40)}px;
            bottom: 120px;
            z-index: 100;
        `;
        countryEl.appendChild(createCountrySVG(country, 45));
        arena.appendChild(countryEl);

        // Show country name
        const nameText = document.createElement('div');
        nameText.textContent = country.name + '!';
        nameText.style.cssText = `
            position: absolute;
            left: ${fighterX + 60}px;
            bottom: 170px;
            font-family: 'Permanent Marker', cursive;
            font-size: 1rem;
            color: ${country.color};
            z-index: 200;
        `;
        arena.appendChild(nameText);
        setTimeout(() => nameText.remove(), 800);

        let progress = 0;
        const startX = fighterX + (direction > 0 ? 40 : -40);
        const fly = setInterval(() => {
            progress += 0.05;
            const x = startX + (targetX - startX) * progress;
            const arc = Math.sin(progress * Math.PI) * 40;
            countryEl.style.left = x + 'px';
            countryEl.style.bottom = (120 + arc) + 'px';
            countryEl.style.transform = `rotate(${progress * 360 * direction}deg) scale(${1 + progress * 0.3})`;

            if (progress >= 1) {
                clearInterval(fly);
                // Hit detection at destination
                if (Math.abs(parseFloat(countryEl.style.left) - targetX) < 50) {
                    this.gameEngine.damageOpponent(move.damage);
                    this.combatSystem.showHitEffect(targetX, 'BONK!', country.color);
                }

                countryEl.style.transform = 'scale(1.5)';
                countryEl.style.opacity = '0';
                countryEl.style.transition = 'all 0.2s';
                setTimeout(() => countryEl.remove(), 200);

                this.isAttacking = false;
                this.setState('idle');
            }
        }, 25);

        return { hit: true, damage: move.damage };
    }

    /**
     * WORLD TOUR! Ultimate - Throw all countries
     * Extracted from POC lines 9627-9720
     */
    executeWorldTour(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        // Title text
        const nameText = document.createElement('div');
        nameText.textContent = 'WORLD TOUR!';
        nameText.style.cssText = `
            position: absolute;
            left: 50%;
            top: 80px;
            transform: translateX(-50%);
            font-family: 'Permanent Marker', cursive;
            font-size: 2rem;
            color: #ffd700;
            text-shadow: 2px 2px 0 #333;
            z-index: 200;
        `;
        arena.appendChild(nameText);
        setTimeout(() => nameText.remove(), 1500);

        let totalHits = 0;

        this.countries.forEach((country, i) => {
            setTimeout(() => {
                const countryEl = document.createElement('div');
                let countryX = fighterX + (direction > 0 ? 40 : -40);
                countryEl.style.cssText = `
                    position: absolute;
                    left: ${countryX}px;
                    bottom: ${80 + (i % 4) * 20}px;
                    z-index: 100;
                `;
                countryEl.appendChild(createCountrySVG(country, 30));
                arena.appendChild(countryEl);

                let hit = false;
                const speed = 12 * direction;
                const fly = setInterval(() => {
                    countryX += speed;
                    const arc = Math.sin(Math.abs(countryX - fighterX) / 200 * Math.PI) * (15 + (i % 3) * 12);
                    countryEl.style.left = countryX + 'px';
                    countryEl.style.bottom = (80 + (i % 4) * 20 + arc) + 'px';
                    countryEl.style.transform = `rotate(${(countryX - fighterX) * 3 * direction}deg)`;

                    // Check if country hit enemy's CURRENT position
                    if (!hit && Math.abs(countryX - this.gameEngine.state.opponentX) < 40) {
                        hit = true;
                        totalHits++;
                        this.gameEngine.damageOpponent(5);
                    }

                    if ((direction > 0 && countryX > 850) || (direction < 0 && countryX < -50)) {
                        clearInterval(fly);
                        countryEl.style.opacity = '0';
                        countryEl.style.transition = 'opacity 0.15s';
                        setTimeout(() => countryEl.remove(), 150);
                    }
                }, 20);
            }, i * 50);
        });

        // Final impact
        setTimeout(() => {
            if (totalHits > 0) {
                this.gameEngine.damageOpponent(move.damage - 20);
                this.combatSystem.showHitEffect(targetX, 'GLOBETROTTER!', '#ffd700');
            }

            this.isAttacking = false;
            this.setState('idle');
        }, this.countries.length * 50 + 400);

        return { hit: true, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FedeCharacter, FEDE_SPRITE, FEDE_COUNTRIES, createCountrySVG };
}
