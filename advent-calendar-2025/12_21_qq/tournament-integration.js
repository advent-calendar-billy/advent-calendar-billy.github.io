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

        tournamentGame.aiUpdateInterval = setInterval(() => {
            if (!tournamentGame.active) return;

            const aiResult = OpponentAI.update({
                playerX: game.playerX,
                playerHealth: game.playerHealth
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
        if (!tournamentGame.active) return;

        const playerX = game.playerX;
        const distance = Math.abs(attackData.x - playerX);

        // Hit detection
        if (distance < 85) {
            game.playerHealth = Math.max(0, game.playerHealth - attackData.damage);
            updateTournamentUI();

            // Show hit effect on player
            const fighter = document.getElementById('player-fighter');
            if (fighter) {
                fighter.classList.add('hit');
                setTimeout(() => fighter.classList.remove('hit'), 300);
            }

            // Show damage number
            showDamageNumber(playerX + 25, 100, attackData.damage);

            // Check if player lost
            if (game.playerHealth <= 0) {
                endRound(false);
            }
        }
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
