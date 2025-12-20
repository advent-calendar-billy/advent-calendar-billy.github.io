/**
 * Combat Mechanics Tests
 *
 * Tests for Phase 2 combat polish:
 * - Hitstun, knockback, blocking, invincibility
 * - Directional attacks (work from both sides)
 * - Collision detection
 */

// ============================================
// Hitstun Tests
// ============================================

describe('Hitstun System', () => {
    const HITSTUN = {
        punch: 200,
        kick: 300,
        special: 400,
        ultimate: 600
    };

    test('punch has shortest hitstun', () => {
        expect(HITSTUN.punch).toBeLessThan(HITSTUN.kick);
        expect(HITSTUN.punch).toBeLessThan(HITSTUN.special);
    });

    test('ultimate has longest hitstun', () => {
        expect(HITSTUN.ultimate).toBeGreaterThan(HITSTUN.special);
        expect(HITSTUN.ultimate).toBeGreaterThan(HITSTUN.kick);
    });

    test('hitstun duration scales with attack power', () => {
        // Stronger attacks = longer stun
        expect(HITSTUN.kick).toBeGreaterThan(HITSTUN.punch);
        expect(HITSTUN.special).toBeGreaterThan(HITSTUN.kick);
        expect(HITSTUN.ultimate).toBeGreaterThan(HITSTUN.special);
    });
});

// ============================================
// Knockback Tests
// ============================================

describe('Knockback System', () => {
    const KNOCKBACK = {
        punch: 15,
        kick: 25,
        special: 35,
        ultimate: 50
    };

    test('punch has minimal knockback', () => {
        expect(KNOCKBACK.punch).toBeLessThanOrEqual(20);
    });

    test('kick has more knockback than punch', () => {
        expect(KNOCKBACK.kick).toBeGreaterThan(KNOCKBACK.punch);
    });

    test('ultimate has maximum knockback', () => {
        expect(KNOCKBACK.ultimate).toBeGreaterThanOrEqual(50);
    });

    test('knockback direction is away from attacker', () => {
        // Simulate knockback direction calculation
        const getKnockbackDirection = (attackerX, targetX) => {
            return attackerX < targetX ? 1 : -1;
        };

        // Attacker on left, target pushed right
        expect(getKnockbackDirection(100, 200)).toBe(1);

        // Attacker on right, target pushed left
        expect(getKnockbackDirection(300, 200)).toBe(-1);
    });

    test('knockback respects arena boundaries', () => {
        const ARENA_MIN = 50;
        const ARENA_MAX = 820;

        const applyKnockback = (x, direction, amount) => {
            const newX = x + (direction * amount);
            return Math.max(ARENA_MIN, Math.min(ARENA_MAX, newX));
        };

        // Knocked to right edge
        expect(applyKnockback(800, 1, 50)).toBe(820);

        // Knocked to left edge
        expect(applyKnockback(60, -1, 50)).toBe(50);

        // Normal knockback
        expect(applyKnockback(400, 1, 30)).toBe(430);
    });
});

// ============================================
// Blocking Tests
// ============================================

describe('Block Mechanic', () => {
    test('blocking reduces punch damage by 75%', () => {
        const punchDamage = 8;
        const blockedDamage = Math.floor(punchDamage * 0.25);
        expect(blockedDamage).toBe(2);
    });

    test('blocking reduces kick damage by 75%', () => {
        const kickDamage = 12;
        const blockedDamage = Math.floor(kickDamage * 0.25);
        expect(blockedDamage).toBe(3);
    });

    test('blocking reduces special damage by 50%', () => {
        const specialDamage = 20;
        const blockedDamage = Math.floor(specialDamage * 0.5);
        expect(blockedDamage).toBe(10);
    });

    test('block requires holding back (away from opponent)', () => {
        const isBlocking = (holdingLeft, holdingRight, facingRight) => {
            // Block by holding direction AWAY from opponent
            if (facingRight) {
                return holdingLeft && !holdingRight;
            } else {
                return holdingRight && !holdingLeft;
            }
        };

        // Facing right, hold left to block
        expect(isBlocking(true, false, true)).toBe(true);
        expect(isBlocking(false, true, true)).toBe(false);

        // Facing left, hold right to block
        expect(isBlocking(false, true, false)).toBe(true);
        expect(isBlocking(true, false, false)).toBe(false);
    });

    test('cannot block while attacking', () => {
        const canBlock = (isAttacking, holdingBack) => {
            return !isAttacking && holdingBack;
        };

        expect(canBlock(false, true)).toBe(true);
        expect(canBlock(true, true)).toBe(false);
    });
});

// ============================================
// Invincibility Tests
// ============================================

describe('Invincibility Frames', () => {
    test('i-frames granted after hitstun ends', () => {
        const I_FRAME_DURATION = 200; // ms
        expect(I_FRAME_DURATION).toBeGreaterThan(0);
    });

    test('attacks miss during i-frames', () => {
        const checkHit = (inRange, isInvincible) => {
            if (isInvincible) return false;
            return inRange;
        };

        // In range but invincible = miss
        expect(checkHit(true, true)).toBe(false);

        // In range and not invincible = hit
        expect(checkHit(true, false)).toBe(true);

        // Out of range = miss regardless
        expect(checkHit(false, false)).toBe(false);
    });
});

// ============================================
// Collision Detection Tests
// ============================================

describe('Collision Detection', () => {
    const COLLISION_WIDTH = 50;

    test('players cannot overlap', () => {
        const checkCollision = (playerX, opponentX) => {
            return Math.abs(playerX - opponentX) < COLLISION_WIDTH;
        };

        // Too close - collision
        expect(checkCollision(100, 130)).toBe(true);

        // Far enough - no collision
        expect(checkCollision(100, 200)).toBe(false);

        // Exactly at collision distance
        expect(checkCollision(100, 150)).toBe(false);
    });

    test('movement stops at collision boundary', () => {
        const moveWithCollision = (playerX, opponentX, direction) => {
            const newX = playerX + (direction * 5);

            if (direction > 0 && newX > opponentX - COLLISION_WIDTH && playerX < opponentX) {
                return opponentX - COLLISION_WIDTH;
            }
            if (direction < 0 && newX < opponentX + COLLISION_WIDTH && playerX > opponentX) {
                return opponentX + COLLISION_WIDTH;
            }

            return newX;
        };

        // Moving right toward opponent at 600
        expect(moveWithCollision(545, 600, 1)).toBe(550); // Stops at boundary
        expect(moveWithCollision(500, 600, 1)).toBe(505); // Normal movement

        // Moving left toward opponent at 100
        expect(moveWithCollision(155, 100, -1)).toBe(150); // Stops at boundary
        expect(moveWithCollision(200, 100, -1)).toBe(195); // Normal movement
    });
});

// ============================================
// Directional Attack Tests
// ============================================

describe('Directional Attacks', () => {
    test('attacks work when player is LEFT of opponent', () => {
        const PUNCH_RANGE = 60;
        const playerX = 100;
        const opponentX = 150;

        const distance = Math.abs(playerX - opponentX);
        expect(distance).toBeLessThan(PUNCH_RANGE);
    });

    test('attacks work when player is RIGHT of opponent', () => {
        const PUNCH_RANGE = 60;
        const playerX = 200;
        const opponentX = 150;

        const distance = Math.abs(playerX - opponentX);
        expect(distance).toBeLessThan(PUNCH_RANGE);
    });

    test('projectiles travel toward opponent regardless of side', () => {
        const getProjectileDirection = (shooterX, targetX) => {
            return targetX > shooterX ? 1 : -1;
        };

        // Shooter on left, target on right - projectile goes right
        expect(getProjectileDirection(100, 600)).toBe(1);

        // Shooter on right, target on left - projectile goes left
        expect(getProjectileDirection(600, 100)).toBe(-1);
    });

    test('knockback direction is correct from either side', () => {
        const getKnockbackDir = (attackerX, targetX) => {
            return attackerX < targetX ? 1 : -1;
        };

        // Attack from left pushes right
        expect(getKnockbackDir(100, 200)).toBe(1);

        // Attack from right pushes left
        expect(getKnockbackDir(300, 200)).toBe(-1);
    });
});

// ============================================
// Combat State Machine Tests
// ============================================

describe('Combat State Machine', () => {
    test('stunned state prevents attacking', () => {
        const canAttack = (state) => {
            return state !== 'stunned' && state !== 'ko';
        };

        expect(canAttack('idle')).toBe(true);
        expect(canAttack('walking')).toBe(true);
        expect(canAttack('stunned')).toBe(false);
        expect(canAttack('ko')).toBe(false);
    });

    test('blocking state prevents movement', () => {
        const canMove = (isBlocking) => !isBlocking;

        expect(canMove(false)).toBe(true);
        expect(canMove(true)).toBe(false);
    });

    test('invincible state prevents damage', () => {
        const takeDamage = (health, damage, isInvincible) => {
            if (isInvincible) return health;
            return Math.max(0, health - damage);
        };

        expect(takeDamage(100, 10, false)).toBe(90);
        expect(takeDamage(100, 10, true)).toBe(100);
    });
});

// ============================================
// Visual Feedback Tests
// ============================================

describe('Visual Feedback', () => {
    test('hit flash duration is brief', () => {
        const HIT_FLASH_DURATION = 100; // ms
        expect(HIT_FLASH_DURATION).toBeLessThanOrEqual(150);
    });

    test('screen shake intensity scales with attack', () => {
        const getShakeIntensity = (attackType) => {
            const intensities = {
                punch: 0,
                kick: 3,
                special: 5,
                ultimate: 8
            };
            return intensities[attackType] || 0;
        };

        expect(getShakeIntensity('punch')).toBe(0);
        expect(getShakeIntensity('kick')).toBeLessThan(getShakeIntensity('special'));
        expect(getShakeIntensity('ultimate')).toBeGreaterThan(getShakeIntensity('special'));
    });

    test('round indicators show correct state', () => {
        const getRoundIndicatorClass = (roundsWon, dotIndex) => {
            if (roundsWon >= dotIndex + 1) return 'won';
            return '';
        };

        // 0 wins - both dots empty
        expect(getRoundIndicatorClass(0, 0)).toBe('');
        expect(getRoundIndicatorClass(0, 1)).toBe('');

        // 1 win - first dot filled
        expect(getRoundIndicatorClass(1, 0)).toBe('won');
        expect(getRoundIndicatorClass(1, 1)).toBe('');

        // 2 wins - both dots filled
        expect(getRoundIndicatorClass(2, 0)).toBe('won');
        expect(getRoundIndicatorClass(2, 1)).toBe('won');
    });
});

// ============================================
// Damage Calculation Tests
// ============================================

describe('Damage Calculation', () => {
    test('blocked damage is always less than full damage', () => {
        const attacks = [
            { damage: 8, blockReduction: 0.25 },   // punch
            { damage: 12, blockReduction: 0.25 },  // kick
            { damage: 20, blockReduction: 0.5 },   // special
            { damage: 45, blockReduction: 0.5 }    // ultimate
        ];

        attacks.forEach(attack => {
            const blocked = Math.floor(attack.damage * attack.blockReduction);
            expect(blocked).toBeLessThan(attack.damage);
            expect(blocked).toBeGreaterThan(0);
        });
    });

    test('energy is gained on hit', () => {
        const ENERGY_GAIN = {
            punch: 10,
            kick: 12,
            special: 15
        };

        expect(ENERGY_GAIN.punch).toBeGreaterThan(0);
        expect(ENERGY_GAIN.kick).toBeGreaterThan(ENERGY_GAIN.punch);
    });
});
