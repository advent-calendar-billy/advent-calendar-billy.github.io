/**
 * Audrey II - The Mean Green Mother
 *
 * Punch: Leaf Slap
 * Kick: Snap Bite
 * Specials: Vine Whip, Feed Me!, Siren Song, MEAN GREEN MOTHER!
 */

// Audrey's sprite template
const AUDREY_SPRITE = `
    <div class="fighter audrey idle">
        <div class="head">
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="spots">
                <div class="spot"></div>
                <div class="spot"></div>
                <div class="spot"></div>
            </div>
            <div class="mouth">
                <div class="teeth">
                    <div class="tooth"></div>
                    <div class="tooth"></div>
                    <div class="tooth"></div>
                    <div class="tooth"></div>
                </div>
            </div>
        </div>
        <div class="body">
            <div class="leaf left"></div>
            <div class="leaf right"></div>
            <div class="stem"></div>
        </div>
        <div class="pot"></div>
    </div>
`;

/**
 * Audrey Character Class
 */
class AudreyCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'audrey',
            name: 'AUDREY II',
            color: '#228b22',
            punchDamage: 8,
            kickDamage: 12,  // Bite is powerful
            spriteTemplate: AUDREY_SPRITE,
            specialMoves: [
                {
                    name: 'Vine Whip',
                    combo: ['left', 'right', 'down', 'z'],
                    damage: 20,
                    energyCost: 20,
                    execute: function(move) { return this.executeVineWhip(move); }
                },
                {
                    name: 'Feed Me!',
                    combo: ['down', 'down', 'z'],
                    damage: 28,
                    energyCost: 25,
                    execute: function(move) { return this.executeFeedMe(move); }
                },
                {
                    name: 'Siren Song',
                    combo: ['down', 'right', 'z'],
                    damage: 22,
                    energyCost: 25,
                    execute: function(move) { return this.executeSirenSong(move); }
                },
                {
                    name: 'MEAN GREEN MOTHER!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 55,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeMeanGreenMother(move); }
                }
            ]
        });
    }

    /**
     * Audrey's Leaf Slap
     */
    animatePunch() {
        if (this.element) {
            this.element.classList.add('punching');
            setTimeout(() => {
                this.element.classList.remove('punching');
            }, 300);
        }
    }

    /**
     * Audrey's Snap Bite
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
     * Vine Whip - Extend vine to hit enemy
     */
    executeVineWhip(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create vine
        const vine = document.createElement('div');
        vine.className = 'vine-whip';
        vine.style.cssText = `
            position: absolute;
            left: ${fighterX + 25 * direction}px;
            bottom: 110px;
            width: 0;
            transform: scaleX(${direction});
        `;
        arena.appendChild(vine);

        let vineLength = 0;
        const extendVine = setInterval(() => {
            vineLength += 15;
            vine.style.width = vineLength + 'px';

            // Wavy motion
            vine.style.transform = `scaleX(${direction}) rotate(${Math.sin(vineLength / 20) * 10}deg)`;

            // Check hit
            const currentTargetX = this.getTargetX();
            const vineEnd = direction > 0 ? fighterX + 25 + vineLength : fighterX + 25 - vineLength;
            if (!hitDealt && Math.abs(vineEnd - currentTargetX) < 40) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, 'WHIP!', '#228b22');
                hitDealt = true;
            }

            if (vineLength > 300) {
                clearInterval(extendVine);

                // Retract
                let retract = vineLength;
                const retractVine = setInterval(() => {
                    retract -= 20;
                    vine.style.width = Math.max(0, retract) + 'px';

                    if (retract <= 0) {
                        clearInterval(retractVine);
                        vine.remove();
                    }
                }, 25);
            }
        }, 25);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Feed Me! - Hungry lunge attack
     */
    executeFeedMe(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        this.combatSystem.showHitEffect(fighterX, 'FEED ME!', '#228b22');

        // Create hungry mouth projectile
        const mouth = document.createElement('div');
        mouth.style.cssText = `
            position: absolute;
            left: ${fighterX + 30 * direction}px;
            bottom: 100px;
            width: 50px;
            height: 35px;
            z-index: 160;
        `;
        mouth.innerHTML = `
            <div style="width: 100%; height: 100%; background: #8b0000; border: 3px solid var(--ink); border-radius: 50%; position: relative;">
                <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px;">
                    <div style="width: 6px; height: 8px; background: #fff; clip-path: polygon(50% 100%, 0% 0%, 100% 0%);"></div>
                    <div style="width: 6px; height: 8px; background: #fff; clip-path: polygon(50% 100%, 0% 0%, 100% 0%);"></div>
                    <div style="width: 6px; height: 8px; background: #fff; clip-path: polygon(50% 100%, 0% 0%, 100% 0%);"></div>
                </div>
            </div>
        `;
        arena.appendChild(mouth);

        let mouthX = fighterX + 30 * direction;
        const lungeAnim = setInterval(() => {
            mouthX += 15 * direction;
            mouth.style.left = mouthX + 'px';
            mouth.style.transform = `rotate(${Math.sin(mouthX / 10) * 10}deg) scale(${1 + Math.sin(mouthX / 15) * 0.2})`;

            // Check hit
            const currentTargetX = this.getTargetX();
            if (!hitDealt && Math.abs(mouthX - currentTargetX) < 50) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, 'CHOMP!', '#8b0000');
                this.combatSystem.screenShake(4, 150);
                hitDealt = true;
                clearInterval(lungeAnim);
                mouth.remove();
            }

            if (Math.abs(mouthX - fighterX) > 350) {
                clearInterval(lungeAnim);
                mouth.remove();
            }
        }, 25);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Siren Song - Musical charm attack
     */
    executeSirenSong(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        this.combatSystem.showHitEffect(fighterX, 'La la la~', '#27ae60');

        // Create musical notes
        const notes = ['', '', ''];
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const note = document.createElement('div');
                note.className = 'siren-note';
                note.textContent = notes[i % 3];
                note.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 30 * direction}px;
                    bottom: ${110 + (i % 3) * 15}px;
                `;
                arena.appendChild(note);

                let noteX = fighterX + 30 * direction;
                const floatNote = setInterval(() => {
                    noteX += 10 * direction;
                    note.style.left = noteX + 'px';
                    note.style.bottom = (110 + (i % 3) * 15 + Math.sin(noteX / 20) * 15) + 'px';
                    note.style.opacity = 1 - Math.abs(noteX - fighterX) / 250;

                    // Check hit
                    const currentTargetX = this.getTargetX();
                    if (!hitDealt && Math.abs(noteX - currentTargetX) < 40) {
                        this.damageTarget(move.damage);
                        this.combatSystem.showHitEffect(currentTargetX, 'MESMERIZED!', '#27ae60');
                        hitDealt = true;
                    }

                    if (Math.abs(noteX - fighterX) > 250) {
                        clearInterval(floatNote);
                        note.remove();
                    }
                }, 25);
            }, i * 80);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 800);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * MEAN GREEN MOTHER! - Ultimate: Full plant attack
     */
    executeMeanGreenMother(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        if (distance > 350) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        let totalHits = 0;

        this.combatSystem.showHitEffect(fighterX, 'MEAN GREEN MOTHER!', '#228b22');

        // Giant vines attack
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const giantVine = document.createElement('div');
                giantVine.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 20 * direction}px;
                    bottom: ${80 + i * 25}px;
                    width: 0;
                    height: 10px;
                    background: linear-gradient(90deg, #228b22, #1a6b1a);
                    border: 2px solid var(--ink);
                    border-radius: 5px;
                    z-index: 150;
                `;
                arena.appendChild(giantVine);

                let vineLen = 0;
                const extendGiant = setInterval(() => {
                    vineLen += 20;
                    giantVine.style.width = vineLen + 'px';

                    if (direction < 0) {
                        giantVine.style.left = (fighterX + 20 - vineLen) + 'px';
                    }

                    // Check hit
                    const currentTargetX = this.getTargetX();
                    const vineEnd = direction > 0 ? fighterX + 20 + vineLen : fighterX + 20 - vineLen;
                    if (Math.abs(vineEnd - currentTargetX) < 50 && totalHits < 5) {
                        this.damageTarget(Math.floor(move.damage / 5));
                        totalHits++;
                    }

                    if (vineLen > 350) {
                        clearInterval(extendGiant);
                        giantVine.style.transition = 'opacity 0.3s';
                        giantVine.style.opacity = '0';
                        setTimeout(() => giantVine.remove(), 300);
                    }
                }, 25);
            }, i * 150);
        }

        // Mouth snap at the end
        setTimeout(() => {
            const bigMouth = document.createElement('div');
            bigMouth.textContent = '';
            bigMouth.style.cssText = `
                position: absolute;
                left: ${targetX}px;
                bottom: 100px;
                font-size: 4rem;
                z-index: 165;
                animation: hitFloat 0.5s ease-out forwards;
            `;
            arena.appendChild(bigMouth);
            this.combatSystem.screenShake(6, 300);
            setTimeout(() => bigMouth.remove(), 500);
        }, 800);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1200);

        return { hit: totalHits > 0, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudreyCharacter, AUDREY_SPRITE };
}
