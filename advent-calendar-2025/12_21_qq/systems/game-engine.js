/**
 * Game Engine - Core game loop and state management
 *
 * Handles:
 * - Game state (health, energy, positions)
 * - Main game loop (requestAnimationFrame)
 * - State transitions (menu, fighting, round end, etc.)
 */

const GameEngine = {
    // Game states
    STATES: {
        TITLE: 'title',
        CHARACTER_SELECT: 'character_select',
        PRE_FIGHT: 'pre_fight',
        FIGHTING: 'fighting',
        ROUND_END: 'round_end',
        MATCH_END: 'match_end',
        VICTORY: 'victory',
        GAME_OVER: 'game_over'
    },

    // Core game state
    state: {
        currentState: 'title',

        // Player state
        playerX: 150,
        playerY: 0,  // 0 = ground level
        playerHealth: 100,
        playerMaxHealth: 100,
        playerEnergy: 0,
        playerMaxEnergy: 100,
        playerFacingRight: true,
        playerState: 'idle',  // idle, walking, jumping, attacking, stunned

        // Opponent state
        opponentX: 650,
        opponentY: 0,
        opponentHealth: 100,
        opponentMaxHealth: 100,
        opponentEnergy: 0,
        opponentFacingRight: false,
        opponentState: 'idle',
        opponentTargetX: 650,

        // Match state
        playerWins: 0,
        opponentWins: 0,
        roundNumber: 1,
        matchNumber: 1,

        // Input state
        keys: {},

        // Timing
        lastFrameTime: 0,
        deltaTime: 0,
        frameCount: 0,

        // Arena bounds
        arenaWidth: 870,
        arenaMinX: 50,
        arenaMaxX: 820,

        // Character info
        selectedCharacter: null,
        currentOpponent: null
    },

    // Callbacks for UI updates
    callbacks: {
        onHealthChange: null,
        onEnergyChange: null,
        onStateChange: null,
        onRoundEnd: null,
        onMatchEnd: null
    },

    // Initialize the game engine
    init(config = {}) {
        // Apply config overrides
        if (config.arenaWidth) {
            this.state.arenaWidth = config.arenaWidth;
            this.state.arenaMaxX = config.arenaWidth - 50;
        }

        // Reset state
        this.resetState();

        console.log('[GameEngine] Initialized');
        return this;
    },

    // Reset game state for new match
    resetState() {
        this.state.playerHealth = this.state.playerMaxHealth;
        this.state.playerEnergy = 0;
        this.state.playerX = 150;
        this.state.playerY = 0;
        this.state.playerState = 'idle';
        this.state.playerFacingRight = true;

        this.state.opponentHealth = this.state.opponentMaxHealth;
        this.state.opponentEnergy = 0;
        this.state.opponentX = 650;
        this.state.opponentY = 0;
        this.state.opponentState = 'idle';
        this.state.opponentFacingRight = false;
        this.state.opponentTargetX = 650;

        this.state.keys = {};
    },

    // Reset for new round (keep wins)
    resetRound() {
        this.state.playerHealth = this.state.playerMaxHealth;
        this.state.playerEnergy = 0;
        this.state.playerX = 150;
        this.state.playerY = 0;
        this.state.playerState = 'idle';

        this.state.opponentHealth = this.state.opponentMaxHealth;
        this.state.opponentEnergy = 0;
        this.state.opponentX = 650;
        this.state.opponentY = 0;
        this.state.opponentState = 'idle';
        this.state.opponentTargetX = 650;
    },

    // Main game loop
    gameLoop: null,
    isRunning: false,

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.state.lastFrameTime = performance.now();
        this.gameLoop = requestAnimationFrame(this.loop.bind(this));
        console.log('[GameEngine] Game loop started');
    },

    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        console.log('[GameEngine] Game loop stopped');
    },

    loop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time
        this.state.deltaTime = currentTime - this.state.lastFrameTime;
        this.state.lastFrameTime = currentTime;
        this.state.frameCount++;

        // Update based on current game state
        if (this.state.currentState === this.STATES.FIGHTING) {
            this.updateFighting();
        }

        // Schedule next frame
        this.gameLoop = requestAnimationFrame(this.loop.bind(this));
    },

    // Update during fighting state
    updateFighting() {
        // Update player facing direction (always face opponent)
        this.state.playerFacingRight = this.state.opponentX > this.state.playerX;
        this.state.opponentFacingRight = this.state.playerX > this.state.opponentX;

        // Check for round end
        if (this.state.playerHealth <= 0) {
            this.endRound(false);  // Player lost
        } else if (this.state.opponentHealth <= 0) {
            this.endRound(true);  // Player won
        }
    },

    // State transitions
    setState(newState) {
        const oldState = this.state.currentState;
        this.state.currentState = newState;

        console.log(`[GameEngine] State: ${oldState} -> ${newState}`);

        if (this.callbacks.onStateChange) {
            this.callbacks.onStateChange(newState, oldState);
        }
    },

    // Start a fight
    startFight(opponent, opponentStats) {
        this.state.currentOpponent = opponent;

        if (opponentStats) {
            this.state.opponentMaxHealth = opponentStats.hp || 100;
            this.state.opponentHealth = this.state.opponentMaxHealth;
        }

        this.resetRound();
        this.setState(this.STATES.FIGHTING);
        this.start();
    },

    // End a round
    endRound(playerWon) {
        if (playerWon) {
            this.state.playerWins++;
        } else {
            this.state.opponentWins++;
        }

        this.state.roundNumber++;
        this.setState(this.STATES.ROUND_END);

        if (this.callbacks.onRoundEnd) {
            this.callbacks.onRoundEnd(playerWon, this.state.playerWins, this.state.opponentWins);
        }

        // Check for match end (best of 3)
        if (this.state.playerWins >= 2 || this.state.opponentWins >= 2) {
            this.endMatch(this.state.playerWins >= 2);
        }
    },

    // End a match
    endMatch(playerWon) {
        this.setState(this.STATES.MATCH_END);

        if (this.callbacks.onMatchEnd) {
            this.callbacks.onMatchEnd(playerWon);
        }
    },

    // Damage handling
    damagePlayer(amount) {
        this.state.playerHealth = Math.max(0, this.state.playerHealth - amount);

        if (this.callbacks.onHealthChange) {
            this.callbacks.onHealthChange('player', this.state.playerHealth, this.state.playerMaxHealth);
        }

        return this.state.playerHealth;
    },

    damageOpponent(amount) {
        this.state.opponentHealth = Math.max(0, this.state.opponentHealth - amount);

        if (this.callbacks.onHealthChange) {
            this.callbacks.onHealthChange('opponent', this.state.opponentHealth, this.state.opponentMaxHealth);
        }

        return this.state.opponentHealth;
    },

    // Energy handling
    addPlayerEnergy(amount) {
        this.state.playerEnergy = Math.min(this.state.playerMaxEnergy, this.state.playerEnergy + amount);

        if (this.callbacks.onEnergyChange) {
            this.callbacks.onEnergyChange('player', this.state.playerEnergy, this.state.playerMaxEnergy);
        }

        return this.state.playerEnergy;
    },

    usePlayerEnergy(amount) {
        if (this.state.playerEnergy >= amount) {
            this.state.playerEnergy -= amount;

            if (this.callbacks.onEnergyChange) {
                this.callbacks.onEnergyChange('player', this.state.playerEnergy, this.state.playerMaxEnergy);
            }

            return true;
        }
        return false;
    },

    // Character collision width (can't overlap)
    COLLISION_WIDTH: 50,

    // Position handling with boundary and collision checks
    movePlayer(dx) {
        let newX = this.state.playerX + dx;

        // Boundary check
        newX = Math.max(this.state.arenaMinX, Math.min(this.state.arenaMaxX, newX));

        // Collision check - can't walk through opponent
        const collisionDist = this.COLLISION_WIDTH;
        if (dx > 0 && newX > this.state.opponentX - collisionDist && this.state.playerX < this.state.opponentX) {
            // Moving right, would collide
            newX = this.state.opponentX - collisionDist;
        } else if (dx < 0 && newX < this.state.opponentX + collisionDist && this.state.playerX > this.state.opponentX) {
            // Moving left, would collide
            newX = this.state.opponentX + collisionDist;
        }

        this.state.playerX = newX;
        return this.state.playerX;
    },

    moveOpponent(dx) {
        let newX = this.state.opponentX + dx;

        // Boundary check
        newX = Math.max(this.state.arenaMinX, Math.min(this.state.arenaMaxX, newX));

        // Collision check - can't walk through player
        const collisionDist = this.COLLISION_WIDTH;
        if (dx > 0 && newX > this.state.playerX - collisionDist && this.state.opponentX < this.state.playerX) {
            // Moving right, would collide
            newX = this.state.playerX - collisionDist;
        } else if (dx < 0 && newX < this.state.playerX + collisionDist && this.state.opponentX > this.state.playerX) {
            // Moving left, would collide
            newX = this.state.playerX + collisionDist;
        }

        this.state.opponentX = newX;
        return this.state.opponentX;
    },

    // Hit detection helper
    isInRange(attackerX, targetX, range = 120) {
        return Math.abs(attackerX - targetX) < range;
    },

    // Get direction toward target (1 = right, -1 = left)
    getDirectionToward(fromX, toX) {
        return toX > fromX ? 1 : -1;
    },

    // Set callbacks
    on(event, callback) {
        if (this.callbacks.hasOwnProperty('on' + event.charAt(0).toUpperCase() + event.slice(1))) {
            this.callbacks['on' + event.charAt(0).toUpperCase() + event.slice(1)] = callback;
        }
        return this;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
