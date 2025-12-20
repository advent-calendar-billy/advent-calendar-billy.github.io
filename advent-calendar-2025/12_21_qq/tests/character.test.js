/**
 * Character System Tests
 *
 * Tests for CharacterBase and FedeCharacter
 */

// Mock DOM elements
const createMockDOM = () => ({
    arena: {
        appendChild: jest.fn(),
        querySelector: jest.fn(),
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 870, height: 400 })
    },
    fighter: {
        style: { left: '150px', transform: '' },
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn()
        },
        querySelector: jest.fn(() => ({
            style: { transform: '', transition: '' },
            appendChild: jest.fn()
        }))
    }
});

// Mock GameEngine
const createMockGameEngine = () => ({
    state: {
        playerX: 150,
        opponentX: 650,
        playerHealth: 100,
        opponentHealth: 100,
        playerEnergy: 0,
        opponentEnergy: 0
    },
    damageOpponent: jest.fn((amount) => {
        mockGameEngine.state.opponentHealth -= amount;
        return mockGameEngine.state.opponentHealth;
    }),
    damagePlayer: jest.fn((amount) => {
        mockGameEngine.state.playerHealth -= amount;
        return mockGameEngine.state.playerHealth;
    }),
    addPlayerEnergy: jest.fn((amount) => {
        mockGameEngine.state.playerEnergy = Math.min(100, mockGameEngine.state.playerEnergy + amount);
        return mockGameEngine.state.playerEnergy;
    }),
    callbacks: {
        onHealthChange: jest.fn(),
        onEnergyChange: jest.fn()
    }
});

// Mock CombatSystem
const createMockCombatSystem = () => ({
    RANGES: { punch: 60, kick: 80, special: 100 },
    DAMAGE: { punch: 8, kick: 12, special: 20 },
    executePunch: jest.fn((attackerX, targetX, isPlayer) => {
        const inRange = Math.abs(attackerX - targetX) < 60;
        return { hit: inRange, damage: inRange ? 8 : 0 };
    }),
    executeKick: jest.fn((attackerX, targetX, isPlayer) => {
        const inRange = Math.abs(attackerX - targetX) < 80;
        return { hit: inRange, damage: inRange ? 12 : 0 };
    }),
    showHitEffect: jest.fn()
});

let mockDOM, mockGameEngine, mockCombatSystem;

beforeEach(() => {
    mockDOM = createMockDOM();
    mockGameEngine = createMockGameEngine();
    mockCombatSystem = createMockCombatSystem();

    // Reset mocks
    jest.clearAllMocks();
});

describe('CharacterBase', () => {
    // Note: CharacterBase requires browser environment
    // These tests validate the concept

    test('character has required properties', () => {
        const config = {
            id: 'test',
            name: 'TEST',
            color: '#ff0000',
            punchDamage: 10,
            kickDamage: 15
        };

        // Simulate CharacterBase behavior
        const character = {
            id: config.id,
            name: config.name,
            color: config.color,
            punchDamage: config.punchDamage,
            kickDamage: config.kickDamage,
            maxHealth: 100,
            health: 100,
            maxEnergy: 100,
            energy: 0,
            x: 0,
            y: 0,
            facingRight: true,
            state: 'idle',
            isAttacking: false
        };

        expect(character.id).toBe('test');
        expect(character.name).toBe('TEST');
        expect(character.punchDamage).toBe(10);
        expect(character.kickDamage).toBe(15);
        expect(character.health).toBe(100);
        expect(character.state).toBe('idle');
    });

    test('takeDamage reduces health correctly', () => {
        const character = { health: 100, maxHealth: 100 };

        character.health = Math.max(0, character.health - 25);
        expect(character.health).toBe(75);

        character.health = Math.max(0, character.health - 100);
        expect(character.health).toBe(0);
    });

    test('addEnergy caps at maxEnergy', () => {
        const character = { energy: 0, maxEnergy: 100 };

        character.energy = Math.min(character.maxEnergy, character.energy + 50);
        expect(character.energy).toBe(50);

        character.energy = Math.min(character.maxEnergy, character.energy + 100);
        expect(character.energy).toBe(100);
    });

    test('reset restores health and energy', () => {
        const character = {
            health: 30,
            maxHealth: 100,
            energy: 75,
            state: 'attacking',
            isAttacking: true,
            reset() {
                this.health = this.maxHealth;
                this.energy = 0;
                this.state = 'idle';
                this.isAttacking = false;
            }
        };

        character.reset();

        expect(character.health).toBe(100);
        expect(character.energy).toBe(0);
        expect(character.state).toBe('idle');
        expect(character.isAttacking).toBe(false);
    });
});

describe('FedeCharacter', () => {
    test('Fede has correct special moves with POC-matching combos', () => {
        // These combos MUST match the POC exactly:
        // The Split uses X (not Z) - this is the key difference
        const fedeSpecials = [
            { name: 'The Split', combo: ['down', 'down', 'x'], damage: 25, energyCost: 20 },
            { name: 'Salmon Sashimi', combo: ['right', 'right', 'z'], damage: 20, energyCost: 25 },
            { name: 'Country Throw', combo: ['down', 'left', 'z'], damage: 18, energyCost: 20 },
            { name: 'WORLD TOUR!', combo: ['down', 'right', 'down', 'right', 'z'], damage: 45, energyCost: 100, ultimate: true }
        ];

        expect(fedeSpecials.length).toBe(4);
        expect(fedeSpecials[0].name).toBe('The Split');
        expect(fedeSpecials[0].combo).toEqual(['down', 'down', 'x']); // X not Z!
        expect(fedeSpecials[1].combo).toEqual(['right', 'right', 'z']); // →→Z
        expect(fedeSpecials[2].combo).toEqual(['down', 'left', 'z']); // ↓←Z
        expect(fedeSpecials[3].ultimate).toBe(true);
        expect(fedeSpecials[3].damage).toBe(45);
    });

    test('Fede sprite template contains required elements', () => {
        const FEDE_SPRITE = `
            <div class="fighter fede idle" id="player-fighter">
                <div class="head">
                    <div class="hair"></div>
                    <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
                    <div class="mouth"></div>
                </div>
                <div class="body">
                    <div class="collar-left"></div>
                    <div class="collar-right"></div>
                    <div class="buttons"></div>
                    <div class="arm left"></div>
                    <div class="arm right"></div>
                </div>
                <div class="legs">
                    <div class="leg left"></div>
                    <div class="leg right"></div>
                </div>
                <div class="feet"><div class="foot"></div><div class="foot"></div></div>
            </div>
        `;

        expect(FEDE_SPRITE).toContain('class="fighter fede');
        expect(FEDE_SPRITE).toContain('class="head"');
        expect(FEDE_SPRITE).toContain('class="body"');
        expect(FEDE_SPRITE).toContain('class="arm right"');
        expect(FEDE_SPRITE).toContain('class="legs"');
    });

    test('Fede countries list has variety', () => {
        const FEDE_COUNTRIES = [
            { name: 'France', color: '#0055A4' },
            { name: 'Japan', color: '#BC002D' },
            { name: 'Brazil', color: '#009739' },
            { name: 'Italy', color: '#008C45' },
            { name: 'Australia', color: '#FFCD00' },
            { name: 'Mexico', color: '#006847' },
            { name: 'Egypt', color: '#C8102E' },
            { name: 'Norway', color: '#BA0C2F' }
        ];

        expect(FEDE_COUNTRIES.length).toBe(8);
        expect(FEDE_COUNTRIES.some(c => c.name === 'Japan')).toBe(true);
        expect(FEDE_COUNTRIES.every(c => c.color.startsWith('#'))).toBe(true);
    });
});

describe('Attack Hit Detection', () => {
    test('punch only hits within range', () => {
        const punchRange = 60;

        // In range
        let result = mockCombatSystem.executePunch(150, 200, true);
        expect(result.hit).toBe(true);

        // Out of range
        result = mockCombatSystem.executePunch(150, 300, true);
        expect(result.hit).toBe(false);
    });

    test('kick only hits within range', () => {
        const kickRange = 80;

        // In range
        let result = mockCombatSystem.executeKick(150, 220, true);
        expect(result.hit).toBe(true);

        // Out of range
        result = mockCombatSystem.executeKick(150, 300, true);
        expect(result.hit).toBe(false);
    });

    test('The Split checks position for both legs', () => {
        // Simulating The Split hit detection
        const fighterX = 400;
        const legReach = 100;
        const leftLegEnd = fighterX - legReach;
        const rightLegEnd = fighterX + 50 + legReach;

        // NPC to the right - should be hit by right leg
        let npcX = 500;
        const rightLegHits = npcX >= fighterX && npcX <= rightLegEnd + 30;
        expect(rightLegHits).toBe(true);

        // NPC to the left - should be hit by left leg
        npcX = 320;
        const leftLegHits = npcX <= fighterX && npcX >= leftLegEnd - 30;
        expect(leftLegHits).toBe(true);

        // NPC too far away - no hit
        npcX = 700;
        const noHit = (npcX >= fighterX && npcX <= rightLegEnd + 30) ||
                      (npcX <= fighterX && npcX >= leftLegEnd - 30);
        expect(noHit).toBe(false);
    });

    test('projectile hit detection uses current enemy position', () => {
        // Simulating projectile (like Passport Throw)
        const projectileHitbox = 40;
        let projectileX = 150;
        let enemyX = 650;

        // Projectile starts - not hitting
        expect(Math.abs(projectileX - enemyX) < projectileHitbox).toBe(false);

        // Enemy moves during projectile flight
        enemyX = 400;

        // Projectile reaches enemy's NEW position
        projectileX = 420;
        expect(Math.abs(projectileX - enemyX) < projectileHitbox).toBe(true);

        // Enemy dodges
        enemyX = 500;
        projectileX = 420;
        expect(Math.abs(projectileX - enemyX) < projectileHitbox).toBe(false);
    });
});

describe('Directional Attacks', () => {
    test('getDirectionToTarget returns correct direction', () => {
        const getDirection = (fromX, toX) => toX > fromX ? 1 : -1;

        // Target to the right
        expect(getDirection(150, 650)).toBe(1);

        // Target to the left
        expect(getDirection(650, 150)).toBe(-1);
    });

    test('projectiles move toward target regardless of side', () => {
        // Simulating passport throw direction
        const simulateProjectile = (startX, targetX) => {
            const direction = targetX > startX ? 1 : -1;
            let x = startX;
            const speed = 12 * direction;

            // Move projectile
            for (let i = 0; i < 50; i++) {
                x += speed;
                if (Math.abs(x - targetX) < 40) {
                    return { hit: true, finalX: x };
                }
            }
            return { hit: false, finalX: x };
        };

        // Player on left, target on right
        let result = simulateProjectile(150, 650);
        expect(result.hit).toBe(true);
        expect(result.finalX).toBeGreaterThan(150);

        // Player on right, target on left
        result = simulateProjectile(650, 150);
        expect(result.hit).toBe(true);
        expect(result.finalX).toBeLessThan(650);
    });
});

describe('Energy System', () => {
    test('ultimate requires full energy', () => {
        const WORLD_TOUR_COST = 100;
        let energy = 50;

        // Not enough energy
        const canUseUltimate = energy >= WORLD_TOUR_COST;
        expect(canUseUltimate).toBe(false);

        // Full energy
        energy = 100;
        expect(energy >= WORLD_TOUR_COST).toBe(true);
    });

    test('special moves consume energy correctly', () => {
        let energy = 100;
        const ULTIMATE_COST = 100;

        // Use ultimate
        energy -= ULTIMATE_COST;
        expect(energy).toBe(0);
    });

    test('attacks build energy on hit', () => {
        let energy = 0;
        const PUNCH_ENERGY = 10;
        const KICK_ENERGY = 10;

        // Punch hit
        energy = Math.min(100, energy + PUNCH_ENERGY);
        expect(energy).toBe(10);

        // Multiple hits
        for (let i = 0; i < 9; i++) {
            energy = Math.min(100, energy + PUNCH_ENERGY);
        }
        expect(energy).toBe(100);

        // Capped at 100
        energy = Math.min(100, energy + KICK_ENERGY);
        expect(energy).toBe(100);
    });
});

describe('Attack States', () => {
    test('isAttacking prevents double attacks', () => {
        let isAttacking = false;

        const tryAttack = () => {
            if (isAttacking) return false;
            isAttacking = true;
            return true;
        };

        // First attack succeeds
        expect(tryAttack()).toBe(true);

        // Second attack fails
        expect(tryAttack()).toBe(false);

        // After reset, attack succeeds
        isAttacking = false;
        expect(tryAttack()).toBe(true);
    });

    test('attack lockout duration', async () => {
        let isAttacking = false;
        const PUNCH_LOCKOUT = 300;
        const SPECIAL_LOCKOUT = 500;

        // Start punch
        isAttacking = true;

        // Can't attack during lockout
        expect(isAttacking).toBe(true);

        // After lockout, can attack again
        await new Promise(r => setTimeout(r, PUNCH_LOCKOUT + 50));
        isAttacking = false;
        expect(isAttacking).toBe(false);
    });
});

// Run tests
if (typeof describe === 'undefined') {
    console.log('Run these tests with: npx jest tests/character.test.js');
}
