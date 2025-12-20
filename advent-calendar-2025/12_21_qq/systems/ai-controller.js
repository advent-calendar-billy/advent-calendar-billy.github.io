/**
 * AI Controller - Controls NPC opponent behavior
 *
 * Handles:
 * - Movement decisions (approach, retreat, maintain distance)
 * - Attack decisions (punch, kick, special)
 * - Timing and reaction delays
 * - Difficulty scaling
 */

const AIController = {
    // AI behavior settings
    settings: {
        reactionTime: 300,      // ms delay before AI reacts
        attackCooldown: 800,    // ms between attacks
        specialChance: 0.20,    // 20% chance to use special when available
        aggressiveness: 0.6,    // How often AI approaches vs retreats
        optimalRange: 70,       // Preferred fighting distance
        moveSpeed: 3,           // Pixels per frame
        decisionInterval: 500   // ms between decisions
    },

    // State
    character: null,
    gameEngine: null,
    combatSystem: null,
    isActive: false,
    lastAttackTime: 0,
    lastDecisionTime: 0,
    currentAction: 'idle',
    updateInterval: null,

    /**
     * Initialize AI with character, game engine, and combat system
     */
    init(character, gameEngine, combatSystem) {
        this.character = character;
        this.gameEngine = gameEngine;
        this.combatSystem = combatSystem;
        this.lastAttackTime = 0;
        this.lastDecisionTime = 0;
        this.currentAction = 'idle';
        console.log('[AIController] Initialized for', character.name);
        return this;
    },

    /**
     * Start AI updates
     */
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.updateInterval = setInterval(() => this.update(), 50);
        console.log('[AIController] Started');
    },

    /**
     * Stop AI updates
     */
    stop() {
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('[AIController] Stopped');
    },

    /**
     * Main update loop
     */
    update() {
        if (!this.isActive || !this.character || !this.gameEngine) return;
        if (this.gameEngine.state.currentState !== this.gameEngine.STATES.FIGHTING) return;
        if (this.character.isAttacking) return;

        const now = Date.now();

        // Make decisions at intervals
        if (now - this.lastDecisionTime > this.settings.decisionInterval) {
            this.makeDecision();
            this.lastDecisionTime = now;
        }

        // Execute current action
        this.executeAction();
    },

    /**
     * Decide what to do next
     */
    makeDecision() {
        const playerX = this.gameEngine.state.playerX;
        const myX = this.character.x;
        const distance = Math.abs(playerX - myX);
        const now = Date.now();

        // Can we attack?
        const canAttack = now - this.lastAttackTime > this.settings.attackCooldown;

        // In attack range?
        const inPunchRange = distance < 70;
        const inKickRange = distance < 90;
        const inSpecialRange = distance < 150;

        // Decision logic
        if (canAttack && inPunchRange) {
            // Close range - attack!
            if (Math.random() < this.settings.specialChance && this.character.energy >= 20) {
                this.currentAction = 'special';
            } else if (Math.random() < 0.5) {
                this.currentAction = 'punch';
            } else {
                this.currentAction = 'kick';
            }
        } else if (canAttack && inKickRange) {
            // Medium range - kick or approach
            if (Math.random() < 0.4) {
                this.currentAction = 'kick';
            } else {
                this.currentAction = 'approach';
            }
        } else if (distance > this.settings.optimalRange) {
            // Too far - approach
            if (Math.random() < this.settings.aggressiveness) {
                this.currentAction = 'approach';
            } else {
                this.currentAction = 'idle';
            }
        } else if (distance < this.settings.optimalRange - 20) {
            // Too close - maybe retreat
            if (Math.random() < 0.3) {
                this.currentAction = 'retreat';
            } else if (canAttack) {
                this.currentAction = 'punch';
            }
        } else {
            // Optimal range - fight or wait
            if (canAttack && Math.random() < 0.5) {
                this.currentAction = Math.random() < 0.5 ? 'punch' : 'kick';
            } else {
                this.currentAction = 'idle';
            }
        }
    },

    /**
     * Execute the current action
     */
    executeAction() {
        const playerX = this.gameEngine.state.playerX;
        const myX = this.character.x;
        const direction = playerX > myX ? 1 : -1;

        switch (this.currentAction) {
            case 'approach':
                this.move(direction);
                break;

            case 'retreat':
                this.move(-direction);
                break;

            case 'punch':
                this.attack('punch');
                break;

            case 'kick':
                this.attack('kick');
                break;

            case 'special':
                this.attack('special');
                break;

            case 'idle':
            default:
                // Do nothing, maybe add idle animation
                break;
        }
    },

    /**
     * Move in a direction
     */
    move(direction) {
        if (!this.character || this.character.isAttacking) return;

        const newX = this.character.x + (direction * this.settings.moveSpeed);

        // Boundary check
        const minX = this.gameEngine.state.arenaMinX || 50;
        const maxX = this.gameEngine.state.arenaMaxX || 820;
        this.character.x = Math.max(minX, Math.min(maxX, newX));

        // Update game engine state
        this.gameEngine.state.opponentX = this.character.x;

        // Update visual position
        if (this.character.element) {
            this.character.element.style.left = this.character.x + 'px';
        }

        // Update facing direction
        this.character.facingRight = this.gameEngine.state.playerX > this.character.x;
        if (this.character.element) {
            if (this.character.facingRight) {
                this.character.element.classList.remove('facing-left');
            } else {
                this.character.element.classList.add('facing-left');
            }
        }
    },

    /**
     * Execute an attack
     */
    attack(type) {
        if (!this.character || this.character.isAttacking) return;

        const now = Date.now();
        if (now - this.lastAttackTime < this.settings.attackCooldown) return;

        this.lastAttackTime = now;
        this.currentAction = 'idle'; // Reset after attack

        // Add reaction delay
        setTimeout(() => {
            if (!this.isActive) return;

            switch (type) {
                case 'punch':
                    this.executePunch();
                    break;
                case 'kick':
                    this.executeKick();
                    break;
                case 'special':
                    this.executeSpecial();
                    break;
            }
        }, this.settings.reactionTime);
    },

    /**
     * Execute punch attack
     */
    executePunch() {
        if (!this.character) return;

        this.character.isAttacking = true;

        // Get positions
        const myX = this.character.x;
        const playerX = this.gameEngine.state.playerX;

        // Check range - PROPER HIT DETECTION
        const inRange = Math.abs(myX - playerX) < 70;

        // Set punching state
        if (this.character.element) {
            this.character.element.classList.remove('idle');
            this.character.element.classList.add('punching');
        }

        // Damage if in range
        if (inRange) {
            this.gameEngine.damagePlayer(this.character.punchDamage);
            if (this.combatSystem) {
                this.combatSystem.showHitEffect(playerX, 'HIT!', '#ff0000');
            }
            // Give Billy energy for landing hits
            this.character.energy = Math.min(this.character.maxEnergy, this.character.energy + 8);
            console.log('[AIController] Punch hit! Damage:', this.character.punchDamage, 'Energy:', this.character.energy);
        }

        // Reset after attack
        setTimeout(() => {
            this.character.isAttacking = false;
            if (this.character.element) {
                this.character.element.classList.remove('punching');
                this.character.element.classList.add('idle');
            }
        }, 300);
    },

    /**
     * Execute kick attack
     */
    executeKick() {
        if (!this.character) return;

        this.character.isAttacking = true;

        const myX = this.character.x;
        const playerX = this.gameEngine.state.playerX;

        // Check range - PROPER HIT DETECTION
        const inRange = Math.abs(myX - playerX) < 90;

        if (this.character.element) {
            this.character.element.classList.remove('idle');
            this.character.element.classList.add('kicking');
        }

        if (inRange) {
            this.gameEngine.damagePlayer(this.character.kickDamage);
            if (this.combatSystem) {
                this.combatSystem.showHitEffect(playerX, 'POW!', '#ff0000');
            }
            // Give Billy energy for landing hits
            this.character.energy = Math.min(this.character.maxEnergy, this.character.energy + 10);
            console.log('[AIController] Kick hit! Damage:', this.character.kickDamage, 'Energy:', this.character.energy);
        }

        setTimeout(() => {
            this.character.isAttacking = false;
            if (this.character.element) {
                this.character.element.classList.remove('kicking');
                this.character.element.classList.add('idle');
            }
        }, 400);
    },

    /**
     * Execute a special attack (pick random available)
     */
    executeSpecial() {
        if (!this.character || !this.character.specialMoves) return;

        // Filter moves by energy cost
        const available = this.character.specialMoves.filter(m =>
            !m.ultimate && (!m.energyCost || this.character.energy >= m.energyCost)
        );

        if (available.length === 0) {
            // Fall back to kick
            this.executeKick();
            return;
        }

        // Pick random available special
        const move = available[Math.floor(Math.random() * available.length)];

        console.log('[AIController] Using special:', move.name);
        this.character.executeSpecial(move.name);
    },

    /**
     * Set difficulty (affects AI behavior)
     * @param {string} level - 'easy', 'normal', 'hard'
     */
    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.settings.reactionTime = 500;
                this.settings.attackCooldown = 1200;
                this.settings.specialChance = 0.10;
                this.settings.aggressiveness = 0.4;
                break;
            case 'normal':
                this.settings.reactionTime = 300;
                this.settings.attackCooldown = 800;
                this.settings.specialChance = 0.20;
                this.settings.aggressiveness = 0.6;
                break;
            case 'hard':
                this.settings.reactionTime = 150;
                this.settings.attackCooldown = 500;
                this.settings.specialChance = 0.30;
                this.settings.aggressiveness = 0.8;
                break;
        }
        console.log('[AIController] Difficulty set to', level);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIController;
}
