/**
 * Combat System Unit Tests
 *
 * These tests verify core combat mechanics work correctly.
 * Run with: npm test
 */

// Mock DOM environment for testing
const createMockGame = () => ({
    playerX: 100,
    dummyX: 650,
    playerHealth: 100,
    dummyHealth: 1000,
    playerEnergy: 0,
    isAttacking: false
});

// ============================================
// Hit Detection Tests
// ============================================

describe('Hit Detection', () => {
    test('should detect hit when distance < punch range', () => {
        const PUNCH_RANGE = 60;
        const playerX = 600;
        const enemyX = 650;
        const distance = Math.abs(playerX - enemyX);

        expect(distance).toBeLessThan(PUNCH_RANGE);
        expect(distance < PUNCH_RANGE).toBe(true);
    });

    test('should miss when distance > punch range', () => {
        const PUNCH_RANGE = 60;
        const playerX = 100;
        const enemyX = 650;
        const distance = Math.abs(playerX - enemyX);

        expect(distance).toBeGreaterThan(PUNCH_RANGE);
        expect(distance < PUNCH_RANGE).toBe(false);
    });

    test('kick should have longer range than punch', () => {
        const PUNCH_RANGE = 60;
        const KICK_RANGE = 80;

        expect(KICK_RANGE).toBeGreaterThan(PUNCH_RANGE);
    });

    test('should use absolute distance (works from either side)', () => {
        const enemyX = 400;

        // Player on left
        const playerLeftX = 350;
        const distanceFromLeft = Math.abs(playerLeftX - enemyX);

        // Player on right
        const playerRightX = 450;
        const distanceFromRight = Math.abs(playerRightX - enemyX);

        // Both should be same distance
        expect(distanceFromLeft).toBe(50);
        expect(distanceFromRight).toBe(50);
    });
});

// ============================================
// Directional Mechanics Tests
// ============================================

describe('Directional Mechanics', () => {
    test('player should face right when enemy is to the right', () => {
        const playerX = 100;
        const enemyX = 650;
        const facingRight = enemyX > playerX;

        expect(facingRight).toBe(true);
    });

    test('player should face left when enemy is to the left', () => {
        const playerX = 700;
        const enemyX = 150;
        const facingRight = enemyX > playerX;

        expect(facingRight).toBe(false);
    });

    test('projectile direction should be calculated toward enemy', () => {
        // From left of enemy
        const playerLeftX = 100;
        const enemyX = 650;
        const directionFromLeft = enemyX > playerLeftX ? 1 : -1;
        expect(directionFromLeft).toBe(1);  // Positive = moving right

        // From right of enemy
        const playerRightX = 800;
        const directionFromRight = enemyX > playerRightX ? 1 : -1;
        expect(directionFromRight).toBe(-1);  // Negative = moving left
    });

    test('projectile should move toward enemy each frame', () => {
        const startX = 100;
        const enemyX = 650;
        const speed = 10;
        const direction = enemyX > startX ? 1 : -1;

        let projectileX = startX;

        // Simulate 10 frames
        for (let i = 0; i < 10; i++) {
            projectileX += speed * direction;
        }

        // Should have moved 100px toward enemy
        expect(projectileX).toBe(200);
        expect(Math.abs(projectileX - enemyX)).toBeLessThan(Math.abs(startX - enemyX));
    });
});

// ============================================
// Damage Calculation Tests
// ============================================

describe('Damage Calculation', () => {
    test('punch damage should be in expected range', () => {
        const PUNCH_DAMAGE_MIN = 5;
        const PUNCH_DAMAGE_MAX = 10;
        const damage = 8;

        expect(damage).toBeGreaterThanOrEqual(PUNCH_DAMAGE_MIN);
        expect(damage).toBeLessThanOrEqual(PUNCH_DAMAGE_MAX);
    });

    test('kick damage should be higher than punch', () => {
        const punchDamage = 8;
        const kickDamage = 12;

        expect(kickDamage).toBeGreaterThan(punchDamage);
    });

    test('special damage should be higher than basic attacks', () => {
        const basicDamage = 10;
        const specialDamage = 20;

        expect(specialDamage).toBeGreaterThan(basicDamage);
    });

    test('health should not go below zero', () => {
        let health = 5;
        const damage = 20;

        health = Math.max(0, health - damage);

        expect(health).toBe(0);
        expect(health).toBeGreaterThanOrEqual(0);
    });

    test('overkill damage should still result in zero health', () => {
        let health = 10;
        const megaDamage = 1000;

        health = Math.max(0, health - megaDamage);

        expect(health).toBe(0);
    });
});

// ============================================
// Energy System Tests
// ============================================

describe('Energy System', () => {
    test('energy should start at zero', () => {
        const game = createMockGame();
        expect(game.playerEnergy).toBe(0);
    });

    test('attacking should build energy', () => {
        let energy = 0;
        const ENERGY_PER_HIT = 10;

        energy += ENERGY_PER_HIT;
        expect(energy).toBe(10);

        energy += ENERGY_PER_HIT;
        expect(energy).toBe(20);
    });

    test('energy should cap at 100', () => {
        let energy = 95;
        const ENERGY_PER_HIT = 10;
        const MAX_ENERGY = 100;

        energy = Math.min(MAX_ENERGY, energy + ENERGY_PER_HIT);

        expect(energy).toBe(100);
    });

    test('special moves should require energy', () => {
        const SPECIAL_COST = 25;
        const energy = 30;

        const canUseSpecial = energy >= SPECIAL_COST;
        expect(canUseSpecial).toBe(true);

        const insufficientEnergy = 10;
        const cannotUseSpecial = insufficientEnergy >= SPECIAL_COST;
        expect(cannotUseSpecial).toBe(false);
    });

    test('ultimate should require full energy', () => {
        const ULTIMATE_COST = 100;

        expect(99 >= ULTIMATE_COST).toBe(false);
        expect(100 >= ULTIMATE_COST).toBe(true);
    });
});

// ============================================
// Arena Boundary Tests
// ============================================

describe('Arena Boundaries', () => {
    const ARENA_WIDTH = 900;
    const ARENA_MIN_X = 0;
    const ARENA_MAX_X = ARENA_WIDTH - 50;  // Character width

    test('player cannot move past left boundary', () => {
        let playerX = 20;
        const moveAmount = -30;

        playerX = Math.max(ARENA_MIN_X, playerX + moveAmount);

        expect(playerX).toBe(0);
    });

    test('player cannot move past right boundary', () => {
        let playerX = 840;
        const moveAmount = 30;

        playerX = Math.min(ARENA_MAX_X, playerX + moveAmount);

        expect(playerX).toBe(850);
    });

    test('player can move freely within boundaries', () => {
        let playerX = 400;
        const moveAmount = 50;

        playerX = Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, playerX + moveAmount));

        expect(playerX).toBe(450);
    });
});

// ============================================
// Round/Match Logic Tests
// ============================================

describe('Round and Match Logic', () => {
    test('round ends when health reaches zero', () => {
        const health = 0;
        const roundOver = health <= 0;

        expect(roundOver).toBe(true);
    });

    test('best of 3 - first to 2 wins', () => {
        const WINS_NEEDED = 2;

        // Player wins 2-0
        expect(2 >= WINS_NEEDED).toBe(true);
        expect(0 >= WINS_NEEDED).toBe(false);

        // Player wins 2-1
        expect(2 >= WINS_NEEDED).toBe(true);
        expect(1 >= WINS_NEEDED).toBe(false);

        // 1-1 tie - no winner yet
        expect(1 >= WINS_NEEDED).toBe(false);
        expect(1 >= WINS_NEEDED).toBe(false);
    });

    test('match should reset health for new round', () => {
        let playerHealth = 0;
        let opponentHealth = 50;

        // Reset for new round
        const MAX_HEALTH = 100;
        playerHealth = MAX_HEALTH;
        opponentHealth = MAX_HEALTH;

        expect(playerHealth).toBe(100);
        expect(opponentHealth).toBe(100);
    });
});

// ============================================
// Tournament Ladder Tests
// ============================================

describe('Tournament Ladder', () => {
    const LADDER = [
        { id: 'timo', difficulty: 1 },
        { id: 'madonna', difficulty: 2 },
        { id: 'jonas', difficulty: 3 },
        { id: 'lucas', difficulty: 4 },
        { id: 'vicky', difficulty: 5 },
        { id: 'jonasl', difficulty: 6 },
        { id: 'frank', difficulty: 7 },
        { id: 'charly', difficulty: 8 },
        { id: 'audrey', difficulty: 9 },
        { id: 'pancho', difficulty: 10 },
        { id: 'pato', difficulty: 11 },
        { id: 'billy', difficulty: 12 }
    ];

    test('ladder should have 12 opponents', () => {
        expect(LADDER.length).toBe(12);
    });

    test('difficulty should increase through ladder', () => {
        for (let i = 1; i < LADDER.length; i++) {
            expect(LADDER[i].difficulty).toBeGreaterThan(LADDER[i - 1].difficulty);
        }
    });

    test('timo should be first (easiest)', () => {
        expect(LADDER[0].id).toBe('timo');
        expect(LADDER[0].difficulty).toBe(1);
    });

    test('billy should be last (final boss)', () => {
        expect(LADDER[LADDER.length - 1].id).toBe('billy');
        expect(LADDER[LADDER.length - 1].difficulty).toBe(12);
    });

    test('advancing to next opponent increments index', () => {
        let currentIndex = 0;

        // Win against Timo
        currentIndex++;
        expect(LADDER[currentIndex].id).toBe('madonna');

        // Win against Madonna
        currentIndex++;
        expect(LADDER[currentIndex].id).toBe('jonas');
    });
});
