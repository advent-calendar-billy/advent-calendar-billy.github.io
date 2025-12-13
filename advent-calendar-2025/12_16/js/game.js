// Castlevania: Symphony of the Night - Boss Fight Minigame
// Authentic SOTN-style gameplay

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // Game state
        this.state = 'start'; // start, dialogue, playing, paused, gameOver, victory
        this.lastTime = 0;

        // Player (Alucard)
        this.player = {
            x: 100,
            y: 0,
            vx: 0,
            vy: 0,
            width: 96,   // 64 * 1.5 scale
            height: 144, // 96 * 1.5 scale
            speed: 5,
            jumpForce: -18,
            gravity: 0.8,
            grounded: false,
            facing: 1, // 1 = right, -1 = left
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            attacking: false,
            attackCooldown: 0,
            attackHit: false,
            backdashing: false,
            backdashTimer: 0,
            invincible: false,
            invincibleTimer: 0,
            hurtTimer: 0
        };

        // Boss (Dracula)
        this.boss = {
            x: 0,
            y: 0,
            width: 144,  // 80 * 1.8 scale
            height: 216, // 120 * 1.8 scale
            hp: 400,
            maxHp: 400,
            phase: 1,
            state: 'idle',
            stateTimer: 0,
            attackCooldown: 0,
            teleportTarget: null,
            projectiles: [],
            facing: -1,
            hitFlash: 0
        };

        // Hit effects
        this.hitEffects = [];
        this.damageNumbers = [];

        // Ground level
        this.groundY = 0;

        // Input handling
        this.keys = {};
        this.setupInput();

        // Sprites
        this.alucardSprite = null;
        this.draculaSprite = null;
        this.backgroundImage = null;
        this.loadSprites();
        this.loadBackground();

        // Dialogue system
        this.dialogueIndex = 0;
        this.dialogues = [
            { speaker: 'DRACULA', text: 'What is a man? A miserable little pile of secrets!' },
            { speaker: 'DRACULA', text: 'But enough talk... HAVE AT YOU!' },
            { speaker: 'ALUCARD', text: 'Father... I will end your reign of terror!' }
        ];

        // Equipment data (must be before setupUI)
        this.equipment = {
            weapon: { name: 'Alucard Sword', attack: 42, description: 'A powerful sword passed down through the Tepes bloodline.' },
            shield: { name: 'Alucard Shield', defense: 5, description: 'Shield once belonging to Vlad Dracula Tepes.' },
            helm: { name: 'Dragon Helm', defense: 8, description: 'A helm imbued with dragon scales.' },
            armor: { name: 'Alucard Mail', defense: 18, description: 'Armor of the vampire lord.' },
            cloak: { name: 'Twilight Cloak', defense: 4, description: 'A mystical cloak that shimmers between dimensions.' },
            acc1: { name: 'Ring of Varda', effect: '+30 INT', description: 'One of the great Elven rings.' },
            acc2: { name: 'Duplicator', effect: 'Infinite items', description: 'Duplicates any item used.' }
        };

        this.inventory = [
            { name: 'Crissaegrim', type: 'weapon', attack: 68, description: 'A legendary blade that strikes multiple times.' },
            { name: 'Shield Rod', type: 'weapon', attack: 11, description: 'A rod that amplifies shield abilities.' },
            { name: 'Dark Blade', type: 'weapon', attack: 45, description: 'A sword forged in darkness.' },
            { name: 'Holy Sword', type: 'weapon', attack: 52, description: 'Blessed blade effective against the undead.' },
            { name: 'Potion', type: 'consumable', effect: 'Restore 50 HP', description: 'A healing potion.' },
            { name: 'High Potion', type: 'consumable', effect: 'Restore 100 HP', description: 'A powerful healing potion.' },
            { name: 'Mana Prism', type: 'consumable', effect: 'Restore 50 MP', description: 'Restores magical energy.' }
        ];

        // UI Elements (after inventory is defined)
        this.setupUI();

        // Start the game loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.groundY = this.canvas.height - 100;

        console.log('Canvas setup:', this.canvas.width, 'x', this.canvas.height, 'Ground:', this.groundY);

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.groundY = this.canvas.height - 100;
            console.log('Canvas resized:', this.canvas.width, 'x', this.canvas.height);
        });
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Handle specific key presses
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleSpacePress();
            }
            if (e.code === 'Enter' || e.code === 'Escape') {
                e.preventDefault();
                this.handlePauseToggle();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    loadSprites() {
        this.alucardSprite = new AlucardSprite(this.canvas);
        this.draculaSprite = new DraculaSprite(this.canvas);
    }

    loadBackground() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'sprites/intro.png';
    }

    setupUI() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Controls button
        document.getElementById('controlsBtn').addEventListener('click', () => {
            document.getElementById('controlsInfo').classList.toggle('visible');
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.restartGame();
        });

        // Play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
        });

        // Pause menu tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Populate inventory
        this.populateInventory();
    }

    populateInventory() {
        const grid = document.getElementById('inventoryGrid');
        grid.innerHTML = '';

        this.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'inventory-item';
            slot.textContent = item.name.charAt(0);
            slot.title = item.name;
            slot.addEventListener('click', () => this.selectInventoryItem(index));
            slot.addEventListener('mouseenter', () => this.showItemDescription(item));
            grid.appendChild(slot);
        });
    }

    selectInventoryItem(index) {
        const items = document.querySelectorAll('.inventory-item');
        items.forEach(i => i.classList.remove('selected'));
        items[index].classList.add('selected');
    }

    showItemDescription(item) {
        const desc = document.getElementById('itemDescription');
        desc.innerHTML = `<strong>${item.name}</strong><br>${item.description}`;
        if (item.attack) desc.innerHTML += `<br>ATT: +${item.attack}`;
        if (item.defense) desc.innerHTML += `<br>DEF: +${item.defense}`;
        if (item.effect) desc.innerHTML += `<br>Effect: ${item.effect}`;
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');
    }

    handleSpacePress() {
        if (this.state === 'dialogue') {
            this.advanceDialogue();
        } else if (this.state === 'start') {
            this.startGame();
        }
    }

    handlePauseToggle() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseMenu').classList.add('active');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseMenu').classList.remove('active');
        }
    }

    startGame() {
        document.getElementById('startScreen').classList.add('hidden');
        this.state = 'dialogue';
        // Position characters for dialogue scene
        this.player.x = 150;
        this.player.y = this.groundY - this.player.height;
        this.boss.x = this.canvas.width - 300;
        this.boss.y = this.groundY - this.boss.height;
        this.showDialogue();
    }

    showDialogue() {
        const dialogue = this.dialogues[this.dialogueIndex];
        const box = document.getElementById('dialogueBox');
        document.getElementById('dialogueSpeaker').textContent = dialogue.speaker;
        document.getElementById('dialogueText').textContent = dialogue.text;
        box.classList.add('active');
    }

    advanceDialogue() {
        this.dialogueIndex++;
        if (this.dialogueIndex >= this.dialogues.length) {
            document.getElementById('dialogueBox').classList.remove('active');
            this.state = 'playing';
            document.getElementById('bossHud').classList.add('active');
            this.initBattle();
        } else {
            this.showDialogue();
        }
    }

    initBattle() {
        // Position player and boss
        this.player.x = 150;
        this.player.y = this.groundY - this.player.height;

        this.boss.x = this.canvas.width - 300;
        this.boss.y = this.groundY - this.boss.height;
    }

    restartGame() {
        // Reset player
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        this.player.invincible = false;
        this.player.x = 150;
        this.player.y = this.groundY - this.player.height;

        // Reset boss
        this.boss.hp = this.boss.maxHp;
        this.boss.phase = 1;
        this.boss.state = 'idle';
        this.boss.stateTimer = 1000;
        this.boss.attackCooldown = 1500;
        this.boss.projectiles = [];
        this.boss.width = 144;
        this.boss.height = 216;
        this.boss.x = this.canvas.width - 300;
        this.boss.hitFlash = 0;

        // Reset effects
        this.hitEffects = [];
        this.damageNumbers = [];

        // Reset Dracula sprite phase
        if (this.draculaSprite) {
            this.draculaSprite.phase = 1;
            this.draculaSprite.setAnimation('idle');
        }

        // Reset dialogue
        this.dialogueIndex = 0;

        // Hide screens
        document.getElementById('gameOverScreen').classList.remove('active');
        document.getElementById('victoryScreen').classList.remove('active');
        document.getElementById('bossHud').classList.remove('active');

        // Back to start
        document.getElementById('startScreen').classList.remove('hidden');
        this.state = 'start';
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;

        this.updatePlayer(deltaTime);
        this.updateBoss(deltaTime);
        this.updateEffects(deltaTime);
        this.checkCollisions();
        this.updateUI();
    }

    updateEffects(deltaTime) {
        // Update hit effects
        this.hitEffects = this.hitEffects.filter(effect => {
            effect.lifetime -= deltaTime;
            return effect.lifetime > 0;
        });

        // Update damage numbers
        this.damageNumbers = this.damageNumbers.filter(num => {
            num.lifetime -= deltaTime;
            num.y += num.vy;
            return num.lifetime > 0;
        });

        // Update boss hit flash
        if (this.boss.hitFlash > 0) {
            this.boss.hitFlash -= deltaTime;
        }
    }

    updatePlayer(deltaTime) {
        const p = this.player;

        // Update timers
        if (p.attackCooldown > 0) p.attackCooldown -= deltaTime;
        if (p.backdashTimer > 0) p.backdashTimer -= deltaTime;
        if (p.invincibleTimer > 0) p.invincibleTimer -= deltaTime;
        else p.invincible = false;
        if (p.hurtTimer > 0) p.hurtTimer -= deltaTime;

        // Check if backdash ended
        if (p.backdashing && p.backdashTimer <= 0) {
            p.backdashing = false;
        }

        // Check if attack ended
        if (p.attacking && this.alucardSprite && this.alucardSprite.isAnimationComplete()) {
            p.attacking = false;
        }

        // Movement (only if not backdashing or attacking)
        if (!p.backdashing && !p.attacking && p.hurtTimer <= 0) {
            // Horizontal movement
            if (this.keys['ArrowLeft']) {
                p.vx = -p.speed;
                p.facing = -1;
            } else if (this.keys['ArrowRight']) {
                p.vx = p.speed;
                p.facing = 1;
            } else {
                p.vx = 0;
            }

            // Jump
            if ((this.keys['KeyX'] || this.keys['ArrowUp']) && p.grounded) {
                p.vy = p.jumpForce;
                p.grounded = false;
            }

            // Attack (can attack in air too, like SOTN)
            if (this.keys['KeyZ'] && p.attackCooldown <= 0) {
                p.attacking = true;
                p.attackCooldown = 400;
                p.attackHit = false; // Reset hit tracking
                if (this.alucardSprite) {
                    this.alucardSprite.setAnimation('attack');
                    this.alucardSprite.currentFrame = 0;
                }
            }

            // Backdash
            if (this.keys['KeyC'] && p.grounded && !p.backdashing) {
                p.backdashing = true;
                p.backdashTimer = 300;
                p.vx = -p.facing * 12;
                if (this.alucardSprite) {
                    this.alucardSprite.setAnimation('backdash');
                    this.alucardSprite.currentFrame = 0;
                }
            }

            // Crouch
            if (this.keys['ArrowDown'] && p.grounded) {
                if (this.alucardSprite) this.alucardSprite.setAnimation('crouch');
            }
        }

        // Apply gravity
        p.vy += p.gravity;

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;

        // Ground collision
        if (p.y >= this.groundY - p.height) {
            p.y = this.groundY - p.height;
            p.vy = 0;
            p.grounded = true;
        }

        // Wall boundaries
        if (p.x < 0) p.x = 0;
        if (p.x > this.canvas.width - p.width) p.x = this.canvas.width - p.width;

        // Update sprite animation
        if (this.alucardSprite) {
            this.alucardSprite.flipX = p.facing === -1;

            if (p.hurtTimer > 0) {
                this.alucardSprite.setAnimation('hurt');
            } else if (!p.attacking && !p.backdashing) {
                if (!p.grounded) {
                    if (p.vy < 0) {
                        this.alucardSprite.setAnimation('jump');
                    } else {
                        this.alucardSprite.setAnimation('fall');
                    }
                } else if (Math.abs(p.vx) > 0) {
                    this.alucardSprite.setAnimation('walk');
                } else if (!this.keys['ArrowDown']) {
                    this.alucardSprite.setAnimation('idle');
                }
            }

            this.alucardSprite.update(deltaTime);
        }
    }

    updateBoss(deltaTime) {
        const b = this.boss;

        // Update state timer
        b.stateTimer -= deltaTime;
        b.attackCooldown -= deltaTime;

        // Face the player
        b.facing = this.player.x < b.x ? -1 : 1;

        // State machine
        switch (b.state) {
            case 'idle':
                if (b.stateTimer <= 0 && b.attackCooldown <= 0) {
                    // Choose an action
                    const action = Math.random();
                    if (action < 0.3) {
                        this.bossTeleport();
                    } else if (action < 0.7) {
                        this.bossFireball();
                    } else {
                        this.bossHellfire();
                    }
                }
                break;

            case 'teleporting':
                if (b.stateTimer <= 0) {
                    b.x = b.teleportTarget;
                    b.state = 'idle';
                    b.stateTimer = 500;
                }
                break;

            case 'attacking':
                if (b.stateTimer <= 0) {
                    b.state = 'idle';
                    b.stateTimer = 1000;
                    b.attackCooldown = 1500;
                }
                break;
        }

        // Update projectiles
        b.projectiles = b.projectiles.filter(proj => {
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.lifetime -= deltaTime;

            // Check if projectile hits player
            if (this.checkProjectileHit(proj)) {
                this.damagePlayer(proj.damage);
                return false;
            }

            return proj.lifetime > 0 && proj.x > -50 && proj.x < this.canvas.width + 50;
        });

        // Update sprite
        if (this.draculaSprite) {
            this.draculaSprite.flipX = b.facing === 1;
            if (b.state === 'teleporting') {
                this.draculaSprite.setAnimation('teleportIn');
            } else if (b.state === 'attacking') {
                this.draculaSprite.setAnimation('attack');
            } else {
                this.draculaSprite.setAnimation('idle');
            }
            this.draculaSprite.update(deltaTime);
        }

        // Check phase transition
        if (b.phase === 1 && b.hp <= b.maxHp * 0.5) {
            this.transitionToPhase2();
        }
    }

    bossTeleport() {
        const b = this.boss;
        b.state = 'teleporting';
        b.stateTimer = 500;

        // Teleport to a position near the player
        const targetX = this.player.x + (Math.random() > 0.5 ? 200 : -200);
        b.teleportTarget = Math.max(100, Math.min(this.canvas.width - 200, targetX));
    }

    bossFireball() {
        const b = this.boss;
        b.state = 'attacking';
        b.stateTimer = 800;

        // Create fireballs in three directions
        const angles = [-20, 0, 20];
        angles.forEach(angle => {
            const rad = angle * Math.PI / 180;
            b.projectiles.push({
                x: b.x + b.width / 2,
                y: b.y + 60,
                vx: Math.cos(rad) * 6 * b.facing,
                vy: Math.sin(rad) * 2,
                radius: 15,
                damage: 10,
                lifetime: 3000,
                type: 'fireball'
            });
        });
    }

    bossHellfire() {
        const b = this.boss;
        b.state = 'attacking';
        b.stateTimer = 1500;

        // Create hellfire pillars
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = 100 + i * (this.canvas.width - 200) / 4;
                b.projectiles.push({
                    x: x,
                    y: this.groundY - 200,
                    vx: 0,
                    vy: 0,
                    radius: 40,
                    damage: 15,
                    lifetime: 1000,
                    type: 'hellfire'
                });
            }, i * 200);
        }
    }

    transitionToPhase2() {
        const b = this.boss;
        b.phase = 2;
        b.width = 350;
        b.height = 300;
        b.y = this.groundY - b.height;

        if (this.draculaSprite) {
            this.draculaSprite.setPhase(2);
        }

        // Show phase transition dialogue
        this.dialogues = [
            { speaker: 'DRACULA', text: 'You have done well to push me this far... But now you face my TRUE POWER!' }
        ];
        this.dialogueIndex = 0;
        this.state = 'dialogue';
        this.showDialogue();
    }

    checkProjectileHit(proj) {
        const p = this.player;
        if (p.invincible) return false;

        const dx = (p.x + p.width / 2) - proj.x;
        const dy = (p.y + p.height / 2) - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        return dist < proj.radius + 30;
    }

    damagePlayer(amount) {
        const p = this.player;
        if (p.invincible) return;

        p.hp -= amount;
        p.invincible = true;
        p.invincibleTimer = 1000;
        p.hurtTimer = 300;

        if (p.hp <= 0) {
            p.hp = 0;
            this.gameOver();
        }
    }

    checkCollisions() {
        const p = this.player;
        const b = this.boss;

        // Player attack hitting boss (only once per swing)
        if (p.attacking && !p.attackHit && this.alucardSprite && this.alucardSprite.currentFrame >= 2) {
            const attackRange = p.facing === 1 ?
                { x: p.x + p.width, y: p.y, w: 100, h: p.height } :
                { x: p.x - 100, y: p.y, w: 100, h: p.height };

            if (this.rectIntersect(attackRange, { x: b.x, y: b.y, w: b.width, h: b.height })) {
                this.damageBoss(this.equipment.weapon.attack);
                p.attackHit = true; // Mark that we hit this swing
                this.createHitSparks(b.x + b.width/2, b.y + b.height/3, 8);
            }
        }

        // Player touching boss (contact damage)
        if (!p.invincible && this.rectIntersect(
            { x: p.x, y: p.y, w: p.width, h: p.height },
            { x: b.x, y: b.y, w: b.width, h: b.height }
        )) {
            this.damagePlayer(15);
            // Knock back player
            p.vx = -p.facing * 10;
        }
    }

    rectIntersect(r1, r2) {
        return r1.x < r2.x + r2.w &&
               r1.x + r1.w > r2.x &&
               r1.y < r2.y + r2.h &&
               r1.y + r1.h > r2.y;
    }

    damageBoss(amount) {
        const b = this.boss;
        b.hp -= amount;
        b.hitFlash = 100;

        // Add hit effect
        this.hitEffects.push({
            x: b.x + b.width / 2 + (Math.random() - 0.5) * 50,
            y: b.y + b.height / 3,
            lifetime: 200,
            size: 30 + Math.random() * 20
        });

        // Add damage number
        this.damageNumbers.push({
            x: b.x + b.width / 2,
            y: b.y + 50,
            value: amount,
            lifetime: 1000,
            vy: -2
        });

        if (b.hp <= 0) {
            b.hp = 0;
            this.victory();
        }
    }

    createHitSparks(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            this.hitEffects.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                lifetime: 150 + Math.random() * 100,
                size: 10 + Math.random() * 15,
                type: 'spark'
            });
        }
    }

    updateUI() {
        // Update HP bar
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('hpFill').style.width = hpPercent + '%';
        document.getElementById('hpValue').textContent = `${this.player.hp}/${this.player.maxHp}`;

        // Update MP bar
        const mpPercent = (this.player.mp / this.player.maxMp) * 100;
        document.getElementById('mpFill').style.width = mpPercent + '%';
        document.getElementById('mpValue').textContent = `${this.player.mp}/${this.player.maxMp}`;

        // Update Boss HP bar
        const bossHpPercent = (this.boss.hp / this.boss.maxHp) * 100;
        document.getElementById('bossHpFill').style.width = bossHpPercent + '%';
    }

    gameOver() {
        this.state = 'gameOver';
        document.getElementById('gameOverScreen').classList.add('active');
    }

    victory() {
        this.state = 'victory';
        document.getElementById('victoryScreen').classList.add('active');
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background (castle throne room)
        this.drawBackground();

        // Draw ground
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

        // Draw floor pattern
        this.ctx.strokeStyle = '#2a2a4a';
        this.ctx.lineWidth = 2;
        for (let x = 0; x < this.canvas.width; x += 80) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.groundY);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        if (this.state === 'playing' || this.state === 'paused' || this.state === 'dialogue') {
            // Draw boss
            this.drawBoss();

            // Draw boss projectiles
            this.drawProjectiles();

            // Draw player
            this.drawPlayer();

            // Draw hit effects
            this.drawHitEffects();

            // Draw damage numbers
            this.drawDamageNumbers();
        }
    }

    drawHitEffects() {
        const ctx = this.ctx;

        this.hitEffects.forEach(effect => {
            const alpha = effect.lifetime / 200;
            const gradient = ctx.createRadialGradient(
                effect.x, effect.y, 0,
                effect.x, effect.y, effect.size
            );
            gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
            gradient.addColorStop(0.3, `rgba(255, 200, 100, ${alpha * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawDamageNumbers() {
        const ctx = this.ctx;

        this.damageNumbers.forEach(num => {
            const alpha = Math.min(1, num.lifetime / 500);
            ctx.font = 'bold 24px Cinzel';
            ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.strokeText(num.value, num.x, num.y);
            ctx.fillText(num.value, num.x, num.y);
        });
    }

    drawBackground() {
        const ctx = this.ctx;

        // Draw background image if loaded
        if (this.backgroundImage && this.backgroundImage.complete) {
            // Draw the castle backdrop with opacity
            ctx.globalAlpha = 0.4;
            ctx.drawImage(
                this.backgroundImage,
                0, 0, 450, 661,  // Castle portion
                0, 0,
                this.canvas.width * 0.6, this.canvas.height
            );
            ctx.globalAlpha = 1;
        }

        // Gothic pillars
        ctx.fillStyle = '#15152a';
        for (let i = 0; i < 5; i++) {
            const x = i * (this.canvas.width / 4);
            ctx.fillRect(x - 30, 50, 60, this.groundY - 50);

            // Pillar decorations
            ctx.fillStyle = '#252545';
            ctx.fillRect(x - 40, 40, 80, 30);
            ctx.fillRect(x - 35, this.groundY - 20, 70, 20);
            ctx.fillStyle = '#15152a';
        }

        // Stained glass window effect
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, 150, 50,
            this.canvas.width / 2, 150, 200
        );
        gradient.addColorStop(0, 'rgba(139, 0, 0, 0.4)');
        gradient.addColorStop(0.5, 'rgba(100, 0, 100, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.canvas.width / 2, 150, 200, 0, Math.PI * 2);
        ctx.fill();

        // Moon through window
        ctx.fillStyle = 'rgba(200, 200, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(this.canvas.width / 2, 120, 70, 0, Math.PI * 2);
        ctx.fill();

        // Add some ambient particles
        this.drawParticles();
    }

    drawParticles() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;

        // Floating dust particles
        for (let i = 0; i < 30; i++) {
            const x = ((time * 20 + i * 47) % this.canvas.width);
            const y = ((Math.sin(time + i) * 50) + 200 + i * 15) % (this.groundY - 50);
            const alpha = 0.1 + Math.sin(time * 2 + i) * 0.1;

            ctx.fillStyle = `rgba(255, 220, 180, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPlayer() {
        const p = this.player;
        const ctx = this.ctx;

        // Draw invincibility flash
        if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Try to draw sprite, fall back to shape if not loaded
        let spriteDrawn = false;
        if (this.alucardSprite && this.alucardSprite.loaded) {
            this.alucardSprite.draw(p.x, p.y, 2);
            spriteDrawn = true;
        }

        if (!spriteDrawn) {
            // Fallback: Draw Alucard-like silhouette
            ctx.save();
            if (p.facing === -1) {
                ctx.translate(p.x + p.width, p.y);
                ctx.scale(-1, 1);
            } else {
                ctx.translate(p.x, p.y);
            }

            // Cape (dark flowing cape)
            ctx.fillStyle = '#3a3a5a';
            ctx.beginPath();
            ctx.moveTo(p.width * 0.5, p.height * 0.15);
            ctx.quadraticCurveTo(p.width * 0.1, p.height * 0.5, p.width * 0.15, p.height);
            ctx.lineTo(p.width * 0.85, p.height);
            ctx.quadraticCurveTo(p.width * 0.9, p.height * 0.5, p.width * 0.5, p.height * 0.15);
            ctx.fill();

            // Body
            ctx.fillStyle = '#555577';
            ctx.fillRect(p.width * 0.35, p.height * 0.18, p.width * 0.3, p.height * 0.45);

            // Head
            ctx.fillStyle = '#e8ddd0';
            ctx.beginPath();
            ctx.arc(p.width * 0.5, p.height * 0.1, p.width * 0.12, 0, Math.PI * 2);
            ctx.fill();

            // Hair (long blonde)
            ctx.fillStyle = '#c4a000';
            ctx.beginPath();
            ctx.ellipse(p.width * 0.5, p.height * 0.08, p.width * 0.15, p.width * 0.1, 0, Math.PI, 0);
            ctx.fill();
            // Hair strands down
            ctx.fillRect(p.width * 0.35, p.height * 0.08, p.width * 0.05, p.height * 0.15);
            ctx.fillRect(p.width * 0.6, p.height * 0.08, p.width * 0.05, p.height * 0.15);

            // Legs
            ctx.fillStyle = '#444466';
            ctx.fillRect(p.width * 0.35, p.height * 0.63, p.width * 0.12, p.height * 0.35);
            ctx.fillRect(p.width * 0.53, p.height * 0.63, p.width * 0.12, p.height * 0.35);

            // Sword (when attacking)
            if (p.attacking) {
                ctx.fillStyle = '#ccccee';
                ctx.fillRect(p.width * 0.65, p.height * 0.25, p.width * 1.2, 6);
                // Sword glow
                ctx.strokeStyle = '#8888ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(p.width * 0.65, p.height * 0.25, p.width * 1.2, 6);
            }

            ctx.restore();
        }

        ctx.globalAlpha = 1;
    }

    drawBoss() {
        const b = this.boss;
        const ctx = this.ctx;

        if (b.state === 'teleporting' && b.stateTimer > 250) {
            // Fade out effect
            ctx.globalAlpha = b.stateTimer / 500;
        }

        // Hit flash effect
        if (b.hitFlash > 0) {
            ctx.filter = 'brightness(2) saturate(0)';
        }

        if (this.draculaSprite && this.draculaSprite.loaded) {
            this.draculaSprite.draw(b.x, b.y, 2.5);
        } else {
            // Fallback rectangle with cape-like shape
            ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#8b0000';
            ctx.beginPath();
            ctx.moveTo(b.x + b.width/2, b.y);
            ctx.lineTo(b.x + b.width, b.y + b.height * 0.3);
            ctx.lineTo(b.x + b.width * 0.9, b.y + b.height);
            ctx.lineTo(b.x + b.width * 0.1, b.y + b.height);
            ctx.lineTo(b.x, b.y + b.height * 0.3);
            ctx.closePath();
            ctx.fill();

            // Head
            ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#ddd';
            ctx.beginPath();
            ctx.arc(b.x + b.width/2, b.y + 30, 25, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.filter = 'none';
        ctx.globalAlpha = 1;
    }

    drawProjectiles() {
        const ctx = this.ctx;

        this.boss.projectiles.forEach(proj => {
            if (proj.type === 'fireball') {
                // Draw fireball
                const gradient = ctx.createRadialGradient(
                    proj.x, proj.y, 0,
                    proj.x, proj.y, proj.radius
                );
                gradient.addColorStop(0, '#ffff00');
                gradient.addColorStop(0.4, '#ff6600');
                gradient.addColorStop(1, '#ff0000');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
                ctx.fill();

                // Glow effect
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 20;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (proj.type === 'hellfire') {
                // Draw hellfire pillar
                const gradient = ctx.createLinearGradient(
                    proj.x, proj.y + 200,
                    proj.x, proj.y - 100
                );
                gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
                gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.8)');
                gradient.addColorStop(0.6, 'rgba(255, 200, 0, 1)');
                gradient.addColorStop(1, 'rgba(255, 255, 200, 0.5)');

                ctx.fillStyle = gradient;
                ctx.fillRect(proj.x - proj.radius, proj.y - 100, proj.radius * 2, 300);
            }
        });
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
