# Family Fighter - Development Constraints

## Important Context

**This game is a gift for the user's boyfriend.** Quality matters. Every detail should be polished and thoughtfully crafted. Take extra care with animations, visual effects, and overall presentation. This isn't just a quick project - it's something meant to delight and impress someone special.

---

## HARD CONSTRAINT: No Auto-Hit Attacks

**Every attack in this game MUST require proper hit detection.** The opponent must always have the ability to avoid damage by moving out of the way.

### What this means:

1. **Projectiles** must travel across the screen and only deal damage when they actually reach the enemy's position
2. **Melee attacks** must check if the enemy is within striking range at the moment of impact
3. **Area effects** must check if the enemy is within the affected area when the effect triggers
4. **Multi-hit ultimates** must check the enemy position for EACH hit, not just deal damage on a timer

### What is NOT allowed:

- Dealing damage after a simple `setTimeout()` without position checking
- Using generous distance checks like `< 200` or `< 250` that make attacks nearly unavoidable
- Multi-hit attacks that deal damage on intervals without checking enemy position each time
- Beam/breath attacks that automatically hit once they "extend to target width"

### Proper hit detection patterns:

```javascript
// GOOD - Projectile with real hit detection
const fly = setInterval(() => {
    projectileX += speed;
    projectile.style.left = projectileX + 'px';

    // Check if projectile reached enemy's CURRENT position
    if (Math.abs(projectileX - game.dummyX) < 40) {
        clearInterval(fly);
        dealDamage(damage);
        projectile.remove();
    }
}, 25);

// GOOD - Area effect that checks position
if (Math.abs(fighterX - game.dummyX) < effectRadius) {
    dealDamage(damage);
}

// BAD - Auto damage after timeout
setTimeout(() => {
    dealDamage(damage); // NO! Enemy can't avoid this
}, 1000);

// BAD - Damage on animation complete without position check
if (progress >= 1) {
    dealDamage(damage); // NO! Should check if enemy is there
}
```

### Why this matters:

- Makes the game fair and skill-based
- Prevents OP (overpowered) moves that guarantee damage
- Encourages strategic positioning and timing
- More satisfying gameplay when hits feel earned

This constraint applies to ALL characters and ALL moves, including ultimates.
