/**
 * Madonna - The Pop Queen
 *
 * Punch: Diva Slap
 * Kick: High Heel Kick
 * Specials: Vogue Strike, Mic Drop, Blond Ambition, MATERIAL WORLD!
 */

// Madonna's sprite template
const MADONNA_SPRITE = `
    <div class="fighter madonna idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
            <div class="beauty-mark"></div>
        </div>
        <div class="body">
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="skirt"></div>
        <div class="feet"><div class="foot"></div><div class="foot"></div></div>
    </div>
`;

/**
 * Madonna Character Class
 */
class MadonnaCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'madonna',
            name: 'MADONNA',
            color: '#e91e8c',
            punchDamage: 7,
            kickDamage: 9,
            spriteTemplate: MADONNA_SPRITE,
            specialMoves: [
                {
                    name: 'Vogue Strike',
                    combo: ['down', 'down', 'z'],
                    damage: 18,
                    energyCost: 20,
                    execute: function(move) { return this.executeVogueStrike(move); }
                },
                {
                    name: 'Mic Drop',
                    combo: ['down', 'right', 'z'],
                    damage: 22,
                    energyCost: 25,
                    execute: function(move) { return this.executeMicDrop(move); }
                },
                {
                    name: 'Blond Ambition',
                    combo: ['left', 'down', 'right', 'z'],
                    damage: 25,
                    energyCost: 30,
                    execute: function(move) { return this.executeBlondAmbition(move); }
                },
                {
                    name: 'MATERIAL WORLD!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 50,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeMaterialWorld(move); }
                }
            ]
        });
    }

    /**
     * Madonna's Diva Slap
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.12s ease-out';
                rightArm.style.transform = 'rotate(70deg) translateX(5px)';
                setTimeout(() => {
                    rightArm.style.transform = 'rotate(-10deg)';
                }, 200);
            }
        }
    }

    /**
     * Madonna's High Heel Kick
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
     * Vogue Strike - Strike a pose and attack
     */
    executeVogueStrike(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);

        let hitDealt = false;

        // Create pose effect
        const poseText = document.createElement('div');
        poseText.textContent = 'VOGUE!';
        poseText.style.cssText = `
            position: absolute;
            left: ${fighterX - 20}px;
            bottom: 180px;
            font-family: 'Finger Paint', cursive;
            font-size: 1.5rem;
            color: #e91e8c;
            text-shadow: 2px 2px 0 var(--ink);
            z-index: 160;
        `;
        arena.appendChild(poseText);

        // Sparkle burst
        for (let i = 0; i < 6; i++) {
            const star = document.createElement('div');
            star.className = 'sparkle-star';
            star.textContent = '';
            const angle = (i / 6) * Math.PI * 2;
            star.style.cssText = `
                position: absolute;
                left: ${fighterX + Math.cos(angle) * 30}px;
                bottom: ${120 + Math.sin(angle) * 30}px;
            `;
            arena.appendChild(star);

            let starDist = 30;
            const expandStar = setInterval(() => {
                starDist += 10;
                star.style.left = (fighterX + Math.cos(angle) * starDist) + 'px';
                star.style.bottom = (120 + Math.sin(angle) * starDist) + 'px';
                star.style.opacity = 1 - starDist / 150;

                // Check hit
                const currentTargetX = this.getTargetX();
                if (!hitDealt && Math.abs(parseFloat(star.style.left) - currentTargetX) < 40) {
                    this.damageTarget(move.damage);
                    this.combatSystem.showHitEffect(currentTargetX, 'STRIKE!', '#e91e8c');
                    hitDealt = true;
                }

                if (starDist > 150) {
                    clearInterval(expandStar);
                    star.remove();
                }
            }, 25);
        }

        setTimeout(() => poseText.remove(), 600);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Mic Drop - Throw microphone at enemy
     */
    executeMicDrop(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create microphone
        const mic = document.createElement('div');
        mic.className = 'projectile microphone';
        mic.style.cssText = `
            position: absolute;
            left: ${fighterX + 30 * direction}px;
            bottom: 150px;
        `;
        arena.appendChild(mic);

        const startX = fighterX + 30 * direction;
        let micX = startX;
        let micY = 150;
        let rotation = 0;

        const throwMic = setInterval(() => {
            micX += 10 * direction;
            micY -= 3;  // Arc down
            rotation += 15;

            mic.style.left = micX + 'px';
            mic.style.bottom = micY + 'px';
            mic.style.transform = `rotate(${rotation}deg)`;

            // Check hit
            const currentTargetX = this.getTargetX();
            if (!hitDealt && Math.abs(micX - currentTargetX) < 40 && micY < 120) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, 'MIC DROP!', '#e91e8c');
                this.combatSystem.screenShake(3, 150);
                hitDealt = true;
                clearInterval(throwMic);
                mic.remove();
            }

            if (micY < 60) {
                clearInterval(throwMic);
                // Bounce effect
                this.combatSystem.showHitEffect(micX, '*CLUNK*', '#666');
                mic.remove();
            }
        }, 25);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 600);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Blond Ambition - Cone bra laser attack
     */
    executeBlondAmbition(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        this.combatSystem.showHitEffect(fighterX, 'BLOND AMBITION!', '#ffd700');

        // Create cone beams
        for (let i = 0; i < 2; i++) {
            const beam = document.createElement('div');
            beam.style.cssText = `
                position: absolute;
                left: ${fighterX + (10 + i * 10) * direction}px;
                bottom: ${105 + i * 5}px;
                width: 0;
                height: 4px;
                background: linear-gradient(90deg, #ffd700, #e91e8c);
                box-shadow: 0 0 10px #ffd700;
                z-index: 155;
            `;
            arena.appendChild(beam);

            let beamWidth = 0;
            const extendBeam = setInterval(() => {
                beamWidth += 15;
                beam.style.width = beamWidth + 'px';

                if (direction < 0) {
                    beam.style.left = (fighterX + (10 + i * 10) - beamWidth) + 'px';
                }

                // Check hit
                const currentTargetX = this.getTargetX();
                const beamEnd = direction > 0 ? fighterX + beamWidth : fighterX - beamWidth;
                if (!hitDealt && Math.abs(beamEnd - currentTargetX) < 40) {
                    this.damageTarget(move.damage);
                    this.combatSystem.showHitEffect(currentTargetX, 'POW!', '#ffd700');
                    hitDealt = true;
                }

                if (beamWidth > 300) {
                    clearInterval(extendBeam);
                    beam.style.transition = 'opacity 0.2s';
                    beam.style.opacity = '0';
                    setTimeout(() => beam.remove(), 200);
                }
            }, 25);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * MATERIAL WORLD! - Ultimate: Money and glamour rain
     */
    executeMaterialWorld(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);

        if (distance > 350) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        let totalHits = 0;

        this.combatSystem.showHitEffect(fighterX, 'MATERIAL WORLD!', '#ffd700');

        // Rain material icons
        const materials = ['$', '', '', '', ''];
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'material-icon';
                item.textContent = materials[i % materials.length];
                item.style.cssText = `
                    position: absolute;
                    left: ${targetX - 60 + Math.random() * 120}px;
                    bottom: 280px;
                `;
                arena.appendChild(item);

                let itemY = 280;
                const fallItem = setInterval(() => {
                    itemY -= 8;
                    item.style.bottom = itemY + 'px';
                    item.style.transform = `rotate(${(280 - itemY) * 2}deg)`;

                    // Check hit
                    const currentTargetX = this.getTargetX();
                    if (itemY < 120 && Math.abs(parseFloat(item.style.left) - currentTargetX) < 40) {
                        if (totalHits < 5) {
                            this.damageTarget(Math.floor(move.damage / 5));
                            totalHits++;
                        }
                    }

                    if (itemY < 60) {
                        clearInterval(fallItem);
                        item.remove();
                    }
                }, 25);
            }, i * 80);
        }

        // Star burst effect
        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                const star = document.createElement('div');
                star.textContent = '';
                star.style.cssText = `
                    position: absolute;
                    left: ${targetX}px;
                    bottom: 100px;
                    font-size: 2rem;
                    color: #ffd700;
                    z-index: 160;
                `;
                arena.appendChild(star);

                const angle = (i / 8) * Math.PI * 2;
                let dist = 0;
                const expandStar = setInterval(() => {
                    dist += 12;
                    star.style.left = (targetX + Math.cos(angle) * dist) + 'px';
                    star.style.bottom = (100 + Math.sin(angle) * dist) + 'px';
                    star.style.opacity = 1 - dist / 150;

                    if (dist > 150) {
                        clearInterval(expandStar);
                        star.remove();
                    }
                }, 25);
            }
        }, 600);

        this.combatSystem.screenShake(5, 400);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1400);

        return { hit: totalHits > 0, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MadonnaCharacter, MADONNA_SPRITE };
}
