/**
 * Billy - The Math Professor
 *
 * Punch: Ruler Smack
 * Kick: Equation Kick
 * Specials: Pythagorean Punch, Infinite Loop, Division Split, WHITEBOARD SLAM
 *
 * Attacks extracted from POC_game_with_good_attacks
 */

// Billy's sprite template
const BILLY_SPRITE = `
    <div class="fighter billy idle">
        <div class="head">
            <div class="hair"></div>
            <div class="glasses"><div class="lens"></div><div class="lens"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <span class="equation">f(x)</span>
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="legs"><div class="leg"></div><div class="leg"></div></div>
    </div>
`;

/**
 * Billy Character Class
 */
class BillyCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'billy',
            name: 'BILLY',
            color: '#3366cc',
            punchDamage: 8,
            kickDamage: 12,
            spriteTemplate: BILLY_SPRITE,
            specialMoves: [
                {
                    name: 'Pythagorean Punch',
                    combo: ['left', 'right', 'z'],
                    damage: 22,
                    energyCost: 25,
                    execute: function(move) { return this.executePythagoreanPunch(move); }
                },
                {
                    name: 'Infinite Loop',
                    combo: ['down', 'left', 'x'],
                    damage: 20,
                    energyCost: 25,
                    execute: function(move) { return this.executeInfiniteLoop(move); }
                },
                {
                    name: 'Division Split',
                    combo: ['down', 'down', 'z'],
                    damage: 18,
                    energyCost: 20,
                    execute: function(move) { return this.executeDivisionSplit(move); }
                },
                {
                    name: 'WHITEBOARD SLAM',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 45,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeWhiteboardSlam(move); }
                }
            ]
        });
    }

    /**
     * Billy's Punch: Ruler Smack
     * Swings a ruler from his arm
     */
    animatePunch() {
        const fighter = this.element;
        const arena = this.arena;
        const fighterX = this.x;

        const rightArm = fighter.querySelector('.arm.right');
        const originalArmTransform = rightArm ? getComputedStyle(rightArm).transform : '';

        // Create hand at end of arm
        const hand = document.createElement('div');
        hand.style.cssText = `
            position: absolute; right: -8px; bottom: -5px;
            width: 7px; height: 7px;
            background: var(--paper, #ffeedd); border: 1px solid var(--ink, #333);
            border-radius: 50%; z-index: 151;
        `;

        // Create ruler held by hand
        const ruler = document.createElement('div');
        ruler.style.cssText = `
            position: absolute; right: -4px; bottom: 2px;
            width: 40px; height: 8px;
            background: linear-gradient(180deg, #deb887 0%, #c49660 100%);
            border: 1px solid #8b7355; border-radius: 1px;
            transform: rotate(-20deg); transform-origin: left center;
            z-index: 150;
        `;
        // Ruler markings
        for (let i = 1; i <= 4; i++) {
            const mark = document.createElement('div');
            mark.style.cssText = `position: absolute; left: ${i * 8}px; top: 1px; width: 1px; height: 4px; background: #333;`;
            ruler.appendChild(mark);
        }
        hand.appendChild(ruler);

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
            ruler.style.transform = `rotate(${-20 + frame * 5}deg)`;

            if (frame >= 10) {
                clearInterval(swing);
                setTimeout(() => {
                    if (rightArm) {
                        rightArm.style.transition = 'transform 0.15s';
                        rightArm.style.transform = originalArmTransform || 'rotate(-15deg)';
                    }
                    hand.remove();
                }, 100);
            }
        }, 28);
    }

    /**
     * Billy's Kick: Standard kick with equation effect
     */
    animateKick() {
        if (this.element) {
            this.element.classList.add('kicking');
            setTimeout(() => {
                this.element.classList.remove('kicking');
            }, 250);
        }
    }

    /**
     * Pythagorean Punch - Billy traverses a triangle path
     * Only deals damage during the hypotenuse (diagonal) phase
     */
    executePythagoreanPunch(move) {
        const fighter = this.element;
        const arena = this.arena;
        const startX = this.x;
        const startBottom = 80;
        const direction = this.getDirectionToTarget();

        // Triangle vertices adjusted for direction
        const pathA = { x: startX, y: startBottom };
        const pathB = { x: startX, y: startBottom + 80 };
        const pathC = { x: startX + (180 * direction), y: startBottom };

        // Draw the triangle trail
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = `
            position: absolute;
            left: ${direction > 0 ? startX : startX - 180}px;
            bottom: 60px;
            width: 200px;
            height: 100px;
            overflow: visible;
            z-index: 50;
            pointer-events: none;
        `;
        const pathD = direction > 0
            ? 'M 0 80 L 0 0 L 180 80 Z'
            : 'M 180 80 L 180 0 L 0 80 Z';
        svg.innerHTML = `
            <path d="${pathD}"
                  fill="none"
                  stroke="var(--billy-blue, #3366cc)"
                  stroke-width="4"
                  stroke-dasharray="500"
                  stroke-dashoffset="500">
                <animate attributeName="stroke-dashoffset" from="500" to="0" dur="1.2s" fill="freeze"/>
            </path>
        `;
        arena.appendChild(svg);

        let phase = 0;
        let progress = 0;
        let hitDealt = false;

        const moveInterval = setInterval(() => {
            progress += 0.06;

            if (phase === 0) {
                // Phase 0: Moving UP (side a)
                const currentY = pathA.y + (pathB.y - pathA.y) * progress;
                fighter.style.bottom = currentY + 'px';

                if (progress >= 1) {
                    progress = 0;
                    phase = 1;
                }
            } else if (phase === 1) {
                // Phase 1: Moving diagonal DOWN (hypotenuse - the punch!)
                const currentX = pathB.x + (pathC.x - pathB.x) * progress;
                const currentY = pathB.y + (pathC.y - pathB.y) * progress;
                fighter.style.left = currentX + 'px';
                fighter.style.bottom = currentY + 'px';
                this.x = currentX;

                // Check collision during hypotenuse - PROPER HIT DETECTION
                const targetX = this.getTargetX();
                if (!hitDealt && Math.abs(currentX - targetX) < 80) {
                    this.damageTarget(move.damage);
                    this.combatSystem.showHitEffect(targetX, 'Q.E.D.!', '#3366cc');
                    hitDealt = true;

                    // Show equation on hit
                    const eq = document.createElement('div');
                    eq.textContent = 'a² + b² = c²';
                    eq.style.cssText = `
                        position: absolute;
                        left: ${currentX + 30}px;
                        bottom: 180px;
                        font-family: 'Patrick Hand', cursive;
                        font-size: 1.8rem;
                        color: var(--billy-blue, #3366cc);
                        z-index: 200;
                        animation: hitFloat 0.5s ease-out forwards;
                    `;
                    arena.appendChild(eq);
                    setTimeout(() => eq.remove(), 500);
                }

                if (progress >= 1) {
                    progress = 0;
                    phase = 2;
                }
            } else if (phase === 2) {
                // Phase 2: Moving back to start (side b)
                const currentX = pathC.x + (pathA.x - pathC.x) * progress;
                fighter.style.left = currentX + 'px';
                this.x = currentX;

                if (progress >= 1) {
                    clearInterval(moveInterval);
                    fighter.style.bottom = startBottom + 'px';
                    fighter.style.left = startX + 'px';
                    this.x = startX;
                    svg.remove();
                    this.isAttacking = false;
                    this.setState('idle');
                }
            }
        }, 25);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Infinite Loop - Trap opponent in spinning infinity
     * Must be close range, opponent can dodge
     */
    executeInfiniteLoop(move) {
        const arena = this.arena;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - this.x);

        // Must be close to trap
        if (distance > 200) {
            this.combatSystem.showHitEffect(this.x, 'Too far!', '#888');
            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 400);
            return { hit: false, damage: 0 };
        }

        // Warning zone appears first
        const trapZone = document.createElement('div');
        trapZone.style.cssText = `
            position: absolute;
            width: 80px;
            height: 40px;
            border: 4px dashed var(--billy-blue, #3366cc);
            border-radius: 50%;
            z-index: 140;
            opacity: 0.7;
            left: ${targetX - 20}px;
            bottom: 60px;
        `;
        arena.appendChild(trapZone);

        // After delay, check if target still in zone
        let hitDealt = false;
        setTimeout(() => {
            const currentTargetX = this.getTargetX();

            // Check if target is still in trap zone
            if (Math.abs(currentTargetX - targetX) < 60) {
                hitDealt = true;

                // Create spinning infinity
                const infinity = document.createElement('div');
                infinity.textContent = '∞';
                infinity.style.cssText = `
                    position: absolute;
                    left: ${currentTargetX}px;
                    bottom: 100px;
                    font-size: 4rem;
                    color: var(--billy-blue, #3366cc);
                    z-index: 150;
                    animation: spin 0.3s linear infinite;
                `;
                arena.appendChild(infinity);

                // Deal damage over time
                let hits = 0;
                const damageInterval = setInterval(() => {
                    hits++;
                    this.damageTarget(4);
                    if (hits >= 5) {
                        clearInterval(damageInterval);
                        this.combatSystem.showHitEffect(currentTargetX, 'LOOP!', '#3366cc');
                        infinity.remove();
                    }
                }, 100);
            }

            trapZone.remove();

            setTimeout(() => {
                this.isAttacking = false;
                this.setState('idle');
            }, 600);
        }, 500);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Division Split - Vertical line that divides the arena
     */
    executeDivisionSplit(move) {
        const arena = this.arena;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        // Create division line at target position
        const line = document.createElement('div');
        line.style.cssText = `
            position: absolute;
            left: ${targetX}px;
            bottom: 80px;
            width: 4px;
            height: 0;
            background: var(--billy-blue, #3366cc);
            z-index: 150;
            transition: height 0.3s ease-out;
        `;
        arena.appendChild(line);

        // Extend line
        setTimeout(() => {
            line.style.height = '200px';
        }, 50);

        // Check hit when line reaches full height
        let hitDealt = false;
        setTimeout(() => {
            const currentTargetX = this.getTargetX();

            // Hit if target is near the line
            if (Math.abs(currentTargetX - targetX) < 40) {
                hitDealt = true;
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(targetX, '÷', '#3366cc');
            }

            // Fade out
            line.style.opacity = '0';
            line.style.transition = 'opacity 0.2s';
            setTimeout(() => line.remove(), 200);

            this.isAttacking = false;
            this.setState('idle');
        }, 400);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * WHITEBOARD SLAM - Ultimate: Throws a whiteboard projectile
     */
    executeWhiteboardSlam(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        // Create whiteboard projectile
        setTimeout(() => {
            const board = document.createElement('div');
            board.className = 'projectile whiteboard';
            board.innerHTML = 'P(n) for all n<br>P(1) ∧ P(k)→P(k+1)<br>∴ P(n) ∎';
            board.style.cssText = `
                position: absolute;
                left: ${fighterX + (direction > 0 ? 40 : -120)}px;
                bottom: 140px;
                width: 120px;
                height: 80px;
                background: white;
                border: 3px solid var(--ink);
                border-radius: 3px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: 'Patrick Hand', cursive;
                font-size: 0.7rem;
                color: var(--billy-blue, #3366cc);
                text-align: center;
                line-height: 1.2;
                z-index: 150;
                transform: rotate(${direction > 0 ? 15 : -15}deg);
            `;
            arena.appendChild(board);

            const startX = fighterX + (direction > 0 ? 40 : -120);
            let progress = 0;
            let hitDealt = false;

            const throwAnim = setInterval(() => {
                progress += 0.08;
                const currentX = startX + (targetX - startX) * progress;
                const arc = Math.sin(progress * Math.PI) * 50;
                board.style.left = currentX + 'px';
                board.style.bottom = (140 + arc) + 'px';
                board.style.transform = `rotate(${(direction > 0 ? 15 : -15) - progress * 30 * direction}deg)`;

                // Check hit - PROPER HIT DETECTION
                const currentTargetX = this.getTargetX();
                if (!hitDealt && Math.abs(currentX - currentTargetX) < 60) {
                    hitDealt = true;
                    this.damageTarget(move.damage);
                    this.combatSystem.showHitEffect(currentTargetX, 'SLAM!', '#3366cc');
                    this.combatSystem.screenShake(8, 300);
                }

                if (progress >= 1) {
                    clearInterval(throwAnim);
                    board.remove();
                }
            }, 30);
        }, 200);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: true, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BillyCharacter, BILLY_SPRITE };
}
