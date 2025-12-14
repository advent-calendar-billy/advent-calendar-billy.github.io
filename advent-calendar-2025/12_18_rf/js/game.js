// Tall Guy's Rollercoaster Game
// Canvas-based with proper track physics

class RollercoasterGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.isRunning = false;
        this.score = 0;
        this.lives = 50; // Playtest mode
        this.trackOffset = 0;
        this.progress = 0;
        this.speed = 8; // Faster base speed

        // Track
        this.trackPoints = [];
        this.trackLength = 15000;
        this.wagonPosition = 0.15; // Wagon at 15% from left of screen

        // Sections
        this.currentSection = 'normal';
        this.isUpsideDown = false;
        this.inTunnel = false;
        this.tunnelStart = 0;
        this.tunnelEnd = 0;
        this.lastFlashTime = 0;
        this.isFlashing = false;

        // Bend mechanics
        this.isBending = false;
        this.bendStartTime = 0;
        this.bendMaxDuration = 1000; // 1 second duck time
        this.bendCooldown = 600;
        this.lastBendEnd = 0;
        this.canBend = true;

        // Arms mechanics
        this.isArmsTucked = false;
        this.armsStartTime = 0;
        this.armsMaxDuration = 500;
        this.armsCooldown = 600;
        this.lastArmsEnd = 0;
        this.canTuckArms = true;

        // Obstacles
        this.obstacles = [];
        this.nextObstacleDistance = 800; // Give player time to get ready

        // NPCs
        this.npcComments = [
            "WOOHOO!", "This is amazing!", "YEAHHH!", "So fast!",
            "Look at him!", "HAHA!", "Duck dude!", "Ohhh close!",
            "AHHHHH!", "I love this!", "FASTER!", "Here we go!",
            "Hold on!", "WOW!", "My hair!", "Best ride!",
            "SCREAM!", "Upside down!", "I feel sick!", "AGAIN!"
        ];
        this.lastCommentTime = 0;
        this.currentComment = '';
        this.commentVisible = false;

        // Colors
        this.colors = {
            sky: ['#1a1a3e', '#2d2d5a', '#4a3f6b', '#6b5a7a', '#8b7a8a'],
            track: '#5a4a3a',
            trackRail: '#8a7a6a',
            trackSupport: '#4a3a2a',
            wagon: '#dc2626',
            wagonHighlight: '#ef4444',
            wagonDark: '#991b1b',
            skin: '#fcd5b8',
            skinShadow: '#e5b89a',
            shirt: '#3b82f6',
            shirtDark: '#2563eb',
            hair: '#4a3728',
            pants: '#1e3a5f'
        };

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.generateTrack();
        this.bindEvents();
        this.initUI();
        this.draw();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Regenerate track for new canvas size
        if (this.trackPoints.length > 0) {
            this.generateTrack();
        }
    }

    generateTrack() {
        this.trackPoints = [];
        const baseY = this.canvas.height * 0.6;

        // Tunnel boundaries
        this.tunnelStartX = 2500;
        this.tunnelEndX = 5500;

        // Loop definitions - actual circular loops
        this.loops = [
            { centerX: 7200, centerY: baseY - 50, radius: 180 },
            { centerX: 9000, centerY: baseY - 50, radius: 200 }
        ];

        // Flat inverted section between loops (upside down but not in a loop)
        this.invertedStart = 7600;  // After first loop
        this.invertedEnd = 8600;    // Before second loop

        // First pass: generate Y positions and handle loops
        let tempPoints = [];
        for (let x = 0; x < this.trackLength; x += 5) {
            const section = this.getSectionAt(x);
            let y;
            let loopData = null;

            if (section === 'normal') {
                // Gentle hills - lower frequency for gradual slopes
                y = baseY + Math.sin(x * 0.0015) * 60 + Math.sin(x * 0.004) * 30;
            } else if (section === 'tunnel') {
                // Flat-ish in tunnel with slight variation
                y = baseY - 30 + Math.sin(x * 0.002) * 20;
            } else if (section === 'drop') {
                // Big drop after tunnel
                const dropProgress = (x - 5500) / 1000;
                y = baseY - 50 + dropProgress * 200;
            } else if (section === 'upsideDown') {
                // Check if we're in a loop
                loopData = this.getLoopDataAt(x);
                if (loopData) {
                    y = loopData.y;
                } else if (x >= this.invertedStart && x <= this.invertedEnd) {
                    // Flat inverted section - elevated track, wagon upside down
                    y = baseY - 180 + Math.sin(x * 0.003) * 15; // Slight wave
                    loopData = { isInvertedFlat: true }; // Mark as inverted
                } else {
                    // Between loops - flat elevated track (right-side up)
                    y = baseY + 100;
                }
            } else if (section === 'finale') {
                // Slow down to flat
                y = baseY + 50;
            } else {
                y = baseY;
            }

            tempPoints.push({ x, y, section, loopData });
        }

        // Second pass: calculate angles from actual slope or loop
        for (let i = 0; i < tempPoints.length; i++) {
            const p = tempPoints[i];
            let angle = 0;
            let isInverted = false;

            if (p.loopData && p.loopData.angle !== undefined) {
                // Use loop angle (tangent to circle)
                angle = p.loopData.angle;
                isInverted = true;
            } else if (p.loopData && p.loopData.isInvertedFlat) {
                // Flat inverted section - flip the angle
                if (i < tempPoints.length - 1) {
                    const next = tempPoints[i + 1];
                    const dx = next.x - p.x;
                    const dy = next.y - p.y;
                    angle = Math.atan2(dy, dx) + Math.PI; // Flip 180 degrees
                }
                isInverted = true;
            } else if (i < tempPoints.length - 1) {
                const next = tempPoints[i + 1];
                const dx = next.x - p.x;
                const dy = next.y - p.y;
                angle = Math.atan2(dy, dx);
            } else if (i > 0) {
                // Use previous angle for last point
                angle = this.trackPoints[i - 1].angle;
            }

            this.trackPoints.push({
                x: p.x,
                y: p.y,
                angle: angle,
                section: p.section,
                inLoop: !!p.loopData,
                isInverted: isInverted
            });
        }
    }

    getLoopDataAt(x) {
        for (const loop of this.loops) {
            const loopStart = loop.centerX - loop.radius;
            const loopEnd = loop.centerX + loop.radius;

            if (x >= loopStart && x <= loopEnd) {
                // We're in this loop
                // Map x position to angle on circle
                // Start at bottom-right (-π/2), go counter-clockwise to bottom-left (3π/2)
                const normalizedX = (x - loop.centerX) / loop.radius; // -1 to 1

                // Use arccos to get the angle, then adjust for full circle traversal
                // Entry (right side): θ starts at -π/2
                // Top: θ = π/2
                // Exit (left side): θ = 3π/2
                const theta = Math.acos(normalizedX);

                // Y position on circle (going up and over)
                const y = loop.centerY - loop.radius * Math.sin(theta);

                // Tangent angle (perpendicular to radius, pointing in direction of travel)
                // Going counter-clockwise: tangent angle = theta + π/2
                const tangentAngle = theta + Math.PI / 2;

                return {
                    y: y,
                    angle: tangentAngle,
                    loop: loop,
                    theta: theta
                };
            }
        }
        return null;
    }

    getSectionAt(x) {
        if (x < 2500) return 'normal';
        if (x < 5500) return 'tunnel';  // Tunnel section
        if (x < 6500) return 'drop';     // Big drop after tunnel
        if (x < 10000) return 'upsideDown'; // Upside down section
        return 'finale';
    }

    getTrackDataAt(worldX) {
        const index = Math.floor(worldX / 5);
        if (index < 0) return this.trackPoints[0];
        if (index >= this.trackPoints.length - 1) return this.trackPoints[this.trackPoints.length - 1];

        const p1 = this.trackPoints[index];
        const p2 = this.trackPoints[index + 1];
        const t = (worldX - p1.x) / 5;

        return {
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t,
            angle: p1.angle + (p2.angle - p1.angle) * t,
            section: p1.section,
            inLoop: p1.inLoop || p2.inLoop,
            isInverted: p1.isInverted || p2.isInverted
        };
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        document.getElementById('btnStart').addEventListener('click', () => this.startGame());
        document.getElementById('btnPlayAgain').addEventListener('click', () => this.restartGame());
        document.getElementById('btnRetry').addEventListener('click', () => this.restartGame());
    }

    onKeyDown(e) {
        if (!this.isRunning) return;

        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            this.startBend();
        }

        if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
            if (this.isUpsideDown) {
                e.preventDefault();
                this.startArmsTuck();
            }
        }
    }

    onKeyUp(e) {
        if (!this.isRunning) return;

        if (e.code === 'Space') {
            this.endBend();
        }

        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            this.endArmsTuck();
        }
    }

    startBend() {
        const now = Date.now();
        if (!this.canBend || now - this.lastBendEnd < this.bendCooldown) return;

        this.isBending = true;
        this.bendStartTime = now;
    }

    endBend() {
        if (!this.isBending) return;

        this.isBending = false;
        this.lastBendEnd = Date.now();
        this.canBend = false;

        setTimeout(() => { this.canBend = true; }, this.bendCooldown);
    }

    startArmsTuck() {
        const now = Date.now();
        if (!this.canTuckArms || now - this.lastArmsEnd < this.armsCooldown) return;

        this.isArmsTucked = true;
        this.armsStartTime = now;
    }

    endArmsTuck() {
        if (!this.isArmsTucked) return;

        this.isArmsTucked = false;
        this.lastArmsEnd = Date.now();
        this.canTuckArms = false;

        setTimeout(() => { this.canTuckArms = true; }, this.armsCooldown);
    }

    initUI() {
        const hearts = document.getElementById('hearts');
        hearts.innerHTML = '';
        // Show number if too many lives, otherwise show hearts
        if (this.lives > 5) {
            hearts.innerHTML = `<span class="heart">❤️</span><span style="font-size: 18px; color: #fff; margin-left: 5px;">x${this.lives}</span>`;
        } else {
            for (let i = 0; i < this.lives; i++) {
                const heart = document.createElement('span');
                heart.className = 'heart';
                heart.textContent = '❤️';
                hearts.appendChild(heart);
            }
        }
    }

    startGame() {
        document.getElementById('startOverlay').classList.add('hidden');
        this.reset();
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    reset() {
        this.score = 0;
        this.lives = 50; // Playtest mode
        this.trackOffset = 0;
        this.progress = 0;
        this.speed = 8;
        this.obstacles = [];
        this.nextObstacleDistance = 800;
        this.isBending = false;
        this.isArmsTucked = false;
        this.canBend = true;
        this.canTuckArms = true;
        this.currentSection = 'normal';
        this.isUpsideDown = false;
        this.inTunnel = false;
        this.commentVisible = false;
        this.lastCommentTime = 0;

        // Regenerate track for current canvas size
        this.generateTrack();

        this.initUI();
        this.updateUI();

        document.getElementById('armsAbility').classList.add('hidden');
    }

    restartGame() {
        document.getElementById('winOverlay').classList.add('hidden');
        document.getElementById('loseOverlay').classList.add('hidden');
        this.startGame();
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Handle first frame
        if (!currentTime || !this.lastTime) {
            this.lastTime = performance.now();
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime) {
        // Ensure positive delta time
        if (deltaTime <= 0 || deltaTime > 100) deltaTime = 16.67;
        const dt = deltaTime / 16.67;

        // Move track
        this.trackOffset += this.speed * dt;
        this.progress = (this.trackOffset / this.trackLength) * 100;

        // Get current wagon position data
        const wagonWorldX = this.trackOffset + this.canvas.width * this.wagonPosition;
        const trackData = this.getTrackDataAt(wagonWorldX);

        // Update section
        this.currentSection = trackData.section;
        this.isUpsideDown = Math.abs(trackData.angle) > Math.PI / 2;
        this.inTunnel = this.currentSection === 'tunnel';

        // Show/hide arms ability
        if (this.isUpsideDown) {
            document.getElementById('armsAbility').classList.remove('hidden');
        } else {
            document.getElementById('armsAbility').classList.add('hidden');
        }

        // Check bend duration
        if (this.isBending) {
            const elapsed = Date.now() - this.bendStartTime;
            if (elapsed >= this.bendMaxDuration) {
                this.endBend();
            }
        }

        if (this.isArmsTucked) {
            const elapsed = Date.now() - this.armsStartTime;
            if (elapsed >= this.armsMaxDuration) {
                this.endArmsTuck();
            }
        }

        // Spawn obstacles
        this.spawnObstacles(wagonWorldX);

        // Update obstacles
        this.updateObstacles();

        // Check collisions
        this.checkCollisions(wagonWorldX, trackData);

        // Random NPC comments
        this.updateComments();

        // Tunnel flashes
        if (this.inTunnel) {
            const now = Date.now();
            if (now - this.lastFlashTime > 800 && Math.random() < 0.02) {
                this.isFlashing = true;
                this.lastFlashTime = now;
                setTimeout(() => { this.isFlashing = false; }, 100);
            }
        }

        // Update score
        this.score += Math.floor(dt * 10);

        // Adjust speed based on section
        if (this.currentSection === 'drop') {
            this.speed = 12;
        } else if (this.currentSection === 'upsideDown') {
            this.speed = 9;
        } else if (this.currentSection === 'finale') {
            this.speed = 10; // Faster finale
        } else {
            this.speed = 8;
        }

        // Check win
        if (this.progress >= 98) {
            this.winGame();
        }

        this.updateUI();
    }

    spawnObstacles(wagonWorldX) {
        const spawnX = wagonWorldX + this.canvas.width;

        while (this.nextObstacleDistance < spawnX) {
            const trackData = this.getTrackDataAt(this.nextObstacleDistance);

            // Choose obstacle type based on section
            let subtype;
            if (trackData.section === 'tunnel') {
                // Tunnel obstacles: lights, cables, support frames
                subtype = ['tunnel-light', 'tunnel-frame', 'cable'][Math.floor(Math.random() * 3)];
            } else if (trackData.section === 'drop') {
                // Fewer obstacles during drop
                if (Math.random() < 0.5) {
                    subtype = 'crossbeam';
                } else {
                    this.nextObstacleDistance += 300;
                    continue;
                }
            } else {
                // Outdoor obstacles: crossbeams, signs on supports, overhead track
                subtype = ['crossbeam', 'support-sign', 'overhead-track'][Math.floor(Math.random() * 3)];
            }

            // Check if we're inverted (in a loop or inverted flat section)
            const isInverted = trackData.isInverted;

            this.obstacles.push({
                worldX: this.nextObstacleDistance,
                type: 'head',
                subtype: subtype,
                hit: false,
                isUpsideDown: isInverted
            });

            // Arm obstacle (only in upside down sections) - parallel support bars
            if (trackData.section === 'upsideDown' && Math.random() < 0.4) {
                this.obstacles.push({
                    worldX: this.nextObstacleDistance + 150,
                    type: 'arm',
                    subtype: 'side-rail',
                    hit: false,
                    isUpsideDown: isInverted
                });
            }

            // Vary obstacle spacing
            const baseSpacing = trackData.section === 'tunnel' ? 300 : 450;
            this.nextObstacleDistance += baseSpacing + Math.random() * 200;
        }
    }

    updateObstacles() {
        // Remove off-screen obstacles
        const minX = this.trackOffset - 200;
        this.obstacles = this.obstacles.filter(o => o.worldX > minX);
    }

    checkCollisions(wagonWorldX, trackData) {
        // Smaller, more precise hit zone
        const hitZoneStart = wagonWorldX - 15;
        const hitZoneEnd = wagonWorldX + 15;

        for (const obs of this.obstacles) {
            if (obs.hit) continue;
            if (obs.worldX < hitZoneStart || obs.worldX > hitZoneEnd) continue;

            let collision = false;

            if (obs.type === 'head') {
                // Only collide if NOT bending
                if (!this.isBending) {
                    collision = true;
                }
            } else if (obs.type === 'arm') {
                // Only collide if upside down AND NOT tucking arms
                if (this.isUpsideDown && !this.isArmsTucked) {
                    collision = true;
                }
            }

            if (collision) {
                obs.hit = true;
                this.onHit(obs.type);
            }
        }
    }

    onHit(type) {
        this.lives--;

        // Update lives display
        this.initUI();

        if (this.lives <= 0) {
            this.loseGame(type === 'head' ? 'You hit your head!' : 'Your arms got caught!');
        }
    }

    updateComments() {
        const now = Date.now();
        const bubble = document.getElementById('speechBubble');

        // Position bubble near the NPC wagons (always update position)
        const wagonScreenX = this.canvas.width * this.wagonPosition;
        const wagonWorldX = this.trackOffset + wagonScreenX;
        const npcWorldX = wagonWorldX - 140; // Middle NPC
        const npcTrackData = this.getTrackDataAt(npcWorldX);
        const npcScreenX = npcWorldX - this.trackOffset;

        bubble.style.left = Math.max(10, npcScreenX - 50) + 'px';
        bubble.style.bottom = (this.canvas.height - npcTrackData.y + 100) + 'px';

        // Show new comment periodically
        if (now - this.lastCommentTime > 3000 && Math.random() < 0.02) {
            this.currentComment = this.npcComments[Math.floor(Math.random() * this.npcComments.length)];
            this.commentVisible = true;
            this.lastCommentTime = now;

            document.getElementById('speechText').textContent = this.currentComment;
            bubble.classList.add('visible');

            setTimeout(() => {
                bubble.classList.remove('visible');
                this.commentVisible = false;
            }, 2000);
        }
    }

    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('progressFill').style.width = Math.min(this.progress, 100) + '%';

        // Bend cooldown
        const now = Date.now();
        let bendPercent = 100;
        const bendFill = document.getElementById('bendFill');

        if (this.isBending) {
            const elapsed = now - this.bendStartTime;
            bendPercent = Math.max(0, 100 - (elapsed / this.bendMaxDuration) * 100);
            bendFill.classList.remove('cooldown');
        } else if (!this.canBend) {
            const elapsed = now - this.lastBendEnd;
            bendPercent = Math.min(100, (elapsed / this.bendCooldown) * 100);
            bendFill.classList.add('cooldown');
        } else {
            bendFill.classList.remove('cooldown');
        }
        bendFill.style.width = bendPercent + '%';

        // Arms cooldown
        let armsPercent = 100;
        const armsFill = document.getElementById('armsFill');

        if (this.isArmsTucked) {
            const elapsed = now - this.armsStartTime;
            armsPercent = Math.max(0, 100 - (elapsed / this.armsMaxDuration) * 100);
            armsFill.classList.remove('cooldown');
        } else if (!this.canTuckArms) {
            const elapsed = now - this.lastArmsEnd;
            armsPercent = Math.min(100, (elapsed / this.armsCooldown) * 100);
            armsFill.classList.add('cooldown');
        } else {
            armsFill.classList.remove('cooldown');
        }
        armsFill.style.width = armsPercent + '%';
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear and draw sky
        this.drawSky();

        // Draw distant scenery
        this.drawScenery();

        // Draw tunnel (behind everything else)
        this.drawTunnel();

        // Draw loop structures
        this.drawLoops();

        // Draw track supports
        this.drawTrackSupports();

        // Draw track
        this.drawTrack();

        // Draw obstacles
        this.drawObstacles();

        // Draw wagons
        this.drawWagons();

        // Draw flash effect (for tunnel)
        if (this.isFlashing) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(0, 0, w, h);
        }
    }

    drawSky() {
        const ctx = this.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f0f2a');
        gradient.addColorStop(0.3, '#1a1a3e');
        gradient.addColorStop(0.6, '#2d2d5a');
        gradient.addColorStop(1, '#4a4a7a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 100; i++) {
            const x = (i * 137 + this.trackOffset * 0.05) % this.canvas.width;
            const y = (i * 89) % (this.canvas.height * 0.5);
            const size = (i % 3) + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawScenery() {
        const ctx = this.ctx;

        // Distant mountains
        ctx.fillStyle = '#2a2a4a';
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height);

        for (let x = 0; x <= this.canvas.width; x += 50) {
            const worldX = x + this.trackOffset * 0.1;
            const y = this.canvas.height - 150 - Math.sin(worldX * 0.002) * 80 - Math.sin(worldX * 0.005) * 40;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.closePath();
        ctx.fill();

        // Closer hills
        ctx.fillStyle = '#3a3a5a';
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height);

        for (let x = 0; x <= this.canvas.width; x += 30) {
            const worldX = x + this.trackOffset * 0.2;
            const y = this.canvas.height - 100 - Math.sin(worldX * 0.004) * 50 - Math.sin(worldX * 0.008) * 25;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    drawLoops() {
        if (!this.loops) return;

        const ctx = this.ctx;

        for (const loop of this.loops) {
            const screenX = loop.centerX - this.trackOffset;

            // Only draw if loop is visible on screen
            if (screenX < -loop.radius - 100 || screenX > this.canvas.width + loop.radius + 100) continue;

            // Draw the loop structure (support frame)
            ctx.save();
            ctx.translate(screenX, loop.centerY);

            // Outer structural ring
            ctx.strokeStyle = '#3a3a4a';
            ctx.lineWidth = 25;
            ctx.beginPath();
            ctx.arc(0, 0, loop.radius + 30, 0, Math.PI * 2);
            ctx.stroke();

            // Inner structural ring
            ctx.strokeStyle = '#4a4a5a';
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.arc(0, 0, loop.radius + 15, 0, Math.PI * 2);
            ctx.stroke();

            // Cross supports on the loop frame
            ctx.strokeStyle = '#3a3a4a';
            ctx.lineWidth = 8;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const innerRadius = loop.radius + 5;
                const outerRadius = loop.radius + 45;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * innerRadius, -Math.sin(angle) * innerRadius);
                ctx.lineTo(Math.cos(angle) * outerRadius, -Math.sin(angle) * outerRadius);
                ctx.stroke();
            }

            // Support pillars from ground to loop
            ctx.strokeStyle = '#4a3a2a';
            ctx.lineWidth = 20;

            // Left pillar
            ctx.beginPath();
            ctx.moveTo(-loop.radius - 30, loop.radius + 30);
            ctx.lineTo(-loop.radius - 30, this.canvas.height - loop.centerY + 50);
            ctx.stroke();

            // Right pillar
            ctx.beginPath();
            ctx.moveTo(loop.radius + 30, loop.radius + 30);
            ctx.lineTo(loop.radius + 30, this.canvas.height - loop.centerY + 50);
            ctx.stroke();

            // Center pillar
            ctx.beginPath();
            ctx.moveTo(0, loop.radius + 40);
            ctx.lineTo(0, this.canvas.height - loop.centerY + 50);
            ctx.stroke();

            // Cross bracing on supports
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#3a2a1a';
            for (let y = loop.radius + 80; y < this.canvas.height - loop.centerY; y += 100) {
                // Left cross brace
                ctx.beginPath();
                ctx.moveTo(-loop.radius - 30, y);
                ctx.lineTo(0, y + 50);
                ctx.stroke();
                // Right cross brace
                ctx.beginPath();
                ctx.moveTo(loop.radius + 30, y);
                ctx.lineTo(0, y + 50);
                ctx.stroke();
            }

            // Decorative lights on the loop (makes it look more like a theme park ride)
            ctx.fillStyle = '#fbbf24';
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const lightRadius = loop.radius + 50;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * lightRadius, -Math.sin(angle) * lightRadius, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        // Draw inverted flat section structure (overhead beam the track hangs from)
        if (this.invertedStart && this.invertedEnd) {
            const invertedStartScreen = this.invertedStart - this.trackOffset;
            const invertedEndScreen = this.invertedEnd - this.trackOffset;

            // Only draw if visible
            if (invertedEndScreen > -100 && invertedStartScreen < this.canvas.width + 100) {
                const baseY = this.canvas.height * 0.6;
                const trackY = baseY - 180;

                // Main overhead beam structure
                ctx.fillStyle = '#3a3a4a';
                const beamY = trackY - 100;
                const startX = Math.max(-50, invertedStartScreen);
                const endX = Math.min(this.canvas.width + 50, invertedEndScreen);

                // Top beam
                ctx.fillRect(startX, beamY - 20, endX - startX, 30);

                // Vertical hangers from beam to track
                ctx.strokeStyle = '#4a4a5a';
                ctx.lineWidth = 10;
                for (let x = this.invertedStart; x <= this.invertedEnd; x += 100) {
                    const screenX = x - this.trackOffset;
                    if (screenX < -50 || screenX > this.canvas.width + 50) continue;

                    ctx.beginPath();
                    ctx.moveTo(screenX, beamY);
                    ctx.lineTo(screenX, trackY + 20);
                    ctx.stroke();
                }

                // Support pillars at ends
                ctx.strokeStyle = '#4a3a2a';
                ctx.lineWidth = 25;

                // Left pillar
                if (invertedStartScreen > -100 && invertedStartScreen < this.canvas.width + 100) {
                    ctx.beginPath();
                    ctx.moveTo(invertedStartScreen, beamY - 20);
                    ctx.lineTo(invertedStartScreen, this.canvas.height);
                    ctx.stroke();
                }

                // Right pillar
                if (invertedEndScreen > -100 && invertedEndScreen < this.canvas.width + 100) {
                    ctx.beginPath();
                    ctx.moveTo(invertedEndScreen, beamY - 20);
                    ctx.lineTo(invertedEndScreen, this.canvas.height);
                    ctx.stroke();
                }

                // Warning lights
                ctx.fillStyle = '#ef4444';
                for (let x = this.invertedStart + 50; x < this.invertedEnd; x += 150) {
                    const screenX = x - this.trackOffset;
                    if (screenX < -20 || screenX > this.canvas.width + 20) continue;
                    ctx.beginPath();
                    ctx.arc(screenX, beamY - 30, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    drawTrackSupports() {
        const ctx = this.ctx;
        ctx.strokeStyle = this.colors.trackSupport;
        ctx.lineWidth = 8;

        const startX = Math.floor(this.trackOffset / 150) * 150;

        for (let worldX = startX; worldX < this.trackOffset + this.canvas.width + 150; worldX += 150) {
            const screenX = worldX - this.trackOffset;
            const trackData = this.getTrackDataAt(worldX);

            // Don't draw supports in tunnel, inside loops, or inverted sections
            if (trackData.section === 'tunnel') continue;
            if (trackData.inLoop) continue;
            if (trackData.isInverted) continue;

            ctx.beginPath();
            ctx.moveTo(screenX, trackData.y);
            ctx.lineTo(screenX, this.canvas.height);
            ctx.stroke();

            // Cross beams
            ctx.lineWidth = 4;
            const supportHeight = this.canvas.height - trackData.y;
            for (let i = 50; i < supportHeight; i += 80) {
                ctx.beginPath();
                ctx.moveTo(screenX - 15, trackData.y + i);
                ctx.lineTo(screenX + 15, trackData.y + i - 30);
                ctx.stroke();
            }
            ctx.lineWidth = 8;
        }
    }

    drawTrack() {
        const ctx = this.ctx;

        // Main track planks
        ctx.strokeStyle = this.colors.track;
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        let first = true;

        for (let screenX = -50; screenX < this.canvas.width + 50; screenX += 3) {
            const worldX = screenX + this.trackOffset;
            const trackData = this.getTrackDataAt(worldX);

            if (first) {
                ctx.moveTo(screenX, trackData.y);
                first = false;
            } else {
                ctx.lineTo(screenX, trackData.y);
            }
        }
        ctx.stroke();

        // Rails
        ctx.strokeStyle = this.colors.trackRail;
        ctx.lineWidth = 4;

        for (let offset of [-8, 8]) {
            ctx.beginPath();
            first = true;

            for (let screenX = -50; screenX < this.canvas.width + 50; screenX += 3) {
                const worldX = screenX + this.trackOffset;
                const trackData = this.getTrackDataAt(worldX);
                const perpX = Math.sin(trackData.angle) * offset;
                const perpY = -Math.cos(trackData.angle) * offset;

                if (first) {
                    ctx.moveTo(screenX + perpX, trackData.y + perpY);
                    first = false;
                } else {
                    ctx.lineTo(screenX + perpX, trackData.y + perpY);
                }
            }
            ctx.stroke();
        }
    }

    drawObstacles() {
        const ctx = this.ctx;

        for (const obs of this.obstacles) {
            const screenX = obs.worldX - this.trackOffset;
            if (screenX < -100 || screenX > this.canvas.width + 100) continue;

            const trackData = this.getTrackDataAt(obs.worldX);

            ctx.save();
            ctx.translate(screenX, trackData.y);

            // Don't rotate obstacles - they're fixed structures
            // Only the track and wagon rotate

            if (obs.type === 'head') {
                // When upside down, obstacles should be BELOW the track (positive Y)
                // because the rider's head is pointing down
                const obstacleY = obs.isUpsideDown ? 130 : -130;

                // Support direction: when upside down, supports go UP (negative Y) from the obstacle
                const supportDir = obs.isUpsideDown ? -1 : 1;

                if (obs.subtype === 'crossbeam') {
                    // Horizontal support beam between two vertical supports
                    // Left support (extends toward ground)
                    ctx.fillStyle = '#5a4a3a';
                    if (obs.isUpsideDown) {
                        ctx.fillRect(-80, obstacleY - 180, 12, 150);
                        ctx.fillRect(68, obstacleY - 180, 12, 150);
                    } else {
                        ctx.fillRect(-80, obstacleY + 30, 12, 150);
                        ctx.fillRect(68, obstacleY + 30, 12, 150);
                    }
                    // Cross beam (the dangerous part)
                    ctx.fillStyle = '#4a3a2a';
                    ctx.fillRect(-80, obstacleY, 160, 25);
                    // Warning stripes on beam
                    ctx.fillStyle = '#fbbf24';
                    for (let i = -70; i < 70; i += 25) {
                        ctx.fillRect(i, obstacleY + 3, 12, 19);
                    }
                    // Bolts
                    ctx.fillStyle = '#888';
                    ctx.beginPath();
                    ctx.arc(-74, obstacleY + 12, 4, 0, Math.PI * 2);
                    ctx.arc(74, obstacleY + 12, 4, 0, Math.PI * 2);
                    ctx.fill();

                } else if (obs.subtype === 'support-sign') {
                    // Sign mounted on a support structure
                    // Support pole (extends toward ground)
                    ctx.fillStyle = '#5a4a3a';
                    if (obs.isUpsideDown) {
                        ctx.fillRect(-8, obstacleY - 200, 16, 180);
                    } else {
                        ctx.fillRect(-8, obstacleY + 20, 16, 180);
                    }
                    // Sign bracket
                    ctx.fillStyle = '#4a3a2a';
                    ctx.fillRect(-50, obstacleY + 5, 100, 8);
                    // Sign (the dangerous part)
                    ctx.fillStyle = '#1e40af';
                    ctx.beginPath();
                    ctx.roundRect(-45, obstacleY - 35, 90, 45, 4);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Sign text
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('DUCK!', 0, obstacleY - 10);

                } else if (obs.subtype === 'overhead-track') {
                    // Another track section passing overhead (or below when upside down)
                    // Track supports (extend toward ground)
                    ctx.fillStyle = '#4a3a2a';
                    if (obs.isUpsideDown) {
                        ctx.fillRect(-90, obstacleY - 220, 10, 200);
                        ctx.fillRect(80, obstacleY - 220, 10, 200);
                    } else {
                        ctx.fillRect(-90, obstacleY + 20, 10, 200);
                        ctx.fillRect(80, obstacleY + 20, 10, 200);
                    }
                    // Overhead track (wooden)
                    ctx.fillStyle = '#5a4a3a';
                    ctx.fillRect(-90, obstacleY - 5, 180, 20);
                    // Rails on overhead track
                    ctx.fillStyle = '#8a7a6a';
                    ctx.fillRect(-85, obstacleY - 8, 170, 4);
                    ctx.fillRect(-85, obstacleY + 12, 170, 4);

                } else if (obs.subtype === 'tunnel-light') {
                    // Industrial light fixture
                    // Mounting bracket
                    ctx.fillStyle = '#444';
                    ctx.fillRect(-5, obstacleY + 15, 10, 30);
                    // Light housing (the dangerous part)
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.roundRect(-25, obstacleY - 15, 50, 35, 5);
                    ctx.fill();
                    // Light bulb/lens
                    ctx.fillStyle = '#fbbf24';
                    ctx.beginPath();
                    ctx.arc(0, obstacleY + 5, 12, 0, Math.PI * 2);
                    ctx.fill();
                    // Glow effect
                    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
                    ctx.beginPath();
                    ctx.arc(0, obstacleY + 5, 25, 0, Math.PI * 2);
                    ctx.fill();

                } else if (obs.subtype === 'tunnel-frame') {
                    // Tunnel structural frame
                    // Vertical supports
                    ctx.fillStyle = '#3a3a3a';
                    ctx.fillRect(-100, obstacleY - 20, 15, 220);
                    ctx.fillRect(85, obstacleY - 20, 15, 220);
                    // Top beam (dangerous)
                    ctx.fillStyle = '#2a2a2a';
                    ctx.fillRect(-100, obstacleY - 20, 200, 20);
                    // Warning paint
                    ctx.fillStyle = '#dc2626';
                    ctx.fillRect(-100, obstacleY - 20, 200, 5);

                } else if (obs.subtype === 'cable') {
                    // Cable tray / pipe crossing
                    // Supports
                    ctx.fillStyle = '#444';
                    ctx.fillRect(-70, obstacleY + 10, 8, 100);
                    ctx.fillRect(62, obstacleY + 10, 8, 100);
                    // Cable tray (dangerous)
                    ctx.fillStyle = '#555';
                    ctx.fillRect(-70, obstacleY - 10, 140, 25);
                    // Cables
                    ctx.strokeStyle = '#222';
                    ctx.lineWidth = 4;
                    for (let i = -50; i <= 50; i += 20) {
                        ctx.beginPath();
                        ctx.moveTo(i, obstacleY - 5);
                        ctx.lineTo(i, obstacleY + 10);
                        ctx.stroke();
                    }
                }
            } else if (obs.type === 'arm') {
                // Side rail / support bar that arms could hit when upside down
                // When upside down (arms pointing down), obstacle should be below
                const armObsY = obs.isUpsideDown ? 90 : -90;
                const supportDir = obs.isUpsideDown ? -1 : 1; // Direction of support structure

                // This is a side safety rail that sticks out
                ctx.fillStyle = '#666';
                // Mounting (goes toward ground)
                ctx.fillRect(-15, armObsY + (supportDir > 0 ? 30 : -110), 30, 80);
                // Horizontal rail (dangerous for arms)
                ctx.fillStyle = '#f97316';
                ctx.fillRect(-60, armObsY - 5, 120, 15);
                // End caps
                ctx.fillStyle = '#ea580c';
                ctx.beginPath();
                ctx.arc(-60, armObsY + 2, 8, 0, Math.PI * 2);
                ctx.arc(60, armObsY + 2, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    drawWagons() {
        const ctx = this.ctx;
        const wagonScreenX = this.canvas.width * this.wagonPosition;
        const wagonWorldX = this.trackOffset + wagonScreenX;
        const trackData = this.getTrackDataAt(wagonWorldX);

        // Draw NPC wagons behind (3 wagons)
        for (let i = 3; i >= 1; i--) {
            const npcWorldX = wagonWorldX - i * 70;
            const npcTrackData = this.getTrackDataAt(npcWorldX);
            const npcScreenX = npcWorldX - this.trackOffset;

            this.drawWagon(ctx, npcScreenX, npcTrackData.y, npcTrackData.angle, false, i);
        }

        // Draw player wagon
        this.drawWagon(ctx, wagonScreenX, trackData.y, trackData.angle, true);
    }

    drawWagon(ctx, x, y, angle, isPlayer, npcIndex = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Offset wagon to sit ON TOP of track, not centered on it
        ctx.translate(0, -15);

        // Wagon body
        const wagonWidth = isPlayer ? 70 : 55;
        const wagonHeight = isPlayer ? 40 : 32;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(-wagonWidth/2 + 3, -wagonHeight + 3, wagonWidth, wagonHeight, 8);
        ctx.fill();

        // Main body
        const gradient = ctx.createLinearGradient(0, -wagonHeight, 0, 0);
        if (isPlayer) {
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(0.5, '#f59e0b');
            gradient.addColorStop(1, '#d97706');
        } else {
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(0.5, '#dc2626');
            gradient.addColorStop(1, '#b91c1c');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-wagonWidth/2, -wagonHeight, wagonWidth, wagonHeight, 8);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.roundRect(-wagonWidth/2 + 5, -wagonHeight + 5, wagonWidth - 10, 12, 4);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#333';
        for (let wx of [-wagonWidth/2 + 12, wagonWidth/2 - 12]) {
            ctx.beginPath();
            ctx.arc(wx, -5, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(wx, -5, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#333';
        }

        // Safety bar
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -wagonHeight + 10, 25, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();

        // Draw character
        if (isPlayer) {
            this.drawTallGuy(ctx, 0, -wagonHeight);
        } else {
            this.drawNPC(ctx, 0, -wagonHeight, npcIndex);
        }

        ctx.restore();
    }

    drawTallGuy(ctx, x, baseY) {
        const isBending = this.isBending;
        const armsTucked = this.isArmsTucked;

        if (isBending) {
            // DUCKING - Head hidden below seat level, body hunched forward

            // Body hunched forward
            ctx.fillStyle = this.colors.shirt;
            ctx.beginPath();
            ctx.roundRect(x - 18, baseY - 35, 36, 40, 8);
            ctx.fill();

            // Back of head visible (top of head poking up slightly)
            ctx.fillStyle = this.colors.hair;
            ctx.beginPath();
            ctx.ellipse(x, baseY - 35, 18, 12, 0, Math.PI, Math.PI * 2);
            ctx.fill();

            // Arms gripping the safety bar
            ctx.strokeStyle = this.colors.shirt;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - 15, baseY - 25);
            ctx.lineTo(x - 30, baseY - 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 15, baseY - 25);
            ctx.lineTo(x + 30, baseY - 10);
            ctx.stroke();

            // Hands gripping bar
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(x - 30, baseY - 8, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 30, baseY - 8, 7, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // NORMAL STANDING - Tall guy with head sticking way up

            // Body (in wagon)
            ctx.fillStyle = this.colors.shirt;
            ctx.beginPath();
            ctx.roundRect(x - 18, baseY - 50, 36, 55, 8);
            ctx.fill();

            // Shirt detail
            ctx.fillStyle = this.colors.shirtDark;
            ctx.beginPath();
            ctx.roundRect(x - 18, baseY - 50, 36, 15, [8, 8, 0, 0]);
            ctx.fill();

            // Arms
            ctx.lineWidth = 12;
            ctx.lineCap = 'round';

            if (armsTucked) {
                // Arms tucked in close to body
                ctx.strokeStyle = this.colors.shirt;
                ctx.beginPath();
                ctx.moveTo(x - 15, baseY - 35);
                ctx.lineTo(x - 10, baseY - 55);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + 15, baseY - 35);
                ctx.lineTo(x + 10, baseY - 55);
                ctx.stroke();

                // Hands near chest
                ctx.fillStyle = this.colors.skin;
                ctx.beginPath();
                ctx.arc(x - 10, baseY - 60, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 10, baseY - 60, 8, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Arms spread out (LONGER - extended further)
                ctx.strokeStyle = this.colors.shirt;

                // Left arm - upper
                ctx.beginPath();
                ctx.moveTo(x - 18, baseY - 35);
                ctx.lineTo(x - 40, baseY - 25);
                ctx.stroke();
                // Left arm - lower
                ctx.beginPath();
                ctx.moveTo(x - 40, baseY - 25);
                ctx.lineTo(x - 65, baseY - 15);
                ctx.stroke();

                // Right arm - upper
                ctx.beginPath();
                ctx.moveTo(x + 18, baseY - 35);
                ctx.lineTo(x + 40, baseY - 25);
                ctx.stroke();
                // Right arm - lower
                ctx.beginPath();
                ctx.moveTo(x + 40, baseY - 25);
                ctx.lineTo(x + 65, baseY - 15);
                ctx.stroke();

                // Hands
                ctx.fillStyle = this.colors.skin;
                ctx.beginPath();
                ctx.arc(x - 65, baseY - 15, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 65, baseY - 15, 9, 0, Math.PI * 2);
                ctx.fill();
            }

            // Neck
            ctx.fillStyle = this.colors.skin;
            ctx.fillRect(x - 8, baseY - 65, 16, 20);

            // Head - sticking way up
            const headY = baseY - 100;

            // Head shape
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.ellipse(x, headY, 22, 26, 0, 0, Math.PI * 2);
            ctx.fill();

            // Hair
            ctx.fillStyle = this.colors.hair;
            ctx.beginPath();
            ctx.ellipse(x, headY - 15, 24, 18, 0, Math.PI, Math.PI * 2);
            ctx.fill();

            // Hair sides
            ctx.beginPath();
            ctx.ellipse(x - 20, headY - 5, 8, 15, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 20, headY - 5, 8, 15, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(x - 8, headY - 2, 7, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 8, headY - 2, 7, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(x - 7, headY - 1, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 9, headY - 1, 4, 0, Math.PI * 2);
            ctx.fill();

            // Eyebrows (worried)
            ctx.strokeStyle = this.colors.hair;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - 14, headY - 14);
            ctx.lineTo(x - 4, headY - 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 14, headY - 14);
            ctx.lineTo(x + 4, headY - 10);
            ctx.stroke();

            // Mouth (worried/scared)
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, headY + 12, 8, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }
    }

    drawNPC(ctx, x, baseY, index) {
        const colors = [
            { shirt: '#8b5cf6', shirtDark: '#7c3aed' },
            { shirt: '#10b981', shirtDark: '#059669' },
            { shirt: '#f43f5e', shirtDark: '#e11d48' }
        ];
        const color = colors[index - 1] || colors[0];

        // Body
        ctx.fillStyle = color.shirt;
        ctx.beginPath();
        ctx.roundRect(x - 12, baseY - 35, 24, 40, 6);
        ctx.fill();

        // Arms (shorter than player but still visible)
        ctx.strokeStyle = color.shirt;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        // Animated arm positions
        const armWave = Math.sin(Date.now() * 0.005 + index) * 0.3;

        ctx.beginPath();
        ctx.moveTo(x - 12, baseY - 25);
        ctx.lineTo(x - 30, baseY - 20 + Math.sin(Date.now() * 0.01 + index) * 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 12, baseY - 25);
        ctx.lineTo(x + 30, baseY - 20 + Math.cos(Date.now() * 0.01 + index) * 10);
        ctx.stroke();

        // Hands
        ctx.fillStyle = this.colors.skin;
        ctx.beginPath();
        ctx.arc(x - 30, baseY - 20 + Math.sin(Date.now() * 0.01 + index) * 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 30, baseY - 20 + Math.cos(Date.now() * 0.01 + index) * 10, 6, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = this.colors.skin;
        ctx.beginPath();
        ctx.arc(x, baseY - 50, 16, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        const hairColors = ['#4a3728', '#1a1a1a', '#d4a574'];
        ctx.fillStyle = hairColors[index - 1] || hairColors[0];
        ctx.beginPath();
        ctx.arc(x, baseY - 55, 14, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eyes (happy)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - 5, baseY - 52, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, baseY - 52, 3, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, baseY - 45, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }

    drawTunnel() {
        const ctx = this.ctx;
        const tunnelStartScreen = this.tunnelStartX - this.trackOffset;
        const tunnelEndScreen = this.tunnelEndX - this.trackOffset;

        // Only draw if tunnel is visible on screen
        if (tunnelEndScreen < -200 || tunnelStartScreen > this.canvas.width + 200) return;

        const trackDataStart = this.getTrackDataAt(this.tunnelStartX);
        const trackDataEnd = this.getTrackDataAt(this.tunnelEndX);

        const tunnelHeight = 180;
        const tunnelTop = trackDataStart.y - tunnelHeight;
        const tunnelBottom = trackDataStart.y + 40;

        // Draw tunnel body (solid rectangle)
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(tunnelStartScreen, tunnelTop - 50, tunnelEndScreen - tunnelStartScreen, tunnelBottom - tunnelTop + 100);

        // Tunnel entrance wall (left side)
        if (tunnelStartScreen > -100 && tunnelStartScreen < this.canvas.width + 100) {
            // Front wall with opening
            ctx.fillStyle = '#4a4a4a';
            // Top part of wall
            ctx.fillRect(tunnelStartScreen - 60, tunnelTop - 80, 120, 80);
            // Left side of opening
            ctx.fillRect(tunnelStartScreen - 60, tunnelTop, 20, tunnelBottom - tunnelTop);
            // Right side of opening
            ctx.fillRect(tunnelStartScreen + 40, tunnelTop, 20, tunnelBottom - tunnelTop);

            // Dark opening
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(tunnelStartScreen - 40, tunnelTop, 80, tunnelBottom - tunnelTop);

            // Warning stripes on entrance
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(tunnelStartScreen - 40, tunnelTop, 80, 8);
            ctx.fillStyle = '#1a1a1a';
            for (let i = -35; i < 40; i += 15) {
                ctx.fillRect(tunnelStartScreen + i, tunnelTop, 8, 8);
            }

            // "TUNNEL" sign
            ctx.fillStyle = '#333';
            ctx.fillRect(tunnelStartScreen - 35, tunnelTop - 35, 70, 25);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TUNNEL', tunnelStartScreen, tunnelTop - 18);
        }

        // Tunnel exit wall (right side)
        if (tunnelEndScreen > -100 && tunnelEndScreen < this.canvas.width + 100) {
            // Front wall with opening
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(tunnelEndScreen - 60, tunnelTop - 80, 120, 80);
            ctx.fillRect(tunnelEndScreen - 60, tunnelTop, 20, tunnelBottom - tunnelTop);
            ctx.fillRect(tunnelEndScreen + 40, tunnelTop, 20, tunnelBottom - tunnelTop);

            // Light opening (exit)
            ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
            ctx.fillRect(tunnelEndScreen - 40, tunnelTop, 80, tunnelBottom - tunnelTop);
        }

        // If we're inside the tunnel, draw ceiling and darkness
        const wagonWorldX = this.trackOffset + this.canvas.width * this.wagonPosition;
        if (wagonWorldX > this.tunnelStartX + 50 && wagonWorldX < this.tunnelEndX - 50) {
            // Dark ceiling covering top of screen
            ctx.fillStyle = '#1a1a1a';
            const ceilingLeft = Math.max(0, tunnelStartScreen + 60);
            const ceilingRight = Math.min(this.canvas.width, tunnelEndScreen - 60);
            ctx.fillRect(ceilingLeft, 0, ceilingRight - ceilingLeft, tunnelTop + 20);

            // Ceiling support beams
            ctx.fillStyle = '#2d2d2d';
            const beamSpacing = 120;
            const startBeam = Math.floor((this.trackOffset) / beamSpacing) * beamSpacing;
            for (let beamX = startBeam; beamX < this.trackOffset + this.canvas.width; beamX += beamSpacing) {
                if (beamX < this.tunnelStartX + 60 || beamX > this.tunnelEndX - 60) continue;
                const screenX = beamX - this.trackOffset;
                // Vertical beam
                ctx.fillRect(screenX - 8, tunnelTop, 16, tunnelBottom - tunnelTop);
            }

            // Dim overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Tunnel lights on ceiling
            const lightSpacing = 180;
            const startLight = Math.floor((this.trackOffset) / lightSpacing) * lightSpacing;
            for (let lightX = startLight; lightX < this.trackOffset + this.canvas.width; lightX += lightSpacing) {
                if (lightX < this.tunnelStartX + 80 || lightX > this.tunnelEndX - 80) continue;
                const screenX = lightX - this.trackOffset;
                const trackData = this.getTrackDataAt(lightX);

                // Light glow
                const gradient = ctx.createRadialGradient(screenX, trackData.y - 60, 0, screenX, trackData.y - 60, 50);
                gradient.addColorStop(0, 'rgba(255, 200, 100, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, trackData.y - 60, 50, 0, Math.PI * 2);
                ctx.fill();

                // Light fixture
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(screenX - 10, tunnelTop + 15, 20, 15);
            }
        }
    }

    winGame() {
        this.isRunning = false;
        this.score += this.lives * 1000;

        document.getElementById('finalScore').textContent = this.score;

        // Draw photo
        this.drawPhoto();

        setTimeout(() => {
            document.getElementById('winOverlay').classList.remove('hidden');
        }, 500);
    }

    drawPhoto() {
        const canvas = document.getElementById('photoCanvas');
        const ctx = canvas.getContext('2d');

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98fb98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Track
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(0, 200);
        ctx.bezierCurveTo(100, 180, 300, 220, 400, 200);
        ctx.stroke();

        // NPC wagons
        for (let i = 0; i < 3; i++) {
            this.drawPhotoWagon(ctx, 80 + i * 60, 175 - i * 5, false, i);
        }

        // Player wagon
        this.drawPhotoWagon(ctx, 280, 185, true);

        // Flash effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawPhotoWagon(ctx, x, y, isPlayer, npcIndex = 0) {
        // Wagon
        ctx.fillStyle = isPlayer ? '#f59e0b' : '#dc2626';
        ctx.beginPath();
        ctx.roundRect(x - 25, y - 20, 50, 25, 5);
        ctx.fill();

        // Character
        if (isPlayer) {
            // Terrified tall guy
            // Body
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x - 10, y - 55, 20, 35);

            // Arms flailing
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 45);
            ctx.lineTo(x - 35, y - 60);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 10, y - 45);
            ctx.lineTo(x + 35, y - 65);
            ctx.stroke();

            // Hands
            ctx.fillStyle = '#fcd5b8';
            ctx.beginPath();
            ctx.arc(x - 35, y - 60, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 35, y - 65, 5, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = '#fcd5b8';
            ctx.beginPath();
            ctx.arc(x, y - 70, 15, 0, Math.PI * 2);
            ctx.fill();

            // Messy hair
            ctx.fillStyle = '#4a3728';
            ctx.beginPath();
            ctx.arc(x, y - 78, 12, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 80);
            ctx.lineTo(x - 15, y - 95);
            ctx.lineTo(x - 5, y - 85);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + 10, y - 80);
            ctx.lineTo(x + 12, y - 92);
            ctx.lineTo(x + 5, y - 85);
            ctx.fill();

            // Terrified eyes (wide open)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(x - 5, y - 72, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 5, y - 72, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(x - 5, y - 71, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 5, y - 71, 3, 0, Math.PI * 2);
            ctx.fill();

            // Screaming mouth
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.ellipse(x, y - 60, 6, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Happy NPC
            const colors = ['#8b5cf6', '#10b981', '#f43f5e'];
            ctx.fillStyle = colors[npcIndex] || colors[0];
            ctx.fillRect(x - 6, y - 35, 12, 18);

            // Arms up
            ctx.strokeStyle = colors[npcIndex] || colors[0];
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 30);
            ctx.lineTo(x - 15, y - 45);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 6, y - 30);
            ctx.lineTo(x + 15, y - 45);
            ctx.stroke();

            // Head
            ctx.fillStyle = '#fcd5b8';
            ctx.beginPath();
            ctx.arc(x, y - 45, 10, 0, Math.PI * 2);
            ctx.fill();

            // Happy face
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(x - 3, y - 47, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 3, y - 47, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y - 42, 4, 0, Math.PI);
            ctx.stroke();
        }
    }

    loseGame(message) {
        this.isRunning = false;

        document.getElementById('loseMessage').textContent = message;
        document.getElementById('loseScore').textContent = this.score;

        setTimeout(() => {
            document.getElementById('loseOverlay').classList.remove('hidden');
        }, 500);
    }
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RollercoasterGame();
});
