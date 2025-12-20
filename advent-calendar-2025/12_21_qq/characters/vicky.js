/**
 * Vicky - Christmas Silks Queen
 *
 * Punch: Handbag Whack
 * Kick: High kick
 * Specials: Silk Wrap (GET OVER HERE!), Naughty List, Ornament Throw, MISTLETOE KISS
 */

// Vicky's sprite template
const VICKY_SPRITE = `
    <div class="fighter vicky idle">
        <div class="head">
            <div class="hair"></div>
            <div class="hair-left"></div>
            <div class="hair-right"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
            <div class="blush left"></div>
            <div class="blush right"></div>
        </div>
        <div class="body">
            <div class="bow"><div class="bow-center"></div></div>
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="skirt"></div>
        <div class="feet"><div class="foot"></div><div class="foot"></div></div>
    </div>
`;

/**
 * Vicky Character Class
 */
class VickyCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'vicky',
            name: 'VICKY',
            color: '#c41e3a',
            punchDamage: 7,
            kickDamage: 9,
            spriteTemplate: VICKY_SPRITE,
            specialMoves: [
                {
                    name: 'Silk Wrap',
                    combo: ['right', 'right', 'z'],
                    damage: 18,
                    energyCost: 25,
                    execute: function(move) { return this.executeSilkWrap(move); }
                },
                {
                    name: 'Naughty List',
                    combo: ['down', 'down', 'x'],
                    damage: 20,
                    energyCost: 25,
                    execute: function(move) { return this.executeNaughtyList(move); }
                },
                {
                    name: 'Ornament Throw',
                    combo: ['left', 'right', 'z'],
                    damage: 15,
                    energyCost: 20,
                    execute: function(move) { return this.executeOrnamentThrow(move); }
                },
                {
                    name: 'MISTLETOE KISS',
                    combo: ['down', 'right', 'down', 'right', 'x'],
                    damage: 45,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeMistletoeKiss(move); }
                }
            ]
        });
    }

    /**
     * Vicky's Punch: Handbag Whack
     */
    animatePunch() {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        // Create handbag
        const bag = document.createElement('div');
        bag.innerHTML = `
            <div style="width: 26px; height: 20px; background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); border-radius: 4px 4px 6px 6px; position: relative; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                <div style="position: absolute; top: -5px; left: 6px; width: 12px; height: 6px; border: 2px solid #ffd700; border-bottom: none; border-radius: 5px 5px 0 0;"></div>
                <div style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 8px; height: 5px; background: #ffd700; border-radius: 2px;"></div>
            </div>
        `;
        bag.style.cssText = `position: absolute; left: ${fighterX + 30 * direction}px; bottom: 100px; z-index: 150; transform: rotate(-40deg);`;
        arena.appendChild(bag);

        let angle = -40;
        let frame = 0;
        const swing = setInterval(() => {
            frame++;
            angle += 10;
            bag.style.transform = `rotate(${angle}deg)`;
            bag.style.left = (fighterX + 30 * direction + frame * 4 * direction) + 'px';

            // Sparkle trail
            if (frame % 2 === 0) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.cssText = `
                    position: absolute;
                    left: ${parseFloat(bag.style.left) + 15}px;
                    bottom: ${95 + Math.random() * 10}px;
                    font-size: 0.6rem;
                    z-index: 149;
                `;
                arena.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 150);
            }

            if (angle >= 50) {
                clearInterval(swing);
                bag.remove();
            }
        }, 25);
    }

    /**
     * Vicky's Kick
     */
    animateKick() {
        if (this.element) {
            this.element.classList.add('kicking');
            setTimeout(() => {
                this.element.classList.remove('kicking');
            }, 300);
        }
    }

    /**
     * Silk Wrap - "GET OVER HERE!" style pull
     */
    executeSilkWrap(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        // Create silk head
        const silkHead = document.createElement('div');
        silkHead.className = 'projectile silk-head';
        silkHead.style.cssText = `position: absolute; left: ${fighterX + 40 * direction}px; bottom: 110px;`;
        arena.appendChild(silkHead);

        // Create silk trail
        const silkTrail = document.createElement('div');
        silkTrail.className = 'projectile silk-trail';
        silkTrail.style.cssText = `position: absolute; left: ${fighterX + 40 * direction}px; bottom: 115px; width: 0px;`;
        arena.appendChild(silkTrail);

        const startX = fighterX + 40 * direction;
        let silkX = startX;
        let caught = false;
        let hitDealt = false;

        const throwSilk = setInterval(() => {
            silkX += 15 * direction;
            silkHead.style.left = silkX + 'px';
            silkTrail.style.width = Math.abs(silkX - startX) + 'px';

            // Check if silk reaches enemy
            const currentTargetX = this.getTargetX();
            if (!caught && Math.abs(silkX - currentTargetX) < 40) {
                caught = true;
                clearInterval(throwSilk);

                this.combatSystem.showHitEffect(currentTargetX, 'GET OVER HERE!', '#e91e8c');

                // Deal damage
                this.damageTarget(move.damage);
                hitDealt = true;

                // Create wrap effect
                const wrap = document.createElement('div');
                wrap.style.cssText = `
                    position: absolute;
                    left: ${currentTargetX - 25}px;
                    bottom: 70px;
                    width: 50px;
                    height: 70px;
                    border: 3px solid #e91e8c;
                    border-radius: 50%;
                    box-shadow: 0 0 12px #e91e8c;
                    z-index: 102;
                `;
                arena.appendChild(wrap);

                setTimeout(() => {
                    silkHead.remove();
                    silkTrail.remove();
                    wrap.remove();
                    this.isAttacking = false;
                    this.setState('idle');
                }, 600);
            }

            // Missed
            if ((direction > 0 && silkX > 850) || (direction < 0 && silkX < 0)) {
                clearInterval(throwSilk);
                silkHead.remove();
                silkTrail.remove();
                this.combatSystem.showHitEffect(fighterX, 'Missed!', '#888');
                this.isAttacking = false;
                this.setState('idle');
            }
        }, 20);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Naughty List - Rain coal from above
     */
    executeNaughtyList(move) {
        const arena = this.arena;
        const targetX = this.getTargetX();
        let totalHits = 0;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const coal = document.createElement('div');
                coal.className = 'projectile coal';
                const coalX = targetX - 30 + i * 15 + (Math.random() - 0.5) * 30;
                coal.style.cssText = `position: absolute; left: ${coalX}px; bottom: 280px;`;
                arena.appendChild(coal);

                let coalY = 280;
                const fallCoal = setInterval(() => {
                    coalY -= 12;
                    coal.style.bottom = coalY + 'px';
                    coal.style.transform = `rotate(${(280 - coalY) * 3}deg)`;

                    // Check if coal hits
                    const currentTargetX = this.getTargetX();
                    if (coalY < 100 && Math.abs(coalX - currentTargetX) < 35) {
                        clearInterval(fallCoal);
                        if (totalHits === 0) {
                            this.damageTarget(move.damage);
                            this.combatSystem.showHitEffect(currentTargetX, 'NAUGHTY!', '#1a1a1a');
                        }
                        totalHits++;
                        coal.remove();
                    } else if (coalY < 60) {
                        clearInterval(fallCoal);
                        coal.remove();
                    }
                }, 25);
            }, i * 100);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: totalHits > 0, damage: move.damage };
    }

    /**
     * Ornament Throw - Throw Christmas ornaments
     */
    executeOrnamentThrow(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        const colors = ['#c41e3a', '#ffd700', '#27ae60', '#e91e8c'];
        let hitDealt = false;

        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ornament = document.createElement('div');
                ornament.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 35 * direction}px;
                    bottom: ${100 + i * 15}px;
                    width: 14px;
                    height: 14px;
                    background: radial-gradient(circle at 30% 30%, ${colors[i]}, ${colors[i]}88);
                    border: 2px solid var(--ink);
                    border-radius: 50%;
                    box-shadow: 0 0 5px ${colors[i]};
                    z-index: 150;
                `;
                arena.appendChild(ornament);

                let ornX = fighterX + 35 * direction;
                const fly = setInterval(() => {
                    ornX += 12 * direction;
                    ornament.style.left = ornX + 'px';
                    ornament.style.transform = `rotate(${ornX * 5}deg)`;

                    const currentTargetX = this.getTargetX();
                    if (Math.abs(ornX - currentTargetX) < 35) {
                        clearInterval(fly);
                        if (!hitDealt) {
                            this.damageTarget(move.damage);
                            this.combatSystem.showHitEffect(currentTargetX, 'SMASH!', colors[i]);
                            hitDealt = true;
                        }
                        ornament.remove();
                    } else if (ornX > 850 || ornX < 0) {
                        clearInterval(fly);
                        ornament.remove();
                    }
                }, 25);
            }, i * 80);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 500);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * MISTLETOE KISS - Ultimate
     */
    executeMistletoeKiss(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);

        if (distance > 200) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        // Create mistletoe
        const mistletoe = document.createElement('div');
        mistletoe.innerHTML = '🎄💋';
        mistletoe.style.cssText = `
            position: absolute;
            left: ${(fighterX + targetX) / 2}px;
            bottom: 200px;
            font-size: 2rem;
            z-index: 160;
            animation: pulse 0.3s ease-in-out infinite;
        `;
        arena.appendChild(mistletoe);

        // Hearts rain down
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = '💖';
                heart.style.cssText = `
                    position: absolute;
                    left: ${targetX - 50 + Math.random() * 100}px;
                    bottom: 250px;
                    font-size: 1.2rem;
                    z-index: 155;
                `;
                arena.appendChild(heart);

                let hY = 250;
                const fall = setInterval(() => {
                    hY -= 6;
                    heart.style.bottom = hY + 'px';
                    heart.style.opacity = hY / 250;
                    if (hY < 80) {
                        clearInterval(fall);
                        heart.remove();
                    }
                }, 30);
            }, i * 80);
        }

        // Damage over time
        let hits = 0;
        const damageInterval = setInterval(() => {
            this.damageTarget(Math.floor(move.damage / 5));
            hits++;
            if (hits >= 5) {
                clearInterval(damageInterval);
            }
        }, 150);

        this.combatSystem.showHitEffect(targetX, '💋 KISS OF DOOM!', '#e91e8c');
        this.combatSystem.screenShake(6, 300);

        setTimeout(() => {
            mistletoe.remove();
            this.isAttacking = false;
            this.setState('idle');
        }, 1000);

        return { hit: true, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VickyCharacter, VICKY_SPRITE };
}
