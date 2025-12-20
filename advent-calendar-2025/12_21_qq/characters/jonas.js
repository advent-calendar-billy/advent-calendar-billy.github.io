/**
 * Jonas M - The Coach
 *
 * Punch: Briefcase Swing
 * Kick: Power Kick (with fist pump)
 * Specials: Post-its, Paradigm Shift, Circle Back, PERFORMANCE REVIEW
 */

// Jonas's sprite template
const JONAS_SPRITE = `
    <div class="fighter jonas idle">
        <div class="head">
            <div class="hair"></div>
            <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
            <div class="mouth"></div>
        </div>
        <div class="body">
            <span class="badge">COACH</span>
            <div class="arm left"></div>
            <div class="arm right"></div>
        </div>
        <div class="legs"><div class="leg"></div><div class="leg"></div></div>
    </div>
`;

/**
 * Jonas Character Class
 */
class JonasCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'jonas',
            name: 'JONAS M',
            color: '#27ae60',
            punchDamage: 8,
            kickDamage: 10,
            spriteTemplate: JONAS_SPRITE,
            specialMoves: [
                {
                    name: 'Post-its',
                    combo: ['right', 'right', 'z'],
                    damage: 18,
                    energyCost: 20,
                    execute: function(move) { return this.executePostIts(move); }
                },
                {
                    name: 'Paradigm Shift',
                    combo: ['down', 'left', 'x'],
                    damage: 0,
                    energyCost: 25,
                    execute: function(move) { return this.executeParadigmShift(move); }
                },
                {
                    name: 'Circle Back',
                    combo: ['left', 'down', 'right', 'z'],
                    damage: 20,
                    energyCost: 30,
                    execute: function(move) { return this.executeCircleBack(move); }
                },
                {
                    name: 'PERFORMANCE REVIEW',
                    combo: ['down', 'down', 'right', 'right', 'z'],
                    damage: 40,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executePerformanceReview(move); }
                }
            ]
        });
    }

    /**
     * Jonas's Punch: Briefcase Swing
     */
    animatePunch() {
        const fighter = this.element;
        const arena = this.arena;
        const fighterX = this.x;

        const rightArm = fighter.querySelector('.arm.right');

        // Create briefcase
        const briefcase = document.createElement('div');
        briefcase.innerHTML = `
            <div style="width: 28px; height: 20px; background: linear-gradient(180deg, #8b4513 0%, #654321 100%); border: 2px solid #4a2c0a; border-radius: 3px; position: relative; box-shadow: 1px 1px 3px rgba(0,0,0,0.4);">
                <div style="position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 8px; height: 4px; background: #4a2c0a; border-radius: 2px 2px 0 0;"></div>
                <div style="position: absolute; top: 7px; left: 50%; transform: translateX(-50%); width: 6px; height: 3px; background: #ffd700; border-radius: 1px;"></div>
            </div>
        `;
        briefcase.style.cssText = `position: absolute; left: ${fighterX + 50}px; bottom: 95px; z-index: 150; transform: rotate(-20deg);`;
        arena.appendChild(briefcase);

        let frame = 0;
        const swing = setInterval(() => {
            frame++;
            const angle = -20 + frame * 8;
            briefcase.style.transform = `rotate(${angle}deg)`;
            briefcase.style.left = (fighterX + 50 + frame * 3) + 'px';

            // Papers fly out
            if (frame === 8) {
                for (let i = 0; i < 3; i++) {
                    const paper = document.createElement('div');
                    paper.style.cssText = `
                        position: absolute; left: ${fighterX + 80}px; bottom: 100px;
                        width: 8px; height: 10px; background: #fff; border: 1px solid #ccc;
                        z-index: 148;
                    `;
                    arena.appendChild(paper);
                    let px = 0, py = 0;
                    const fly = setInterval(() => {
                        px += 4 + i;
                        py -= 2;
                        paper.style.transform = `translate(${px}px, ${py}px) rotate(${px * 8}deg)`;
                        paper.style.opacity = 1 - px / 40;
                        if (px > 35) { clearInterval(fly); paper.remove(); }
                    }, 25);
                }
            }

            if (frame >= 12) {
                clearInterval(swing);
                briefcase.remove();
            }
        }, 25);
    }

    /**
     * Jonas's Kick: Power kick
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
     * Post-its - Throw sticky notes
     */
    executePostIts(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const direction = this.getDirectionToTarget();

        const symbols = ['!', '✓', '*', '→', '★'];
        let hitsLanded = 0;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const note = document.createElement('div');
                note.className = 'projectile sticky-note';
                note.textContent = symbols[i];
                note.style.cssText = `
                    position: absolute;
                    left: ${fighterX + 40 * direction}px;
                    bottom: ${100 + i * 10}px;
                `;
                arena.appendChild(note);

                let noteX = fighterX + 40 * direction;
                const flyNote = setInterval(() => {
                    noteX += 12 * direction;
                    note.style.left = noteX + 'px';
                    note.style.transform = `rotate(${(noteX - fighterX) * 2}deg)`;

                    // Check if note reached target
                    const currentTargetX = this.getTargetX();
                    if (Math.abs(noteX - currentTargetX) < 40) {
                        clearInterval(flyNote);
                        if (hitsLanded === 0) {
                            this.damageTarget(move.damage);
                            this.combatSystem.showHitEffect(currentTargetX, 'POST-IT!', '#27ae60');
                        }
                        hitsLanded++;
                        note.remove();
                    } else if (noteX > 850 || noteX < 0) {
                        clearInterval(flyNote);
                        note.remove();
                    }
                }, 25);
            }, i * 60);
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 500);

        return { hit: hitsLanded > 0, damage: move.damage };
    }

    /**
     * Paradigm Shift - Shield with buzzwords
     */
    executeParadigmShift(move) {
        const arena = this.arena;
        const fighterX = this.x;

        // Create shield bubble
        const shield = document.createElement('div');
        shield.className = 'projectile paradigm-shield';
        shield.style.cssText = `
            position: absolute;
            left: ${fighterX - 30}px;
            bottom: 50px;
        `;

        // Add buzzwords
        const words = ['SYNERGY', 'LEVERAGE', 'PIVOT'];
        words.forEach((word, i) => {
            const bw = document.createElement('div');
            bw.className = 'buzzword';
            bw.textContent = word;
            bw.style.cssText = `
                position: absolute;
                top: ${20 + i * 25}px;
                left: 50%;
                transform: translateX(-50%);
            `;
            shield.appendChild(bw);
        });

        arena.appendChild(shield);

        // Animate rotation
        let angle = 0;
        const spin = setInterval(() => {
            angle += 5;
            shield.style.transform = `rotate(${angle}deg)`;
        }, 30);

        this.combatSystem.showHitEffect(fighterX, 'PARADIGM SHIFT!', '#27ae60');

        setTimeout(() => {
            clearInterval(spin);
            shield.remove();
            this.isAttacking = false;
            this.setState('idle');
        }, 1500);

        return { hit: false, damage: 0 };
    }

    /**
     * Circle Back - Teleport behind enemy
     */
    executeCircleBack(move) {
        const arena = this.arena;
        const fighter = this.element;
        const startX = this.x;
        const targetX = this.getTargetX();
        const behindX = targetX + 80;

        let hitDealt = false;

        // Draw arc trail
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = `
            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 160;
        `;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke', '#27ae60');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-dasharray', '8,4');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        arena.appendChild(svg);

        let progress = 0;
        const arcAnim = setInterval(() => {
            progress += 0.08;

            const currentX = startX + (behindX - startX) * progress;
            const arcHeight = Math.sin(progress * Math.PI) * 80;

            this.x = currentX;
            fighter.style.left = currentX + 'px';
            fighter.style.bottom = (80 + arcHeight) + 'px';
            fighter.style.opacity = '0.7';

            // Draw path
            const arenaHeight = arena.offsetHeight;
            let pathD = `M${startX + 25},${arenaHeight - 120}`;
            for (let t = 0; t <= progress; t += 0.05) {
                const px = startX + 25 + (behindX - startX) * t;
                const py = arenaHeight - 120 - Math.sin(Math.PI * t) * 80;
                pathD += ` L${px},${py}`;
            }
            path.setAttribute('d', pathD);

            if (progress >= 1) {
                clearInterval(arcAnim);

                fighter.style.opacity = '1';
                fighter.style.bottom = '80px';
                this.facingRight = false;
                fighter.classList.add('facing-left');

                this.combatSystem.showHitEffect(this.x, "Let's circle back!", '#27ae60');

                // Attack from behind
                setTimeout(() => {
                    const currentTargetX = this.getTargetX();
                    if (Math.abs(this.x - currentTargetX) < 100) {
                        this.damageTarget(move.damage);
                        this.combatSystem.showHitEffect(currentTargetX, 'BACKSTAB!', '#27ae60');
                        hitDealt = true;
                    }

                    svg.remove();

                    // Return to original position
                    setTimeout(() => {
                        this.x = startX;
                        fighter.style.left = startX + 'px';
                        fighter.classList.remove('facing-left');
                        this.isAttacking = false;
                        this.setState('idle');
                    }, 400);
                }, 200);
            }
        }, 25);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * PERFORMANCE REVIEW - Ultimate
     */
    executePerformanceReview(move) {
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

        // Create clipboard
        const clipboard = document.createElement('div');
        clipboard.innerHTML = `
            <div style="width: 50px; height: 65px; background: #deb887; border: 2px solid var(--ink); border-radius: 3px; position: relative;">
                <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); width: 20px; height: 10px; background: #8b4513; border-radius: 3px;"></div>
                <div style="position: absolute; top: 10px; left: 5px; right: 5px; height: 2px; background: var(--ink);"></div>
                <div style="position: absolute; top: 18px; left: 5px; right: 5px; height: 2px; background: var(--ink);"></div>
                <div style="position: absolute; top: 26px; left: 5px; right: 5px; height: 2px; background: var(--ink);"></div>
                <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); color: #c41e3a; font-weight: bold; font-size: 1rem;">F</div>
            </div>
        `;
        clipboard.style.cssText = `position: absolute; left: ${fighterX + 30}px; bottom: 140px; z-index: 160;`;
        arena.appendChild(clipboard);

        // Show review text
        const reviews = ['NEEDS IMPROVEMENT', 'UNDERPERFORMING', 'SEE ME AFTER'];
        let reviewIndex = 0;

        const showReview = setInterval(() => {
            if (reviewIndex >= reviews.length) {
                clearInterval(showReview);
                return;
            }

            const text = document.createElement('div');
            text.textContent = reviews[reviewIndex];
            text.style.cssText = `
                position: absolute;
                left: ${targetX - 50}px;
                bottom: ${150 + reviewIndex * 20}px;
                font-family: 'Patrick Hand', cursive;
                font-size: 0.9rem;
                color: #c41e3a;
                z-index: 165;
                animation: hitFloat 0.5s ease-out forwards;
            `;
            arena.appendChild(text);

            this.damageTarget(Math.floor(move.damage / 3));

            setTimeout(() => text.remove(), 500);
            reviewIndex++;
        }, 300);

        this.combatSystem.screenShake(5, 200);

        setTimeout(() => {
            clipboard.remove();
            this.combatSystem.showHitEffect(targetX, 'TERMINATED!', '#c41e3a');
            this.isAttacking = false;
            this.setState('idle');
        }, 1200);

        return { hit: true, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JonasCharacter, JONAS_SPRITE };
}
