// SVG Sprite Handler for SOTN-style game
// Uses individual SVG files for each animation state

class AlucardSprite {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.loaded = false;
        this.flipX = false;
        this.currentAnimation = 'idle';
        this.walkFrame = 0;
        this.walkTimer = 0;

        // Load all SVG sprites
        this.sprites = {
            idle: new Image(),
            walk1: new Image(),
            walk2: new Image(),
            attack: new Image(),
            jump: new Image(),
            hurt: new Image()
        };

        this.sprites.idle.src = 'sprites/player_idle.svg';
        this.sprites.walk1.src = 'sprites/player_walk1.svg';
        this.sprites.walk2.src = 'sprites/player_walk2.svg';
        this.sprites.attack.src = 'sprites/player_attack.svg';
        this.sprites.jump.src = 'sprites/player_jump.svg';
        this.sprites.hurt.src = 'sprites/player_hurt.svg';

        // Track loading
        let loadedCount = 0;
        const totalSprites = Object.keys(this.sprites).length;

        Object.values(this.sprites).forEach(img => {
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.loaded = true;
                    console.log('All player sprites loaded');
                }
            };
        });
    }

    setAnimation(name) {
        if (name === 'walk') {
            this.currentAnimation = 'walk';
        } else if (name === 'fall') {
            this.currentAnimation = 'jump'; // Use jump for falling too
        } else if (this.sprites[name]) {
            this.currentAnimation = name;
        }
    }

    update(deltaTime) {
        // Animate walk cycle
        if (this.currentAnimation === 'walk') {
            this.walkTimer += deltaTime;
            if (this.walkTimer > 150) {
                this.walkTimer = 0;
                this.walkFrame = 1 - this.walkFrame; // Toggle between 0 and 1
            }
        }
    }

    isAnimationComplete() {
        // For attack animation, consider it complete after a short time
        return this.currentAnimation === 'attack' || this.currentAnimation === 'hurt';
    }

    draw(x, y, scale = 1.5) {
        if (!this.loaded) return;

        let sprite;
        if (this.currentAnimation === 'walk') {
            sprite = this.walkFrame === 0 ? this.sprites.walk1 : this.sprites.walk2;
        } else {
            sprite = this.sprites[this.currentAnimation] || this.sprites.idle;
        }

        if (!sprite || !sprite.complete) return;

        const width = (this.currentAnimation === 'attack' ? 100 : 64) * scale;
        const height = 96 * scale;

        this.ctx.save();

        if (this.flipX) {
            this.ctx.translate(x + width, y);
            this.ctx.scale(-1, 1);
        } else {
            this.ctx.translate(x, y);
        }

        this.ctx.drawImage(sprite, 0, 0, width, height);
        this.ctx.restore();
    }
}

class DraculaSprite {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.loaded = false;
        this.flipX = false;
        this.currentAnimation = 'idle';
        this.phase = 1;

        // Load all SVG sprites
        this.sprites = {
            idle: new Image(),
            attack: new Image(),
            teleport: new Image()
        };

        this.sprites.idle.src = 'sprites/boss_idle.svg';
        this.sprites.attack.src = 'sprites/boss_attack.svg';
        this.sprites.teleport.src = 'sprites/boss_teleport.svg';

        // Track loading
        let loadedCount = 0;
        const totalSprites = Object.keys(this.sprites).length;

        Object.values(this.sprites).forEach(img => {
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.loaded = true;
                    console.log('All boss sprites loaded');
                }
            };
        });
    }

    setAnimation(name) {
        if (name === 'teleportIn') {
            this.currentAnimation = 'teleport';
        } else if (name === 'demonIdle' || name === 'demonAttack') {
            this.currentAnimation = 'idle'; // Use same sprite for demon form for now
        } else if (this.sprites[name]) {
            this.currentAnimation = name;
        }
    }

    setPhase(phase) {
        this.phase = phase;
    }

    update(deltaTime) {
        // Could add animation timing here
    }

    isAnimationComplete() {
        return true;
    }

    draw(x, y, scale = 1.8) {
        if (!this.loaded) return;

        const sprite = this.sprites[this.currentAnimation] || this.sprites.idle;
        if (!sprite || !sprite.complete) return;

        const width = (this.currentAnimation === 'attack' ? 120 : 80) * scale;
        const height = 120 * scale;

        // Scale up for demon phase
        const phaseScale = this.phase === 2 ? 1.3 : 1;

        this.ctx.save();

        if (this.flipX) {
            this.ctx.translate(x + width * phaseScale, y);
            this.ctx.scale(-1, 1);
        } else {
            this.ctx.translate(x, y);
        }

        this.ctx.drawImage(sprite, 0, 0, width * phaseScale, height * phaseScale);
        this.ctx.restore();
    }
}

// Export for use in game.js
window.AlucardSprite = AlucardSprite;
window.DraculaSprite = DraculaSprite;
