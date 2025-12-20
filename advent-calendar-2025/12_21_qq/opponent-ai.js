// Opponent AI System for Family Fighter
// Controls enemy characters with varying difficulty levels

const OpponentAI = {
    // Current AI state
    state: {
        isActive: false,
        character: null,
        stats: null,
        x: 650,
        targetX: 650,
        health: 100,
        energy: 0,
        isAttacking: false,
        lastAttackTime: 0,
        moveTimer: 0,
        decisionTimer: 0,
        currentAction: 'idle',  // idle, approach, retreat, attack
        facingLeft: true
    },

    // Initialize AI with opponent data
    init(opponent, opponentStats) {
        console.log('[OpponentAI] Initializing:', opponent.name, 'HP:', opponentStats.hp, 'AttackChance:', opponentStats.attackChance);
        this.state = {
            isActive: true,
            character: opponent,
            stats: opponentStats,
            x: 650,
            targetX: 650,
            health: opponentStats.hp,
            maxHealth: opponentStats.hp,
            energy: 0,
            isAttacking: false,
            lastAttackTime: 0,
            moveTimer: 0,
            decisionTimer: 0,
            currentAction: 'idle',
            facingLeft: true
        };
        return this;
    },

    // Main update loop - call this every frame
    update(gameState) {
        if (!this.state.isActive || this.state.isAttacking) return;

        const playerX = gameState.playerX;
        const distance = Math.abs(this.state.x - playerX);

        // Update timers
        this.state.moveTimer++;
        this.state.decisionTimer++;

        // Make decisions periodically (faster = more reactive)
        if (this.state.decisionTimer >= 20) {
            this.state.decisionTimer = 0;
            this.makeDecision(playerX, distance);
        }

        // Execute current action
        this.executeAction(playerX, distance, gameState);

        // Always face the player
        this.state.facingLeft = this.state.x > playerX;

        return {
            x: this.state.x,
            facingLeft: this.state.facingLeft,
            action: this.state.currentAction
        };
    },

    // AI decision making
    makeDecision(playerX, distance) {
        const rand = Math.random();
        const difficulty = this.state.stats;

        // Base attack chance scaled by difficulty (minimum 30% at close range for all opponents)
        const baseAttackChance = Math.max(0.3, difficulty.attackChance * 10);

        // Determine action based on distance and randomness
        if (distance < 90) {
            // Close range - mostly attack!
            if (rand < baseAttackChance) {
                this.state.currentAction = 'attack';
            } else if (rand < baseAttackChance + 0.15) {
                this.state.currentAction = 'retreat';
            } else {
                this.state.currentAction = 'idle';
            }
        } else if (distance < 180) {
            // Medium range - approach and attack
            if (rand < baseAttackChance * 0.5) {
                this.state.currentAction = 'attack';
            } else if (rand < 0.75) {
                this.state.currentAction = 'approach';
            } else {
                this.state.currentAction = 'idle';
            }
        } else {
            // Long range - always approach
            if (rand < 0.85) {
                this.state.currentAction = 'approach';
            } else {
                this.state.currentAction = 'idle';
            }
        }
    },

    // Execute the current action
    executeAction(playerX, distance, gameState) {
        const arena = document.getElementById('arena');
        const maxX = arena ? arena.offsetWidth - 100 : 800;
        const minX = 50;
        const speed = this.state.stats.moveSpeed * 2;

        switch (this.state.currentAction) {
            case 'approach':
                if (distance > 70) {
                    if (this.state.x > playerX) {
                        this.state.x = Math.max(minX, this.state.x - speed);
                    } else {
                        this.state.x = Math.min(maxX, this.state.x + speed);
                    }
                }
                break;

            case 'retreat':
                // Move away from player
                if (this.state.x > playerX) {
                    this.state.x = Math.min(maxX, this.state.x + speed * 1.2);
                } else {
                    this.state.x = Math.max(minX, this.state.x - speed * 1.2);
                }
                break;

            case 'attack':
                if (distance < 120 && !this.state.isAttacking) {
                    this.performAttack(gameState);
                } else if (distance >= 120) {
                    // Too far, approach instead
                    this.state.currentAction = 'approach';
                }
                break;

            case 'idle':
            default:
                // Random small movements
                if (this.state.moveTimer % 60 === 0) {
                    this.state.targetX = this.state.x + (Math.random() - 0.5) * 50;
                    this.state.targetX = Math.max(minX, Math.min(maxX, this.state.targetX));
                }
                if (Math.abs(this.state.x - this.state.targetX) > speed) {
                    if (this.state.x < this.state.targetX) {
                        this.state.x += speed * 0.5;
                    } else {
                        this.state.x -= speed * 0.5;
                    }
                }
                break;
        }
    },

    // Perform an attack
    performAttack(gameState) {
        if (this.state.isAttacking) return;

        const now = Date.now();
        const cooldown = 400 + Math.random() * 200; // Variable cooldown 400-600ms
        if (now - this.state.lastAttackTime < cooldown) return;

        this.state.isAttacking = true;
        this.state.lastAttackTime = now;

        const attackType = Math.random();
        const distance = Math.abs(this.state.x - gameState.playerX);
        let damage = 0;
        let attackName = '';
        let attackDuration = 300;
        let isSpecial = false;

        // Check for special move (opponents with specialChance can use them)
        if (this.state.stats.specialChance && Math.random() < this.state.stats.specialChance) {
            damage = this.state.stats.damage.special;
            attackName = 'special';
            attackDuration = 600;
            isSpecial = true;
        } else if (attackType < 0.6) {
            // Punch (more common)
            damage = this.state.stats.damage.punch;
            attackName = 'punch';
            attackDuration = 300;
        } else {
            // Kick
            damage = this.state.stats.damage.kick;
            attackName = 'kick';
            attackDuration = 400;
        }

        // Always trigger the attack callback for animation, even if out of range
        // Hit detection is handled in the callback
        console.log('[OpponentAI] Performing attack:', attackName, 'damage:', damage, 'distance:', distance);
        if (this.onAttack) {
            this.onAttack({
                type: attackName,
                damage: damage,
                x: this.state.x,
                playerX: gameState.playerX,
                isSpecial: isSpecial,
                characterId: this.state.character ? this.state.character.id : null
            });
        } else {
            console.warn('[OpponentAI] Attack callback not set!');
        }

        // Reset attacking state after duration
        setTimeout(() => {
            this.state.isAttacking = false;
            this.state.currentAction = 'idle';
        }, attackDuration);

        // Build energy
        this.state.energy = Math.min(100, this.state.energy + 10);

        return { type: attackName, damage, duration: attackDuration };
    },

    // Take damage
    takeDamage(amount) {
        this.state.health = Math.max(0, this.state.health - amount);
        return this.state.health;
    },

    // Check if defeated
    isDefeated() {
        return this.state.health <= 0;
    },

    // Get health percentage
    getHealthPercent() {
        return (this.state.health / this.state.maxHealth) * 100;
    },

    // Reset for new round
    reset(opponent, opponentStats) {
        this.init(opponent, opponentStats);
    },

    // Callback setter for when AI attacks
    onAttack: null,

    // Set attack callback
    setAttackCallback(callback) {
        this.onAttack = callback;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpponentAI;
}
