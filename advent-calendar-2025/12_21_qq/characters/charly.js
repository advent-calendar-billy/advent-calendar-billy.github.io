/**
 * Charly - The Excel Biker
 *
 * Punch: Wrench Swing
 * Kick: Boot Stomp
 * Specials: Wheelie Strike, Excel Throw, Rev Bomb, HIGHWAY TO HELL!
 */

// Charly's sprite template
const CHARLY_SPRITE = `
    <div class="fighter charly idle">
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
            <div class="leg"><div class="boot"></div></div>
            <div class="leg"><div class="boot"></div></div>
        </div>
    </div>
`;

/**
 * Charly Character Class
 */
class CharlyCharacter extends CharacterBase {
    constructor() {
        super({
            id: 'charly',
            name: 'CHARLY',
            color: '#c0392b',
            punchDamage: 9,
            kickDamage: 11,
            spriteTemplate: CHARLY_SPRITE,
            specialMoves: [
                {
                    name: 'Wheelie Strike',
                    combo: ['down', 'left', 'right', 'z'],
                    damage: 22,
                    energyCost: 20,
                    execute: function(move) { return this.executeWheelieStrike(move); }
                },
                {
                    name: 'Excel Throw',
                    combo: ['down', 'right', 'z'],
                    damage: 20,
                    energyCost: 25,
                    execute: function(move) { return this.executeExcelThrow(move); }
                },
                {
                    name: 'Rev Bomb',
                    combo: ['down', 'down', 'x'],
                    damage: 18,
                    energyCost: 20,
                    execute: function(move) { return this.executeRevBomb(move); }
                },
                {
                    name: 'HIGHWAY TO HELL!',
                    combo: ['down', 'right', 'down', 'right', 'z'],
                    damage: 50,
                    energyCost: 100,
                    ultimate: true,
                    execute: function(move) { return this.executeHighwayToHell(move); }
                }
            ]
        });
    }

    /**
     * Charly's Wrench Swing
     */
    animatePunch() {
        if (this.element) {
            const rightArm = this.element.querySelector('.arm.right');
            if (rightArm) {
                rightArm.style.transition = 'transform 0.12s ease-out';
                rightArm.style.transform = 'rotate(80deg) translateX(6px)';
                setTimeout(() => {
                    rightArm.style.transform = 'rotate(-12deg)';
                }, 200);
            }
        }
    }

    /**
     * Charly's Boot Stomp
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
     * Wheelie Strike - Motorcycle wheelie attack
     */
    executeWheelieStrike(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create motorcycle
        const moto = document.createElement('div');
        moto.className = 'motorcycle';
        moto.innerHTML = `
            <div class="motorcycle-body"></div>
            <div class="motorcycle-wheel front"></div>
            <div class="motorcycle-wheel back"></div>
        `;
        moto.style.cssText = `
            position: absolute;
            left: ${fighterX - 20}px;
            bottom: 68px;
        `;
        arena.appendChild(moto);

        this.combatSystem.showHitEffect(fighterX, 'VROOM!', '#c0392b');

        let motoX = fighterX - 20;
        let wheelie = 0;

        const rideAnim = setInterval(() => {
            motoX += 12 * direction;
            wheelie = Math.min(wheelie + 2, 25);

            moto.style.left = motoX + 'px';
            moto.style.transform = `rotate(${-wheelie * direction}deg)`;

            // Check hit
            const currentTargetX = this.getTargetX();
            if (!hitDealt && Math.abs(motoX + 30 - currentTargetX) < 50) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, 'WHEELIE!', '#c0392b');
                this.combatSystem.screenShake(4, 150);
                hitDealt = true;
            }

            if (Math.abs(motoX - fighterX) > 300) {
                clearInterval(rideAnim);
                moto.remove();
            }
        }, 25);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 700);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Excel Throw - Throw spreadsheets
     */
    executeExcelThrow(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const direction = this.getDirectionToTarget();

        let hitDealt = false;

        // Create Excel spreadsheet
        const sheet = document.createElement('div');
        sheet.className = 'excel-sheet';
        sheet.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 20px); gap: 1px; padding: 2px;">
                <div class="excel-cell">A1</div>
                <div class="excel-cell">B1</div>
                <div class="excel-cell">C1</div>
                <div class="excel-cell">=SUM</div>
                <div class="excel-cell">42</div>
                <div class="excel-cell">#REF</div>
            </div>
        `;
        sheet.style.cssText = `
            position: absolute;
            left: ${fighterX + 30 * direction}px;
            bottom: 120px;
            width: 65px;
            height: 40px;
        `;
        arena.appendChild(sheet);

        let sheetX = fighterX + 30 * direction;
        let rotation = 0;

        const flySheet = setInterval(() => {
            sheetX += 12 * direction;
            rotation += 10;
            sheet.style.left = sheetX + 'px';
            sheet.style.transform = `rotate(${rotation}deg)`;

            // Check hit
            const currentTargetX = this.getTargetX();
            if (!hitDealt && Math.abs(sheetX - currentTargetX) < 45) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(currentTargetX, '#VALUE!', '#27ae60');
                hitDealt = true;
                clearInterval(flySheet);
                sheet.remove();
            }

            if (Math.abs(sheetX - fighterX) > 400) {
                clearInterval(flySheet);
                sheet.remove();
            }
        }, 25);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 600);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * Rev Bomb - Engine explosion
     */
    executeRevBomb(move) {
        const arena = this.arena;
        const fighterX = this.x;
        const targetX = this.getTargetX();
        const distance = Math.abs(targetX - fighterX);

        let hitDealt = false;

        this.combatSystem.showHitEffect(fighterX, 'VROOOOM!', '#c0392b');

        // Create smoke clouds
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const smoke = document.createElement('div');
                smoke.className = 'rev-smoke';
                smoke.style.cssText = `
                    position: absolute;
                    left: ${fighterX + (Math.random() - 0.5) * 60}px;
                    bottom: ${70 + Math.random() * 30}px;
                    width: ${15 + Math.random() * 15}px;
                    height: ${15 + Math.random() * 15}px;
                `;
                arena.appendChild(smoke);

                let smokeSize = parseFloat(smoke.style.width);
                const expandSmoke = setInterval(() => {
                    smokeSize += 5;
                    smoke.style.width = smokeSize + 'px';
                    smoke.style.height = smokeSize + 'px';
                    smoke.style.opacity = 1 - smokeSize / 80;

                    if (smokeSize > 60) {
                        clearInterval(expandSmoke);
                        smoke.remove();
                    }
                }, 30);
            }, i * 50);
        }

        // Shockwave damage
        setTimeout(() => {
            if (distance < 150) {
                this.damageTarget(move.damage);
                this.combatSystem.showHitEffect(targetX, 'BOOM!', '#c0392b');
                this.combatSystem.screenShake(5, 200);
                hitDealt = true;
            }
        }, 300);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 600);

        return { hit: hitDealt, damage: move.damage };
    }

    /**
     * HIGHWAY TO HELL! - Ultimate: Full motorcycle rampage
     */
    executeHighwayToHell(move) {
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

        let totalHits = 0;

        this.combatSystem.showHitEffect(fighterX, 'HIGHWAY TO HELL!', '#c0392b');

        // Create big motorcycle
        const hellBike = document.createElement('div');
        hellBike.style.cssText = `
            position: absolute;
            left: ${fighterX - 40}px;
            bottom: 60px;
            z-index: 150;
        `;
        hellBike.innerHTML = `
            <div style="width: 80px; height: 40px; background: linear-gradient(180deg, #c0392b, #7b241c); border: 3px solid var(--ink); border-radius: 15px 25px 5px 5px; position: relative;">
                <div style="position: absolute; bottom: -15px; left: 5px; width: 25px; height: 25px; background: #333; border: 3px solid var(--ink); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -15px; right: 5px; width: 25px; height: 25px; background: #333; border: 3px solid var(--ink); border-radius: 50%;"></div>
                <div style="position: absolute; top: -10px; left: 20px; font-size: 1.5rem;"></div>
            </div>
        `;
        arena.appendChild(hellBike);

        let bikeX = fighterX - 40;

        const rampageAnim = setInterval(() => {
            bikeX += 15 * direction;
            hellBike.style.left = bikeX + 'px';
            hellBike.style.transform = `rotate(${Math.sin(bikeX / 20) * 5}deg)`;

            // Fire trail
            if (Math.random() > 0.5) {
                const fire = document.createElement('div');
                fire.textContent = '';
                fire.style.cssText = `
                    position: absolute;
                    left: ${bikeX + 40}px;
                    bottom: ${65 + Math.random() * 20}px;
                    font-size: 1.2rem;
                    z-index: 145;
                `;
                arena.appendChild(fire);
                setTimeout(() => fire.remove(), 300);
            }

            // Check hit
            const currentTargetX = this.getTargetX();
            if (Math.abs(bikeX + 40 - currentTargetX) < 50 && totalHits < 3) {
                this.damageTarget(Math.floor(move.damage / 3));
                totalHits++;
                this.combatSystem.screenShake(4, 100);
            }

            if (Math.abs(bikeX - fighterX) > 400) {
                clearInterval(rampageAnim);
                hellBike.remove();
            }
        }, 25);

        this.combatSystem.screenShake(6, 600);

        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 1000);

        return { hit: totalHits > 0, damage: move.damage };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharlyCharacter, CHARLY_SPRITE };
}
