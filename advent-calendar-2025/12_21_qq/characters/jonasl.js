/**
 * Jonas L - The Bass Player
 *
 * Punch: Fist Strike
 * Kick: Boot Kick
 * Specials: Paddle Ball, Hot Coffee, Bass Swing, BASS SOLO!
 */

// JonasL's sprite template
const JONASL_SPRITE = `
    <div class="fighter jonasl idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <div class="bass">
                <div class="bass-neck"></div>
                <div class="bass-body">
                    <div class="bass-strings"></div>
                </div>
            </div>
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
 * JonasL Character Class
 */
class JonasLCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'jonasl',
            name: 'JONAS L',
            color: '#8b4513',
            punchDamage: 8,
            kickDamage: 10,
            spriteTemplate: JONASL_SPRITE,
            specialMoves: [
                {
                    name: 'Paddle Ball',
                    combo: ['right', 'down', 'z'],
                    damage: 16,
                    energyCost: 20,
                    execute: function(move) { return this.executePaddleBall(move); }
                },
                {
                    name: 'Hot Coffee',
                    combo: ['down', 'left', 'z'],
                    damage: 20,
                    energyCost: 25,
                    execute: function(move) { return this.executeHotCoffee(move); }
                },
                {
                    name: 'Bass Swing',
                    combo: ['right', 'right', 'z'],
                    damage: 22,
                    energyCost: 20,
                    execute: function(move) { return this.executeBassSwing(move); }
                },
                {
                    name: 'BASS SOLO!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 50,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeBassSolo(move); }
                }
            ]
        });
    }

    /**
     * JonasL's Punch
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.12s ease-out';
                rightArm.style.transform = 'rotate(75deg) translateX(5px)';
                setTimeout(() => {
                    rightArm.style.transform = '';
                }, 200);
            }
        }
    }

    /**
     * JonasL's Kick
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
     * Paddle Ball - Extends and snaps back
     */
    executePaddleBall(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create paddle
        const paddle = document.createElement('div');
        paddle.style.cssText = `
            position: absolute;
            width: 30px;
            height: 45px;
            z-index: 160;
            left: ${fighterX + 45 * direction}px;
            bottom: 115px;
        `;

        const handle = document.createElement('div');
        handle.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 10px;
            width: 10px;
            height: 18px;
            background: #8b4513;
            border: 2px solid #333;
            border-radius: 2px;
        `;

        const face = document.createElement('div');
        face.style.cssText = `
            position: absolute;
            bottom: 15px;
            left: 0;
            width: 30px;
            height: 30px;
            background: #c0392b;
            border: 3px solid #333;
            border-radius: 50%;
        `;

        paddle.appendChild(handle);
        paddle.appendChild(face);
        arena.appendChild(paddle);

        // Create ball
        const ball = document.createElement('div');
        ball.className = 'projectile paddle-ball';
        ball.style.cssText = `
            position: absolute;
            left: ${fighterX + 60 * direction}px;
            bottom: 140px;
        `;
        arena.appendChild(ball);

        // Create elastic
        const elastic = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elastic.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 154;
        `;
        const elasticLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        elasticLine.setAttribute('stroke', '#333');
        elasticLine.setAttribute('stroke-width', '2');
        elasticLine.setAttribute('fill', 'none');
        elastic.appendChild(elasticLine);
        arena.appendChild(elastic);

        const paddleX = fighterX + 60 * direction;
        const paddleY = 140;
        const maxReach = Math.min(distance * 0.8, 250);

        let phase = 0;
        let progress = 0;

        const paddleAnim = setInterval(() => {
            if (phase === 0) {
                // Wind up
                progress += 0.2;
                paddle.style.transform = `rotate(${-20 * progress * direction}deg)`;
                if (progress >= 1) {
                    phase = 1;
                    progress = 0;
                }
            } else if (phase === 1) {
                // Launch
                progress += 0.05;
                const currentX = paddleX + maxReach * progress * direction;
                const arc = Math.sin(progress * Math.PI) * 30;

                ball.style.left = currentX + 'px';
                ball.style.bottom = (paddleY + arc) + 'px';
                paddle.style.transform = `rotate(${(-20 + progress * 40) * direction}deg)`;

                // Draw elastic
                const arenaHeight = arena.offsetHeight;
                const startPx = paddleX + 15 * direction;
                const startPy = arenaHeight - paddleY - 10;
                const endPx = currentX + 9;
                const endPy = arenaHeight - (paddleY + arc) - 9;
                const midX = (startPx + endPx) / 2;
                const sag = progress * 20;
                elasticLine.setAttribute('d', `M${startPx},${startPy} Q${midX},${startPy + sag} ${endPx},${endPy}`);

                // Check hit
                if (progress >= 0.9 && !hitDealt) {
                    const finalTargetX = this.getTargetX();
                    if (Math.abs(currentX - finalTargetX) < 50) {
                        this.damageTarget(move.damage);
                        this.combatSystem.showHitEffect(finalTargetX, 'BONK!', '#8b4513');
                        hitDealt = true;
                    }
                }

                if (progress >= 1) {
                    phase = 2;
                    progress = 0;
                }
            } else if (phase === 2) {
                // Snap back
                progress += 0.08;
                const currentX = paddleX + maxReach * (1 - progress) * direction;
                const arc = Math.sin((1 - progress) * Math.PI) * 20;

                ball.style.left = currentX + 'px';
                ball.style.bottom = (paddleY + arc) + 'px';

                const arenaHeight = arena.offsetHeight;
                const startPx = paddleX + 15 * direction;
                const startPy = arenaHeight - paddleY - 10;
                const endPx = currentX + 9;
                const endPy = arenaHeight - (paddleY + arc) - 9;
                const midX = (startPx + endPx) / 2;
                const sag = (1 - progress) * 15;
                elasticLine.setAttribute('d', `M${startPx},${startPy} Q${midX},${startPy + sag} ${endPx},${endPy}`);

                if (progress >= 1) {
                    clearInterval(paddleAnim);
                    paddle.remove();
                    ball.remove();
                    elastic.remove();
                    this.isAttacking = false;
                    this.setState('idle');
                }
            }
        }, 25);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Hot Coffee - Throw hot coffee
     */
    executeHotCoffee(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create coffee mug
        const mug = document.createElement('div');
        mug.style.cssText = `
            position: absolute;
            width: 20px;
            height: 24px;
            background: linear-gradient(to right, #fff, #e8e8e8, #fff);
            border: 2px solid #666;
            border-radius: 0 0 5px 5px;
            z-index: 160;
            left: ${fighterX + 45 * direction}px;
            bottom: 130px;
        `;

        const handle = document.createElement('div');
        handle.style.cssText = `
            position: absolute;
            ${direction > 0 ? 'right' : 'left'}: -8px;
            top: 5px;
            width: 7px;
            height: 10px;
            border: 2px solid #666;
            border-${direction > 0 ? 'left' : 'right'}: none;
            border-radius: ${direction > 0 ? '0 6px 6px 0' : '6px 0 0 6px'};
        `;

        const coffee = document.createElement('div');
        coffee.style.cssText = `
            position: absolute;
            top: 2px;
            left: 2px;
            right: 2px;
            height: 16px;
            background: linear-gradient(180deg, #2d1810, #1a0f0a);
            border-radius: 2px;
        `;

        mug.appendChild(coffee);
        mug.appendChild(handle);
        arena.appendChild(mug);

        // Throw the mug
        const startX = fighterX + 45 * direction;
        let mugX = startX;
        let mugY = 130;
        let rotation = 0;

        const throwAnim = setInterval(() => {
            mugX += 12 * direction;
            mugY += Math.sin((mugX - startX) / 50) * 2 - 0.5;
            rotation += 15;

            mug.style.left = mugX + 'px';
            mug.style.bottom = mugY + 'px';
            mug.style.transform = `rotate(${rotation * direction}deg)`;

            // Check hit
            const currentTargetX = this.getTargetX();
            if (!hitDealt && Math.abs(mugX - currentTargetX) < 40) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, 'HOT!', '#2d1810');
                hitDealt = true;

                // Create coffee splash effect
                for (let i = 0; i < 8; i++) {
                    const splash = document.createElement('div');
                    splash.className = 'coffee-splash';
                    splash.style.cssText = `
                        position: absolute;
                        left: ${currentTargetX + (Math.random() - 0.5) * 60}px;
                        bottom: ${100 + Math.random() * 50}px;
                        width: ${6 + Math.random() * 4}px;
                        height: ${6 + Math.random() * 4}px;
                        background: #2d1810;
                        border-radius: 50%;
                        z-index: 150;
                    `;
                    arena.appendChild(splash);
                    setTimeout(() => splash.remove(), 400);
                }

                clearInterval(throwAnim);
                mug.remove();
            }

            // Out of bounds
            if (mugX > 850 || mugX < 0 || mugY < 50) {
                clearInterval(throwAnim);
                mug.remove();
            }
        }, 25);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 600);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Bass Swing - Swing the bass guitar
     */
    executeBassSwing(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        if (this.element) {
            this.element.classList.add('special-bass');
        }

        // Check range - melee attack
        setTimeout(() => {
            if (distance < 100) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(targetX, 'THWACK!', '#8b4513');
                this.combatSystem.screenShake(3, 150);
                hitDealt = true;
            } else {
                this.combatSystem.showHitEffect(fighterX, 'Missed!', '#888');
            }
        }, 200);

        setTimeout(() => {
            if (this.element) {
                this.element.classList.remove('special-bass');
            }
            this.isAttacking = false;
            this.setState('idle');
        }, 400);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * BASS SOLO! - Ultimate: Musical shockwaves
     */
    executeBassSolo(move) {
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

        this.combatSystem.showHitEffect(fighterX, 'BASS SOLO!', '#8b4513');

        let totalHits = 0;
        const noteColors = ['#e74c3c', '#f39c12', '#27ae60', '#3498db', '#9b59b6'];

        // Create musical notes flying out
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const note = document.createElement('div');
                note.textContent = ['♪', '♫', '♩', '♬', '♭'][i];
                note.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 30 * direction}px;
                    bottom: ${100 + i * 15}px;
                    font-size: 2rem;
                    color: ${noteColors[i]};
                    text-shadow: 2px 2px 0 var(--ink);
                    z-index: 160;
                `;
                arena.appendChild(note);

                const startX = fighterX + 30 * direction;
                let progress = 0;

                const noteAnim = setInterval(() => {
                    progress += 0.05;
                    const currentTargetX = this.getTargetX();
                    const noteX = startX + (currentTargetX - startX) * progress;
                    const wave = Math.sin(progress * Math.PI * 3) * 20;

                    note.style.left = noteX + 'px';
                    note.style.bottom = (100 + i * 15 + wave) + 'px';
                    note.style.transform = `scale(${1 + Math.sin(progress * Math.PI) * 0.3})`;

                    // Check hit
                    if (progress >= 0.9) {
                        const finalTargetX = this.getTargetX();
                        if (Math.abs(noteX - finalTargetX) < 50) {
                            clearInterval(noteAnim);
                            this.damageTarget(Math.floor(move.damage / 5));
                            totalHits++;
                            note.remove();
                            return;
                        }
                    }

                    if (progress >= 1) {
                        clearInterval(noteAnim);
                        note.remove();
                    }
                }, 25);
            }, i * 150);
        }

        // Shockwave rings
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ring = document.createElement('div');
                ring.style.cssText = `
                    position: absolute;
                    left: ${fighterX - 10}px;
                    bottom: 110px;
                    width: 20px;
                    height: 20px;
                    border: 3px solid ${noteColors[i]};
                    border-radius: 50%;
                    z-index: 155;
                    opacity: 1;
                `;
                arena.appendChild(ring);

                let ringSize = 20;
                const expandRing = setInterval(() => {
                    ringSize += 15;
                    ring.style.width = ringSize + 'px';
                    ring.style.height = ringSize + 'px';
                    ring.style.left = (fighterX - ringSize / 2) + 'px';
                    ring.style.bottom = (110 - ringSize / 4) + 'px';
                    ring.style.opacity = 1 - ringSize / 300;

                    if (ringSize > 300) {
                        clearInterval(expandRing);
                        ring.remove();
                    }
                }, 30);
            }, i * 200);
        }

        this.combatSystem.screenShake(6, 500);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1200);

        return { hit: totalHits > 0, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JonasLCharacter, JONASL_SPRITE };
}
