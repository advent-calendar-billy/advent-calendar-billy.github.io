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

    // Knockback amounts
    KNOCKBACK: {
        punch: 15,
        kick: 25,
        special: 35,
        ultimate: 50
    },

    // Hitstun durations (ms)
    HITSTUN: {
        punch: 200,
        kick: 300,
        special: 400,
        ultimate: 600
    },

    // Combat state
    state: {
        playerInvincible: false,
        opponentInvincible: false,
        playerStunned: false,
        opponentStunned: false,
        playerBlocking: false,
        opponentBlocking: false,
        // Combo tracking
        playerCombo: 0,
        opponentCombo: 0,
        playerComboDamage: 0,
        opponentComboDamage: 0,
        comboResetTimer: null
    },

    // Combo reset delay (ms) - combo ends if no hit within this time
    COMBO_RESET_DELAY: 1500,

    // Reference to game engine
    gameEngine: null,

    // Reference to arena element
    arena: null,

    // Fighter elements for visual effects
    playerElement: null,
    opponentElement: null,

    // Initialize combat system
    init(gameEngine, arenaElement) {
        this.gameEngine = gameEngine;
        this.arena = arenaElement;
        this.playerElement = arenaElement?.querySelector('#player-fighter');
        this.opponentElement = arenaElement?.querySelector('#opponent-fighter');
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
        const target = isPlayer ? 'opponent' : 'player';

        // Check if target is invincible
        if (this.isInvincible(target)) {
            return { hit: false, damage: 0, blocked: false };
        }

        const inRange = this.isInRange(attackerX, targetX, this.RANGES.punch);

        if (inRange) {
            let damage = this.DAMAGE.punch;

            // Check for block (reduces damage by 75%)
            if (this.isBlocking(target)) {
                damage = Math.floor(damage * 0.25);
                this.showHitEffect(targetX, 'BLOCK!', '#4488ff');
                this.showDamageNumber(targetX, damage, true);
                return { hit: true, damage: damage, blocked: true };
            }

            if (isPlayer) {
                this.gameEngine.damageOpponent(damage);
                this.gameEngine.addPlayerEnergy(10);
            } else {
                this.gameEngine.damagePlayer(damage);
            }

            // Apply combat effects
            const knockbackDir = attackerX < targetX ? 1 : -1;
            this.applyKnockback(target, knockbackDir, this.KNOCKBACK.punch);
            this.applyHitstun(target, this.HITSTUN.punch);
            this.flashCharacter(target);

            // Track combo and show damage
            this.registerHit(isPlayer ? 'player' : 'opponent', damage);
            this.showDamageNumber(targetX, damage, false);

            this.showHitEffect(targetX, 'HIT!');
            return { hit: true, damage: damage, blocked: false };
        }

        return { hit: false, damage: 0, blocked: false };
    },

    /**
     * Execute a kick attack
     * @param {number} attackerX - Attacker's X position
     * @param {number} targetX - Target's X position
     * @param {boolean} isPlayer - True if player is attacking
     * @returns {object} Result with hit status and damage
     */
    executeKick(attackerX, targetX, isPlayer = true) {
        const target = isPlayer ? 'opponent' : 'player';

        // Check if target is invincible
        if (this.isInvincible(target)) {
            return { hit: false, damage: 0, blocked: false };
        }

        const inRange = this.isInRange(attackerX, targetX, this.RANGES.kick);

        if (inRange) {
            let damage = this.DAMAGE.kick;

            // Check for block (reduces damage by 75%)
            if (this.isBlocking(target)) {
                damage = Math.floor(damage * 0.25);
                this.showHitEffect(targetX, 'BLOCK!', '#4488ff');
                this.showDamageNumber(targetX, damage, true);
                return { hit: true, damage: damage, blocked: true };
            }

            if (isPlayer) {
                this.gameEngine.damageOpponent(damage);
                this.gameEngine.addPlayerEnergy(12);
            } else {
                this.gameEngine.damagePlayer(damage);
            }

            // Apply combat effects - kicks have more knockback
            const knockbackDir = attackerX < targetX ? 1 : -1;
            this.applyKnockback(target, knockbackDir, this.KNOCKBACK.kick);
            this.applyHitstun(target, this.HITSTUN.kick);
            this.flashCharacter(target);
            this.screenShake(3, 100); // Light screen shake on kicks

            // Track combo and show damage
            this.registerHit(isPlayer ? 'player' : 'opponent', damage);
            this.showDamageNumber(targetX, damage, false);

            this.showHitEffect(targetX, 'POW!');
            return { hit: true, damage: damage, blocked: false };
        }

        return { hit: false, damage: 0, blocked: false };
    },

    /**
     * Execute a special attack with custom damage
     * @param {number} attackerX - Attacker's X position
     * @param {number} targetX - Target's X position
     * @param {number} damage - Damage amount
     * @param {string} hitText - Text to show on hit
     * @param {boolean} isPlayer - True if player is attacking
     * @param {boolean} isUltimate - True if this is an ultimate move
     * @returns {object} Result with hit status and damage
     */
    executeSpecial(attackerX, targetX, damage, hitText = 'SPECIAL!', isPlayer = true, isUltimate = false) {
        const target = isPlayer ? 'opponent' : 'player';

        // Check if target is invincible
        if (this.isInvincible(target)) {
            return { hit: false, damage: 0, blocked: false };
        }

        const inRange = this.isInRange(attackerX, targetX, this.RANGES.special);

        if (inRange) {
            // Specials can't be blocked (or do reduced block damage)
            const blocking = this.isBlocking(target);
            let actualDamage = blocking ? Math.floor(damage * 0.5) : damage;

            if (isPlayer) {
                this.gameEngine.damageOpponent(actualDamage);
                this.gameEngine.addPlayerEnergy(15);
            } else {
                this.gameEngine.damagePlayer(actualDamage);
            }

            // Apply combat effects - specials have big knockback
            const knockbackDir = attackerX < targetX ? 1 : -1;
            const knockback = isUltimate ? this.KNOCKBACK.ultimate : this.KNOCKBACK.special;
            const hitstun = isUltimate ? this.HITSTUN.ultimate : this.HITSTUN.special;

            this.applyKnockback(target, knockbackDir, knockback);
            this.applyHitstun(target, hitstun);
            this.flashCharacter(target);
            this.screenShake(isUltimate ? 8 : 5, isUltimate ? 300 : 200);

            // Track combo and show damage
            this.registerHit(isPlayer ? 'player' : 'opponent', actualDamage);
            this.showDamageNumber(targetX, actualDamage, blocking);

            if (blocking) {
                this.showHitEffect(targetX, 'GUARD!', '#4488ff');
            } else {
                this.showHitEffect(targetX, hitText, '#ff6600');
            }

            return { hit: true, damage: actualDamage, blocked: blocking };
        }

        return { hit: false, damage: 0, blocked: false };
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

        // Track combo and show damage
        this.registerHit(isPlayerProjectile ? 'player' : 'opponent', damage);
        this.showDamageNumber(targetX, damage, false);

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
    },

    // ==========================================
    // Combat State Methods
    // ==========================================

    /**
     * Check if target is currently invincible
     * @param {string} target - 'player' or 'opponent'
     */
    isInvincible(target) {
        return target === 'player' ? this.state.playerInvincible : this.state.opponentInvincible;
    },

    /**
     * Check if target is currently blocking
     * @param {string} target - 'player' or 'opponent'
     */
    isBlocking(target) {
        return target === 'player' ? this.state.playerBlocking : this.state.opponentBlocking;
    },

    /**
     * Check if target is currently stunned
     * @param {string} target - 'player' or 'opponent'
     */
    isStunned(target) {
        return target === 'player' ? this.state.playerStunned : this.state.opponentStunned;
    },

    /**
     * Set blocking state for a target
     * @param {string} target - 'player' or 'opponent'
     * @param {boolean} blocking - Whether blocking
     */
    setBlocking(target, blocking) {
        if (target === 'player') {
            this.state.playerBlocking = blocking;
        } else {
            this.state.opponentBlocking = blocking;
        }

        // Update visual
        const element = target === 'player' ? this.playerElement : this.opponentElement;
        if (element) {
            if (blocking) {
                element.classList.add('blocking');
            } else {
                element.classList.remove('blocking');
            }
        }
    },

    /**
     * Apply hitstun to target (brief stagger, can't act)
     * @param {string} target - 'player' or 'opponent'
     * @param {number} duration - Hitstun duration in ms
     */
    applyHitstun(target, duration) {
        if (target === 'player') {
            this.state.playerStunned = true;
        } else {
            this.state.opponentStunned = true;
        }

        // Visual: add stunned class for animation
        const element = target === 'player' ? this.playerElement : this.opponentElement;
        if (element) {
            element.classList.add('stunned');
        }

        // Remove stun after duration and grant brief invincibility
        setTimeout(() => {
            if (target === 'player') {
                this.state.playerStunned = false;
            } else {
                this.state.opponentStunned = false;
            }

            if (element) {
                element.classList.remove('stunned');
            }

            // Grant brief invincibility after hitstun
            this.grantInvincibility(target, 200);
        }, duration);
    },

    /**
     * Grant temporary invincibility
     * @param {string} target - 'player' or 'opponent'
     * @param {number} duration - Invincibility duration in ms
     */
    grantInvincibility(target, duration) {
        if (target === 'player') {
            this.state.playerInvincible = true;
        } else {
            this.state.opponentInvincible = true;
        }

        // Visual: add invincible class (blinking effect)
        const element = target === 'player' ? this.playerElement : this.opponentElement;
        if (element) {
            element.classList.add('invincible');
        }

        setTimeout(() => {
            if (target === 'player') {
                this.state.playerInvincible = false;
            } else {
                this.state.opponentInvincible = false;
            }

            if (element) {
                element.classList.remove('invincible');
            }
        }, duration);
    },

    /**
     * Flash character white when hit
     * @param {string} target - 'player' or 'opponent'
     */
    flashCharacter(target) {
        const element = target === 'player' ? this.playerElement : this.opponentElement;
        if (!element) return;

        element.classList.add('hit-flash');

        setTimeout(() => {
            element.classList.remove('hit-flash');
        }, 100);
    },

    /**
     * Reset combat state (for new round)
     */
    resetState() {
        // Clear combo timer
        if (this.state.comboResetTimer) {
            clearTimeout(this.state.comboResetTimer);
        }

        this.state = {
            playerInvincible: false,
            opponentInvincible: false,
            playerStunned: false,
            opponentStunned: false,
            playerBlocking: false,
            opponentBlocking: false,
            playerCombo: 0,
            opponentCombo: 0,
            playerComboDamage: 0,
            opponentComboDamage: 0,
            comboResetTimer: null
        };

        // Remove all combat classes
        [this.playerElement, this.opponentElement].forEach(el => {
            if (el) {
                el.classList.remove('stunned', 'invincible', 'blocking', 'hit-flash');
            }
        });

        // Remove combo display
        this.hideComboDisplay();
    },

    // ==========================================
    // Combo System
    // ==========================================

    /**
     * Register a hit for combo tracking
     * @param {string} attacker - 'player' or 'opponent'
     * @param {number} damage - Damage dealt
     */
    registerHit(attacker, damage) {
        if (attacker === 'player') {
            this.state.playerCombo++;
            this.state.playerComboDamage += damage;
            this.state.opponentCombo = 0;
            this.state.opponentComboDamage = 0;
        } else {
            this.state.opponentCombo++;
            this.state.opponentComboDamage += damage;
            this.state.playerCombo = 0;
            this.state.playerComboDamage = 0;
        }

        // Show combo if 2+ hits
        if (this.state.playerCombo >= 2) {
            this.showComboDisplay(this.state.playerCombo, this.state.playerComboDamage, true);
        } else if (this.state.opponentCombo >= 2) {
            this.showComboDisplay(this.state.opponentCombo, this.state.opponentComboDamage, false);
        }

        // Reset combo timer
        if (this.state.comboResetTimer) {
            clearTimeout(this.state.comboResetTimer);
        }
        this.state.comboResetTimer = setTimeout(() => {
            this.resetCombo();
        }, this.COMBO_RESET_DELAY);
    },

    /**
     * Reset combo counters
     */
    resetCombo() {
        this.state.playerCombo = 0;
        this.state.opponentCombo = 0;
        this.state.playerComboDamage = 0;
        this.state.opponentComboDamage = 0;
        this.hideComboDisplay();
    },

    /**
     * Show combo counter on screen
     * @param {number} hits - Number of hits
     * @param {number} damage - Total combo damage
     * @param {boolean} isPlayer - Whether player did the combo
     */
    showComboDisplay(hits, damage, isPlayer) {
        let comboDisplay = document.getElementById('combo-counter');

        if (!comboDisplay && this.arena) {
            comboDisplay = document.createElement('div');
            comboDisplay.id = 'combo-counter';
            comboDisplay.className = 'combo-counter';
            this.arena.appendChild(comboDisplay);
        }

        if (comboDisplay) {
            comboDisplay.innerHTML = `
                <div class="combo-hits">${hits} HITS!</div>
                <div class="combo-damage">${damage} DMG</div>
            `;
            comboDisplay.className = `combo-counter ${isPlayer ? 'player-combo' : 'opponent-combo'} active`;
        }
    },

    /**
     * Hide combo display
     */
    hideComboDisplay() {
        const comboDisplay = document.getElementById('combo-counter');
        if (comboDisplay) {
            comboDisplay.classList.remove('active');
        }
    },

    /**
     * Show floating damage number
     * @param {number} x - X position
     * @param {number} damage - Damage amount
     * @param {boolean} isBlocked - Whether attack was blocked
     */
    showDamageNumber(x, damage, isBlocked = false) {
        if (!this.arena) return;

        const number = document.createElement('div');
        number.textContent = isBlocked ? `${damage}` : `-${damage}`;
        number.className = `damage-number ${isBlocked ? 'blocked' : ''}`;
        number.style.cssText = `
            position: absolute;
            left: ${x + Math.random() * 30 - 15}px;
            bottom: ${160 + Math.random() * 20}px;
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: ${isBlocked ? '16px' : '22px'};
            font-weight: bold;
            color: ${isBlocked ? '#4488ff' : '#ff4444'};
            text-shadow: 2px 2px 0 #000, -1px -1px 0 #000;
            pointer-events: none;
            z-index: 200;
            animation: damageFloat 0.8s ease-out forwards;
        `;

        this.arena.appendChild(number);

        setTimeout(() => {
            number.remove();
        }, 800);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatSystem;
}
