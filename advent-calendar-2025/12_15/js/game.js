/**
 * Fede's Falling Dream - Game Logic
 */

class FallingDreamGame {
    constructor() {
        this.isRunning = false;
        this.altitude = 99000;
        this.playerX = 50;
        this.playerY = 25;
        this.obstacles = [];
        this.windParticles = [];
        this.cloudLayers = [];
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.lastSpawnTime = 0;
        this.animationFrameId = null;
        this.keys = { left: false, right: false, up: false, down: false };

        this.lives = 3;
        this.maxLives = 3;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 1500;

        this.parachuteAvailable = false;
        this.parachuteDeployed = false;
        this.parachuteAltitude = 3000;

        this.windStrength = 0;
        this.windDirection = 0;
        this.windGustTimer = 0;
        this.nextGustTime = 2000;
        this.currentGust = { strength: 0, direction: 0, duration: 0, elapsed: 0 };

        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.nearMissTimer = 0;
        this.speedLines = [];

        this.characterTilt = 0;
        this.targetTilt = 0;

        this.sleepRestlessness = 0;
        this.sleepTossTimer = 0;
        this.sleepTargetRotation = 0;
        this.sleepCurrentRotation = 0;
        this.sleepTargetY = 0;
        this.sleepCurrentY = 0;
        this.currentSleepDirection = 'center';

        // ~45 second game
        this.descentRate = 2200;

        this.phases = {
            space: { minAlt: 75000, spawnRate: 400, windMult: 0.05 },
            atmosphere: { minAlt: 55000, spawnRate: 450, windMult: 0.4 },
            sky: { minAlt: 20000, spawnRate: 400, windMult: 1.0 },
            ground: { minAlt: 0, spawnRate: 500, windMult: 0.7 }
        };

        this.gameContainer = document.querySelector('.game-container');
        this.dreamSection = document.getElementById('dreamSection');
        this.dreamBackground = document.getElementById('dreamBackground');
        this.starsLayer = document.getElementById('starsLayer');
        this.earthContainer = document.getElementById('earthContainer');
        this.fallingCharacter = document.getElementById('fallingCharacter');
        this.sleepingCharacter = document.getElementById('sleepingCharacter');
        this.sleepingContainer = document.getElementById('sleepingContainer');
        this.obstaclesContainer = document.getElementById('obstaclesContainer');
        this.landingZone = document.getElementById('landingZone');
        this.altitudeDisplay = document.getElementById('altitude').querySelector('span');
        this.progressBar = document.getElementById('progressBar');
        this.progressMarker = document.getElementById('progressMarker');
        this.dreamBubble = document.getElementById('dreamBubble');

        this.startOverlay = document.getElementById('startOverlay');
        this.winOverlay = document.getElementById('winOverlay');
        this.loseOverlay = document.getElementById('loseOverlay');

        this.startButton = document.getElementById('startButton');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.retryButton = document.getElementById('retryButton');

        this.obstacleTypes = {
            space: [
                { type: 'asteroid', src: 'icons/asteroid-1.svg', class: 'asteroid', width: 55, height: 55, damage: true, behavior: 'tumble' },
                { type: 'asteroid', src: 'icons/asteroid-2.svg', class: 'asteroid', width: 50, height: 50, damage: true, behavior: 'tumble' },
                { type: 'asteroid', src: 'icons/asteroid-3.svg', class: 'asteroid-large', width: 75, height: 60, damage: true, behavior: 'tumble' },
                { type: 'asteroid', src: 'icons/asteroid-1.svg', class: 'asteroid', width: 45, height: 45, damage: true, behavior: 'tumble' }
            ],
            atmosphere: [
                { type: 'asteroid', src: 'icons/asteroid-1.svg', class: 'asteroid', width: 45, height: 45, damage: true, behavior: 'tumble' },
                { type: 'asteroid', src: 'icons/asteroid-2.svg', class: 'asteroid', width: 40, height: 40, damage: true, behavior: 'tumble' },
                { type: 'plane', src: 'icons/plane.svg', class: 'plane', width: 100, height: 50, damage: true, behavior: 'fly-horizontal' },
                { type: 'cloud', src: 'icons/cloud-1.svg', class: 'cloud', width: 180, height: 90, damage: false, behavior: 'drift' },
                { type: 'cloud', src: 'icons/cloud-2.svg', class: 'cloud', width: 150, height: 75, damage: false, behavior: 'drift' }
            ],
            sky: [
                { type: 'cloud', src: 'icons/cloud-1.svg', class: 'cloud', width: 200, height: 100, damage: false, behavior: 'drift' },
                { type: 'cloud', src: 'icons/cloud-2.svg', class: 'cloud', width: 170, height: 85, damage: false, behavior: 'drift' },
                { type: 'plane', src: 'icons/plane.svg', class: 'plane', width: 100, height: 50, damage: true, behavior: 'fly-horizontal' },
                { type: 'helicopter', src: 'icons/helicopter.svg', class: 'helicopter', width: 90, height: 58, damage: true, behavior: 'hover' },
                { type: 'bird', src: 'icons/bird-1.svg', class: 'bird', width: 50, height: 32, damage: true, behavior: 'flap' }
            ],
            ground: [
                { type: 'bird', src: 'icons/bird-1.svg', class: 'bird', width: 50, height: 32, damage: true, behavior: 'flap' },
                { type: 'bird', src: 'icons/bird-2.svg', class: 'bird', width: 50, height: 32, damage: true, behavior: 'flap' },
                { type: 'helicopter', src: 'icons/helicopter.svg', class: 'helicopter', width: 80, height: 52, damage: true, behavior: 'hover' },
                { type: 'cloud', src: 'icons/cloud-3.svg', class: 'cloud-small', width: 140, height: 70, damage: false, behavior: 'drift' }
            ]
        };

        this.init();
    }

    init() {
        this.createStars();
        this.createWindParticlePool();
        this.createSpeedLines();
        this.createParallaxLayers();
        this.createWindIndicator();
        this.createLivesDisplay();
        this.createParachuteButton();
        this.dreamBackground.classList.add('space');
        this.bindEvents();
        this.startOverlay.classList.add('active');
        this.landingZone.style.visibility = 'hidden';
    }

    createStars() {
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3.5 + 0.5;
            star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;animation-delay:${Math.random()*3}s;animation-duration:${1.5+Math.random()*2.5}s;`;
            this.starsLayer.appendChild(star);
        }
    }

    createWindParticlePool() {
        this.windContainer = document.createElement('div');
        this.windContainer.className = 'wind-container';
        this.dreamSection.appendChild(this.windContainer);
        for (let i = 0; i < 80; i++) {
            const particle = document.createElement('div');
            particle.className = 'wind-particle';
            particle.style.opacity = '0';
            this.windContainer.appendChild(particle);
            this.windParticles.push({ element: particle, active: false, x: 0, y: 0, length: 0 });
        }
    }

    createSpeedLines() {
        this.speedLinesContainer = document.createElement('div');
        this.speedLinesContainer.className = 'speed-lines-container';
        this.dreamSection.appendChild(this.speedLinesContainer);
        for (let i = 0; i < 35; i++) {
            const line = document.createElement('div');
            line.className = 'speed-line';
            this.speedLinesContainer.appendChild(line);
            this.speedLines.push({ element: line, x: Math.random() * 100, y: Math.random() * 100, speed: 0.4 + Math.random() * 0.6 });
        }
    }

    createParallaxLayers() {
        this.parallaxContainer = document.createElement('div');
        this.parallaxContainer.className = 'parallax-container';
        this.dreamSection.insertBefore(this.parallaxContainer, this.dreamSection.firstChild.nextSibling);
        for (let layer = 0; layer < 3; layer++) {
            const layerDiv = document.createElement('div');
            layerDiv.className = `parallax-layer layer-${layer}`;
            layerDiv.style.opacity = '0';
            this.parallaxContainer.appendChild(layerDiv);
            this.cloudLayers.push({ element: layerDiv, clouds: [], speed: 0.25 + layer * 0.35, opacity: 0 });
        }
    }

    createWindIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'wind-indicator';
        indicator.innerHTML = `<div class="wind-arrow" id="windArrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div><span class="wind-label">WIND</span>`;
        document.querySelector('.game-ui').appendChild(indicator);
        this.windArrow = document.getElementById('windArrow');
    }

    createLivesDisplay() {
        const livesDisplay = document.createElement('div');
        livesDisplay.className = 'lives-display';
        livesDisplay.id = 'livesDisplay';
        let heartsHTML = '';
        for (let i = 0; i < this.maxLives; i++) {
            heartsHTML += `<div class="life-heart" id="heart${i}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>`;
        }
        livesDisplay.innerHTML = heartsHTML;
        document.querySelector('.game-ui').insertBefore(livesDisplay, document.querySelector('.game-ui').firstChild.nextSibling);
    }

    createParachuteButton() {
        const parachuteBtn = document.createElement('div');
        parachuteBtn.className = 'parachute-button';
        parachuteBtn.id = 'parachuteButton';
        parachuteBtn.innerHTML = `<div class="parachute-inner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.5 2 2 6.5 2 12c0 0 2 4 10 4s10-4 10-4c0-5.5-4.5-10-10-10z"/><path d="M12 16v6"/><path d="M8 16l4 6 4-6"/></svg><span>DEPLOY</span><span class="parachute-hint">[SPACE]</span></div>`;
        this.dreamSection.appendChild(parachuteBtn);
        this.parachuteButton = parachuteBtn;
        parachuteBtn.addEventListener('click', () => this.deployParachute());
    }

    updateLivesDisplay() {
        for (let i = 0; i < this.maxLives; i++) {
            const heart = document.getElementById(`heart${i}`);
            if (i < this.lives) heart.classList.remove('lost');
            else heart.classList.add('lost');
        }
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.startButton.addEventListener('click', () => this.startGame());
        this.playAgainButton.addEventListener('click', () => this.restartGame());
        this.retryButton.addEventListener('click', () => this.restartGame());
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft') { this.keys.left = true; e.preventDefault(); }
        if (e.key === 'ArrowRight') { this.keys.right = true; e.preventDefault(); }
        if (e.key === 'ArrowUp') { this.keys.up = true; e.preventDefault(); }
        if (e.key === 'ArrowDown') { this.keys.down = true; e.preventDefault(); }
        if (e.key === ' ' || e.key === 'Enter') {
            if (this.startOverlay.classList.contains('active')) { this.startGame(); e.preventDefault(); }
            else if (this.parachuteAvailable && !this.parachuteDeployed && this.isRunning) { this.deployParachute(); e.preventDefault(); }
        }
        if ((e.key === 'r' || e.key === 'R') && !this.isRunning && (this.winOverlay.classList.contains('active') || this.loseOverlay.classList.contains('active'))) {
            this.restartGame();
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft') this.keys.left = false;
        if (e.key === 'ArrowRight') this.keys.right = false;
        if (e.key === 'ArrowUp') this.keys.up = false;
        if (e.key === 'ArrowDown') this.keys.down = false;
    }

    deployParachute() {
        if (!this.parachuteAvailable || this.parachuteDeployed) return;
        this.parachuteDeployed = true;
        this.parachuteButton.classList.add('deployed');
        this.fallingCharacter.classList.add('parachute-deployed');
        this.descentRate = 400;
        this.screenShake.intensity = 5;
    }

    startGame() {
        this.startOverlay.classList.remove('active');
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameTime = 0;
        this.lives = this.maxLives;
        this.updateLivesDisplay();
        // Spawn initial asteroids immediately
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.spawnObstacle(), i * 200);
        }
        this.gameLoop(this.lastTime);
    }

    restartGame() {
        this.altitude = 99000;
        this.playerX = 50;
        this.playerY = 25;
        this.obstacles = [];
        this.gameTime = 0;
        this.windStrength = 0;
        this.windDirection = 0;
        this.currentGust = { strength: 0, direction: 0, duration: 0, elapsed: 0 };
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.characterTilt = 0;
        this.lives = this.maxLives;
        this.invulnerable = false;
        this.sleepRestlessness = 0;
        this.sleepCurrentRotation = 0;
        this.sleepCurrentY = 0;
        this.currentSleepDirection = 'center';
        this.parachuteAvailable = false;
        this.parachuteDeployed = false;
        this.descentRate = 2200;

        this.obstaclesContainer.innerHTML = '';
        this.cloudLayers.forEach(layer => { layer.element.innerHTML = ''; layer.clouds = []; layer.element.style.opacity = '0'; });

        this.dreamBackground.className = 'dream-background space';
        this.starsLayer.style.opacity = '1';
        this.earthContainer.style.transform = 'translateX(-50%) scale(1)';
        this.earthContainer.style.bottom = '-60%';
        this.landingZone.classList.remove('visible');
        this.landingZone.style.visibility = 'hidden';
        this.sleepingCharacter.src = 'icons/character-sleeping.svg';
        this.sleepingContainer.style.transform = 'translate(0, 0) rotate(0deg)';
        this.fallingCharacter.style.left = '50%';
        this.fallingCharacter.style.top = '25%';
        this.fallingCharacter.classList.remove('parachute-deployed', 'invulnerable');
        this.gameContainer.style.transform = 'translate(0, 0)';
        this.gameContainer.classList.remove('near-miss');
        this.dreamBubble.querySelector('span').textContent = 'zzz...';
        this.dreamBubble.style.opacity = '1';
        this.parachuteButton.classList.remove('visible', 'deployed');
        this.progressBar.style.width = '0%';
        this.progressMarker.style.left = '0%';

        this.updateLivesDisplay();
        this.winOverlay.classList.remove('active');
        this.loseOverlay.classList.remove('active');

        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;
        this.gameTime += this.deltaTime * 1000;

        if (this.invulnerable) {
            this.invulnerableTimer -= this.deltaTime * 1000;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
                this.fallingCharacter.classList.remove('invulnerable');
            }
        }

        this.updateWind();
        this.updatePlayer();
        this.updateSleepingCharacter();
        this.updateAltitude();
        this.updateObstacles();
        this.updateWindParticles();
        this.updateSpeedLines();
        this.updateParallaxClouds();
        this.updateScreenShake();
        this.updateCharacterAnimation();
        this.updatePhase();
        this.updateProgressBar();
        this.updateParachuteAvailability();

        const phase = this.getCurrentPhase();
        if (this.gameTime - this.lastSpawnTime > this.phases[phase].spawnRate) {
            this.spawnObstacle();
            this.lastSpawnTime = this.gameTime;
        }

        const collision = this.checkCollisions();
        if (collision === 'damage' && !this.invulnerable) {
            this.takeDamage();
            if (this.lives <= 0) { this.gameOver(false); return; }
        } else if (collision === 'cloud') {
            this.triggerCloudEffect();
        }

        if (this.altitude <= 0 && this.parachuteDeployed) { this.gameOver(true); return; }
        else if (this.altitude <= 0 && !this.parachuteDeployed) { this.gameOver(false); return; }

        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    updateParachuteAvailability() {
        if (this.altitude <= this.parachuteAltitude && !this.parachuteDeployed && !this.parachuteAvailable) {
            this.parachuteAvailable = true;
            this.parachuteButton.classList.add('visible');
        }
    }

    takeDamage() {
        this.lives--;
        this.updateLivesDisplay();
        this.invulnerable = true;
        this.invulnerableTimer = this.invulnerableDuration;
        this.fallingCharacter.classList.add('invulnerable');
        this.screenShake.intensity = 12;
        this.gameContainer.classList.add('hit');
        this.sleepRestlessness = Math.min(1, this.sleepRestlessness + 0.4);
        this.dreamBubble.querySelector('span').textContent = '...!';
        setTimeout(() => {
            this.gameContainer.classList.remove('hit');
            if (this.lives > 0) this.dreamBubble.querySelector('span').textContent = 'zzz...';
        }, 300);
    }

    updateWind() {
        const phase = this.getCurrentPhase();
        const windMult = this.phases[phase].windMult;

        this.windStrength = Math.sin(this.gameTime * 0.001) * 0.5 * windMult;
        this.windDirection = Math.sin(this.gameTime * 0.0007) * 0.8;

        this.windGustTimer += this.deltaTime * 1000;
        if (this.currentGust.duration > 0) {
            this.currentGust.elapsed += this.deltaTime * 1000;
            const progress = this.currentGust.elapsed / this.currentGust.duration;
            if (progress < 1) {
                const gustIntensity = Math.sin(progress * Math.PI);
                this.windStrength += this.currentGust.strength * gustIntensity * windMult;
                this.windDirection += this.currentGust.direction * gustIntensity;
            } else {
                this.currentGust.duration = 0;
            }
        }

        if (this.windGustTimer > this.nextGustTime) {
            this.windGustTimer = 0;
            this.nextGustTime = 1500 + Math.random() * 3000;
            const gustStrength = phase === 'sky' ? 2.5 : (phase === 'atmosphere' ? 1.5 : 0.5);
            this.currentGust = {
                strength: (Math.random() - 0.5) * 2 * gustStrength,
                direction: (Math.random() - 0.5) * 3,
                duration: 500 + Math.random() * 1000,
                elapsed: 0
            };
            if (Math.abs(this.currentGust.strength) > 1.5) this.screenShake.intensity = Math.abs(this.currentGust.strength) * 2;
        }

        if (this.windArrow) {
            const angle = this.windDirection * 55;
            const scale = 0.5 + Math.abs(this.windStrength) * 0.6;
            this.windArrow.style.transform = `rotate(${angle}deg) scale(${scale})`;
            this.windArrow.style.opacity = Math.abs(this.windStrength) + 0.3;
        }
    }

    updatePlayer() {
        const moveSpeed = 55;
        const windForce = this.windStrength * 15;

        if (this.keys.left) { this.playerX -= moveSpeed * this.deltaTime; this.targetTilt = -25; this.sleepRestlessness = Math.min(1, this.sleepRestlessness + this.deltaTime * 0.5); }
        if (this.keys.right) { this.playerX += moveSpeed * this.deltaTime; this.targetTilt = 25; this.sleepRestlessness = Math.min(1, this.sleepRestlessness + this.deltaTime * 0.5); }
        if (this.keys.up) { this.playerY -= moveSpeed * this.deltaTime; this.sleepRestlessness = Math.min(1, this.sleepRestlessness + this.deltaTime * 0.5); }
        if (this.keys.down) { this.playerY += moveSpeed * this.deltaTime; this.sleepRestlessness = Math.min(1, this.sleepRestlessness + this.deltaTime * 0.5); }

        if (!this.keys.left && !this.keys.right) this.targetTilt = this.windDirection * 15;

        this.playerX += windForce * this.deltaTime;
        this.playerX = Math.max(5, Math.min(95, this.playerX));
        this.playerY = Math.max(5, Math.min(85, this.playerY));

        this.fallingCharacter.style.left = `${this.playerX}%`;
        this.fallingCharacter.style.top = `${this.playerY}%`;

        if (!this.keys.left && !this.keys.right && !this.keys.up && !this.keys.down) {
            this.sleepRestlessness = Math.max(0, this.sleepRestlessness - this.deltaTime * 0.3);
        }
    }

    updateSleepingCharacter() {
        this.sleepTossTimer += this.deltaTime * 1000;
        if (this.sleepTossTimer > 600 - this.sleepRestlessness * 300) {
            this.sleepTossTimer = 0;
            this.sleepTargetY = Math.random() * this.sleepRestlessness * 8 - 4;
        }

        // Head rotation based on left/right input - like turning head on pillow
        const inputRotation = (this.playerX - 50) * 0.25;
        const randomToss = Math.sin(this.gameTime * 0.002) * this.sleepRestlessness * 6;
        this.sleepTargetRotation = inputRotation + randomToss;

        this.sleepCurrentRotation += (this.sleepTargetRotation - this.sleepCurrentRotation) * 5 * this.deltaTime;
        this.sleepCurrentY += (this.sleepTargetY - this.sleepCurrentY) * 3 * this.deltaTime;

        // Switch sleeping SVG based on player position (head turned left/right)
        const threshold = 15;
        if (this.playerX < 50 - threshold && this.currentSleepDirection !== 'left') {
            this.sleepingCharacter.src = 'icons/character-sleeping-left.svg';
            this.currentSleepDirection = 'left';
        } else if (this.playerX > 50 + threshold && this.currentSleepDirection !== 'right') {
            this.sleepingCharacter.src = 'icons/character-sleeping-right.svg';
            this.currentSleepDirection = 'right';
        } else if (this.playerX >= 50 - threshold && this.playerX <= 50 + threshold && this.currentSleepDirection !== 'center') {
            this.sleepingCharacter.src = 'icons/character-sleeping.svg';
            this.currentSleepDirection = 'center';
        }

        // Only rotation and slight Y shift (up/down in bed), no horizontal sliding
        this.sleepingContainer.style.transform = `translateY(${this.sleepCurrentY}px) rotate(${this.sleepCurrentRotation}deg)`;

        if (this.sleepRestlessness > 0.6) this.dreamBubble.classList.add('distressed');
        else this.dreamBubble.classList.remove('distressed');
    }

    updateAltitude() {
        this.altitude -= this.descentRate * this.deltaTime;
        this.altitude = Math.max(0, this.altitude);
        this.altitudeDisplay.textContent = Math.floor(this.altitude).toLocaleString();
    }

    updateProgressBar() {
        const progress = ((99000 - this.altitude) / 99000) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressMarker.style.left = `${progress}%`;
    }

    updateCharacterAnimation() {
        this.characterTilt += (this.targetTilt - this.characterTilt) * 8 * this.deltaTime;
        const wobble = Math.sin(this.gameTime * 0.012) * 8;
        const totalTilt = this.characterTilt + wobble + this.windDirection * 10;
        this.fallingCharacter.style.transform = `translate(-50%, -50%) rotate(${totalTilt}deg)`;
    }

    updateWindParticles() {
        const phase = this.getCurrentPhase();
        if (phase === 'space') {
            this.windParticles.forEach(p => { p.element.style.opacity = '0'; p.active = false; });
            return;
        }

        const spawnChance = this.parachuteDeployed ? 0.2 : 0.6;
        const particleSpeed = this.parachuteDeployed ? 300 : 1200;

        this.windParticles.forEach(particle => {
            if (particle.active) {
                particle.y -= particleSpeed * this.deltaTime;
                particle.x += this.windDirection * 80 * this.deltaTime;
                if (particle.y < -10) { particle.active = false; particle.element.style.opacity = '0'; }
                const angle = -85 + this.windDirection * 10;
                particle.element.style.transform = `translate(${particle.x}vw, ${particle.y}vh) rotate(${angle}deg)`;
            } else if (Math.random() < spawnChance * this.deltaTime) {
                particle.active = true;
                particle.x = Math.random() * 100;
                particle.y = 105;
                particle.length = 50 + Math.random() * 80;
                const opacity = 0.2 + Math.random() * 0.35;
                particle.element.style.cssText = `opacity:${opacity};width:2px;height:${particle.length}px;left:0;top:0;transform:translate(${particle.x}vw,${particle.y}vh) rotate(-85deg);`;
            }
        });
    }

    updateSpeedLines() {
        const speed = this.parachuteDeployed ? 200 : 900;
        this.speedLines.forEach(line => {
            line.y -= speed * this.deltaTime * line.speed;
            if (line.y < -10) { line.y = 110; line.x = Math.random() * 100; }
            const opacity = this.parachuteDeployed ? 0.1 : 0.35 * line.speed;
            const length = this.parachuteDeployed ? 40 : 100 + 80 * line.speed;
            line.element.style.cssText = `opacity:${opacity};height:${length}px;left:${line.x}%;top:${line.y}%;`;
        });
    }

    updateParallaxClouds() {
        const phase = this.getCurrentPhase();
        const targetOpacity = (phase === 'sky' || phase === 'ground') ? 1 : (phase === 'atmosphere' ? 0.6 : 0);
        const cloudSpeed = this.parachuteDeployed ? 100 : 400;

        this.cloudLayers.forEach((layer, index) => {
            layer.opacity += (targetOpacity - layer.opacity) * 2.5 * this.deltaTime;
            layer.element.style.opacity = layer.opacity * (0.25 + index * 0.25);

            layer.clouds = layer.clouds.filter(cloud => {
                cloud.y -= cloudSpeed * layer.speed * this.deltaTime;
                cloud.x += this.windDirection * 50 * layer.speed * this.deltaTime;
                if (cloud.y < -20) { cloud.element.remove(); return false; }
                cloud.element.style.transform = `translate(${cloud.x}%, ${cloud.y}%)`;
                return true;
            });

            if (layer.opacity > 0.25 && Math.random() < 0.8 * this.deltaTime) this.spawnParallaxCloud(layer, index);
        });
    }

    spawnParallaxCloud(layer, layerIndex) {
        const cloud = document.createElement('div');
        cloud.className = 'parallax-cloud';
        const size = 100 + Math.random() * 160 + layerIndex * 40;
        const x = Math.random() * 100;
        cloud.style.cssText = `width:${size}px;height:${size*0.5}px;left:0;top:0;transform:translate(${x}%,115%);`;
        layer.element.appendChild(cloud);
        layer.clouds.push({ element: cloud, x: x, y: 115, size: size });
    }

    updateScreenShake() {
        if (this.screenShake.intensity > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.intensity *= 0.88;
            if (this.screenShake.intensity < 0.1) { this.screenShake.intensity = 0; this.screenShake.x = 0; this.screenShake.y = 0; }
            this.gameContainer.style.transform = `translate(${this.screenShake.x}px, ${this.screenShake.y}px)`;
        }
        if (this.nearMissTimer > 0) {
            this.nearMissTimer -= this.deltaTime * 1000;
            if (this.nearMissTimer <= 0) this.gameContainer.classList.remove('near-miss');
        }
    }

    getCurrentPhase() {
        if (this.altitude > 75000) return 'space';
        if (this.altitude > 55000) return 'atmosphere';
        if (this.altitude > 20000) return 'sky';
        return 'ground';
    }

    updatePhase() {
        const phase = this.getCurrentPhase();
        if (!this.dreamBackground.classList.contains(phase)) this.dreamBackground.className = `dream-background ${phase}`;

        if (phase === 'space') this.starsLayer.style.opacity = '1';
        else if (phase === 'atmosphere') { const progress = (75000 - this.altitude) / 20000; this.starsLayer.style.opacity = 1 - progress * 0.9; }
        else this.starsLayer.style.opacity = '0';

        if (this.altitude < 80000) {
            const progress = (80000 - this.altitude) / 80000;
            const scale = 1 + progress * 4;
            this.earthContainer.style.transform = `translateX(-50%) scale(${scale})`;
            this.earthContainer.style.bottom = `${-60 + progress * 40}%`;
        }

        if (this.altitude < 4000) {
            this.landingZone.style.visibility = 'visible';
            this.landingZone.classList.add('visible');
        }
    }

    spawnObstacle() {
        const phase = this.getCurrentPhase();
        if (this.altitude < 1000) return;

        const types = this.obstacleTypes[phase];
        const obstacleType = types[Math.floor(Math.random() * types.length)];

        const obstacle = document.createElement('div');
        obstacle.className = `obstacle ${obstacleType.class}`;
        if (obstacleType.damage) obstacle.classList.add('damaging');
        obstacle.dataset.behavior = obstacleType.behavior;

        const img = document.createElement('img');
        img.src = obstacleType.src;
        obstacle.appendChild(img);

        let x, y, vx = 0;

        if (obstacleType.behavior === 'fly-horizontal') {
            const fromLeft = Math.random() > 0.5;
            x = fromLeft ? -15 : 115;
            y = 20 + Math.random() * 60;
            vx = fromLeft ? (100 + Math.random() * 80) : -(100 + Math.random() * 80);
            if (!fromLeft) img.style.transform = 'scaleX(-1)';
        } else {
            x = 5 + Math.random() * 90;
            y = 110;
        }

        obstacle.style.cssText = `left:${x}%;top:${y}%;width:${obstacleType.width}px;height:${obstacleType.height}px;`;
        this.obstaclesContainer.appendChild(obstacle);
        this.obstacles.push({ element: obstacle, x: x, y: y, vx: vx, width: obstacleType.width, height: obstacleType.height, damage: obstacleType.damage, type: obstacleType.type, behavior: obstacleType.behavior, phase: 0 });
    }

    updateObstacles() {
        const baseSpeed = this.parachuteDeployed ? 15 : 70;

        this.obstacles = this.obstacles.filter(obs => {
            obs.phase += this.deltaTime;

            switch (obs.behavior) {
                case 'fly-horizontal':
                    obs.x += obs.vx * this.deltaTime / 100 * 100;
                    obs.y -= baseSpeed * 0.2 * this.deltaTime;
                    break;
                case 'hover':
                    obs.y -= baseSpeed * 0.7 * this.deltaTime;
                    obs.x += Math.sin(obs.phase * 3) * 20 * this.deltaTime;
                    obs.x += this.windDirection * 40 * this.deltaTime;
                    break;
                case 'flap':
                    obs.y -= baseSpeed * 0.8 * this.deltaTime;
                    obs.x += Math.sin(obs.phase * 6) * 30 * this.deltaTime;
                    obs.x += this.windDirection * 25 * this.deltaTime;
                    break;
                case 'drift':
                    obs.y -= baseSpeed * 0.6 * this.deltaTime;
                    obs.x += this.windDirection * 60 * this.deltaTime;
                    break;
                case 'tumble':
                    obs.y -= baseSpeed * this.deltaTime;
                    obs.x += this.windDirection * 20 * this.deltaTime;
                    break;
                default:
                    obs.y -= baseSpeed * this.deltaTime;
            }

            obs.element.style.top = `${obs.y}%`;
            obs.element.style.left = `${obs.x}%`;

            if (obs.y < -15 || obs.x < -20 || obs.x > 120) { obs.element.remove(); return false; }
            return true;
        });
    }

    checkCollisions() {
        const playerRect = this.fallingCharacter.getBoundingClientRect();
        const hitboxShrink = 18;
        const playerHitbox = { left: playerRect.left + hitboxShrink, right: playerRect.right - hitboxShrink, top: playerRect.top + hitboxShrink, bottom: playerRect.bottom - hitboxShrink };

        let nearMiss = false;
        let cloudHit = false;

        for (const obs of this.obstacles) {
            const obsRect = obs.element.getBoundingClientRect();

            if (playerHitbox.left < obsRect.right && playerHitbox.right > obsRect.left && playerHitbox.top < obsRect.bottom && playerHitbox.bottom > obsRect.top) {
                if (obs.damage) return 'damage';
                else cloudHit = true;
            }

            const margin = 30;
            if (obs.damage && playerHitbox.left < obsRect.right + margin && playerHitbox.right > obsRect.left - margin && playerHitbox.top < obsRect.bottom + margin && playerHitbox.bottom > obsRect.top - margin) {
                nearMiss = true;
            }
        }

        if (nearMiss && this.nearMissTimer <= 0) {
            this.nearMissTimer = 400;
            this.gameContainer.classList.add('near-miss');
            this.screenShake.intensity = 3;
        }

        return cloudHit ? 'cloud' : null;
    }

    triggerCloudEffect() {
        // Visual feedback when passing through clouds
        this.fallingCharacter.classList.add('in-cloud');
        this.screenShake.intensity = 2;
        // Brief visibility reduction effect
        setTimeout(() => {
            this.fallingCharacter.classList.remove('in-cloud');
        }, 150);
    }

    gameOver(won) {
        this.isRunning = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        if (won) {
            this.sleepingCharacter.src = 'icons/character-sleeping-smile.svg';
            this.dreamBubble.style.opacity = '0';
            setTimeout(() => this.winOverlay.classList.add('active'), 800);
        } else {
            this.screenShake.intensity = 20;
            this.gameContainer.classList.add('hit');
            this.dreamBubble.querySelector('span').textContent = '!!!';
            this.sleepRestlessness = 1;
            this.sleepTargetRotation = 30;
            setTimeout(() => { this.gameContainer.classList.remove('hit'); this.loseOverlay.classList.add('active'); }, 500);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new FallingDreamGame());
