/**
 * Frank - The Sweet Transvestite
 *
 * Punch: Dramatic Slap
 * Kick: Platform Stomp
 * Specials: Sweet Transvestite, Lab Lightning, Time Warp, FLOOR SHOW!
 */

// Frank's sprite template
const FRANK_SPRITE = `
    <div class="fighter frank idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="legs">
            <div class="leg"><div class="shoe"></div></div>
            <div class="leg"><div class="shoe"></div></div>
        </div>
    </div>
`;

/**
 * Frank Character Class
 */
class FrankCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'frank',
            name: 'FRANK',
            color: '#cc0033',
            punchDamage: 8,
            kickDamage: 10,
            spriteTemplate: FRANK_SPRITE,
            specialMoves: [
                {
                    name: 'Sweet Transvestite',
                    combo: ['down', 'down', 'z'],
                    damage: 15,
                    energyCost: 20,
                    execute: function(move) { return this.executeSweetTransvestite(move); }
                },
                {
                    name: 'Lab Lightning',
                    combo: ['down', 'right', 'z'],
                    damage: 25,
                    energyCost: 25,
                    execute: function(move) { return this.executeLabLightning(move); }
                },
                {
                    name: 'Time Warp',
                    combo: ['left', 'down', 'right', 'x'],
                    damage: 0,
                    energyCost: 30,
                    execute: function(move) { return this.executeTimeWarp(move); }
                },
                {
                    name: 'FLOOR SHOW!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 55,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeFloorShow(move); }
                }
            ]
        });
    }

    /**
     * Frank's Dramatic Slap
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.12s ease-out';
                rightArm.style.transform = 'rotate(75deg) translateX(6px)';
                setTimeout(() => {
                    rightArm.style.transform = 'rotate(-10deg)';
                }, 200);
            }
        }
    }

    /**
     * Frank's Platform Stomp
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
     * Sweet Transvestite - Charm attack with hearts
     */
    executeSweetTransvestite(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        this.combatSystem.showHitEffect(fighterX, "I'm just a sweet transvestite!", '#cc0033');

        // Create floating hearts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'charm-heart';
                heart.textContent = '';
                heart.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 20 * direction}px;
                    bottom: ${120 + i * 10}px;
                `;
                arena.appendChild(heart);

                let heartX = fighterX + 20 * direction;
                const floatHeart = setInterval(() => {
                    heartX += 8 * direction;
                    heart.style.left = heartX + 'px';

                    // Check hit
                    const currentTargetX = this.getTargetX();
                    if (!hitDealt && Math.abs(heartX - currentTargetX) < 40) {
                        this.damageTarget(move.damage);
                        this.combatSystem.showHitEffect(currentTargetX, 'CHARMED!', '#cc0033');
                        hitDealt = true;
                        clearInterval(floatHeart);
                        heart.remove();
                    }

                    if (Math.abs(heartX - fighterX) > 300) {
                        clearInterval(floatHeart);
                        heart.remove();
                    }
                }, 30);
            }, i * 100);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Lab Lightning - Electric attack
     */
    executeLabLightning(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create lightning bolts
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const bolt = document.createElement('div');
                bolt.className = 'lightning-bolt';
                bolt.style.cssText = `
                    position: absolute;
                    left: ${fighterX + (50 + i * 80) * direction}px;
                    bottom: 180px;
                `;
                arena.appendChild(bolt);

                let boltY = 180;
                const strikeBolt = setInterval(() => {
                    boltY -= 15;
                    bolt.style.bottom = boltY + 'px';

                    // Check hit when bolt reaches ground
                    const currentTargetX = this.getTargetX();
                    if (boltY < 80 && Math.abs(parseFloat(bolt.style.left) - currentTargetX) < 50) {
                        if (!hitDealt) {
                            this.damageTarget(move.damage);
                            this.combatSystem.showHitEffect(currentTargetX, 'SHOCKING!', '#ffd700');
                            this.combatSystem.screenShake(4, 150);
                            hitDealt = true;
                        }
                    }

                    if (boltY < 60) {
                        clearInterval(strikeBolt);
                        bolt.remove();
                    }
                }, 25);
            }, i * 150);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Time Warp - Teleport move
     */
    executeTimeWarp(move) {
        const arena = this.arena;
        const fighter = this.element;
        const startX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();
        const newX = targetX - 80 * direction;

        // Create portal at start
        const portal1 = document.createElement('div');
        portal1.className = 'time-portal';
        portal1.style.cssText = `
            position: absolute;
            left: ${startX - 25}px;
            bottom: 80px;
            width: 50px;
            height: 80px;
        `;
        arena.appendChild(portal1);

        // Create portal at destination
        const portal2 = document.createElement('div');
        portal2.className = 'time-portal';
        portal2.style.cssText = `
            position: absolute;
            left: ${newX - 25}px;
            bottom: 80px;
            width: 50px;
            height: 80px;
        `;
        arena.appendChild(portal2);

        this.combatSystem.showHitEffect(startX, "Let's do the Time Warp!", '#9b59b6');

        // Fade out
        setTimeout(() => {
            if (fighter) {
                fighter.style.transition = 'opacity 0.2s';
                fighter.style.opacity = '0';
            }
        }, 200);

        // Teleport
        setTimeout(() => {
            this.x = newX;
            if (fighter) {
                fighter.style.left = newX + 'px';
                fighter.style.opacity = '1';
            }
            this.facingRight = direction > 0;
        }, 400);

        // Clean up
        setTimeout(() => {
            portal1.remove();
            portal2.remove();
            this.isAttacking = false;
            this.setState('idle');
        }, 600);

        return { hit: false, damage: 0 };
    }

    /**
     * FLOOR SHOW! - Ultimate: Dramatic performance
     */
    executeFloorShow(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);

        if (distance > 300) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        let totalHits = 0;

        this.combatSystem.showHitEffect(fighterX, 'FLOOR SHOW!', '#cc0033');

        // Spotlight effect
        const spotlight = document.createElement('div');
        spotlight.style.cssText = `
            position: absolute;
            left: ${fighterX - 50}px;
            bottom: 60px;
            width: 100px;
            height: 200px;
            background: linear-gradient(transparent, rgba(255, 215, 0, 0.3));
            clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
            z-index: 5;
            animation: spotlightPulse 0.5s ease-in-out infinite;
        `;
        arena.appendChild(spotlight);

        // Dramatic poses with damage
        const poses = ['DRAMA!', 'GLAMOUR!', 'FINALE!'];
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const poseText = document.createElement('div');
                poseText.textContent = poses[i];
                poseText.style.cssText = `
                    position: absolute;
                    left: ${fighterX - 30}px;
                    bottom: ${150 + i * 20}px;
                    font-family: 'Finger Paint', cursive;
                    font-size: 1.3rem;
                    color: #cc0033;
                    text-shadow: 2px 2px 0 #ffd700;
                    z-index: 160;
                    animation: hitFloat 0.5s ease-out forwards;
                `;
                arena.appendChild(poseText);
                setTimeout(() => poseText.remove(), 500);

                // Damage on each pose
                const currentTargetX = this.getTargetX();
                if (Math.abs(fighterX - currentTargetX) < 200) {
                    this.damageTarget(Math.floor(move.damage / 3));
                    totalHits++;
                }

                this.combatSystem.screenShake(3, 100);
            }, i * 300);
        }

        // Final burst of sparkles
        setTimeout(() => {
            for (let i = 0; i < 10; i++) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '';
                sparkle.style.cssText = `
                    position: absolute;
                    left: ${fighterX + (Math.random() - 0.5) * 100}px;
                    bottom: ${80 + Math.random() * 100}px;
                    font-size: 1.5rem;
                    z-index: 160;
                `;
                arena.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 500);
            }
            spotlight.remove();
        }, 1000);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1200);

        return { hit: totalHits > 0, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FrankCharacter, FRANK_SPRITE };
}
