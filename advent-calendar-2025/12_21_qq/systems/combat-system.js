/**
 * Combat System - Hit detection and damage handling
 *
 * CRITICAL: Every attack MUST check hit detection.
 * No auto-damage allowed. Enemy must be able to dodge.
 *
 * Handles:
 * - Hit detection (range checks)
 * - Damage application
 * - Visual effects on hit
 * - Knockback
 */

const CombatSystem = {
    // Attack ranges
    RANGES: {
        punch: 60,
        kick: 80,
        special: 100,
        projectile_hitbox: 40
    },

    // Base damage values
    DAMAGE: {
        punch: 8,
        kick: 12,
        special: 20
    },

    // Reference to game engine
    gameEngine: null,

    // Reference to arena element
    arena: null,

    // Initialize combat system
    init(gameEngine, arenaElement) {
        this.gameEngine = gameEngine;
        this.arena = arenaElement;
        console.log('[CombatSystem] Initialized');
        return this;
    },

    /**
     * Check if attacker is in range to hit target
     * @param {number} attackerX - Attacker's X position
     * @param {number} targetX - Target's X position
     * @param {number} range - Attack range in pixels
     * @returns {boolean} True if in range
     */
    isInRange(attackerX, targetX, range) {
        return Math.abs(attackerX - targetX) < range;
    },

    /**
     * Execute a punch attack
     * @param {number} attackerX - Attacker's X position
     * @param {number} targetX - Target's X position
     * @param {boolean} isPlayer - True if player is attacking
     * @returns {object} Result with hit status and damage
     */
    executePunch(attackerX, targetX, isPlayer = true) {
        const inRange = this.isInRange(attackerX, targetX, this.RANGES.punch);

        if (inRange) {
            const damage = this.DAMAGE.punch;

            if (isPlayer) {
                this.gameEngine.damageOpponent(damage);
                this.gameEngine.addPlayerEnergy(10);
            } else {
                this.gameEngine.damagePlayer(damage);
            }

            this.showHitEffect(targetX, 'HIT!');
            return { hit: true, damage: damage };
        }

        return { hit: false, damage: 0 };
    },

    /**
     * Execute a kick attack
     * @param {number} attackerX - Attacker's X position
     * @param {number} targetX - Target's X position
     * @param {boolean} isPlayer - True if player is attacking
     * @returns {object} Result with hit status and damage
     */
    executeKick(attackerX, targetX, isPlayer = true) {
        const inRange = this.isInRange(attackerX, targetX, this.RANGES.kick);

        if (inRange) {
            const damage = this.DAMAGE.kick;

            if (isPlayer) {
                this.gameEngine.damageOpponent(damage);
                this.gameEngine.addPlayerEnergy(12);
            } else {
                this.gameEngine.damagePlayer(damage);
            }

            this.showHitEffect(targetX, 'POW!');
            return { hit: true, damage: damage };
        }

        return { hit: false, damage: 0 };
    },

    /**
     * Execute a special attack with custom damage
     * @param {number} attackerX - Attacker's X position
     * @param {number} targetX - Target's X position
     * @param {number} damage - Damage amount
     * @param {string} hitText - Text to show on hit
     * @param {boolean} isPlayer - True if player is attacking
     * @returns {object} Result with hit status and damage
     */
    executeSpecial(attackerX, targetX, damage, hitText = 'SPECIAL!', isPlayer = true) {
        const inRange = this.isInRange(attackerX, targetX, this.RANGES.special);

        if (inRange) {
            if (isPlayer) {
                this.gameEngine.damageOpponent(damage);
                this.gameEngine.addPlayerEnergy(15);
            } else {
                this.gameEngine.damagePlayer(damage);
            }

            this.showHitEffect(targetX, hitText, '#ff6600');
            return { hit: true, damage: damage };
        }

        return { hit: false, damage: 0 };
    },

    /**
     * Check projectile collision with target
     * @param {number} projectileX - Projectile's X position
     * @param {number} targetX - Target's X position
     * @returns {boolean} True if projectile hit target
     */
    checkProjectileHit(projectileX, targetX) {
        return this.isInRange(projectileX, targetX, this.RANGES.projectile_hitbox);
    },

    /**
     * Apply projectile damage
     * @param {number} damage - Damage amount
     * @param {string} hitText - Text to show
     * @param {number} targetX - Where to show effect
     * @param {boolean} isPlayerProjectile - True if player's projectile
     */
    applyProjectileDamage(damage, hitText, targetX, isPlayerProjectile = true) {
        if (isPlayerProjectile) {
            this.gameEngine.damageOpponent(damage);
            this.gameEngine.addPlayerEnergy(10);
        } else {
            this.gameEngine.damagePlayer(damage);
        }

        this.showHitEffect(targetX, hitText, '#ffcc00');
    },

    /**
     * Show hit effect at position
     * @param {number} x - X position
     * @param {string} text - Text to display
     * @param {string} color - Text color
     */
    showHitEffect(x, text = 'HIT!', color = '#ff0000') {
        if (!this.arena) return;

        const effect = document.createElement('div');
        effect.textContent = text;
        effect.className = 'hit-effect';
        effect.style.cssText = `
            position: absolute;
            left: ${x}px;
            bottom: 150px;
            font-family: 'Bangers', 'Impact', sans-serif;
            font-size: 28px;
            color: ${color};
            text-shadow: 2px 2px 0 #000, -1px -1px 0 #000;
            pointer-events: none;
            z-index: 200;
            animation: hitFloat 0.5s ease-out forwards;
        `;

        this.arena.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 500);
    },

    /**
     * Show damage number at position
     * @param {number} x - X position
     * @param {number} damage - Damage amount
     */
    showDamageNumber(x, damage) {
        if (!this.arena) return;

        const number = document.createElement('div');
        number.textContent = `-${damage}`;
        number.className = 'damage-number';
        number.style.cssText = `
            position: absolute;
            left: ${x + 20}px;
            bottom: 180px;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: bold;
            color: #ff4444;
            text-shadow: 1px 1px 0 #000;
            pointer-events: none;
            z-index: 200;
            animation: damageFloat 0.8s ease-out forwards;
        `;

        this.arena.appendChild(number);

        setTimeout(() => {
            number.remove();
        }, 800);
    },

    /**
     * Apply knockback to a character
     * @param {string} target - 'player' or 'opponent'
     * @param {number} direction - 1 (right) or -1 (left)
     * @param {number} amount - Knockback distance
     */
    applyKnockback(target, direction, amount = 30) {
        if (target === 'player') {
            this.gameEngine.movePlayer(direction * amount);
        } else {
            this.gameEngine.moveOpponent(direction * amount);
        }
    },

    /**
     * Create screen shake effect
     * @param {number} intensity - Shake intensity in pixels
     * @param {number} duration - Duration in ms
     */
    screenShake(intensity = 5, duration = 200) {
        if (!this.arena) return;

        const originalTransform = this.arena.style.transform;
        let elapsed = 0;
        const interval = 16;  // ~60fps

        const shake = setInterval(() => {
            elapsed += interval;

            if (elapsed >= duration) {
                clearInterval(shake);
                this.arena.style.transform = originalTransform;
                return;
            }

            const x = (Math.random() - 0.5) * intensity * 2;
            const y = (Math.random() - 0.5) * intensity * 2;
            this.arena.style.transform = `translate(${x}px, ${y}px)`;
        }, interval);
    },

    /**
     * Flash the screen (for heavy hits)
     * @param {string} color - Flash color
     * @param {number} duration - Duration in ms
     */
    screenFlash(color = 'white', duration = 100) {
        if (!this.arena) return;

        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: ${color};
            opacity: 0.5;
            pointer-events: none;
            z-index: 500;
        `;

        this.arena.appendChild(flash);

        setTimeout(() => {
            flash.remove();
        }, duration);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatSystem;
}
