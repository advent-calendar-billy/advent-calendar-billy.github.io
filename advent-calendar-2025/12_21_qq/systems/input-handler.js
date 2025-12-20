/**
 * Input Handler - Keyboard input and combo detection
 *
 * Handles:
 * - Key press/release tracking
 * - Combo input detection (e.g., down, right, Z)
 * - Movement input
 * - Attack input
 */

const InputHandler = {
    // Current key states
    keys: {},

    // Combo tracking
    comboBuffer: [],
    comboTimeout: null,
    COMBO_WINDOW: 500,  // ms to complete a combo
    MAX_COMBO_LENGTH: 5,

    // Input mapping
    INPUT_MAP: {
        'ArrowDown': 'down',
        'ArrowUp': 'up',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'z': 'z',
        'Z': 'z',
        'x': 'x',
        'X': 'x',
        'c': 'c',
        'C': 'c'
    },

    // Registered move lists (per character)
    moveLists: {},
    currentCharacter: null,

    // Callbacks
    callbacks: {
        onPunch: null,
        onKick: null,
        onJump: null,
        onSpecial: null,
        onUltimate: null,
        onMove: null,
        onBlock: null
    },

    // Movement state
    isMovingLeft: false,
    isMovingRight: false,

    // Blocking state (holding back)
    isBlocking: false,

    // Attack lockout (prevent spam)
    isAttacking: false,
    attackLockout: 0,

    // Initialize input handler
    init() {
        this.bindEvents();
        console.log('[InputHandler] Initialized');
        return this;
    },

    // Bind keyboard events
    bindEvents() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    },

    // Unbind events (for cleanup)
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    },

    // Handle key down
    handleKeyDown(e) {
        // Prevent default for game keys
        if (this.INPUT_MAP[e.key]) {
            e.preventDefault();
        }

        // Track key state
        this.keys[e.key] = true;

        // Map to combo input
        const input = this.INPUT_MAP[e.key];
        if (!input) return;

        // Handle movement keys
        if (input === 'left') {
            this.isMovingLeft = true;
            if (this.callbacks.onMove) {
                this.callbacks.onMove(-1);
            }
        } else if (input === 'right') {
            this.isMovingRight = true;
            if (this.callbacks.onMove) {
                this.callbacks.onMove(1);
            }
        }

        // Handle attack keys (only if not in attack lockout)
        if (!this.isAttacking) {
            if (input === 'z') {
                // Check for special move first
                this.addToCombo('z');
                const special = this.checkCombo();
                if (special) {
                    this.executeSpecial(special);
                } else {
                    this.executePunch();
                }
            } else if (input === 'x') {
                this.addToCombo('x');
                const special = this.checkCombo();
                if (special) {
                    this.executeSpecial(special);
                } else {
                    this.executeKick();
                }
            } else if (input === 'c') {
                this.executeJump();
            } else {
                // Direction keys add to combo buffer
                this.addToCombo(input);
            }
        }
    },

    // Handle key up
    handleKeyUp(e) {
        this.keys[e.key] = false;

        const input = this.INPUT_MAP[e.key];
        if (input === 'left') {
            this.isMovingLeft = false;
        } else if (input === 'right') {
            this.isMovingRight = false;
        }
    },

    // Add input to combo buffer
    addToCombo(input) {
        this.comboBuffer.push({
            input: input,
            time: Date.now()
        });

        // Limit buffer size
        if (this.comboBuffer.length > this.MAX_COMBO_LENGTH) {
            this.comboBuffer.shift();
        }

        // Clear combo after timeout
        if (this.comboTimeout) {
            clearTimeout(this.comboTimeout);
        }
        this.comboTimeout = setTimeout(() => {
            this.comboBuffer = [];
        }, this.COMBO_WINDOW);
    },

    // Check if current combo matches any special move
    checkCombo() {
        if (!this.currentCharacter || !this.moveLists[this.currentCharacter]) {
            return null;
        }

        const moves = this.moveLists[this.currentCharacter];
        const now = Date.now();

        // Get recent inputs within combo window
        const recentInputs = this.comboBuffer
            .filter(entry => now - entry.time < this.COMBO_WINDOW)
            .map(entry => entry.input);

        // Check each special move
        for (const move of moves) {
            if (this.matchesCombo(recentInputs, move.combo)) {
                return move;
            }
        }

        return null;
    },

    // Check if input sequence matches a combo
    matchesCombo(inputs, combo) {
        if (inputs.length < combo.length) return false;

        // Check if the last N inputs match the combo
        const startIndex = inputs.length - combo.length;
        for (let i = 0; i < combo.length; i++) {
            if (inputs[startIndex + i] !== combo[i]) {
                return false;
            }
        }

        return true;
    },

    // Execute punch
    executePunch() {
        if (this.isAttacking) return;

        this.isAttacking = true;
        this.attackLockout = Date.now();

        if (this.callbacks.onPunch) {
            this.callbacks.onPunch();
        }

        // Attack lockout duration
        setTimeout(() => {
            this.isAttacking = false;
        }, 300);
    },

    // Execute kick
    executeKick() {
        if (this.isAttacking) return;

        this.isAttacking = true;
        this.attackLockout = Date.now();

        if (this.callbacks.onKick) {
            this.callbacks.onKick();
        }

        // Attack lockout duration
        setTimeout(() => {
            this.isAttacking = false;
        }, 400);
    },

    // Execute jump
    executeJump() {
        if (this.callbacks.onJump) {
            this.callbacks.onJump();
        }
    },

    // Execute special move
    executeSpecial(move) {
        if (this.isAttacking) return;

        this.isAttacking = true;
        this.comboBuffer = [];  // Clear combo buffer after successful special

        if (this.callbacks.onSpecial) {
            this.callbacks.onSpecial(move);
        }

        // Special moves have longer lockout
        const lockoutDuration = move.ultimate ? 800 : 500;
        setTimeout(() => {
            this.isAttacking = false;
        }, lockoutDuration);
    },

    // Register move list for a character
    registerMoveList(characterId, moves) {
        this.moveLists[characterId] = moves;
    },

    // Set current character (for combo detection)
    setCharacter(characterId) {
        this.currentCharacter = characterId;
        this.comboBuffer = [];
    },

    // Get current movement direction (-1 = left, 0 = none, 1 = right)
    getMovementDirection() {
        if (this.isMovingLeft && !this.isMovingRight) return -1;
        if (this.isMovingRight && !this.isMovingLeft) return 1;
        return 0;
    },

    /**
     * Check if player is blocking (holding back)
     * @param {boolean} facingRight - Whether player is facing right
     * @returns {boolean} True if player is holding back (blocking)
     */
    isHoldingBack(facingRight) {
        // Block by holding the direction AWAY from opponent
        if (facingRight) {
            return this.isMovingLeft && !this.isMovingRight;
        } else {
            return this.isMovingRight && !this.isMovingLeft;
        }
    },

    /**
     * Update blocking state based on facing direction
     * Call this each frame from the game loop
     * @param {boolean} facingRight - Whether player is facing right
     * @param {function} combatSystem - Reference to CombatSystem for setting block state
     */
    updateBlockState(facingRight, combatSystem) {
        const wasBlocking = this.isBlocking;
        this.isBlocking = this.isHoldingBack(facingRight) && !this.isAttacking;

        // Notify combat system of blocking state change
        if (combatSystem && this.isBlocking !== wasBlocking) {
            combatSystem.setBlocking('player', this.isBlocking);

            if (this.callbacks.onBlock) {
                this.callbacks.onBlock(this.isBlocking);
            }
        }
    },

    // Check if a key is currently held
    isKeyDown(key) {
        return !!this.keys[key];
    },

    // Set callback
    on(event, callback) {
        const callbackName = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
        if (this.callbacks.hasOwnProperty(callbackName)) {
            this.callbacks[callbackName] = callback;
        }
        return this;
    },

    // Clear all callbacks
    clearCallbacks() {
        for (const key in this.callbacks) {
            this.callbacks[key] = null;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}
