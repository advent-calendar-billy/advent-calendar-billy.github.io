/**
 * Tournament UI - Visual components for tournament flow
 *
 * Handles:
 * - Title screen with "FIGHT" button
 * - Tournament ladder view (opponent progression)
 * - VS screen (pre-fight)
 * - Round announcer ("ROUND 1... FIGHT!")
 * - Victory/defeat screens
 */

const TournamentUI = {
    // DOM element references
    elements: {
        container: null,
        titleScreen: null,
        ladderView: null,
        vsScreen: null,
        roundAnnouncer: null,
        victoryScreen: null,
        gameOverScreen: null
    },

    // Animation timing
    timing: {
        vsScreenDuration: 2500,
        roundAnnounceDuration: 2000,
        fightFlashDuration: 500,
        victoryDisplayDuration: 3000
    },

    // Initialize UI
    init(container) {
        this.elements.container = container || document.body;
        this.createOverlayContainer();
        console.log('[TournamentUI] Initialized');
        return this;
    },

    // Create the overlay container for all tournament UI
    createOverlayContainer() {
        const overlay = document.createElement('div');
        overlay.id = 'tournament-overlay';
        overlay.className = 'tournament-overlay';
        overlay.innerHTML = `
            <div id="title-screen" class="screen title-screen hidden">
                <div class="title-content">
                    <h1 class="game-title">FAMILY FIGHTER</h1>
                    <p class="game-subtitle">Tournament Edition</p>
                    <button id="start-fight-btn" class="fight-button">FIGHT</button>
                    <p class="controls-hint">Z: Punch | X: Kick | C: Jump | Arrows: Move</p>
                </div>
            </div>

            <div id="ladder-view" class="screen ladder-view hidden">
                <h2>TOURNAMENT LADDER</h2>
                <div id="ladder-opponents" class="ladder-opponents"></div>
                <button id="continue-btn" class="continue-button">CONTINUE</button>
            </div>

            <div id="vs-screen" class="screen vs-screen hidden">
                <div class="vs-fighter left">
                    <div class="fighter-portrait" id="player-portrait"></div>
                    <div class="fighter-name" id="player-name">FEDE</div>
                    <div class="fighter-title" id="player-title">The Traveler</div>
                </div>
                <div class="vs-text">VS</div>
                <div class="vs-fighter right">
                    <div class="fighter-portrait" id="opponent-portrait"></div>
                    <div class="fighter-name" id="opponent-name"></div>
                    <div class="fighter-title" id="opponent-title"></div>
                </div>
                <div class="match-info">
                    <span id="match-number">MATCH 1</span>
                </div>
            </div>

            <div id="round-announcer" class="screen round-announcer hidden">
                <div class="round-text" id="round-text">ROUND 1</div>
                <div class="fight-text" id="fight-text">FIGHT!</div>
            </div>

            <div id="round-end-screen" class="screen round-end-screen hidden">
                <div class="round-result" id="round-result">YOU WIN!</div>
                <div class="round-score" id="round-score">1 - 0</div>
            </div>

            <div id="match-end-screen" class="screen match-end-screen hidden">
                <div class="match-result" id="match-result">VICTORY!</div>
                <div class="match-message" id="match-message">You defeated TIMO!</div>
                <button id="next-match-btn" class="continue-button">NEXT OPPONENT</button>
            </div>

            <div id="victory-screen" class="screen victory-screen hidden">
                <div class="victory-content">
                    <h1 class="victory-title">CHAMPION!</h1>
                    <p class="victory-message">You defeated all challengers!</p>
                    <div class="victory-stats" id="victory-stats"></div>
                    <button id="play-again-btn" class="fight-button">PLAY AGAIN</button>
                </div>
            </div>

            <div id="game-over-screen" class="screen game-over-screen hidden">
                <div class="game-over-content">
                    <h1 class="game-over-title">GAME OVER</h1>
                    <p class="game-over-message" id="game-over-message">Defeated by TIMO</p>
                    <div class="game-over-progress" id="game-over-progress"></div>
                    <button id="retry-btn" class="fight-button">TRY AGAIN</button>
                </div>
            </div>
        `;

        this.elements.container.appendChild(overlay);

        // Cache references
        this.elements.overlay = overlay;
        this.elements.titleScreen = document.getElementById('title-screen');
        this.elements.ladderView = document.getElementById('ladder-view');
        this.elements.vsScreen = document.getElementById('vs-screen');
        this.elements.roundAnnouncer = document.getElementById('round-announcer');
        this.elements.roundEndScreen = document.getElementById('round-end-screen');
        this.elements.matchEndScreen = document.getElementById('match-end-screen');
        this.elements.victoryScreen = document.getElementById('victory-screen');
        this.elements.gameOverScreen = document.getElementById('game-over-screen');
    },

    // Hide all screens
    hideAll() {
        const screens = this.elements.overlay.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));
    },

    // Show specific screen with animation
    showScreen(screenId, data = {}) {
        this.hideAll();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('animate-in');
            setTimeout(() => screen.classList.remove('animate-in'), 500);
        }
    },

    // ==========================================
    // Title Screen
    // ==========================================

    showTitle(onStart) {
        this.showScreen('title-screen');

        const startBtn = document.getElementById('start-fight-btn');
        startBtn.onclick = () => {
            this.playSound('select');
            if (onStart) onStart();
        };
    },

    // ==========================================
    // Ladder View
    // ==========================================

    showLadder(ladderStatus, onContinue) {
        this.showScreen('ladder-view');

        const ladderContainer = document.getElementById('ladder-opponents');
        ladderContainer.innerHTML = '';

        // Build ladder from bottom to top (final boss at top)
        const reversedLadder = [...ladderStatus].reverse();

        reversedLadder.forEach((opponent, reverseIndex) => {
            const originalIndex = ladderStatus.length - 1 - reverseIndex;
            const opponentDiv = document.createElement('div');
            opponentDiv.className = 'ladder-opponent';

            if (opponent.defeated) {
                opponentDiv.classList.add('defeated');
            } else if (opponent.current) {
                opponentDiv.classList.add('current');
            } else if (!opponent.unlocked) {
                opponentDiv.classList.add('locked');
            }

            const isFinalBoss = originalIndex === ladderStatus.length - 1;

            opponentDiv.innerHTML = `
                <div class="opponent-rank">${originalIndex + 1}</div>
                <div class="opponent-info">
                    <span class="opponent-name">${opponent.unlocked ? opponent.name : '???'}</span>
                    <span class="opponent-title">${opponent.unlocked ? opponent.title : 'Unknown Challenger'}</span>
                </div>
                <div class="opponent-status">
                    ${opponent.defeated ? '<span class="status-icon defeated-icon">X</span>' : ''}
                    ${opponent.current ? '<span class="status-icon current-icon">></span>' : ''}
                    ${isFinalBoss ? '<span class="boss-crown">FINAL BOSS</span>' : ''}
                </div>
            `;

            ladderContainer.appendChild(opponentDiv);
        });

        const continueBtn = document.getElementById('continue-btn');
        continueBtn.onclick = () => {
            this.playSound('select');
            if (onContinue) onContinue();
        };
    },

    // ==========================================
    // VS Screen
    // ==========================================

    showVS(opponent, matchNumber = 1) {
        return new Promise((resolve) => {
            this.showScreen('vs-screen');

            // Update opponent info
            document.getElementById('opponent-name').textContent = opponent.name;
            document.getElementById('opponent-title').textContent = opponent.title;
            document.getElementById('match-number').textContent = `MATCH ${matchNumber}`;

            // Set portrait colors
            const playerPortrait = document.getElementById('player-portrait');
            const opponentPortrait = document.getElementById('opponent-portrait');

            playerPortrait.className = 'fighter-portrait fede';
            opponentPortrait.className = `fighter-portrait ${opponent.id}`;
            opponentPortrait.style.backgroundColor = opponent.color || '#666';

            this.playSound('vs');

            // Auto-advance after duration
            setTimeout(() => {
                this.hideAll();
                resolve();
            }, this.timing.vsScreenDuration);
        });
    },

    // ==========================================
    // Round Announcer
    // ==========================================

    announceRound(roundNumber) {
        return new Promise((resolve) => {
            this.showScreen('round-announcer');

            const roundText = document.getElementById('round-text');
            const fightText = document.getElementById('fight-text');

            roundText.textContent = `ROUND ${roundNumber}`;
            roundText.classList.remove('animate-round');
            fightText.classList.remove('animate-fight');

            // Force reflow
            void roundText.offsetWidth;

            roundText.classList.add('animate-round');

            this.playSound('round');

            setTimeout(() => {
                fightText.classList.add('animate-fight');
                this.playSound('fight');
            }, this.timing.roundAnnounceDuration - this.timing.fightFlashDuration);

            setTimeout(() => {
                this.hideAll();
                resolve();
            }, this.timing.roundAnnounceDuration);
        });
    },

    // ==========================================
    // Round End Screen
    // ==========================================

    showRoundEnd(playerWon, playerWins, opponentWins) {
        return new Promise((resolve) => {
            this.showScreen('round-end-screen');

            const resultText = document.getElementById('round-result');
            const scoreText = document.getElementById('round-score');

            resultText.textContent = playerWon ? 'YOU WIN!' : 'YOU LOSE!';
            resultText.className = `round-result ${playerWon ? 'win' : 'lose'}`;
            scoreText.textContent = `${playerWins} - ${opponentWins}`;

            this.playSound(playerWon ? 'win' : 'lose');

            setTimeout(() => {
                this.hideAll();
                resolve();
            }, 1500);
        });
    },

    // ==========================================
    // Match End Screen
    // ==========================================

    showMatchEnd(playerWon, opponent, nextOpponent, onContinue) {
        this.showScreen('match-end-screen');

        const resultText = document.getElementById('match-result');
        const messageText = document.getElementById('match-message');
        const nextBtn = document.getElementById('next-match-btn');

        if (playerWon) {
            resultText.textContent = 'VICTORY!';
            resultText.className = 'match-result victory';
            messageText.textContent = `You defeated ${opponent.name}!`;
            nextBtn.textContent = nextOpponent ? 'NEXT OPPONENT' : 'CONTINUE';
            this.playSound('victory');
        } else {
            // This shouldn't happen - game over screen handles losses
            resultText.textContent = 'DEFEAT';
            resultText.className = 'match-result defeat';
            messageText.textContent = `${opponent.name} wins!`;
            nextBtn.textContent = 'TRY AGAIN';
        }

        nextBtn.onclick = () => {
            this.playSound('select');
            if (onContinue) onContinue();
        };
    },

    // ==========================================
    // Victory Screen (Tournament Win)
    // ==========================================

    showVictory(stats, onPlayAgain) {
        this.showScreen('victory-screen');

        const statsDiv = document.getElementById('victory-stats');
        statsDiv.innerHTML = `
            <div class="stat">Matches Won: <span>${stats.matchesWon}</span></div>
            <div class="stat">Rounds Won: <span>${stats.totalRoundsWon}</span></div>
            <div class="stat">Rounds Lost: <span>${stats.totalRoundsLost}</span></div>
        `;

        this.playSound('champion');

        const playAgainBtn = document.getElementById('play-again-btn');
        playAgainBtn.onclick = () => {
            this.playSound('select');
            if (onPlayAgain) onPlayAgain();
        };
    },

    // ==========================================
    // Game Over Screen
    // ==========================================

    showGameOver(defeatedBy, progress, totalOpponents, onRetry) {
        this.showScreen('game-over-screen');

        const messageText = document.getElementById('game-over-message');
        const progressDiv = document.getElementById('game-over-progress');

        messageText.textContent = `Defeated by ${defeatedBy.name}`;
        progressDiv.innerHTML = `
            <div class="progress-text">Progress: ${progress} / ${totalOpponents} opponents</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(progress / totalOpponents) * 100}%"></div>
            </div>
        `;

        this.playSound('gameover');

        const retryBtn = document.getElementById('retry-btn');
        retryBtn.onclick = () => {
            this.playSound('select');
            if (onRetry) onRetry();
        };
    },

    // ==========================================
    // Sound Effects (placeholder - can be implemented later)
    // ==========================================

    playSound(soundId) {
        // Placeholder for sound effects
        // Could use Web Audio API or audio elements
        console.log('[TournamentUI] Sound:', soundId);
    },

    // ==========================================
    // Utility Methods
    // ==========================================

    // Flash the screen (for KO, etc.)
    flashScreen(color = 'white', duration = 200) {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        flash.style.backgroundColor = color;
        this.elements.overlay.appendChild(flash);

        setTimeout(() => flash.remove(), duration);
    },

    // Shake the screen
    shakeScreen(intensity = 10, duration = 300) {
        const arena = document.querySelector('.arena, #arena, .game-container');
        if (arena) {
            arena.classList.add('screen-shake');
            arena.style.setProperty('--shake-intensity', intensity + 'px');
            setTimeout(() => arena.classList.remove('screen-shake'), duration);
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentUI;
}
