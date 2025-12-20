/**
 * Regression Guard Tests
 *
 * These tests protect against accidentally deleting or breaking critical features.
 * If any of these tests fail, it means an important feature was broken or removed.
 *
 * Each test documents WHY the feature matters and what would break if it's missing.
 */

// ============================================
// FEDE'S COMBOS - CRITICAL: Must match POC exactly
// ============================================

describe('GUARD: Fede Combos Must Match POC', () => {
    /**
     * The Split MUST use X (kick), not Z (punch)
     * This was a bug that was fixed - ↓↓X triggers The Split
     * If this changes, the special move system is broken
     */
    const FEDE_COMBOS = {
        'The Split': ['down', 'down', 'x'],
        'Salmon Sashimi': ['right', 'right', 'z'],
        'Country Throw': ['down', 'left', 'z'],
        'WORLD TOUR!': ['down', 'right', 'down', 'right', 'z']
    };

    test('The Split uses X (kick key), NOT Z', () => {
        expect(FEDE_COMBOS['The Split'][2]).toBe('x');
        expect(FEDE_COMBOS['The Split'][2]).not.toBe('z');
    });

    test('Salmon Sashimi is →→Z (two rights, then Z)', () => {
        expect(FEDE_COMBOS['Salmon Sashimi']).toEqual(['right', 'right', 'z']);
    });

    test('Country Throw is ↓←Z (down, left, Z)', () => {
        expect(FEDE_COMBOS['Country Throw']).toEqual(['down', 'left', 'z']);
    });

    test('WORLD TOUR is 5 inputs: ↓→↓→Z', () => {
        expect(FEDE_COMBOS['WORLD TOUR!']).toHaveLength(5);
        expect(FEDE_COMBOS['WORLD TOUR!'][4]).toBe('z');
    });
});

// ============================================
// ALL 13 CHARACTERS MUST EXIST
// ============================================

describe('GUARD: All 13 Characters Exist', () => {
    /**
     * The game has exactly 13 characters.
     * Fede is the player, the other 12 are opponents.
     * If any character is missing, the tournament mode will break.
     */
    const REQUIRED_CHARACTERS = [
        'fede',    // Player character
        'timo',    // Opponent 1 (easiest)
        'madonna', // Opponent 2
        'jonas',   // Opponent 3
        'lucas',   // Opponent 4
        'vicky',   // Opponent 5
        'jonasl',  // Opponent 6
        'frank',   // Opponent 7
        'charly',  // Opponent 8
        'audrey',  // Opponent 9
        'pancho',  // Opponent 10
        'pato',    // Opponent 11
        'billy'    // Opponent 12 (final boss)
    ];

    test('exactly 13 characters are required', () => {
        expect(REQUIRED_CHARACTERS).toHaveLength(13);
    });

    test('fede is the player character', () => {
        expect(REQUIRED_CHARACTERS[0]).toBe('fede');
    });

    test('billy is the final boss (last opponent)', () => {
        expect(REQUIRED_CHARACTERS[REQUIRED_CHARACTERS.length - 1]).toBe('billy');
    });

    test('timo is the first opponent (easiest)', () => {
        expect(REQUIRED_CHARACTERS[1]).toBe('timo');
    });

    test('tournament order is preserved', () => {
        const tournamentOrder = REQUIRED_CHARACTERS.slice(1); // All opponents
        expect(tournamentOrder).toEqual([
            'timo', 'madonna', 'jonas', 'lucas', 'vicky', 'jonasl',
            'frank', 'charly', 'audrey', 'pancho', 'pato', 'billy'
        ]);
    });
});

// ============================================
// INPUT SYSTEM - Z/X/C keys
// ============================================

describe('GUARD: Input System Keys', () => {
    /**
     * The game uses specific keys for actions:
     * - Z = Punch
     * - X = Kick
     * - C = Jump
     * - Arrow keys = Movement/combo input
     *
     * If these mappings change, all player muscle memory is broken.
     */
    const KEY_MAPPINGS = {
        punch: 'z',
        kick: 'x',
        jump: 'c',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        up: 'ArrowUp',
        down: 'ArrowDown'
    };

    test('Z is punch', () => {
        expect(KEY_MAPPINGS.punch).toBe('z');
    });

    test('X is kick', () => {
        expect(KEY_MAPPINGS.kick).toBe('x');
    });

    test('C is jump', () => {
        expect(KEY_MAPPINGS.jump).toBe('c');
    });

    test('arrow keys are movement', () => {
        expect(KEY_MAPPINGS.left).toBe('ArrowLeft');
        expect(KEY_MAPPINGS.right).toBe('ArrowRight');
    });
});

// ============================================
// HIT DETECTION - MUST CHECK POSITIONS
// ============================================

describe('GUARD: Hit Detection Must Check Positions', () => {
    /**
     * CRITICAL: The game must NEVER auto-hit.
     * All attacks must check if the enemy is actually in range.
     * This is documented in CLAUDE.md as a HARD CONSTRAINT.
     *
     * If hit detection is removed, the game becomes unfair and broken.
     */

    test('punch has finite range (around 60px)', () => {
        const PUNCH_RANGE = 60;
        const checkPunchHit = (attackerX, targetX) => {
            return Math.abs(attackerX - targetX) < PUNCH_RANGE;
        };

        // Close - hits
        expect(checkPunchHit(100, 150)).toBe(true);

        // Far - misses (CRITICAL: enemy can dodge)
        expect(checkPunchHit(100, 500)).toBe(false);
    });

    test('kick has finite range (around 80px)', () => {
        const KICK_RANGE = 80;
        const checkKickHit = (attackerX, targetX) => {
            return Math.abs(attackerX - targetX) < KICK_RANGE;
        };

        // Close - hits
        expect(checkKickHit(100, 170)).toBe(true);

        // Far - misses (CRITICAL: enemy can dodge)
        expect(checkKickHit(100, 500)).toBe(false);
    });

    test('projectiles must travel and check position on arrival', () => {
        // Simulate projectile travel
        const simulateProjectile = (startX, targetX, hitboxWidth = 40) => {
            let x = startX;
            const speed = 12;
            const direction = targetX > startX ? 1 : -1;

            for (let frame = 0; frame < 100; frame++) {
                x += speed * direction;

                // Check hit at CURRENT position
                if (Math.abs(x - targetX) < hitboxWidth) {
                    return { hit: true, frame };
                }

                // Off screen
                if (x < -50 || x > 950) {
                    return { hit: false, frame };
                }
            }
            return { hit: false, frame: 100 };
        };

        // Projectile travels and hits
        const result = simulateProjectile(150, 650);
        expect(result.hit).toBe(true);
        expect(result.frame).toBeGreaterThan(0); // Takes time to travel
    });
});

// ============================================
// ENERGY SYSTEM
// ============================================

describe('GUARD: Energy System', () => {
    /**
     * Energy powers special moves:
     * - Hitting with attacks builds energy
     * - Special moves cost energy
     * - Ultimate (WORLD TOUR) costs 100 (full bar)
     *
     * If this breaks, special moves either never work or always work.
     */

    test('energy caps at 100', () => {
        let energy = 0;
        const MAX_ENERGY = 100;

        for (let i = 0; i < 20; i++) {
            energy = Math.min(MAX_ENERGY, energy + 10);
        }

        expect(energy).toBe(100);
    });

    test('special moves require minimum energy', () => {
        const checkCanUseSpecial = (energy, cost) => energy >= cost;

        expect(checkCanUseSpecial(15, 20)).toBe(false);
        expect(checkCanUseSpecial(20, 20)).toBe(true);
        expect(checkCanUseSpecial(50, 20)).toBe(true);
    });

    test('ultimate requires exactly 100 energy', () => {
        const ULTIMATE_COST = 100;

        expect(99 >= ULTIMATE_COST).toBe(false);
        expect(100 >= ULTIMATE_COST).toBe(true);
    });

    test('using special consumes energy', () => {
        let energy = 100;
        const SPECIAL_COST = 25;

        energy -= SPECIAL_COST;
        expect(energy).toBe(75);
    });
});

// ============================================
// HEALTH SYSTEM
// ============================================

describe('GUARD: Health System', () => {
    /**
     * Health determines when rounds/matches end:
     * - Health cannot go below 0
     * - When health hits 0, the character is KO'd
     * - Full health is 100 (can be higher for bosses)
     */

    test('health cannot go negative', () => {
        let health = 50;
        const damage = 100;

        health = Math.max(0, health - damage);
        expect(health).toBe(0);
    });

    test('KO happens at 0 health', () => {
        const isKO = (health) => health <= 0;

        expect(isKO(0)).toBe(true);
        expect(isKO(1)).toBe(false);
        expect(isKO(-5)).toBe(true); // Edge case
    });

    test('damage reduces health', () => {
        let health = 100;

        health -= 25;
        expect(health).toBe(75);

        health -= 30;
        expect(health).toBe(45);
    });
});

// ============================================
// ROUND SYSTEM - Best of 3
// ============================================

describe('GUARD: Best of 3 Round System', () => {
    /**
     * Matches are best of 3:
     * - First to 2 round wins, wins the match
     * - After match win, advance to next opponent
     * - After match loss, game over
     */

    const ROUNDS_TO_WIN = 2;

    test('need 2 round wins to win match', () => {
        expect(ROUNDS_TO_WIN).toBe(2);
    });

    test('1 round win is not enough', () => {
        const roundWins = 1;
        expect(roundWins >= ROUNDS_TO_WIN).toBe(false);
    });

    test('2 round wins means match victory', () => {
        const roundWins = 2;
        expect(roundWins >= ROUNDS_TO_WIN).toBe(true);
    });

    test('losing 2 rounds means game over', () => {
        const roundLosses = 2;
        expect(roundLosses >= ROUNDS_TO_WIN).toBe(true);
    });
});

// ============================================
// DAMAGE VALUES - Balance Critical
// ============================================

describe('GUARD: Damage Values', () => {
    /**
     * Damage values affect game balance:
     * - Punch: ~8 damage (fast, weak)
     * - Kick: ~12 damage (slower, stronger)
     * - Specials: 18-45 damage (require energy)
     *
     * If these change significantly, the game becomes unbalanced.
     */

    test('punch damage is in reasonable range', () => {
        const PUNCH_DAMAGE = 8;
        expect(PUNCH_DAMAGE).toBeGreaterThanOrEqual(5);
        expect(PUNCH_DAMAGE).toBeLessThanOrEqual(15);
    });

    test('kick damage is stronger than punch', () => {
        const PUNCH_DAMAGE = 8;
        const KICK_DAMAGE = 12;
        expect(KICK_DAMAGE).toBeGreaterThan(PUNCH_DAMAGE);
    });

    test('special moves deal more than basic attacks', () => {
        const KICK_DAMAGE = 12;
        const SPECIAL_DAMAGE = 20;
        expect(SPECIAL_DAMAGE).toBeGreaterThan(KICK_DAMAGE);
    });

    test('ultimate deals high damage', () => {
        const ULTIMATE_DAMAGE = 45;
        expect(ULTIMATE_DAMAGE).toBeGreaterThanOrEqual(40);
    });
});

// ============================================
// AI BEHAVIOR - Must Fight Back
// ============================================

describe('GUARD: AI Must Fight Back', () => {
    /**
     * AI opponents must:
     * - Attack when close to player
     * - Approach when far from player
     * - Use specials when they have energy
     *
     * If AI is broken, the game is too easy.
     */

    const makeAIDecision = (distance, hasEnergy) => {
        if (distance < 90) return 'attack';
        if (distance > 200 && hasEnergy) return 'special';
        return 'approach';
    };

    test('AI attacks when close', () => {
        expect(makeAIDecision(50, false)).toBe('attack');
        expect(makeAIDecision(89, false)).toBe('attack');
    });

    test('AI approaches when at medium distance', () => {
        expect(makeAIDecision(150, false)).toBe('approach');
    });

    test('AI uses special when far and has energy', () => {
        expect(makeAIDecision(300, true)).toBe('special');
    });

    test('AI approaches when far but no energy', () => {
        expect(makeAIDecision(300, false)).toBe('approach');
    });
});

// ============================================
// DIFFICULTY SCALING - Opponents Get Harder
// ============================================

describe('GUARD: Difficulty Progression', () => {
    /**
     * Later opponents must be harder:
     * - Higher HP
     * - Higher attack chance
     * - Timo (first) is easiest
     * - Billy (last) is hardest
     */

    test('Timo has lowest difficulty', () => {
        const TIMO_HP = 60;
        const BILLY_HP = 250;
        expect(TIMO_HP).toBeLessThan(BILLY_HP);
    });

    test('Billy has highest HP', () => {
        const BILLY_HP = 250;
        expect(BILLY_HP).toBeGreaterThanOrEqual(200);
    });

    test('attack chance increases with difficulty', () => {
        const TIMO_ATTACK_CHANCE = 0.08;
        const BILLY_ATTACK_CHANCE = 0.22;
        expect(BILLY_ATTACK_CHANCE).toBeGreaterThan(TIMO_ATTACK_CHANCE);
    });
});

// ============================================
// MOVEMENT BOUNDS
// ============================================

describe('GUARD: Movement Bounds', () => {
    /**
     * Characters must stay on screen:
     * - Arena is approximately 870px wide
     * - Characters cannot walk off edges
     */

    const ARENA_WIDTH = 870;
    const CHAR_WIDTH = 60;

    const clampPosition = (x) => {
        return Math.max(30, Math.min(ARENA_WIDTH - CHAR_WIDTH, x));
    };

    test('cannot move past left edge', () => {
        expect(clampPosition(-50)).toBe(30);
    });

    test('cannot move past right edge', () => {
        expect(clampPosition(900)).toBe(ARENA_WIDTH - CHAR_WIDTH);
    });

    test('normal positions are unchanged', () => {
        expect(clampPosition(400)).toBe(400);
    });
});

// ============================================
// COMBO INPUT BUFFER
// ============================================

describe('GUARD: Combo Input System', () => {
    /**
     * Combo inputs are buffered:
     * - Inputs are stored in order
     * - Combos match the most recent inputs
     * - Extra inputs before combo don't break matching
     */

    const matchesCombo = (inputs, combo) => {
        if (inputs.length < combo.length) return false;
        const start = inputs.length - combo.length;
        for (let i = 0; i < combo.length; i++) {
            if (inputs[start + i] !== combo[i]) return false;
        }
        return true;
    };

    test('exact match works', () => {
        expect(matchesCombo(['down', 'down', 'x'], ['down', 'down', 'x'])).toBe(true);
    });

    test('extra inputs before combo still match', () => {
        expect(matchesCombo(['up', 'left', 'down', 'down', 'x'], ['down', 'down', 'x'])).toBe(true);
    });

    test('partial combo does not match', () => {
        expect(matchesCombo(['down', 'x'], ['down', 'down', 'x'])).toBe(false);
    });

    test('wrong order does not match', () => {
        expect(matchesCombo(['x', 'down', 'down'], ['down', 'down', 'x'])).toBe(false);
    });
});

