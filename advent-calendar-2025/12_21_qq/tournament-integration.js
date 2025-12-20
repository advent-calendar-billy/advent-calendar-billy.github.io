// Tournament Integration - Connects all systems to the main game
// This file should be loaded after tournament.js, backgrounds.js, opponent-ai.js, game-controller.js

(function() {
    'use strict';

    // Store original game functions for fallback
    let originalSelectCharacter = null;
    let originalResetGame = null;
    let originalDealDamage = null;
    let originalStartGameLoop = null;

    // Tournament game state
    const tournamentGame = {
        active: false,
        opponentElement: null,
        aiUpdateInterval: null
    };

    // Initialize tournament mode
    function initTournamentMode() {
        // Hide character select, show tournament ladder
        const charSelect = document.getElementById('character-select');
        const ladderScreen = document.getElementById('tournament-ladder');

        if (charSelect) charSelect.style.display = 'none';
        if (ladderScreen) ladderScreen.style.display = 'flex';

        Tournament.init();
        renderLadderScreen();
    }

    // Render the tournament ladder screen
    function renderLadderScreen() {
        const ladderScreen = document.getElementById('tournament-ladder');
        if (!ladderScreen) return;

        const ladderData = Tournament.getLadderDisplay();

        let html = `
            <div class="ladder-container">
                <h2 class="ladder-title">FAMILY FIGHTER</h2>
                <p class="ladder-subtitle">Tournament Mode</p>
                <div class="ladder-player-info">
                    <span class="player-name">FEDE</span>
                    <span>vs THE WORLD</span>
                </div>
                <div class="ladder-list">
        `;

        // Show opponents (reversed so final boss is at top)
        const reversed = [...ladderData].reverse();
        reversed.forEach((opponent) => {
            let classes = 'ladder-opponent';
            let content = '';

            if (opponent.isDefeated) {
                classes += ' defeated';
                content = `
                    <span class="opponent-status">DEFEATED</span>
                    <span class="opponent-name">${opponent.name}</span>
                    <span class="opponent-title">${opponent.title}</span>
                `;
            } else if (opponent.isCurrent) {
                classes += ' current';
                content = `
                    <span class="opponent-status">NEXT FIGHT</span>
                    <span class="opponent-name">${opponent.name}</span>
                    <span class="opponent-title">${opponent.title}</span>
                    <span class="opponent-desc">${opponent.description}</span>
                `;
            } else if (opponent.isRevealed) {
                classes += ' revealed';
                content = `
                    <span class="opponent-name">${opponent.name}</span>
                    <span class="opponent-title">${opponent.title}</span>
                `;
            } else {
                classes += ' mystery';
                content = `
                    <span class="opponent-name">???</span>
                    <span class="opponent-title">MYSTERY CHALLENGER</span>
                `;
            }

            if (opponent.isFinalBoss) {
                classes += ' final-boss';
            }

            html += `<div class="${classes}">${content}</div>`;
        });

        html += `
                </div>
                <button class="fight-btn" onclick="startTournamentMatch()">FIGHT!</button>
            </div>
        `;

        ladderScreen.innerHTML = html;
    }

    // Start a tournament match
    window.startTournamentMatch = function() {
        const opponent = Tournament.getCurrentOpponent();
        const stats = Tournament.getOpponentStats(opponent);

        // Hide ladder, show pre-fight
        document.getElementById('tournament-ladder').style.display = 'none';

        showPreFightScreen(opponent, function() {
            startFight(opponent, stats);
        });
    };

    // Show the VS screen before fight
    function showPreFightScreen(opponent, callback) {
        const preFight = document.getElementById('pre-fight-screen');
        if (!preFight) {
            callback();
            return;
        }

        preFight.innerHTML = `
            <div class="vs-container">
                <div class="fighter-intro player">
                    <span class="fighter-name">FEDE</span>
                    <span class="fighter-title">The World Traveler</span>
                </div>
                <div class="vs-text">VS</div>
                <div class="fighter-intro opponent">
                    <span class="fighter-name">${opponent.name}</span>
                    <span class="fighter-title">${opponent.title}</span>
                </div>
            </div>
            <div class="match-info">${Tournament.getMatchStatus()}</div>
        `;

        preFight.classList.add('show');

        // Auto-dismiss after 2.5 seconds
        setTimeout(() => {
            preFight.classList.remove('show');
            callback();
        }, 2500);
    }

    // Start the actual fight
    function startFight(opponent, stats) {
        tournamentGame.active = true;

        // Show game arena
        document.getElementById('game-arena').style.display = 'flex';

        // Setup player (always Fede)
        setupFedePlayer();

        // Setup opponent
        setupOpponent(opponent, stats);

        // Apply background
        const arena = document.getElementById('arena');
        Backgrounds.applyToArena(arena, Tournament.state.matchNumber);

        // Initialize AI
        OpponentAI.init(opponent, stats);
        OpponentAI.setAttackCallback(handleOpponentAttack);

        // Reset game state
        game.playerHealth = 100;
        game.playerEnergy = 0;
        game.playerX = 100;
        game.selectedCharacter = 'fede';

        updateTournamentUI();
        startOpponentAILoop();

        // Start the game loop if it exists
        if (typeof window.startGameLoop === 'function') {
            window.startGameLoop();
        }
    }

    // Setup Fede as the player
    function setupFedePlayer() {
        document.getElementById('player-name').textContent = 'FEDE';
        document.getElementById('player-name').style.color = '#4a90d9';

        // Use Fede's character template
        if (window.characterTemplates && window.characterTemplates.fede) {
            document.getElementById('player-fighter-container').innerHTML = window.characterTemplates.fede;
        }

        // Setup move list for Fede
        const moveListEl = document.getElementById('move-list');
        if (moveListEl && window.moveLists && window.moveLists.fede) {
            moveListEl.innerHTML = `<h4>Moves</h4>` +
                window.moveLists.fede.specials.map(m =>
                    `<div class="move"><span class="move-name">${m.name}:</span> ${m.combo.map(k => {
                        if (k === 'down') return '↓';
                        if (k === 'up') return '↑';
                        if (k === 'right') return '→';
                        if (k === 'left') return '←';
                        return k.toUpperCase();
                    }).join(' ')}</div>`
                ).join('');
        }

        const fighter = document.getElementById('player-fighter');
        if (fighter) {
            fighter.style.position = 'absolute';
            fighter.style.left = '100px';
            fighter.style.bottom = '68px';
        }
    }

    // Setup the opponent character
    function setupOpponent(opponent, stats) {
        // Hide the NPC dummy - we're using the opponent fighter instead
        const npcDummy = document.getElementById('npc-dummy');
        if (npcDummy) {
            npcDummy.style.display = 'none';
        }

        // Update opponent name in header
        const opponentNameEl = document.getElementById('opponent-name');
        if (opponentNameEl) {
            opponentNameEl.textContent = opponent.name;
            opponentNameEl.style.color = getOpponentColor(opponent.id);
        }

        // Replace dummy with opponent character
        const opponentContainer = document.getElementById('opponent-fighter-container');
        if (opponentContainer && window.characterTemplates && window.characterTemplates[opponent.id]) {
            let template = window.characterTemplates[opponent.id];
            // Modify template for opponent (facing left, different ID)
            template = template.replace('id="player-fighter"', 'id="opponent-fighter"');
            template = template.replace('class="fighter', 'class="fighter facing-left');
            opponentContainer.innerHTML = template;
        }

        // Position opponent with absolute positioning
        const opponentFighter = document.getElementById('opponent-fighter');
        if (opponentFighter) {
            opponentFighter.style.position = 'absolute';
            opponentFighter.style.left = '650px';
            opponentFighter.style.bottom = '68px';
        }

        // Update health bar max
        game.dummyHealth = stats.hp;
        game.dummyX = 650;
    }

    // Get color for opponent based on their ID
    function getOpponentColor(id) {
        const colors = {
            timo: '#888',
            madonna: '#e91e8c',
            jonas: 'var(--green)',
            lucas: 'var(--purple)',
            vicky: '#c41e3a',
            jonasl: '#8b4513',
            frank: '#cc0033',
            charly: '#c0392b',
            audrey: '#228b22',
            pancho: '#2563eb',
            pato: 'var(--orange)',
            billy: 'var(--blue)'
        };
        return colors[id] || 'var(--ink)';
    }

    // Start AI update loop
    function startOpponentAILoop() {
        if (tournamentGame.aiUpdateInterval) {
            clearInterval(tournamentGame.aiUpdateInterval);
        }

        // Debug: confirm AI loop is starting
        console.log('[TournamentAI] Starting AI loop');

        tournamentGame.aiUpdateInterval = setInterval(() => {
            if (!tournamentGame.active) return;

            // Get player position - try multiple sources
            let playerX = 100;
            if (window.game && typeof window.game.playerX === 'number') {
                playerX = window.game.playerX;
            } else {
                // Fallback: get position from fighter element
                const playerFighter = document.getElementById('player-fighter');
                if (playerFighter) {
                    const left = parseFloat(playerFighter.style.left);
                    if (!isNaN(left)) playerX = left;
                }
            }

            const aiResult = OpponentAI.update({
                playerX: playerX,
                playerHealth: game.playerHealth || 100
            });

            if (aiResult) {
                // Update opponent position
                game.dummyX = aiResult.x;
                const opponentFighter = document.getElementById('opponent-fighter');
                if (opponentFighter) {
                    opponentFighter.style.left = aiResult.x + 'px';
                    if (aiResult.facingLeft) {
                        opponentFighter.classList.add('facing-left');
                    } else {
                        opponentFighter.classList.remove('facing-left');
                    }
                }
            }
        }, 1000 / 60); // 60 FPS
    }

    // Handle opponent attacking player
    function handleOpponentAttack(attackData) {
        console.log('[TournamentAI] Opponent attack:', attackData.type, 'at distance:', Math.abs(attackData.x - attackData.playerX));

        if (!tournamentGame.active) {
            console.log('[TournamentAI] Attack blocked - tournament not active');
            return;
        }

        const opponentFighter = document.getElementById('opponent-fighter');
        const arena = document.getElementById('arena');
        const facingLeft = attackData.x > attackData.playerX;

        // Show attack animation on opponent
        if (opponentFighter) {
            // Add attack class for animation
            if (attackData.type === 'punch') {
                opponentFighter.classList.add('punching');
                setTimeout(() => opponentFighter.classList.remove('punching'), 250);
            } else if (attackData.type === 'kick') {
                opponentFighter.classList.add('kicking');
                setTimeout(() => opponentFighter.classList.remove('kicking'), 350);
            } else if (attackData.type === 'special') {
                opponentFighter.classList.add('special-attack');
                setTimeout(() => opponentFighter.classList.remove('special-attack'), 500);
            }

            // Show attack swoosh effect - more visible
            const swoosh = document.createElement('div');
            swoosh.style.cssText = `
                position: absolute;
                left: ${facingLeft ? attackData.x - 80 : attackData.x + 60}px;
                bottom: 100px;
                width: 70px;
                height: 40px;
                background: radial-gradient(ellipse at ${facingLeft ? 'right' : 'left'}, rgba(255,80,80,0.8) 0%, rgba(255,150,50,0.4) 50%, transparent 70%);
                border-radius: 50%;
                z-index: 150;
                animation: attackSwoosh 0.25s ease-out forwards;
                transform: ${facingLeft ? 'scaleX(-1)' : ''};
            `;
            arena.appendChild(swoosh);
            setTimeout(() => swoosh.remove(), 250);

            // Show attack type indicator above opponent
            const attackLabel = document.createElement('div');
            attackLabel.textContent = attackData.type.toUpperCase() + '!';
            attackLabel.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 200px;
                font-family: 'Finger Paint', cursive;
                font-size: 16px;
                color: #ff6b6b;
                text-shadow: 1px 1px 0 #000;
                z-index: 200;
                animation: hitTextPop 0.4s ease-out forwards;
                pointer-events: none;
            `;
            arena.appendChild(attackLabel);
            setTimeout(() => attackLabel.remove(), 400);

            // For special attacks, launch a projectile toward the player
            if (attackData.isSpecial) {
                console.log('[SPECIAL ATTACK]', attackData.characterId, 'is using special attack!');
                launchOpponentProjectile(attackData, arena, facingLeft);
            }
        }

        // Hit detection - slightly larger range for attacks to connect
        const distance = Math.abs(attackData.x - attackData.playerX);
        if (distance < 100) {
            game.playerHealth = Math.max(0, game.playerHealth - attackData.damage);
            updateTournamentUI();

            // Show hit effect on player
            const fighter = document.getElementById('player-fighter');
            if (fighter) {
                fighter.classList.add('hit');
                setTimeout(() => fighter.classList.remove('hit'), 300);
            }

            // Show damage number on player
            showDamageNumber(attackData.playerX + 25, 100, attackData.damage);

            // Show hit text
            const hitText = attackData.type === 'special' ? 'SPECIAL!' : (attackData.type === 'kick' ? 'KICK!' : 'POW!');
            const hit = document.createElement('div');
            hit.className = 'hit-text impact-effect';
            hit.textContent = hitText;
            hit.style.cssText = `
                position: absolute;
                left: ${attackData.playerX + 25}px;
                bottom: 150px;
                font-family: 'Finger Paint', cursive;
                font-size: 20px;
                color: #e74c3c;
                text-shadow: 2px 2px 0 #000;
                z-index: 200;
                animation: hitTextPop 0.3s ease-out forwards;
            `;
            arena.appendChild(hit);
            setTimeout(() => hit.remove(), 300);

            // Check if player lost
            if (game.playerHealth <= 0) {
                endRound(false);
            }
        }
    }

    // Launch NPC special attack with character-specific visuals
    function launchOpponentProjectile(attackData, arena, facingLeft) {
        const charId = attackData.characterId || 'default';

        // Each character has unique special attack visuals
        executeNPCSpecial(charId, attackData, arena, facingLeft);
    }

    // Execute character-specific NPC special attacks
    function executeNPCSpecial(charId, attackData, arena, facingLeft) {
        const startX = attackData.x;
        const targetX = attackData.playerX;
        const direction = facingLeft ? -1 : 1;
        const opponentFighter = document.getElementById('opponent-fighter');

        switch (charId) {
            case 'timo':
                executeTimoNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'billy':
                executeBillyNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'pato':
                executePatoNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'jonas':
                executeJonasNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'lucas':
                executeLucasNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'vicky':
                executeVickyNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'jonasl':
                executeJonasLNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'frank':
                executeFrankNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'charly':
                executeCharlyNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'audrey':
                executeAudreyNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'pancho':
                executePanchoNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            case 'madonna':
                executeMadonnaNPCSpecial(attackData, arena, facingLeft, opponentFighter);
                break;
            default:
                // Fallback to generic projectile
                launchGenericProjectile(attackData, arena, facingLeft);
        }
    }

    // TIMO - Crying baby with flag
    function executeTimoNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['drool', 'complain', 'flag'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'drool') {
            // Excessive drool - drool puddles spread out
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const drool = document.createElement('div');
                    drool.textContent = '💧';
                    drool.style.cssText = `
                        position: absolute;
                        left: ${attackData.x + (Math.random() - 0.5) * 60}px;
                        bottom: ${100 + Math.random() * 30}px;
                        font-size: ${16 + Math.random() * 12}px;
                        opacity: 0.8;
                        z-index: 150;
                        animation: droolFall 1s ease-in forwards;
                    `;
                    arena.appendChild(drool);
                    setTimeout(() => drool.remove(), 1000);
                }, i * 100);
            }
            showSpecialText(arena, attackData.x, 'DROOL!', '#87CEEB');
        } else if (special === 'complain') {
            // Loud complaining - WAAAAAH text bubbles
            const complaints = ['WAAAAAH!', 'WAAAA!', 'WAH WAH!', '😭😭😭'];
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const wah = document.createElement('div');
                    wah.textContent = complaints[Math.floor(Math.random() * complaints.length)];
                    wah.style.cssText = `
                        position: absolute;
                        left: ${attackData.x - 30 + i * 30}px;
                        bottom: ${180 + i * 20}px;
                        font-family: 'Comic Sans MS', cursive;
                        font-size: ${20 + i * 4}px;
                        color: #ff6b6b;
                        text-shadow: 2px 2px 0 #000;
                        z-index: 160;
                        animation: wahFloat 1.5s ease-out forwards;
                    `;
                    arena.appendChild(wah);
                    setTimeout(() => wah.remove(), 1500);
                }, i * 200);
            }
            showSpecialText(arena, attackData.x, 'COMPLAINING!', '#ff6b6b');
        } else {
            // Wave the flag
            const flag = document.createElement('div');
            flag.innerHTML = '🏳️';
            flag.style.cssText = `
                position: absolute;
                left: ${attackData.x + 20}px;
                bottom: 150px;
                font-size: 40px;
                z-index: 160;
                animation: flagWave 1s ease-in-out;
                transform-origin: bottom center;
            `;
            arena.appendChild(flag);
            setTimeout(() => flag.remove(), 1000);
            showSpecialText(arena, attackData.x, 'FLAG WAVE!', '#888');
        }
    }

    // BILLY - Math genius
    function executeBillyNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['triangle', 'equation', 'whiteboard'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'triangle') {
            // Pythagorean triangle attack
            const triangle = document.createElement('div');
            triangle.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 100px;
                width: 0; height: 0;
                border-left: 40px solid transparent;
                border-right: 40px solid transparent;
                border-bottom: 70px solid #3498db;
                z-index: 155;
                filter: drop-shadow(0 0 10px #3498db);
            `;
            arena.appendChild(triangle);

            // Add labels
            const labels = ['a²', 'b²', 'c²'];
            labels.forEach((label, i) => {
                const text = document.createElement('div');
                text.textContent = label;
                text.style.cssText = `
                    position: absolute;
                    left: ${attackData.x + 20 + i * 25}px;
                    bottom: ${120 + (i === 2 ? 40 : 0)}px;
                    font-family: 'Times New Roman', serif;
                    font-size: 14px;
                    color: #fff;
                    z-index: 156;
                `;
                arena.appendChild(text);
                setTimeout(() => text.remove(), 1000);
            });

            // Animate toward player
            let pos = attackData.x;
            const fly = setInterval(() => {
                pos += (facingLeft ? -8 : 8);
                triangle.style.left = pos + 'px';
                triangle.style.transform = `rotate(${(pos - attackData.x) * 2}deg)`;
                if (Math.abs(pos - attackData.playerX) < 50 || pos < 0 || pos > 900) {
                    clearInterval(fly);
                    triangle.remove();
                }
            }, 25);
            setTimeout(() => { clearInterval(fly); triangle.remove(); }, 2000);
            showSpecialText(arena, attackData.x, 'a² + b² = c²!', '#3498db');
        } else if (special === 'equation') {
            // Floating equations attack
            const equations = ['∫f(x)dx', 'Σn²', '√π', 'e^iπ', '∂y/∂x'];
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const eq = document.createElement('div');
                    eq.textContent = equations[Math.floor(Math.random() * equations.length)];
                    eq.style.cssText = `
                        position: absolute;
                        left: ${attackData.x + (facingLeft ? -20 : 40)}px;
                        bottom: ${100 + i * 20}px;
                        font-family: 'Times New Roman', serif;
                        font-size: 22px;
                        color: #3498db;
                        text-shadow: 0 0 10px #3498db;
                        z-index: 155;
                    `;
                    arena.appendChild(eq);

                    let eqPos = attackData.x;
                    const fly = setInterval(() => {
                        eqPos += (facingLeft ? -6 : 6);
                        eq.style.left = eqPos + 'px';
                        eq.style.bottom = (100 + i * 20 + Math.sin(eqPos * 0.1) * 15) + 'px';
                        if (eqPos < 0 || eqPos > 900) {
                            clearInterval(fly);
                            eq.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); eq.remove(); }, 2000);
                }, i * 150);
            }
            showSpecialText(arena, attackData.x, 'MATH ATTACK!', '#3498db');
        } else {
            // Whiteboard slam
            const board = document.createElement('div');
            board.style.cssText = `
                position: absolute;
                left: ${attackData.x - 30}px;
                bottom: 80px;
                width: 80px; height: 60px;
                background: #fff;
                border: 4px solid #8B4513;
                z-index: 155;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Comic Sans MS', cursive;
                font-size: 12px;
            `;
            board.textContent = 'Q.E.D.';
            arena.appendChild(board);

            // Slam animation
            board.style.animation = 'whiteboardSlam 0.5s ease-out';
            setTimeout(() => board.remove(), 800);
            showSpecialText(arena, attackData.x, 'WHITEBOARD!', '#8B4513');
        }
    }

    // PATO - Crypto/Cinema bro
    function executePatoNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['bitcoin', 'camera', 'code'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'bitcoin') {
            // Bitcoin throw
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const coin = document.createElement('div');
                    coin.textContent = '₿';
                    coin.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${110 + i * 15}px;
                        font-size: 28px;
                        color: #f7931a;
                        text-shadow: 0 0 10px #f7931a;
                        z-index: 155;
                    `;
                    arena.appendChild(coin);

                    let coinPos = attackData.x;
                    const fly = setInterval(() => {
                        coinPos += (facingLeft ? -10 : 10);
                        coin.style.left = coinPos + 'px';
                        coin.style.transform = `rotate(${(coinPos - attackData.x) * 3}deg)`;
                        if (coinPos < 0 || coinPos > 900) {
                            clearInterval(fly);
                            coin.remove();
                        }
                    }, 25);
                    setTimeout(() => { clearInterval(fly); coin.remove(); }, 1500);
                }, i * 100);
            }
            showSpecialText(arena, attackData.x, 'TO THE MOON!', '#f7931a');
        } else if (special === 'camera') {
            // Director's cut - film reel attack
            const reel = document.createElement('div');
            reel.textContent = '🎬';
            reel.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 120px;
                font-size: 40px;
                z-index: 155;
            `;
            arena.appendChild(reel);

            let reelPos = attackData.x;
            const fly = setInterval(() => {
                reelPos += (facingLeft ? -7 : 7);
                reel.style.left = reelPos + 'px';
                reel.style.transform = `rotate(${(reelPos - attackData.x) * 5}deg)`;
                if (reelPos < 0 || reelPos > 900) {
                    clearInterval(fly);
                    reel.remove();
                }
            }, 25);
            setTimeout(() => { clearInterval(fly); reel.remove(); }, 2000);
            showSpecialText(arena, attackData.x, "DIRECTOR'S CUT!", '#e74c3c');
        } else {
            // Code attack - brackets fly out
            const codeChars = ['{ }', '< />', '( )', '[ ]', '/* */'];
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const code = document.createElement('div');
                    code.textContent = codeChars[Math.floor(Math.random() * codeChars.length)];
                    code.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${100 + i * 20}px;
                        font-family: 'Courier New', monospace;
                        font-size: 20px;
                        color: #2ecc71;
                        text-shadow: 0 0 5px #2ecc71;
                        z-index: 155;
                    `;
                    arena.appendChild(code);

                    let codePos = attackData.x;
                    const fly = setInterval(() => {
                        codePos += (facingLeft ? -8 : 8);
                        code.style.left = codePos + 'px';
                        if (codePos < 0 || codePos > 900) {
                            clearInterval(fly);
                            code.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); code.remove(); }, 1500);
                }, i * 80);
            }
            showSpecialText(arena, attackData.x, 'STACK OVERFLOW!', '#2ecc71');
        }
    }

    // JONAS M - The Coach
    function executeJonasNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['postits', 'paradigm', 'synergy'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'postits') {
            // Post-it note barrage
            const colors = ['#ffeb3b', '#ff9800', '#4caf50', '#2196f3', '#e91e63'];
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const postit = document.createElement('div');
                    postit.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${100 + Math.random() * 40}px;
                        width: 25px; height: 25px;
                        background: ${colors[Math.floor(Math.random() * colors.length)]};
                        border: 1px solid #333;
                        z-index: 155;
                        transform: rotate(${Math.random() * 30 - 15}deg);
                        box-shadow: 2px 2px 3px rgba(0,0,0,0.3);
                    `;
                    arena.appendChild(postit);

                    let postitPos = attackData.x;
                    const fly = setInterval(() => {
                        postitPos += (facingLeft ? -9 : 9);
                        postit.style.left = postitPos + 'px';
                        postit.style.bottom = (100 + Math.sin(postitPos * 0.08) * 20 + Math.random() * 10) + 'px';
                        if (postitPos < 0 || postitPos > 900) {
                            clearInterval(fly);
                            postit.remove();
                        }
                    }, 25);
                    setTimeout(() => { clearInterval(fly); postit.remove(); }, 1500);
                }, i * 80);
            }
            showSpecialText(arena, attackData.x, 'POST-ITS!', '#ffeb3b');
        } else if (special === 'paradigm') {
            // Paradigm shift - swirling business words
            const words = ['SYNERGY', 'PIVOT', 'DISRUPT', 'LEVERAGE', 'AGILE'];
            for (let i = 0; i < words.length; i++) {
                setTimeout(() => {
                    const word = document.createElement('div');
                    word.textContent = words[i];
                    word.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${120 + i * 15}px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        font-weight: bold;
                        color: #27ae60;
                        z-index: 155;
                    `;
                    arena.appendChild(word);

                    let wordPos = attackData.x;
                    const angle = (i / words.length) * Math.PI;
                    const fly = setInterval(() => {
                        wordPos += (facingLeft ? -6 : 6);
                        word.style.left = wordPos + 'px';
                        word.style.bottom = (120 + Math.sin(wordPos * 0.05 + angle) * 30) + 'px';
                        if (wordPos < 0 || wordPos > 900) {
                            clearInterval(fly);
                            word.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); word.remove(); }, 2000);
                }, i * 100);
            }
            showSpecialText(arena, attackData.x, 'PARADIGM SHIFT!', '#27ae60');
        } else {
            // Circle back - boomerang chart
            const chart = document.createElement('div');
            chart.textContent = '📊';
            chart.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 120px;
                font-size: 35px;
                z-index: 155;
            `;
            arena.appendChild(chart);

            let t = 0;
            const startX = attackData.x;
            const fly = setInterval(() => {
                t += 0.1;
                const x = startX + (facingLeft ? -1 : 1) * Math.sin(t) * 100;
                const y = 120 + Math.cos(t * 2) * 30;
                chart.style.left = x + 'px';
                chart.style.bottom = y + 'px';
                chart.style.transform = `rotate(${t * 100}deg)`;
                if (t > Math.PI * 2) {
                    clearInterval(fly);
                    chart.remove();
                }
            }, 30);
            showSpecialText(arena, attackData.x, 'CIRCLE BACK!', '#27ae60');
        }
    }

    // LUCAS - Soccer star
    function executeLucasNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['bicycle', 'cat', 'goal'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'bicycle') {
            // Bicycle kick - spinning soccer ball
            const ball = document.createElement('div');
            ball.textContent = '⚽';
            ball.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 150px;
                font-size: 35px;
                z-index: 155;
            `;
            arena.appendChild(ball);

            // Kick animation on fighter
            if (fighter) fighter.classList.add('kicking');
            setTimeout(() => { if (fighter) fighter.classList.remove('kicking'); }, 400);

            let ballPos = attackData.x;
            let ballY = 150;
            let velY = 8;
            const fly = setInterval(() => {
                ballPos += (facingLeft ? -12 : 12);
                velY -= 0.5;
                ballY += velY;
                ball.style.left = ballPos + 'px';
                ball.style.bottom = Math.max(60, ballY) + 'px';
                ball.style.transform = `rotate(${(ballPos - attackData.x) * 5}deg)`;
                if (ballPos < 0 || ballPos > 900 || ballY < 60) {
                    clearInterval(fly);
                    ball.remove();
                }
            }, 25);
            setTimeout(() => { clearInterval(fly); ball.remove(); }, 2000);
            showSpecialText(arena, attackData.x, 'BICYCLE KICK!', '#9b59b6');
        } else if (special === 'cat') {
            // Cat throw
            const cat = document.createElement('div');
            cat.textContent = '🐱';
            cat.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 120px;
                font-size: 30px;
                z-index: 155;
            `;
            arena.appendChild(cat);

            let catPos = attackData.x;
            const fly = setInterval(() => {
                catPos += (facingLeft ? -7 : 7);
                cat.style.left = catPos + 'px';
                cat.style.bottom = (120 + Math.sin(catPos * 0.1) * 20) + 'px';
                cat.style.transform = `rotate(${Math.sin(catPos * 0.2) * 20}deg)`;
                if (catPos < 0 || catPos > 900) {
                    clearInterval(fly);
                    cat.remove();
                }
            }, 30);
            setTimeout(() => { clearInterval(fly); cat.remove(); }, 2000);
            showSpecialText(arena, attackData.x, 'CAT ATTACK!', '#f39c12');
        } else {
            // Goal celebration - multiple balls
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const ball = document.createElement('div');
                    ball.textContent = '⚽';
                    ball.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${100 + i * 30}px;
                        font-size: 25px;
                        z-index: 155;
                    `;
                    arena.appendChild(ball);

                    let ballPos = attackData.x;
                    const fly = setInterval(() => {
                        ballPos += (facingLeft ? -10 : 10);
                        ball.style.left = ballPos + 'px';
                        ball.style.transform = `rotate(${(ballPos - attackData.x) * 4}deg)`;
                        if (ballPos < 0 || ballPos > 900) {
                            clearInterval(fly);
                            ball.remove();
                        }
                    }, 25);
                    setTimeout(() => { clearInterval(fly); ball.remove(); }, 1500);
                }, i * 150);
            }
            showSpecialText(arena, attackData.x, 'HAT TRICK!', '#9b59b6');
        }
    }

    // VICKY - Aerial silk queen
    function executeVickyNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['silk', 'christmas', 'ribbon'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'silk') {
            // Silk wrap attack
            const silk = document.createElement('div');
            silk.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 100px;
                width: 8px;
                height: 80px;
                background: linear-gradient(180deg, #c41e3a, #ff69b4, #c41e3a);
                z-index: 155;
                transform-origin: top center;
                animation: silkSwing 0.8s ease-in-out;
            `;
            arena.appendChild(silk);
            setTimeout(() => silk.remove(), 1000);
            showSpecialText(arena, attackData.x, 'SILK WRAP!', '#c41e3a');
        } else if (special === 'christmas') {
            // Christmas spirit - ornaments and stars
            const items = ['⭐', '🎄', '❄️', '🎁', '✨'];
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const item = document.createElement('div');
                    item.textContent = items[i % items.length];
                    item.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${100 + i * 20}px;
                        font-size: 24px;
                        z-index: 155;
                    `;
                    arena.appendChild(item);

                    let itemPos = attackData.x;
                    const fly = setInterval(() => {
                        itemPos += (facingLeft ? -7 : 7);
                        item.style.left = itemPos + 'px';
                        item.style.bottom = (100 + i * 20 + Math.sin(itemPos * 0.1) * 15) + 'px';
                        if (itemPos < 0 || itemPos > 900) {
                            clearInterval(fly);
                            item.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); item.remove(); }, 1500);
                }, i * 100);
            }
            showSpecialText(arena, attackData.x, 'CHRISTMAS SPIRIT!', '#c41e3a');
        } else {
            // Ribbon dance
            const ribbon = document.createElement('div');
            ribbon.textContent = '🎀';
            ribbon.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 120px;
                font-size: 35px;
                z-index: 155;
            `;
            arena.appendChild(ribbon);

            let t = 0;
            const startX = attackData.x;
            const fly = setInterval(() => {
                t += 0.15;
                ribbon.style.left = (startX + (facingLeft ? -1 : 1) * t * 30) + 'px';
                ribbon.style.bottom = (120 + Math.sin(t * 3) * 40) + 'px';
                ribbon.style.transform = `rotate(${t * 100}deg)`;
                if (t > 5) {
                    clearInterval(fly);
                    ribbon.remove();
                }
            }, 30);
            showSpecialText(arena, attackData.x, 'RIBBON DANCE!', '#ff69b4');
        }
    }

    // JONAS L - Coffee-powered bassist
    function executeJonasLNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['coffee', 'bass', 'note'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'coffee') {
            // Hot coffee throw
            const coffee = document.createElement('div');
            coffee.textContent = '☕';
            coffee.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 120px;
                font-size: 35px;
                z-index: 155;
            `;
            arena.appendChild(coffee);

            let coffeePos = attackData.x;
            const fly = setInterval(() => {
                coffeePos += (facingLeft ? -10 : 10);
                coffee.style.left = coffeePos + 'px';
                coffee.style.transform = `rotate(${(coffeePos - attackData.x) * 2}deg)`;

                // Coffee splash trail
                if (Math.random() > 0.7) {
                    const splash = document.createElement('div');
                    splash.textContent = '💦';
                    splash.style.cssText = `
                        position: absolute;
                        left: ${coffeePos}px;
                        bottom: 110px;
                        font-size: 12px;
                        opacity: 0.7;
                        z-index: 154;
                    `;
                    arena.appendChild(splash);
                    setTimeout(() => splash.remove(), 300);
                }

                if (coffeePos < 0 || coffeePos > 900) {
                    clearInterval(fly);
                    coffee.remove();
                }
            }, 25);
            setTimeout(() => { clearInterval(fly); coffee.remove(); }, 2000);
            showSpecialText(arena, attackData.x, 'HOT COFFEE!', '#8b4513');
        } else if (special === 'bass') {
            // Bass swing - sound waves
            const waves = ['♪', '♫', '♬', '🎵', '🎶'];
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const wave = document.createElement('div');
                    wave.textContent = waves[i % waves.length];
                    wave.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${100 + i * 15}px;
                        font-size: ${20 + i * 3}px;
                        color: #8b4513;
                        z-index: 155;
                    `;
                    arena.appendChild(wave);

                    let wavePos = attackData.x;
                    const fly = setInterval(() => {
                        wavePos += (facingLeft ? -8 : 8);
                        wave.style.left = wavePos + 'px';
                        wave.style.opacity = Math.max(0, 1 - Math.abs(wavePos - attackData.x) / 300);
                        if (wavePos < 0 || wavePos > 900) {
                            clearInterval(fly);
                            wave.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); wave.remove(); }, 1500);
                }, i * 80);
            }
            showSpecialText(arena, attackData.x, 'BASS SLAP!', '#8b4513');
        } else {
            // Musical note barrage
            const notes = ['🎸', '🎵', '🎶'];
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const note = document.createElement('div');
                    note.textContent = notes[Math.floor(Math.random() * notes.length)];
                    note.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${110 + Math.random() * 40}px;
                        font-size: 28px;
                        z-index: 155;
                    `;
                    arena.appendChild(note);

                    let notePos = attackData.x;
                    const fly = setInterval(() => {
                        notePos += (facingLeft ? -9 : 9);
                        note.style.left = notePos + 'px';
                        note.style.bottom = (110 + Math.sin(notePos * 0.1) * 25) + 'px';
                        if (notePos < 0 || notePos > 900) {
                            clearInterval(fly);
                            note.remove();
                        }
                    }, 25);
                    setTimeout(() => { clearInterval(fly); note.remove(); }, 1500);
                }, i * 100);
            }
            showSpecialText(arena, attackData.x, 'BASS SOLO!', '#8b4513');
        }
    }

    // FRANK - Dr. Frank-N-Furter
    function executeFrankNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['timewarp', 'lab', 'sparkle'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'timewarp') {
            // Time Warp - disco effects
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const sparkle = document.createElement('div');
                    sparkle.textContent = '✨';
                    sparkle.style.cssText = `
                        position: absolute;
                        left: ${attackData.x + (Math.random() - 0.5) * 100}px;
                        bottom: ${80 + Math.random() * 80}px;
                        font-size: ${15 + Math.random() * 15}px;
                        z-index: 155;
                        animation: sparkleFlash 0.5s ease-out forwards;
                    `;
                    arena.appendChild(sparkle);
                    setTimeout(() => sparkle.remove(), 500);
                }, i * 60);
            }

            // Jump text
            const jump = document.createElement('div');
            jump.textContent = "IT'S JUST A JUMP TO THE LEFT!";
            jump.style.cssText = `
                position: absolute;
                left: ${attackData.x - 80}px;
                bottom: 180px;
                font-family: 'Finger Paint', cursive;
                font-size: 14px;
                color: #9b59b6;
                text-shadow: 1px 1px 0 #000;
                z-index: 160;
                white-space: nowrap;
            `;
            arena.appendChild(jump);
            setTimeout(() => jump.remove(), 1000);
            showSpecialText(arena, attackData.x, 'TIME WARP!', '#9b59b6');
        } else if (special === 'lab') {
            // Lab experiment - bubbling flask
            const flask = document.createElement('div');
            flask.textContent = '🧪';
            flask.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 120px;
                font-size: 35px;
                z-index: 155;
            `;
            arena.appendChild(flask);

            let flaskPos = attackData.x;
            const fly = setInterval(() => {
                flaskPos += (facingLeft ? -8 : 8);
                flask.style.left = flaskPos + 'px';

                // Bubbles
                if (Math.random() > 0.6) {
                    const bubble = document.createElement('div');
                    bubble.style.cssText = `
                        position: absolute;
                        left: ${flaskPos + Math.random() * 20}px;
                        bottom: 130px;
                        width: ${5 + Math.random() * 8}px;
                        height: ${5 + Math.random() * 8}px;
                        background: rgba(155, 89, 182, 0.6);
                        border-radius: 50%;
                        z-index: 154;
                    `;
                    arena.appendChild(bubble);
                    setTimeout(() => bubble.remove(), 400);
                }

                if (flaskPos < 0 || flaskPos > 900) {
                    clearInterval(fly);
                    flask.remove();
                }
            }, 30);
            setTimeout(() => { clearInterval(fly); flask.remove(); }, 2000);
            showSpecialText(arena, attackData.x, 'EXPERIMENT!', '#9b59b6');
        } else {
            // Sparkle attack - glitter bomb
            for (let i = 0; i < 12; i++) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '💎';
                sparkle.style.cssText = `
                    position: absolute;
                    left: ${attackData.x}px;
                    bottom: 120px;
                    font-size: 18px;
                    z-index: 155;
                `;
                arena.appendChild(sparkle);

                const angle = (i / 12) * Math.PI * 2;
                const speed = 5 + Math.random() * 3;
                let t = 0;
                const fly = setInterval(() => {
                    t += 1;
                    sparkle.style.left = (attackData.x + Math.cos(angle) * t * speed) + 'px';
                    sparkle.style.bottom = (120 + Math.sin(angle) * t * speed) + 'px';
                    sparkle.style.opacity = Math.max(0, 1 - t / 30);
                    if (t > 30) {
                        clearInterval(fly);
                        sparkle.remove();
                    }
                }, 30);
            }
            showSpecialText(arena, attackData.x, 'GLITTER BOMB!', '#e91e63');
        }
    }

    // CHARLY - The Biker
    function executeCharlyNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['motorcycle', 'excel', 'wheelie'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'motorcycle') {
            // Motorcycle charge
            const bike = document.createElement('div');
            bike.textContent = '🏍️';
            bike.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 80px;
                font-size: 45px;
                z-index: 155;
                transform: scaleX(${facingLeft ? 1 : -1});
            `;
            arena.appendChild(bike);

            let bikePos = attackData.x;
            const fly = setInterval(() => {
                bikePos += (facingLeft ? -15 : 15);
                bike.style.left = bikePos + 'px';

                // Tire smoke
                const smoke = document.createElement('div');
                smoke.style.cssText = `
                    position: absolute;
                    left: ${bikePos + (facingLeft ? 30 : -10)}px;
                    bottom: 70px;
                    width: 15px; height: 15px;
                    background: rgba(100,100,100,0.5);
                    border-radius: 50%;
                    z-index: 154;
                `;
                arena.appendChild(smoke);
                setTimeout(() => smoke.remove(), 300);

                if (bikePos < -50 || bikePos > 950) {
                    clearInterval(fly);
                    bike.remove();
                }
            }, 25);
            setTimeout(() => { clearInterval(fly); bike.remove(); }, 1500);
            showSpecialText(arena, attackData.x, 'MOTORCYCLE!', '#c0392b');
        } else if (special === 'excel') {
            // Excel spreadsheet attack
            const cells = ['A1', 'B2', 'C3', '=SUM()', 'VLOOKUP', '#REF!'];
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const cell = document.createElement('div');
                    cell.textContent = cells[Math.floor(Math.random() * cells.length)];
                    cell.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${100 + i * 18}px;
                        padding: 2px 5px;
                        background: #fff;
                        border: 1px solid #333;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        z-index: 155;
                    `;
                    arena.appendChild(cell);

                    let cellPos = attackData.x;
                    const fly = setInterval(() => {
                        cellPos += (facingLeft ? -8 : 8);
                        cell.style.left = cellPos + 'px';
                        if (cellPos < 0 || cellPos > 900) {
                            clearInterval(fly);
                            cell.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); cell.remove(); }, 1500);
                }, i * 80);
            }
            showSpecialText(arena, attackData.x, 'SPREADSHEET!', '#217346');
        } else {
            // Wheelie
            const wheel = document.createElement('div');
            wheel.textContent = '🛞';
            wheel.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 100px;
                font-size: 40px;
                z-index: 155;
            `;
            arena.appendChild(wheel);

            let wheelPos = attackData.x;
            const fly = setInterval(() => {
                wheelPos += (facingLeft ? -12 : 12);
                wheel.style.left = wheelPos + 'px';
                wheel.style.transform = `rotate(${(wheelPos - attackData.x) * 5}deg)`;
                if (wheelPos < 0 || wheelPos > 900) {
                    clearInterval(fly);
                    wheel.remove();
                }
            }, 25);
            setTimeout(() => { clearInterval(fly); wheel.remove(); }, 1500);
            showSpecialText(arena, attackData.x, 'WHEELIE!', '#c0392b');
        }
    }

    // AUDREY II - Man-eating plant
    function executeAudreyNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['vine', 'bite', 'feed'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'vine') {
            // Vine grab - extending vines
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const vine = document.createElement('div');
                    vine.style.cssText = `
                        position: absolute;
                        left: ${attackData.x + (facingLeft ? -10 : 40)}px;
                        bottom: ${90 + i * 25}px;
                        width: 0;
                        height: 8px;
                        background: linear-gradient(90deg, #228b22, #32cd32);
                        border-radius: 4px;
                        z-index: 155;
                        transition: width 0.3s ease-out;
                    `;
                    arena.appendChild(vine);

                    setTimeout(() => {
                        vine.style.width = '150px';
                        if (facingLeft) vine.style.transform = 'scaleX(-1)';
                    }, 50);

                    setTimeout(() => vine.remove(), 800);
                }, i * 100);
            }
            showSpecialText(arena, attackData.x, 'VINE GRAB!', '#228b22');
        } else if (special === 'bite') {
            // Chomping teeth
            const teeth = document.createElement('div');
            teeth.innerHTML = '🦷🦷';
            teeth.style.cssText = `
                position: absolute;
                left: ${attackData.x + (facingLeft ? -40 : 40)}px;
                bottom: 120px;
                font-size: 30px;
                z-index: 155;
                animation: chomp 0.3s ease-in-out infinite;
            `;
            arena.appendChild(teeth);

            let teethPos = attackData.x + (facingLeft ? -40 : 40);
            const fly = setInterval(() => {
                teethPos += (facingLeft ? -10 : 10);
                teeth.style.left = teethPos + 'px';
                if (teethPos < 0 || teethPos > 900) {
                    clearInterval(fly);
                    teeth.remove();
                }
            }, 30);
            setTimeout(() => { clearInterval(fly); teeth.remove(); }, 1500);
            showSpecialText(arena, attackData.x, 'CHOMP!', '#228b22');
        } else {
            // Feed me - mouth opens
            const mouth = document.createElement('div');
            mouth.textContent = '👄';
            mouth.style.cssText = `
                position: absolute;
                left: ${attackData.x}px;
                bottom: 140px;
                font-size: 50px;
                z-index: 155;
                animation: mouthOpen 0.5s ease-in-out infinite;
            `;
            arena.appendChild(mouth);

            const feedText = document.createElement('div');
            feedText.textContent = 'FEED ME!';
            feedText.style.cssText = `
                position: absolute;
                left: ${attackData.x - 20}px;
                bottom: 200px;
                font-family: 'Finger Paint', cursive;
                font-size: 20px;
                color: #228b22;
                text-shadow: 2px 2px 0 #000;
                z-index: 160;
            `;
            arena.appendChild(feedText);

            setTimeout(() => { mouth.remove(); feedText.remove(); }, 1200);
            showSpecialText(arena, attackData.x, 'FEED ME SEYMOUR!', '#228b22');
        }
    }

    // PANCHO - Tech Superman
    function executePanchoNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['laser', 'freeze', 'fly'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'laser') {
            // Heat vision - red laser beams
            for (let i = 0; i < 2; i++) {
                const laser = document.createElement('div');
                laser.style.cssText = `
                    position: absolute;
                    left: ${attackData.x + (facingLeft ? -200 : 40)}px;
                    bottom: ${145 + i * 8}px;
                    width: 200px;
                    height: 4px;
                    background: linear-gradient(${facingLeft ? '270deg' : '90deg'}, #ff0000, #ff6600, transparent);
                    z-index: 155;
                    box-shadow: 0 0 10px #ff0000;
                `;
                arena.appendChild(laser);
                setTimeout(() => laser.remove(), 500);
            }
            showSpecialText(arena, attackData.x, 'HEAT VISION!', '#ff0000');
        } else if (special === 'freeze') {
            // Freeze breath - ice particles
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const ice = document.createElement('div');
                    ice.textContent = '❄️';
                    ice.style.cssText = `
                        position: absolute;
                        left: ${attackData.x + (facingLeft ? -20 : 40)}px;
                        bottom: ${100 + Math.random() * 50}px;
                        font-size: ${12 + Math.random() * 12}px;
                        z-index: 155;
                        opacity: 0.8;
                    `;
                    arena.appendChild(ice);

                    let icePos = attackData.x + (facingLeft ? -20 : 40);
                    const fly = setInterval(() => {
                        icePos += (facingLeft ? -8 : 8);
                        ice.style.left = icePos + 'px';
                        ice.style.opacity = Math.max(0, 0.8 - Math.abs(icePos - attackData.x) / 200);
                        if (icePos < 0 || icePos > 900) {
                            clearInterval(fly);
                            ice.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); ice.remove(); }, 1000);
                }, i * 50);
            }
            showSpecialText(arena, attackData.x, 'FREEZE BREATH!', '#00bfff');
        } else {
            // Flying punch
            if (fighter) {
                fighter.style.transition = 'transform 0.3s, left 0.3s';
                fighter.style.transform = 'translateY(-50px) rotate(-10deg)';
                setTimeout(() => {
                    fighter.style.transform = '';
                }, 500);
            }

            // Cape swoosh
            const cape = document.createElement('div');
            cape.style.cssText = `
                position: absolute;
                left: ${attackData.x - 20}px;
                bottom: 80px;
                width: 40px;
                height: 60px;
                background: linear-gradient(180deg, #dc2626, #ef4444);
                clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%);
                z-index: 154;
                animation: capeFlutter 0.5s ease-out;
            `;
            arena.appendChild(cape);
            setTimeout(() => cape.remove(), 600);
            showSpecialText(arena, attackData.x, 'SUPER PUNCH!', '#2563eb');
        }
    }

    // MADONNA - Pop Queen
    function executeMadonnaNPCSpecial(attackData, arena, facingLeft, fighter) {
        const specials = ['vogue', 'kiss', 'mic'];
        const special = specials[Math.floor(Math.random() * specials.length)];

        if (special === 'vogue') {
            // Vogue strike - pose with sparkles
            if (fighter) {
                fighter.style.transition = 'transform 0.2s';
                fighter.style.transform = 'rotate(5deg) scale(1.05)';
                setTimeout(() => fighter.style.transform = '', 500);
            }

            // Sparkle burst
            for (let i = 0; i < 8; i++) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.cssText = `
                    position: absolute;
                    left: ${attackData.x + (Math.random() - 0.5) * 80}px;
                    bottom: ${100 + Math.random() * 60}px;
                    font-size: ${15 + Math.random() * 15}px;
                    z-index: 155;
                    animation: sparkleFlash 0.6s ease-out forwards;
                `;
                arena.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 600);
            }
            showSpecialText(arena, attackData.x, 'VOGUE!', '#e91e8c');
        } else if (special === 'kiss') {
            // Blow kisses
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const kiss = document.createElement('div');
                    kiss.textContent = '💋';
                    kiss.style.cssText = `
                        position: absolute;
                        left: ${attackData.x}px;
                        bottom: ${120 + i * 10}px;
                        font-size: 25px;
                        z-index: 155;
                    `;
                    arena.appendChild(kiss);

                    let kissPos = attackData.x;
                    const fly = setInterval(() => {
                        kissPos += (facingLeft ? -8 : 8);
                        kiss.style.left = kissPos + 'px';
                        kiss.style.bottom = (120 + i * 10 + Math.sin(kissPos * 0.1) * 15) + 'px';
                        if (kissPos < 0 || kissPos > 900) {
                            clearInterval(fly);
                            kiss.remove();
                        }
                    }, 30);
                    setTimeout(() => { clearInterval(fly); kiss.remove(); }, 1500);
                }, i * 100);
            }
            showSpecialText(arena, attackData.x, 'BLOW KISS!', '#e91e8c');
        } else {
            // Mic drop
            const mic = document.createElement('div');
            mic.textContent = '🎤';
            mic.style.cssText = `
                position: absolute;
                left: ${attackData.x + 20}px;
                bottom: 150px;
                font-size: 30px;
                z-index: 155;
            `;
            arena.appendChild(mic);

            // Drop animation
            let micY = 150;
            const drop = setInterval(() => {
                micY -= 8;
                mic.style.bottom = micY + 'px';
                mic.style.transform = `rotate(${(150 - micY) * 3}deg)`;
                if (micY < 70) {
                    clearInterval(drop);
                    // Impact effect
                    const impact = document.createElement('div');
                    impact.textContent = '💥';
                    impact.style.cssText = `
                        position: absolute;
                        left: ${attackData.x + 15}px;
                        bottom: 60px;
                        font-size: 35px;
                        z-index: 155;
                    `;
                    arena.appendChild(impact);
                    setTimeout(() => { mic.remove(); impact.remove(); }, 300);
                }
            }, 30);
            showSpecialText(arena, attackData.x, 'MIC DROP!', '#e91e8c');
        }
    }

    // Helper function to show special attack text
    function showSpecialText(arena, x, text, color) {
        const textEl = document.createElement('div');
        textEl.textContent = text;
        textEl.style.cssText = `
            position: absolute;
            left: ${x - 40}px;
            bottom: 200px;
            font-family: 'Finger Paint', cursive;
            font-size: 18px;
            color: ${color};
            text-shadow: 2px 2px 0 #000;
            z-index: 200;
            animation: hitTextPop 0.8s ease-out forwards;
            white-space: nowrap;
        `;
        arena.appendChild(textEl);
        setTimeout(() => textEl.remove(), 800);
    }

    // Fallback generic projectile
    function launchGenericProjectile(attackData, arena, facingLeft) {
        const projectile = document.createElement('div');
        const startX = attackData.x + (facingLeft ? -20 : 60);
        const direction = facingLeft ? -1 : 1;
        const projectileStyles = {
            billy: { emoji: '📐', color: '#3498db', trail: '✨' },
            pato: { emoji: '₿', color: '#f7931a', trail: '💰' },
            jonas: { emoji: '📊', color: '#27ae60', trail: '📈' },
            madonna: { emoji: '💋', color: '#e91e8c', trail: '💕' },
            frank: { emoji: '🔬', color: '#9b59b6', trail: '⚡' },
            vicky: { emoji: '🎀', color: '#c41e3a', trail: '✨' },
            charly: { emoji: '📈', color: '#c0392b', trail: '💼' },
            audrey: { emoji: '🌿', color: '#228b22', trail: '🌱' },
            pancho: { emoji: '💪', color: '#2563eb', trail: '⭐' },
            jonasl: { emoji: '☕', color: '#8b4513', trail: '🎸' },
            lucas: { emoji: '⚽', color: '#9b59b6', trail: '🐱' },
            timo: { emoji: '🏳️', color: '#888', trail: '👶' },
            default: { emoji: '💥', color: '#e74c3c', trail: '✦' }
        };

        const style = projectileStyles[charId] || projectileStyles.default;

        projectile.textContent = style.emoji;
        projectile.style.cssText = `
            position: absolute;
            left: ${startX}px;
            bottom: 120px;
            font-size: 28px;
            z-index: 160;
            filter: drop-shadow(0 0 8px ${style.color});
            transition: none;
            pointer-events: none;
        `;
        arena.appendChild(projectile);

        let currentX = startX;
        const speed = 8;
        const damage = attackData.damage;
        let hasHit = false;

        const flyInterval = setInterval(() => {
            // Move toward player
            currentX += direction * speed;
            projectile.style.left = currentX + 'px';

            // Add slight wobble
            projectile.style.bottom = (120 + Math.sin(currentX * 0.1) * 5) + 'px';

            // Add trail effect
            if (Math.random() > 0.6) {
                const trail = document.createElement('div');
                trail.textContent = style.trail;
                trail.style.cssText = `
                    position: absolute;
                    left: ${currentX + (facingLeft ? 20 : -20)}px;
                    bottom: ${120 + Math.sin(currentX * 0.1) * 5}px;
                    font-size: 14px;
                    opacity: 0.7;
                    z-index: 155;
                    pointer-events: none;
                `;
                arena.appendChild(trail);
                setTimeout(() => trail.remove(), 200);
            }

            // Check hit with player
            const playerX = game.playerX || 100;
            const distance = Math.abs(currentX - playerX);

            if (distance < 50 && !hasHit) {
                hasHit = true;
                clearInterval(flyInterval);

                // Deal damage
                game.playerHealth = Math.max(0, game.playerHealth - damage);
                updateTournamentUI();

                // Show impact
                const impact = document.createElement('div');
                impact.textContent = 'SPECIAL HIT!';
                impact.style.cssText = `
                    position: absolute;
                    left: ${currentX}px;
                    bottom: 150px;
                    font-family: 'Finger Paint', cursive;
                    font-size: 22px;
                    color: ${style.color};
                    text-shadow: 2px 2px 0 #000;
                    z-index: 200;
                    animation: hitTextPop 0.5s ease-out forwards;
                `;
                arena.appendChild(impact);
                setTimeout(() => impact.remove(), 500);

                // Hit effect on player
                const fighter = document.getElementById('player-fighter');
                if (fighter) {
                    fighter.classList.add('hit');
                    setTimeout(() => fighter.classList.remove('hit'), 300);
                }

                showDamageNumber(playerX + 25, 100, damage);

                projectile.remove();

                if (game.playerHealth <= 0) {
                    endRound(false);
                }
            }

            // Remove if off screen
            if (currentX < -50 || currentX > 900) {
                clearInterval(flyInterval);
                projectile.remove();
            }
        }, 25);
    }

    // Override the dealDamage function to track tournament
    function hookDealDamage() {
        if (typeof window.dealDamage === 'function') {
            originalDealDamage = window.dealDamage;

            window.dealDamage = function(amount, text = 'HIT!') {
                if (!tournamentGame.active) {
                    return originalDealDamage(amount, text);
                }

                // Apply damage to opponent
                const remainingHealth = OpponentAI.takeDamage(amount);
                game.dummyHealth = remainingHealth;

                // Build player energy
                game.playerEnergy = Math.min(100, game.playerEnergy + 10);

                updateTournamentUI();

                // Show effects
                const dummy = document.getElementById('opponent-fighter') || document.getElementById('npc-dummy');
                if (dummy) {
                    dummy.classList.add('hit');
                    setTimeout(() => dummy.classList.remove('hit'), 300);
                }

                showDamageNumber(game.dummyX + 25, 100, amount);
                showHitText(text);

                // Check if opponent defeated
                if (OpponentAI.isDefeated()) {
                    endRound(true);
                }
            };
        }
    }

    // Show damage number floating up
    function showDamageNumber(x, y, amount) {
        const arena = document.getElementById('arena');
        if (!arena) return;

        const dmg = document.createElement('div');
        dmg.className = 'damage-number';
        dmg.textContent = '-' + amount;
        dmg.style.left = x + 'px';
        dmg.style.bottom = y + 'px';
        arena.appendChild(dmg);

        setTimeout(() => dmg.remove(), 600);
    }

    // Show hit text
    function showHitText(text) {
        const arena = document.getElementById('arena');
        if (!arena) return;

        const hit = document.createElement('div');
        hit.className = 'hit-text impact-effect';
        hit.textContent = text;
        hit.style.left = (game.dummyX + 25) + 'px';
        hit.style.bottom = '150px';
        arena.appendChild(hit);

        setTimeout(() => hit.remove(), 400);
    }

    // Update tournament UI (health bars, etc.)
    function updateTournamentUI() {
        // Player health
        const playerHealth = document.getElementById('player-health');
        if (playerHealth) {
            playerHealth.style.width = game.playerHealth + '%';
            if (game.playerHealth < 30) {
                playerHealth.classList.add('low');
            } else {
                playerHealth.classList.remove('low');
            }
        }

        // Player energy
        const playerEnergy = document.getElementById('player-energy');
        if (playerEnergy) {
            playerEnergy.style.width = game.playerEnergy + '%';
        }

        // Opponent health
        const opponentHealth = document.getElementById('dummy-health') || document.getElementById('opponent-health');
        if (opponentHealth) {
            const healthPercent = OpponentAI.getHealthPercent();
            opponentHealth.style.width = healthPercent + '%';
            if (healthPercent < 30) {
                opponentHealth.classList.add('low');
            } else {
                opponentHealth.classList.remove('low');
            }
        }

        // Update round indicator
        updateRoundIndicator();
    }

    // Update round indicator dots
    function updateRoundIndicator() {
        const indicator = document.getElementById('round-indicator');
        if (!indicator) return;

        let html = '';
        for (let i = 0; i < 3; i++) {
            let classes = 'round-pip';
            if (i < Tournament.state.playerWins) {
                classes += ' player';
            } else if (i < Tournament.state.opponentWins + Tournament.state.playerWins) {
                // This logic needs adjustment for proper display
            }
            html += `<div class="${classes}"></div>`;
        }
        indicator.innerHTML = html;
    }

    // End the current round
    function endRound(playerWon) {
        tournamentGame.active = false;

        if (tournamentGame.aiUpdateInterval) {
            clearInterval(tournamentGame.aiUpdateInterval);
        }

        Tournament.recordRoundWin(playerWon);

        if (Tournament.isMatchComplete()) {
            endMatch();
        } else {
            showRoundResult(playerWon);
        }
    }

    // Show round result overlay
    function showRoundResult(playerWon) {
        const overlay = document.getElementById('round-result-overlay');
        if (!overlay) {
            // Fallback - just continue
            setTimeout(() => continueToNextRound(), 1500);
            return;
        }

        overlay.innerHTML = `
            <div class="round-result-text ${playerWon ? 'win' : 'lose'}">
                ${playerWon ? 'ROUND WIN!' : 'ROUND LOST!'}
            </div>
            <div class="score-display">${Tournament.getScoreDisplay()}</div>
            <div class="round-indicator" id="round-dots"></div>
            <button class="continue-btn" onclick="continueToNextRound()">NEXT ROUND</button>
        `;

        // Add round dots
        const dots = overlay.querySelector('#round-dots');
        for (let i = 0; i < Tournament.state.playerWins; i++) {
            dots.innerHTML += '<div class="round-dot player-win"></div>';
        }
        for (let i = 0; i < Tournament.state.opponentWins; i++) {
            dots.innerHTML += '<div class="round-dot opponent-win"></div>';
        }

        overlay.classList.add('show');
    }

    // Continue to next round
    window.continueToNextRound = function() {
        const overlay = document.getElementById('round-result-overlay');
        if (overlay) overlay.classList.remove('show');

        const opponent = Tournament.getCurrentOpponent();
        const stats = Tournament.getOpponentStats(opponent);

        // Reset for new round
        OpponentAI.reset(opponent, stats);
        game.playerHealth = 100;
        game.playerEnergy = 0;
        game.dummyHealth = stats.hp;

        tournamentGame.active = true;
        updateTournamentUI();
        startOpponentAILoop();
    };

    // End the match
    function endMatch() {
        const playerWon = Tournament.didPlayerWinMatch();

        if (playerWon) {
            const hasNextOpponent = Tournament.advanceToNextOpponent();
            if (!hasNextOpponent) {
                if (Tournament.state.hasWonTournament) {
                    showVictoryScreen();
                }
            } else {
                showMatchVictory();
            }
        } else {
            showGameOverScreen();
        }
    }

    // Show match victory
    function showMatchVictory() {
        const overlay = document.getElementById('round-result-overlay');
        if (!overlay) return;

        const nextOpponent = Tournament.getCurrentOpponent();

        overlay.innerHTML = `
            <div class="round-result-text win">MATCH WON!</div>
            <div class="score-display">Next challenger: ${nextOpponent.name}</div>
            <button class="continue-btn" onclick="returnToLadder()">CONTINUE</button>
        `;

        overlay.classList.add('show');
    }

    // Return to ladder screen
    window.returnToLadder = function() {
        const overlay = document.getElementById('round-result-overlay');
        if (overlay) overlay.classList.remove('show');

        document.getElementById('game-arena').style.display = 'none';
        document.getElementById('tournament-ladder').style.display = 'flex';

        renderLadderScreen();
    };

    // Skip to next boss (cheat/debug function)
    window.skipToNextBoss = function() {
        // Stop current AI
        if (tournamentGame.aiUpdateInterval) {
            clearInterval(tournamentGame.aiUpdateInterval);
        }
        tournamentGame.active = false;

        // Advance to next opponent
        Tournament.state.playerWins = 2;
        Tournament.state.opponentWins = 0;
        const hasNext = Tournament.advanceToNextOpponent();

        if (hasNext) {
            // Start next fight immediately
            const nextOpponent = Tournament.getCurrentOpponent();
            const nextStats = Tournament.getOpponentStats(nextOpponent);

            // Reset player state
            game.playerHealth = 100;
            game.playerEnergy = 0;
            game.playerX = 100;

            // Show quick transition
            const arena = document.getElementById('arena');
            const skipText = document.createElement('div');
            skipText.textContent = `SKIPPING TO: ${nextOpponent.name}`;
            skipText.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Finger Paint', cursive;
                font-size: 32px;
                color: #fff;
                text-shadow: 3px 3px 0 #000;
                z-index: 500;
                animation: hitTextPop 0.5s ease-out forwards;
            `;
            arena.appendChild(skipText);

            setTimeout(() => {
                skipText.remove();
                startFight(nextOpponent, nextStats);
            }, 500);
        } else {
            // Tournament complete
            showVictoryScreen();
        }
    };

    // Show game over screen
    function showGameOverScreen() {
        const overlay = document.getElementById('game-over-screen');
        if (!overlay) return;

        const opponent = Tournament.getCurrentOpponent();

        overlay.innerHTML = `
            <div class="game-over-text">GAME OVER</div>
            <div class="defeated-by">Defeated by ${opponent.name}</div>
            <div class="progress-text">Made it to match ${Tournament.state.matchNumber} of ${Tournament.ladder.length}</div>
            <button class="continue-btn" onclick="restartTournament()">TRY AGAIN</button>
        `;

        overlay.classList.add('show');
    }

    // Show victory screen
    function showVictoryScreen() {
        const overlay = document.getElementById('victory-screen');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="champion-text">CHAMPION!</div>
            <div class="trophy">🏆</div>
            <div class="victory-message">
                <p>FEDE has defeated all challengers!</p>
                <p>Including the mighty BILLY!</p>
            </div>
            <div class="congrats-text">FAMILY FIGHTER CHAMPION</div>
            <button class="continue-btn" onclick="restartTournament()">PLAY AGAIN</button>
        `;

        overlay.classList.add('show');
    }

    // Restart tournament
    window.restartTournament = function() {
        // Hide overlays
        document.querySelectorAll('.show').forEach(el => el.classList.remove('show'));
        document.getElementById('game-arena').style.display = 'none';

        // Reset everything
        Tournament.init();
        Backgrounds.reset();

        // Show ladder
        document.getElementById('tournament-ladder').style.display = 'flex';
        renderLadderScreen();
    };

    // Hook into the game when DOM is ready
    function setupHooks() {
        hookDealDamage();
    }

    // Initialize when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupHooks();
            initTournamentMode();
        });
    } else {
        setupHooks();
        initTournamentMode();
    }

    // Export for debugging
    window.tournamentGame = tournamentGame;
    window.initTournamentMode = initTournamentMode;
    window.renderLadderScreen = renderLadderScreen;
})();
