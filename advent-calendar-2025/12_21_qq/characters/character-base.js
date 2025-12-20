/**
 * Character Base Class
 *
 * Base class for all fighters. Each character extends this
 * and implements their own special attacks.
 *
 * IMPORTANT: All attacks must check hit detection properly.
 * See CLAUDE.md for hit detection requirements.
 */

class CharacterBase {
    constructor(config) {
        // Character identity
        this.id = config.id;
        this.name = config.name;
        this.color = config.color;

        // Stats
        this.maxHealth = config.maxHealth || 100;
        this.health = this.maxHealth;
        this.maxEnergy = config.maxEnergy || 100;
        this.energy = 0;

        // Position and state
        this.x = 0;
        this.y = 0;
        this.facingRight = true;
        this.state = 'idle'; // idle, walking, jumping, attacking, stunned, special
        this.isAttacking = false;
        this.isPlayer = true; // Set to false for AI-controlled opponents

        // References
        this.element = null;
        this.arena = null;
        this.gameEngine = null;
        this.combatSystem = null;

        // Attack damage values
        this.punchDamage = config.punchDamage || 8;
        this.kickDamage = config.kickDamage || 12;

        // Special moves list (override in subclass)
        this.specialMoves = config.specialMoves || [];

        // Sprite template (HTML string)
        this.spriteTemplate = config.spriteTemplate || '';

        console.log(`[Character] Created ${this.name}`);
    }

    /**
     * Initialize character with game references
     */
    init(gameEngine, combatSystem, arenaElement, fighterElement) {
        this.gameEngine = gameEngine;
        this.combatSystem = combatSystem;
        this.arena = arenaElement;
        this.element = fighterElement;

        // Set initial position
        this.updateVisualPosition();

        return this;
    }

    /**
     * Create the DOM element for this character's sprite
     */
    createSprite() {
        const container = document.createElement('div');
        container.innerHTML = this.spriteTemplate;
        return container.firstElementChild;
    }

    /**
     * Update visual position to match state
     */
    updateVisualPosition() {
        if (!this.element) return;

        this.element.style.left = this.x + 'px';

        // Update facing direction
        if (this.facingRight) {
            this.element.classList.remove('facing-left');
            this.element.classList.add('facing-right');
        } else {
            this.element.classList.remove('facing-right');
            this.element.classList.add('facing-left');
        }
    }

    /**
     * Set character state and update CSS classes
     */
    setState(newState) {
        const oldState = this.state;
        this.state = newState;

        if (this.element) {
            this.element.classList.remove('idle', 'walking', 'jumping', 'attacking', 'stunned', 'special', 'punching', 'kicking');
            this.element.classList.add(newState);
        }

        return oldState;
    }

    /**
     * Get the target X position (opponent's position)
     * Override if needed for NPC behavior
     */
    getTargetX() {
        if (this.gameEngine) {
            return this.gameEngine.state.opponentX;
        }
        return 650;
    }

    /**
     * Get direction toward target (1 = right, -1 = left)
     */
    getDirectionToTarget() {
        const targetX = this.getTargetX();
        return targetX > this.x ? 1 : -1;
    }

    /**
     * Execute basic punch attack
     * Can be overridden for character-specific animations
     */
    executePunch() {
        if (this.isAttacking) return { hit: false, damage: 0 };

        this.isAttacking = true;
        this.setState('punching');

        const targetX = this.getTargetX();
        const result = this.combatSystem.executePunch(this.x, targetX, true);

        // Animate the punch (override in subclass for custom animation)
        this.animatePunch();

        // Reset after attack
        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 300);

        return result;
    }

    /**
     * Punch animation - override in subclass for character-specific visuals
     */
    animatePunch() {
        // Default: just use CSS animation
        const rightArm = this.element?.querySelector('.arm.right');
        if (rightArm) {
            rightArm.style.transition = 'transform 0.1s';
            rightArm.style.transform = 'rotate(70deg)';
            setTimeout(() => {
                rightArm.style.transform = '';
            }, 200);
        }
    }

    /**
     * Execute basic kick attack
     * Can be overridden for character-specific animations
     */
    executeKick() {
        if (this.isAttacking) return { hit: false, damage: 0 };

        this.isAttacking = true;
        this.setState('kicking');

        const targetX = this.getTargetX();
        const result = this.combatSystem.executeKick(this.x, targetX, true);

        // Animate the kick (override in subclass for custom animation)
        this.animateKick();

        // Reset after attack
        setTimeout(() => {
            this.isAttacking = false;
            this.setState('idle');
        }, 400);

        return result;
    }

    /**
     * Kick animation - override in subclass for character-specific visuals
     */
    animateKick() {
        // Default: just use CSS animation
        if (this.element) {
            this.element.classList.add('kicking');
            setTimeout(() => {
                this.element.classList.remove('kicking');
            }, 250);
        }
    }

    /**
     * Execute special move by name
     */
    executeSpecial(moveName) {
        const move = this.specialMoves.find(m => m.name === moveName);
        if (!move) {
            console.warn(`[Character] Unknown special move: ${moveName}`);
            return { hit: false, damage: 0 };
        }

        if (this.isAttacking) return { hit: false, damage: 0 };

        // Check energy requirement
        if (move.energyCost && this.energy < move.energyCost) {
            console.log(`[Character] Not enough energy for ${moveName}`);
            return { hit: false, damage: 0 };
        }

        this.isAttacking = true;
        this.setState('special');

        // Deduct energy
        if (move.energyCost) {
            this.energy -= move.energyCost;
            if (this.gameEngine && this.gameEngine.callbacks.onEnergyChange) {
                this.gameEngine.callbacks.onEnergyChange('player', this.energy, this.maxEnergy);
            }
        }

        // Call the move's execute function
        const result = move.execute.call(this, move);

        return result;
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health;
    }

    /**
     * Deal damage to the target (player damages opponent, opponent damages player)
     * This ensures AI-controlled characters damage the correct target
     */
    damageTarget(amount) {
        if (!this.gameEngine) return 0;

        if (this.isPlayer) {
            return this.gameEngine.damageOpponent(amount);
        } else {
            return this.gameEngine.damagePlayer(amount);
        }
    }

    /**
     * Add energy
     */
    addEnergy(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        return this.energy;
    }

    /**
     * Reset for new round
     */
    reset() {
        this.health = this.maxHealth;
        this.energy = 0;
        this.state = 'idle';
        this.isAttacking = false;
    }

    /**
     * Clean up DOM elements and animations
     */
    cleanup() {
        // Remove any projectiles or effects created by this character
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterBase;
}
