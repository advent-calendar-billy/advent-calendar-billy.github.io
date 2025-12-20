/**
 * Lucas - The Soccer Star
 *
 * Punch: Elbow Strike
 * Kick: Soccer Kick
 * Specials: Bicycle Kick, Cat Throw, Sliding Tackle, HAT TRICK!
 */

// Lucas's sprite template
const LUCAS_SPRITE = `
    <div class="fighter lucas idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <span class="jersey-num">10</span>
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="legs">
            <div class="leg"><div class="sock"></div></div>
            <div class="leg"><div class="sock"></div></div>
        </div>
    </div>
`;

/**
 * Lucas Character Class
 */
class LucasCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'lucas',
            name: 'LUCAS',
            color: '#9b59b6',
            punchDamage: 8,
            kickDamage: 10,
            spriteTemplate: LUCAS_SPRITE,
            specialMoves: [
                {
                    name: 'Bicycle Kick',
                    combo: ['left', 'right', 'x'],
                    damage: 20,
                    energyCost: 25,
                    execute: function(move) { return this.executeBicycleKick(move); }
                },
                {
                    name: 'Cat Throw',
                    combo: ['down', 'left', 'z'],
                    damage: 18,
                    energyCost: 20,
                    execute: function(move) { return this.executeCatThrow(move); }
                },
                {
                    name: 'Sliding Tackle',
                    combo: ['right', 'right', 'x'],
                    damage: 15,
                    energyCost: 15,
                    execute: function(move) { return this.executeSlidingTackle(move); }
                },
                {
                    name: 'HAT TRICK!',
                    combo: ['down', 'right', 'down', 'right', 'x'],
                    damage: 45,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeHatTrick(move); }
                }
            ]
        });
    }

    /**
     * Lucas's Punch: Elbow Strike
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.12s ease-out';
                rightArm.style.transform = 'rotate(80deg) translateX(5px)';
                setTimeout(() => {
                    rightArm.style.transform = '';
                }, 200);
            }
        }
    }

    /**
     * Lucas's Kick: Soccer Kick
     */
    animateKick() {
        if (this.element) {
            this.element.classList.add('kicking');
            setTimeout(() => {
                this.element.classList.remove('kicking');
            }, 350);
        }
    }

    /**
     * Bicycle Kick - Acrobatic overhead kick
     */
    executeBicycleKick(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        // Check if in range (mid-range attack)
        if (distance > 350) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        // Bicycle kick animation
        if (this.element) {
            this.element.classList.add('special-bicycle');
        }

        let hitDealt = false;

        // Create soccer ball after wind-up
        setTimeout(() => {
            const ball = document.createElement('div');
            ball.className = 'projectile soccer-ball';
            ball.style.cssText = `position: absolute; left: ${fighterX + 30 * direction}px; bottom: 180px;`;
            arena.appendChild(ball);

            const startX = fighterX + 30 * direction;
            let progress = 0;

            const kickAnim = setInterval(() => {
                progress += 0.06;
                const currentTargetX = this.getTargetX();
                const currentX = startX + (currentTargetX - startX) * progress;
                const arc = Math.sin(progress * Math.PI) * 80;

                ball.style.left = currentX + 'px';
                ball.style.bottom = (100 + arc) + 'px';
                ball.style.transform = `rotate(${progress * 720}deg)`;

                // Check for hit when ball reaches target
                if (progress >= 0.9 && !hitDealt) {
                    const finalTargetX = this.getTargetX();
                    if (Math.abs(currentX - finalTargetX) < 50) {
                        this.damageTarget(move.damage);
                        this.combatSystem.showHitEffect(finalTargetX, 'GOLAZO!', '#9b59b6');
                        hitDealt = true;
                    }
                }

                if (progress >= 1) {
                    clearInterval(kickAnim);
                    ball.remove();
                }
            }, 25);
        }, 300);

        setTimeout(() => {
            if (this.element) {
                this.element.classList.remove('special-bicycle');
            }
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Cat Throw - Throw two cats at the opponent
     */
    executeCatThrow(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        const catData = [
            { color: '#f39c12', text: 'MEOW!' },  // Orange cat
            { color: '#7f8c8d', text: 'HISS!' }   // Gray cat
        ];

        let totalHits = 0;

        catData.forEach((catInfo, i) => {
            setTimeout(() => {
                // Create cat projectile
                const cat = document.createElement('div');
                cat.style.cssText = `
                    position: absolute;
                    width: 45px;
                    height: 35px;
                    z-index: 200;
                    pointer-events: none;
                `;

                // Cat body
                const body = document.createElement('div');
                body.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 35px;
                    height: 22px;
                    background: ${catInfo.color};
                    border: 3px solid #333;
                    border-radius: 50%;
                `;

                // Cat head
                const head = document.createElement('div');
                head.style.cssText = `
                    position: absolute;
                    bottom: 10px;
                    right: 0;
                    width: 22px;
                    height: 20px;
                    background: ${catInfo.color};
                    border: 3px solid #333;
                    border-radius: 50%;
                `;

                // Cat ears
                const ear1 = document.createElement('div');
                ear1.style.cssText = `
                    position: absolute;
                    top: -8px;
                    left: 2px;
                    width: 0;
                    height: 0;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-bottom: 10px solid ${catInfo.color};
                `;

                const ear2 = document.createElement('div');
                ear2.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: 2px;
                    width: 0;
                    height: 0;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-bottom: 10px solid ${catInfo.color};
                `;

                head.appendChild(ear1);
                head.appendChild(ear2);
                cat.appendChild(body);
                cat.appendChild(head);

                // Position at Lucas's hands
                const startX = fighterX + 40 * direction;
                const startBottom = 130;
                cat.style.left = startX + 'px';
                cat.style.bottom = startBottom + 'px';
                arena.appendChild(cat);

                // Animate cat flying in an arc
                let progress = 0;
                const catFly = setInterval(() => {
                    progress += 0.03;
                    const currentTargetX = this.getTargetX();
                    const currentX = startX + (currentTargetX - startX) * progress;
                    const arc = Math.sin(progress * Math.PI) * 70;

                    cat.style.left = currentX + 'px';
                    cat.style.bottom = (startBottom + arc) + 'px';
                    cat.style.transform = `rotate(${progress * 360}deg)`;

                    // Check for hit
                    if (progress >= 0.9) {
                        const finalTargetX = this.getTargetX();
                        if (Math.abs(currentX - finalTargetX) < 45) {
                            clearInterval(catFly);
                            this.damageTarget(Math.floor(move.damage / 2));
                            this.combatSystem.showHitEffect(finalTargetX, catInfo.text, catInfo.color);
                            totalHits++;
                            cat.remove();
                            return;
                        }
                    }

                    if (progress >= 1) {
                        clearInterval(catFly);
                        cat.remove();
                    }
                }, 25);
            }, i * 300);
        });

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1400);

        return { hit: totalHits > 0, damage: move.damage };
    }

    /**
     * Sliding Tackle - Slide toward enemy
     */
    executeSlidingTackle(move) {
        const arena = this.arena;
        const fighter = this.element;
        const startX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        if (fighter) {
            fighter.classList.add('sliding');
        }

        let slideProgress = 0;
        const slide = setInterval(() => {
            slideProgress += 0.08;
            this.x = startX + slideProgress * 150 * direction;

            if (fighter) {
                fighter.style.left = this.x + 'px';
                fighter.style.transform = `rotate(${-15 * direction}deg) translateY(10px)`;
            }

            // Check for hit during slide
            const targetX = this.getTargetX();
            if (!hitDealt && Math.abs(this.x - targetX) < 60) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(targetX, 'TACKLE!', '#9b59b6');
                hitDealt = true;
            }

            if (slideProgress >= 1) {
                clearInterval(slide);
                if (fighter) {
                    fighter.style.transform = '';
                    fighter.classList.remove('sliding');
                }
                this.isAttacking = false;
                this.setState('idle');
            }
        }, 30);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * HAT TRICK! - Ultimate: Three soccer balls
     */
    executeHatTrick(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        // Check range
        if (distance > 400) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        let totalHits = 0;

        // Three soccer balls kicked in sequence
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ball = document.createElement('div');
                ball.className = 'projectile soccer-ball';
                ball.style.cssText = `position: absolute; left: ${fighterX + (30 + i * 20) * direction}px; bottom: 100px;`;
                arena.appendChild(ball);

                const startX = fighterX + (30 + i * 20) * direction;
                const arcHeight = 60 + i * 30;

                let progress = 0;
                const ballFly = setInterval(() => {
                    progress += 0.07;
                    const currentTargetX = this.getTargetX();
                    const currentX = startX + (currentTargetX - startX) * progress;
                    const arc = Math.sin(progress * Math.PI) * arcHeight;

                    ball.style.left = currentX + 'px';
                    ball.style.bottom = (100 + arc) + 'px';
                    ball.style.transform = `rotate(${progress * 540}deg)`;

                    if (progress >= 0.9) {
                        const finalTargetX = this.getTargetX();
                        if (Math.abs(currentX - finalTargetX) < 50) {
                            clearInterval(ballFly);
                            this.damageTarget(Math.floor(move.damage / 3));
                            this.combatSystem.showHitEffect(finalTargetX, i === 2 ? 'HAT TRICK!' : 'GOAL!', '#9b59b6');
                            totalHits++;
                            ball.remove();
                            return;
                        }
                    }

                    if (progress >= 1) {
                        clearInterval(ballFly);
                        ball.remove();
                    }
                }, 25);
            }, i * 250);
        }

        // Show HAT TRICK text at the end
        setTimeout(() => {
            const htText = document.createElement('div');
            htText.textContent = 'HAT TRICK!';
            htText.style.cssText = `
                position: absolute;
                left: 50%;
                top: 35%;
                transform: translateX(-50%);
                font-family: 'Finger Paint', cursive;
                font-size: 2.5rem;
                color: #9b59b6;
                text-shadow: 2px 2px 0 var(--ink);
                z-index: 200;
                animation: hitFloat 0.8s ease-out forwards;
            `;
            arena.appendChild(htText);
            setTimeout(() => htText.remove(), 800);
        }, 800);

        this.combatSystem.screenShake(5, 300);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1200);

        return { hit: totalHits > 0, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LucasCharacter, LUCAS_SPRITE };
}
