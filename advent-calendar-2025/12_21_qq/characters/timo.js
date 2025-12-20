/**
 * Timo - The Perpetual Complainer
 *
 * Punch: Lazy Swipe
 * Kick: Half-hearted Kick
 * Specials: Excessive Drool, Loud Complaining, Wave the Flag, MEGA TANTRUM!
 *
 * Note: Timo's specials are mostly utility/debuff moves with minimal damage
 */

// Timo's sprite template
const TIMO_SPRITE = `
    <div class="fighter timo idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
            <div class="drool-drop"></div>
        </div>
        <div class="body">
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="pants"></div>
        <div class="feet"><div class="foot"></div><div class="foot"></div></div>
    </div>
`;

/**
 * Timo Character Class
 */
class TimoCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'timo',
            name: 'TIMO',
            color: '#888888',
            punchDamage: 5,  // Weak punches
            kickDamage: 6,   // Weak kicks
            spriteTemplate: TIMO_SPRITE,
            specialMoves: [
                {
                    name: 'Excessive Drool',
                    combo: ['down', 'down', 'z'],
                    damage: 0,
                    energyCost: 10,
                    execute: function(move) { return this.executeExcessiveDrool(move); }
                },
                {
                    name: 'Loud Complaining',
                    combo: ['left', 'right', 'z'],
                    damage: 0,
                    energyCost: 10,
                    execute: function(move) { return this.executeLoudComplaining(move); }
                },
                {
                    name: 'Wave the Flag',
                    combo: ['right', 'right', 'x'],
                    damage: 0,
                    energyCost: 10,
                    execute: function(move) { return this.executeWaveTheFlag(move); }
                },
                {
                    name: 'MEGA TANTRUM!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 35,  // His one damaging move!
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeMegaTantrum(move); }
                }
            ]
        });
    }

    /**
     * Timo's Lazy Punch
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.2s ease-out';
                rightArm.style.transform = 'rotate(40deg) translateX(3px)';
                setTimeout(() => {
                    rightArm.style.transform = 'rotate(-5deg)';
                }, 300);
            }
        }
    }

    /**
     * Timo's Half-hearted Kick
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
     * Excessive Drool - Creates a slippery puddle
     */
    executeExcessiveDrool(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        // Create multiple drool drops
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const drop = document.createElement('div');
                drop.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 15 + (Math.random() - 0.5) * 20}px;
                    bottom: 120px;
                    width: 6px;
                    height: 10px;
                    background: #a8d4e6;
                    border: 1px solid #5a9ec4;
                    border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
                    z-index: 150;
                `;
                arena.appendChild(drop);

                let dropY = 120;
                const fallDrop = setInterval(() => {
                    dropY -= 8;
                    drop.style.bottom = dropY + 'px';

                    if (dropY <= 65) {
                        clearInterval(fallDrop);
                        drop.remove();

                        // Create puddle on ground
                        const puddle = document.createElement('div');
                        puddle.className = 'drool-puddle';
                        puddle.style.cssText = `
                            position: absolute;
                            left: ${fighterX + 10 + i * 15}px;
                            bottom: 60px;
                            width: ${15 + Math.random() * 10}px;
                            height: ${8 + Math.random() * 5}px;
                        `;
                        arena.appendChild(puddle);

                        // Puddle fades after a while
                        setTimeout(() => {
                            puddle.style.transition = 'opacity 0.5s';
                            puddle.style.opacity = '0';
                            setTimeout(() => puddle.remove(), 500);
                        }, 2000);
                    }
                }, 30);
            }, i * 100);
        }

        this.combatSystem.showHitEffect(fighterX, 'DROOL...', '#a8d4e6');

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: false, damage: 0 };
    }

    /**
     * Loud Complaining - Annoys everyone with complaints
     */
    executeLoudComplaining(move) {
        const arena = this.arena;
        const fighterX = this.x;

        const complaints = [
            "I'M TIRED!",
            "THIS IS UNFAIR!",
            "I DON'T WANNA!",
            "IT'S TOO HARD!",
            "WHY ME?!"
        ];

        // Create speech bubbles with complaints
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'complaint-bubble';
                bubble.textContent = complaints[Math.floor(Math.random() * complaints.length)];
                bubble.style.cssText = `
                    position: absolute;
                    left: ${fighterX - 30 + i * 20}px;
                    bottom: ${160 + i * 30}px;
                    transform: rotate(${(Math.random() - 0.5) * 10}deg);
                `;
                arena.appendChild(bubble);

                // Float up and fade
                let bubbleY = 160 + i * 30;
                const floatBubble = setInterval(() => {
                    bubbleY += 2;
                    bubble.style.bottom = bubbleY + 'px';
                    bubble.style.opacity = 1 - (bubbleY - (160 + i * 30)) / 80;

                    if (bubbleY > 250 + i * 30) {
                        clearInterval(floatBubble);
                        bubble.remove();
                    }
                }, 30);
            }, i * 200);
        }

        this.combatSystem.showHitEffect(fighterX, 'WAAAAAH!', '#888');

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 800);

        return { hit: false, damage: 0 };
    }

    /**
     * Wave the Flag - Surrenders dramatically
     */
    executeWaveTheFlag(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        // Create white flag
        const flag = document.createElement('div');
        flag.className = 'white-flag';
        flag.innerHTML = `
            <div class="flag-pole"></div>
            <div class="flag-cloth"></div>
        `;
        flag.style.cssText = `
            position: absolute;
            left: ${fighterX + 30 * direction}px;
            bottom: 130px;
        `;
        arena.appendChild(flag);

        // Wave the flag
        let waveCount = 0;
        const waveFlag = setInterval(() => {
            waveCount++;
            flag.style.transform = `rotate(${Math.sin(waveCount * 0.3) * 20}deg)`;

            if (waveCount > 30) {
                clearInterval(waveFlag);
                flag.style.transition = 'opacity 0.3s';
                flag.style.opacity = '0';
                setTimeout(() => flag.remove(), 300);
            }
        }, 30);

        this.combatSystem.showHitEffect(fighterX, 'I GIVE UP!', 'white');

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1000);

        return { hit: false, damage: 0 };
    }

    /**
     * MEGA TANTRUM! - Ultimate: Finally deals damage!
     */
    executeMegaTantrum(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);

        if (distance > 250) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        let hitDealt = false;

        // Start tantrum animation
        if (this.element) {
            this.element.classList.add('tantrum');
        }

        this.combatSystem.showHitEffect(fighterX, 'MEGA TANTRUM!', '#e74c3c');

        // Create shockwaves of crying
        const tears = ['😭', '😫', '😤', '💢', '😡'];
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const tear = document.createElement('div');
                tear.textContent = tears[i % tears.length];
                tear.style.cssText = `
                    position: absolute;
                    left: ${fighterX}px;
                    bottom: 130px;
                    font-size: 1.5rem;
                    z-index: 160;
                `;
                arena.appendChild(tear);

                const angle = (i / 8) * Math.PI * 2;
                let radius = 0;

                const expandTear = setInterval(() => {
                    radius += 8;
                    tear.style.left = (fighterX + Math.cos(angle) * radius) + 'px';
                    tear.style.bottom = (130 + Math.sin(angle) * radius * 0.5) + 'px';
                    tear.style.opacity = 1 - radius / 200;

                    // Check if tears hit enemy
                    const currentTargetX = this.getTargetX();
                    if (!hitDealt && Math.abs(parseFloat(tear.style.left) - currentTargetX) < 40) {
                        this.damageTarget(Math.floor(move.damage / 3));
                        hitDealt = true;
                    }

                    if (radius > 200) {
                        clearInterval(expandTear);
                        tear.remove();
                    }
                }, 25);
            }, i * 100);
        }

        // Stomp effects
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.combatSystem.screenShake(4, 150);

                // Ground crack effect
                const crack = document.createElement('div');
                crack.textContent = '💥';
                crack.style.cssText = `
                    position: absolute;
                    left: ${fighterX + (Math.random() - 0.5) * 60}px;
                    bottom: 65px;
                    font-size: 1.2rem;
                    z-index: 5;
                `;
                arena.appendChild(crack);
                setTimeout(() => crack.remove(), 400);

                // Deal damage during stomps
                const currentTargetX = this.getTargetX();
                if (Math.abs(fighterX - currentTargetX) < 150) {
                    this.damageTarget(Math.floor(move.damage / 3));
                    hitDealt = true;
                }
            }, 400 + i * 300);
        }

        setTimeout(() => {
            if (this.element) {
                this.element.classList.remove('tantrum');
            }
            this.isAttacking = false;
            this.setState('idle');
        }, 1500);

        return { hit: hitDealt, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TimoCharacter, TIMO_SPRITE };
}
