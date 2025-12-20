/**
 * Pancho - The Tech Superman
 *
 * Punch: Super Punch
 * Kick: Power Kick
 * Specials: Gadget Throw, Superman Flight, Heat Vision, FREEZE BREATH!
 */

// Pancho's sprite template
const PANCHO_SPRITE = `
    <div class="fighter pancho idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <div class="cape"></div>
            <span class="logo">S</span>
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="legs">
            <div class="leg"></div>
            <div class="leg"></div>
        </div>
    </div>
`;

/**
 * Pancho Character Class
 */
class PanchoCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'pancho',
            name: 'PANCHO',
            color: '#2563eb',
            punchDamage: 10,  // Super strength
            kickDamage: 12,
            spriteTemplate: PANCHO_SPRITE,
            specialMoves: [
                {
                    name: 'Gadget Throw',
                    combo: ['down', 'right', 'z'],
                    damage: 22,
                    energyCost: 20,
                    execute: function(move) { return this.executeGadgetThrow(move); }
                },
                {
                    name: 'Superman Flight',
                    combo: ['up', 'up', 'x'],
                    damage: 0,
                    energyCost: 25,
                    execute: function(move) { return this.executeSupermanFlight(move); }
                },
                {
                    name: 'Heat Vision',
                    combo: ['down', 'right', 'down', 'z'],
                    damage: 30,
                    energyCost: 30,
                    execute: function(move) { return this.executeHeatVision(move); }
                },
                {
                    name: 'FREEZE BREATH!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 45,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeFreezeBreath(move); }
                }
            ]
        });
    }

    /**
     * Pancho's Super Punch
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.12s ease-out';
                rightArm.style.transform = 'rotate(85deg) translateX(8px)';
                setTimeout(() => {
                    rightArm.style.transform = 'rotate(-15deg)';
                }, 200);
            }
        }
    }

    /**
     * Pancho's Power Kick
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
     * Gadget Throw - Throw tech gadgets
     */
    executeGadgetThrow(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create gadget
        const gadget = document.createElement('div');
        gadget.className = 'projectile gadget';
        gadget.style.cssText = `
            position: absolute;
            left: ${fighterX + 40 * direction}px;
            bottom: 120px;
        `;
        arena.appendChild(gadget);

        const startX = fighterX + 40 * direction;
        let gadgetX = startX;
        let rotation = 0;

        const flyGadget = setInterval(() => {
            gadgetX += 14 * direction;
            rotation += 20;
            gadget.style.left = gadgetX + 'px';
            gadget.style.transform = `rotate(${rotation}deg)`;

            // Check hit
            const currentTargetX = this.getTargetX();
            if (!hitDealt && Math.abs(gadgetX - currentTargetX) < 40) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, 'TECH HIT!', '#2563eb');
                hitDealt = true;
                clearInterval(flyGadget);
                gadget.remove();
            }

            if (gadgetX > 850 || gadgetX < 0) {
                clearInterval(flyGadget);
                gadget.remove();
            }
        }, 25);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 500);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Superman Flight - Fly up and reposition
     */
    executeSupermanFlight(move) {
        const arena = this.arena;
        const fighter = this.element;
        const startX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        if (fighter) {
            fighter.classList.add('flying');
        }

        this.combatSystem.showHitEffect(startX, 'UP, UP AND AWAY!', '#2563eb');

        // Create trail effect
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: absolute;
            left: ${startX}px;
            bottom: 80px;
            width: 60px;
            height: 80px;
            background: linear-gradient(transparent, rgba(37, 99, 235, 0.3));
            z-index: 5;
            animation: trailFade 0.5s forwards;
        `;
        arena.appendChild(trail);

        setTimeout(() => {
            trail.remove();
            if (fighter) {
                fighter.classList.remove('flying');
            }
            this.isAttacking = false;
            this.setState('idle');
        }, 500);

        return { hit: false, damage: 0 };
    }

    /**
     * Heat Vision - Laser beams from eyes
     */
    executeHeatVision(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        if (this.element) {
            this.element.classList.add('laser-eyes');
        }

        // Create heat beams
        const beam1 = document.createElement('div');
        const beam2 = document.createElement('div');

        [beam1, beam2].forEach((beam, i) => {
            beam.className = 'heat-beam';
            beam.style.cssText = `
                position: absolute;
                left: ${fighterX + 20 * direction}px;
                bottom: ${135 + i * 6}px;
                width: 0;
                transform-origin: ${direction > 0 ? 'left' : 'right'} center;
            `;
            arena.appendChild(beam);
        });

        let beamWidth = 0;
        const extendBeam = setInterval(() => {
            beamWidth += 20;
            beam1.style.width = beamWidth + 'px';
            beam2.style.width = beamWidth + 'px';

            if (direction < 0) {
                beam1.style.left = (fighterX + 20 - beamWidth) + 'px';
                beam2.style.left = (fighterX + 20 - beamWidth) + 'px';
            }

            // Check hit
            const currentTargetX = this.getTargetX();
            const beamEnd = direction > 0 ? fighterX + 20 + beamWidth : fighterX + 20 - beamWidth;
            if (!hitDealt && Math.abs(beamEnd - currentTargetX) < 40) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, 'BURN!', '#ef4444');
                hitDealt = true;
            }

            if (beamWidth > distance + 50 || beamWidth > 400) {
                clearInterval(extendBeam);

                // Retract beams
                let retractWidth = beamWidth;
                const retractBeam = setInterval(() => {
                    retractWidth -= 30;
                    beam1.style.width = Math.max(0, retractWidth) + 'px';
                    beam2.style.width = Math.max(0, retractWidth) + 'px';

                    if (retractWidth <= 0) {
                        clearInterval(retractBeam);
                        beam1.remove();
                        beam2.remove();
                    }
                }, 25);
            }
        }, 25);

        setTimeout(() => {
            if (this.element) {
                this.element.classList.remove('laser-eyes');
            }
            this.isAttacking = false;
            this.setState('idle');
        }, 800);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * FREEZE BREATH! - Ultimate: Freezing wind
     */
    executeFreezeBreath(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        if (distance > 400) {
            this.combatSystem.showHitEffect(fighterX, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        let hitDealt = false;

        this.combatSystem.showHitEffect(fighterX, 'FREEZE BREATH!', '#3b82f6');

        // Create freeze cloud particles
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const cloud = document.createElement('div');
                cloud.className = 'freeze-cloud';
                cloud.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 30 * direction}px;
                    bottom: ${100 + (Math.random() - 0.5) * 40}px;
                    width: ${20 + Math.random() * 20}px;
                    height: ${20 + Math.random() * 20}px;
                `;
                arena.appendChild(cloud);

                let cloudX = fighterX + 30 * direction;
                const cloudAnim = setInterval(() => {
                    cloudX += 12 * direction;
                    cloud.style.left = cloudX + 'px';
                    cloud.style.opacity = 1 - Math.abs(cloudX - fighterX) / 400;

                    // Check hit
                    const currentTargetX = this.getTargetX();
                    if (!hitDealt && Math.abs(cloudX - currentTargetX) < 50) {
                        this.damageTarget(Math.floor(move.damage / 5));
                        hitDealt = true;
                    }

                    if (Math.abs(cloudX - fighterX) > 400) {
                        clearInterval(cloudAnim);
                        cloud.remove();
                    }
                }, 25);
            }, i * 60);
        }

        // Snowflake effects
        const snowflakes = ['*', '+', 'x'];
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const snow = document.createElement('div');
                snow.textContent = snowflakes[i % 3];
                snow.style.cssText = `
                    position: absolute;
                    left: ${fighterX + (20 + i * 15) * direction}px;
                    bottom: ${120 + (Math.random() - 0.5) * 60}px;
                    color: #93c5fd;
                    font-size: 1rem;
                    z-index: 160;
                `;
                arena.appendChild(snow);

                let snowY = parseFloat(snow.style.bottom);
                const fallSnow = setInterval(() => {
                    snowY -= 2;
                    snow.style.bottom = snowY + 'px';
                    snow.style.opacity = snowY / 120;

                    if (snowY < 60) {
                        clearInterval(fallSnow);
                        snow.remove();
                    }
                }, 30);
            }, i * 50);
        }

        this.combatSystem.screenShake(4, 400);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1200);

        return { hit: hitDealt, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PanchoCharacter, PANCHO_SPRITE };
}
