/**
 * Pato - The Bitcoin Director
 *
 * Punch: Quick Jab
 * Kick: Director Kick
 * Specials: Bitcoin Throw, Director's Cut, Stack Overflow, TO THE MOON!
 */

// Pato's sprite template
const PATO_SPRITE = `
    <div class="fighter pato idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <span class="logo">B</span>
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="legs"><div class="leg"></div><div class="leg"></div></div>
    </div>
`;

/**
 * Pato Character Class
 */
class PatoCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'pato',
            name: 'PATO',
            color: '#f39c12',
            punchDamage: 8,
            kickDamage: 10,
            spriteTemplate: PATO_SPRITE,
            specialMoves: [
                {
                    name: 'Bitcoin Throw',
                    combo: ['down', 'left', 'z'],
                    damage: 15,
                    energyCost: 20,
                    execute: function(move) { return this.executeBitcoinThrow(move); }
                },
                {
                    name: "Director's Cut",
                    combo: ['right', 'right', 'z'],
                    damage: 20,
                    energyCost: 25,
                    execute: function(move) { return this.executeDirectorsCut(move); }
                },
                {
                    name: 'Stack Overflow',
                    combo: ['down', 'down', 'x'],
                    damage: 18,
                    energyCost: 25,
                    execute: function(move) { return this.executeStackOverflow(move); }
                },
                {
                    name: 'TO THE MOON!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 40,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeToTheMoon(move); }
                }
            ]
        });
    }

    /**
     * Pato's Quick Jab
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.12s ease-out';
                rightArm.style.transform = 'rotate(75deg) translateX(5px)';
                setTimeout(() => {
                    rightArm.style.transform = 'rotate(-10deg)';
                }, 200);
            }
        }
    }

    /**
     * Pato's Director Kick
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
     * Bitcoin Throw - Throw bitcoin coins at enemy
     */
    executeBitcoinThrow(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Throw 2 coins in quick succession
        const coinOffsets = [0, 120];
        const coinHeights = [130, 115];

        coinOffsets.forEach((delay, i) => {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'bitcoin-coin';
                coin.textContent = '₿';
                coin.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 50 * direction}px;
                    bottom: ${coinHeights[i]}px;
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #f7931a 0%, #ffb347 50%, #f7931a 100%);
                    border: 3px solid #c77800;
                    border-radius: 50%;
                    z-index: 155;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 16px;
                    color: #fff;
                    text-shadow: 1px 1px 0 #c77800;
                    box-shadow: 0 0 8px rgba(247,147,26,0.5);
                `;
                arena.appendChild(coin);

                const startX = fighterX + 50 * direction;
                let progress = 0;

                const coinFly = setInterval(() => {
                    progress += 0.06;
                    const currentTargetX = this.getTargetX();
                    const currentX = startX + (currentTargetX - startX) * progress;
                    const arc = Math.sin(progress * Math.PI) * (25 + i * 10);

                    coin.style.left = currentX + 'px';
                    coin.style.bottom = (coinHeights[i] + arc) + 'px';
                    coin.style.transform = `rotate(${progress * 720}deg)`;

                    // Sparkle trail
                    if (progress > 0.1 && progress < 0.9 && Math.random() > 0.7) {
                        const sparkle = document.createElement('div');
                        sparkle.textContent = '✦';
                        sparkle.style.cssText = `
                            position: absolute;
                            font-size: 0.8rem;
                            color: #f7931a;
                            opacity: 0.8;
                            z-index: 150;
                            pointer-events: none;
                            left: ${currentX + Math.random() * 10}px;
                            bottom: ${coinHeights[i] + arc - 5}px;
                        `;
                        arena.appendChild(sparkle);
                        setTimeout(() => sparkle.remove(), 150);
                    }

                    // Check hit at current enemy position
                    const hitTargetX = this.getTargetX();
                    if (!hitDealt && Math.abs(currentX - hitTargetX) < 40) {
                        this.damageTarget(move.damage);
                        this.combatSystem.showHitEffect(hitTargetX, '₿', '#f7931a');
                        hitDealt = true;
                        clearInterval(coinFly);
                        coin.remove();
                    }

                    if (progress >= 1) {
                        clearInterval(coinFly);
                        if (i === 1 && !hitDealt) {
                            // Second coin shows price up effect even if miss
                            const priceUp = document.createElement('div');
                            priceUp.textContent = '+%';
                            priceUp.style.cssText = `
                                position: absolute;
                                font-family: 'Patrick Hand', cursive;
                                font-size: 1rem;
                                color: #27ae60;
                                z-index: 160;
                                left: ${currentX}px;
                                bottom: 160px;
                            `;
                            arena.appendChild(priceUp);

                            let upProgress = 0;
                            const floatUp = setInterval(() => {
                                upProgress += 0.1;
                                priceUp.style.bottom = (160 + upProgress * 20) + 'px';
                                priceUp.style.opacity = 1 - upProgress;
                                if (upProgress >= 1) {
                                    clearInterval(floatUp);
                                    priceUp.remove();
                                }
                            }, 30);
                        }
                        coin.remove();
                    }
                }, 25);
            }, delay);
        });

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 600);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Director's Cut - Rush forward with film strip trail
     */
    executeDirectorsCut(move) {
        const arena = this.arena;
        const startX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create film strip trail
        const film = document.createElement('div');
        film.className = 'film-strip';
        film.style.cssText = `
            position: absolute;
            left: ${startX - 60 * direction}px;
            bottom: 115px;
            width: 80px;
            height: 18px;
            background: repeating-linear-gradient(90deg, var(--ink) 0px, var(--ink) 12px, var(--paper) 12px, var(--paper) 16px);
            border: 2px solid var(--ink);
            z-index: 90;
        `;
        arena.appendChild(film);

        let progress = 0;
        const rushDistance = 250;

        const rushInterval = setInterval(() => {
            progress += 0.06;
            const currentX = startX + rushDistance * progress * direction;
            this.x = currentX;

            if (this.element) {
                this.element.style.left = currentX + 'px';
            }

            // Film strip trails behind
            film.style.left = (currentX - 60 * direction) + 'px';
            film.style.width = (80 + progress * 40) + 'px';

            // Check collision during rush
            const targetX = this.getTargetX();
            if (!hitDealt && Math.abs(currentX - targetX) < 60) {
                this.damageTarget(move.damage);
                hitDealt = true;

                // Show "CUT!" callout
                const cutText = document.createElement('div');
                cutText.textContent = 'CUT!';
                cutText.style.cssText = `
                    position: absolute;
                    font-family: 'Permanent Marker', cursive;
                    font-size: 2rem;
                    color: #f39c12;
                    left: ${currentX + 40 * direction}px;
                    bottom: 170px;
                    z-index: 160;
                    animation: hitFloat 0.5s ease-out forwards;
                `;
                arena.appendChild(cutText);
                setTimeout(() => cutText.remove(), 400);

                this.combatSystem.screenShake(3, 100);
            }

            if (progress >= 1) {
                clearInterval(rushInterval);
                film.remove();
                this.isAttacking = false;
                this.setState('idle');
            }
        }, 25);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Stack Overflow - Rain of code brackets on enemy
     */
    executeStackOverflow(move) {
        const arena = this.arena;
        const targetX = this.getTargetX();

        const brackets = ['{', '}', '[', ']', '</>'];
        let hitsLanded = 0;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const bracket = document.createElement('div');
                bracket.className = 'code-bracket';
                bracket.textContent = brackets[i];
                bracket.style.cssText = `
                    position: absolute;
                    font-family: monospace;
                    font-size: 2rem;
                    font-weight: bold;
                    color: #f39c12;
                    z-index: 150;
                    left: ${targetX - 40 + i * 20}px;
                    top: -40px;
                `;
                arena.appendChild(bracket);

                let y = -40;
                const targetY = 120; // Where the enemy is

                const fall = setInterval(() => {
                    y += 15;
                    bracket.style.top = y + 'px';
                    bracket.style.transform = `scale(${1 + y / 150}) rotate(${y * 2}deg)`;

                    // Check if bracket hit the enemy (enemy is at bottom ~68px, so y needs to reach ~130)
                    const currentTargetX = this.getTargetX();
                    if (y >= targetY && Math.abs(parseFloat(bracket.style.left) - currentTargetX) < 50) {
                        clearInterval(fall);
                        if (hitsLanded < 3) {
                            this.damageTarget(Math.floor(move.damage / 3));
                            hitsLanded++;
                        }
                        bracket.style.color = '#e74c3c';
                        bracket.style.transform += ' scale(1.5)';
                        setTimeout(() => bracket.remove(), 150);
                    } else if (y > 200) {
                        clearInterval(fall);
                        bracket.remove();
                    }
                }, 20);
            }, i * 100);
        }

        // Show ERROR 500 at the end
        setTimeout(() => {
            const errorText = document.createElement('div');
            errorText.textContent = 'ERROR 500!';
            errorText.style.cssText = `
                position: absolute;
                font-size: 2.5rem;
                font-family: monospace;
                font-weight: bold;
                color: #f39c12;
                left: ${targetX}px;
                bottom: 180px;
                z-index: 160;
                animation: hitFloat 0.5s ease-out forwards;
            `;
            arena.appendChild(errorText);
            this.combatSystem.screenShake(4, 150);
            setTimeout(() => errorText.remove(), 500);
        }, 600);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1000);

        return { hit: hitsLanded > 0, damage: move.damage };
    }

    /**
     * TO THE MOON! - Ultimate: Bitcoin rocket attack
     */
    executeToTheMoon(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        this.combatSystem.showHitEffect(fighterX, 'TO THE MOON!', '#f39c12');

        // Create rocket
        const rocket = document.createElement('div');
        rocket.className = 'pato-rocket';
        rocket.innerHTML = `
            <div class="rocket-body" style="transform: rotate(90deg);">
                <span>B</span>
                <div class="rocket-fin left"></div>
                <div class="rocket-fin right"></div>
            </div>
            <div class="rocket-flame" style="transform: rotate(90deg);"></div>
        `;
        rocket.style.cssText = `
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 150;
            left: ${fighterX + 30 * direction}px;
            bottom: 80px;
        `;
        arena.appendChild(rocket);

        let rocketX = fighterX + 30 * direction;
        let rocketY = 80;
        let phase = 'horizontal';

        const createTrail = () => {
            const trail = document.createElement('div');
            trail.style.cssText = `
                position: absolute;
                left: ${rocketX}px;
                bottom: ${rocketY}px;
                width: 15px;
                height: 15px;
                background: radial-gradient(circle, #ff6600, transparent);
                border-radius: 50%;
                z-index: 100;
                pointer-events: none;
            `;
            arena.appendChild(trail);
            setTimeout(() => trail.remove(), 300);
        };

        const flyRocket = setInterval(() => {
            createTrail();

            if (phase === 'horizontal') {
                rocketX += 12 * direction;
                rocket.style.left = rocketX + 'px';

                // Check if reached enemy's current X position
                const targetX = this.getTargetX();
                if (Math.abs(rocketX - targetX) < 30) {
                    phase = 'vertical';
                    // Rotate rocket upward
                    const rocketBody = rocket.querySelector('.rocket-body');
                    const rocketFlame = rocket.querySelector('.rocket-flame');
                    if (rocketBody) rocketBody.style.transform = 'rotate(0deg)';
                    if (rocketFlame) rocketFlame.style.transform = 'rotate(0deg)';
                } else if (Math.abs(rocketX - fighterX) > 500) {
                    // Missed - went off screen
                    clearInterval(flyRocket);
                    rocket.remove();
                    this.combatSystem.showHitEffect(rocketX, 'MISSED!', '#888');
                    this.isAttacking = false;
                    this.setState('idle');
                }
            } else if (phase === 'vertical') {
                rocketY += 20;
                rocket.style.bottom = rocketY + 'px';

                // Check if enemy is still at this X position during launch
                const targetX = this.getTargetX();
                if (rocketY < 200 && Math.abs(rocketX - targetX) < 50 && !hitDealt) {
                    hitDealt = true;
                    clearInterval(flyRocket);
                    rocket.remove();

                    // Explosion effect
                    const explosion = document.createElement('div');
                    explosion.style.cssText = `
                        position: absolute;
                        left: ${rocketX - 40}px;
                        bottom: ${rocketY}px;
                        width: 80px;
                        height: 80px;
                        background: radial-gradient(circle, #ff6600, #ff0000, transparent);
                        border-radius: 50%;
                        z-index: 160;
                    `;
                    arena.appendChild(explosion);

                    const wagmi = document.createElement('div');
                    wagmi.textContent = 'WAGMI!';
                    wagmi.style.cssText = `
                        position: absolute;
                        left: 50%;
                        bottom: 200px;
                        transform: translateX(-50%);
                        font-size: 3rem;
                        font-family: 'Finger Paint', cursive;
                        color: #f39c12;
                        z-index: 165;
                        animation: hitFloat 0.8s ease-out forwards;
                    `;
                    arena.appendChild(wagmi);

                    this.damageTarget(move.damage);
                    this.combatSystem.screenShake(6, 400);

                    setTimeout(() => {
                        explosion.remove();
                        wagmi.remove();
                    }, 800);

                    this.isAttacking = false;
                    this.setState('idle');
                } else if (rocketY > 400) {
                    // Rocket flew past - enemy dodged
                    clearInterval(flyRocket);
                    rocket.remove();
                    this.combatSystem.showHitEffect(rocketX, 'DODGED!', '#888');
                    this.isAttacking = false;
                    this.setState('idle');
                }
            }
        }, 30);

        return { hit: hitDealt, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PatoCharacter, PATO_SPRITE };
}
