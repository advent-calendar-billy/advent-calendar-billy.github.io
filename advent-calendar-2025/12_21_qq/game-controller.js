// Game Controller for Family Fighter Tournament Mode
// Integrates Tournament, Backgrounds, and OpponentAI systems

const GameController = {
    // Game flow states
    STATES: {
        TITLE: 'title',
        LADDER: 'ladder',
        PRE_FIGHT: 'pre_fight',
        FIGHTING: 'fighting',
        ROUND_END: 'round_end',
        MATCH_END: 'match_end',
        GAME_OVER: 'game_over',
        VICTORY: 'victory'
    },

    currentState: 'title',

    // Fede's stats (player always plays as Fede)
    playerStats: {
        hp: 100,
        maxHp: 100,
        energy: 0
    },

    // Damage values for proper balancing
    damageConfig: {
        // Basic attacks (Z and X)
        punch: 6,
        kick: 9,
        // Special moves scale with base damage from character
        specialMultiplier: 1.0,
        // Ultimate moves
        ultimateMultiplier: 1.0
    },

    // Initialize the game controller
    init() {
        this.currentState = this.STATES.TITLE;
        Tournament.init();
        this.setupEventListeners();
        return this;
    },

    // Setup UI event listeners
    setupEventListeners() {
        // These will be called from the main game
    },

    // Start the tournament
    startTournament() {
        Tournament.init();
        this.currentState = this.STATES.LADDER;
        this.showLadderScreen();
    },

    // Show the ladder/tournament screen
    showLadderScreen() {
        const ladderData = Tournament.getLadderDisplay();
        this.renderLadder(ladderData);
    },

    // Render the ladder UI
    renderLadder(ladderData) {
        // This creates the HTML for the ladder screen
        let html = `
            <div class="ladder-container">
                <h2 class="ladder-title">TOURNAMENT LADDER</h2>
                <p class="ladder-subtitle">Fede must defeat all challengers!</p>
                <div class="ladder-list">
        `;

        // Show opponents in reverse order (final boss at top)
        const reversed = [...ladderData].reverse();
        reversed.forEach((opponent, index) => {
            const realIndex = ladderData.length - 1 - index;
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

            html += `<div class="${classes}" data-index="${realIndex}">${content}</div>`;
        });

        html += `
                </div>
                <button class="fight-btn" onclick="GameController.startMatch()">FIGHT!</button>
            </div>
        `;

        return html;
    },

    // Start a match against current opponent
    startMatch() {
        const opponent = Tournament.getCurrentOpponent();
        const stats = Tournament.getOpponentStats(opponent);

        // Initialize AI
        OpponentAI.init(opponent, stats);
        OpponentAI.setAttackCallback(this.handleOpponentAttack.bind(this));

        // Reset player stats
        this.playerStats.hp = 100;
        this.playerStats.maxHp = 100;
        this.playerStats.energy = 0;

        // Apply background for this match
        const arena = document.getElementById('arena');
        if (arena) {
            Backgrounds.applyToArena(arena, Tournament.state.matchNumber);
        }

        this.currentState = this.STATES.PRE_FIGHT;
        this.showPreFightScreen(opponent);
    },

    // Show the pre-fight "VS" screen
    showPreFightScreen(opponent) {
        return `
            <div class="pre-fight-screen">
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
            </div>
        `;
    },

    // Begin the actual fight
    beginFight() {
        this.currentState = this.STATES.FIGHTING;
        // Start game loop integration
    },

    // Handle opponent attacking the player
    handleOpponentAttack(attackData) {
        if (this.currentState !== this.STATES.FIGHTING) return;

        // Check if player is in range
        const playerX = window.game ? window.game.playerX : 100;
        const distance = Math.abs(attackData.x - playerX);

        if (distance < 85) {
            this.playerStats.hp = Math.max(0, this.playerStats.hp - attackData.damage);
            this.showPlayerHit(attackData);

            if (this.playerStats.hp <= 0) {
                this.endRound(false);
            }
        }
    },

    // Show player getting hit
    showPlayerHit(attackData) {
        // Trigger hit animation/effects
        const fighter = document.getElementById('player-fighter');
        if (fighter) {
            fighter.classList.add('hit');
            setTimeout(() => fighter.classList.remove('hit'), 300);
        }
    },

    // Called when player deals damage to opponent
    handlePlayerAttack(damage, isSpecial = false, isUltimate = false) {
        if (this.currentState !== this.STATES.FIGHTING) return;

        const remainingHealth = OpponentAI.takeDamage(damage);

        // Update opponent health bar
        this.updateOpponentHealthBar();

        // Build player energy
        if (!isUltimate) {
            this.playerStats.energy = Math.min(100, this.playerStats.energy + (isSpecial ? 15 : 10));
        }

        if (OpponentAI.isDefeated()) {
            this.endRound(true);
        }
    },

    // Update opponent health bar display
    updateOpponentHealthBar() {
        const healthBar = document.getElementById('opponent-health');
        if (healthBar) {
            healthBar.style.width = OpponentAI.getHealthPercent() + '%';
        }
    },

    // End the current round
    endRound(playerWon) {
        this.currentState = this.STATES.ROUND_END;
        Tournament.recordRoundWin(playerWon);

        if (Tournament.isMatchComplete()) {
            this.endMatch();
        } else {
            // Show round result and continue
            this.showRoundResult(playerWon);
        }
    },

    // Show round result
    showRoundResult(playerWon) {
        const text = playerWon ? 'ROUND WIN!' : 'ROUND LOST!';
        return `
            <div class="round-result">
                <div class="result-text ${playerWon ? 'win' : 'lose'}">${text}</div>
                <div class="score">${Tournament.getScoreDisplay()}</div>
                <button onclick="GameController.nextRound()">NEXT ROUND</button>
            </div>
        `;
    },

    // Start next round
    nextRound() {
        const opponent = Tournament.getCurrentOpponent();
        const stats = Tournament.getOpponentStats(opponent);

        // Reset for new round
        OpponentAI.reset(opponent, stats);
        this.playerStats.hp = 100;
        this.playerStats.energy = 0;

        this.currentState = this.STATES.FIGHTING;
    },

    // End the current match
    endMatch() {
        this.currentState = this.STATES.MATCH_END;
        const playerWon = Tournament.didPlayerWinMatch();

        if (playerWon) {
            const hasNextOpponent = Tournament.advanceToNextOpponent();
            if (!hasNextOpponent) {
                if (Tournament.state.hasWonTournament) {
                    this.showVictoryScreen();
                }
            } else {
                this.showMatchVictory();
            }
        } else {
            this.showGameOver();
        }
    },

    // Show match victory (advancing to next opponent)
    showMatchVictory() {
        const nextOpponent = Tournament.getCurrentOpponent();
        return `
            <div class="match-victory">
                <div class="victory-text">MATCH WON!</div>
                <div class="next-opponent">
                    <span>Next challenger:</span>
                    <span class="opponent-name">${nextOpponent.name}</span>
                </div>
                <button onclick="GameController.showLadderScreen()">CONTINUE</button>
            </div>
        `;
    },

    // Show game over screen
    showGameOver() {
        this.currentState = this.STATES.GAME_OVER;
        return `
            <div class="game-over-screen">
                <div class="game-over-text">GAME OVER</div>
                <div class="defeated-by">Defeated by ${Tournament.getCurrentOpponent().name}</div>
                <div class="progress">Made it to match ${Tournament.state.matchNumber} of ${Tournament.ladder.length}</div>
                <button onclick="GameController.restartTournament()">TRY AGAIN</button>
            </div>
        `;
    },

    // Show final victory screen
    showVictoryScreen() {
        this.currentState = this.STATES.VICTORY;
        return `
            <div class="victory-screen">
                <div class="champion-text">CHAMPION!</div>
                <div class="victory-message">
                    <p>FEDE has defeated all challengers!</p>
                    <p>Including the mighty BILLY, the Final Boss!</p>
                </div>
                <div class="trophy">🏆</div>
                <div class="congrats">FAMILY FIGHTER CHAMPION</div>
                <button onclick="GameController.restartTournament()">PLAY AGAIN</button>
            </div>
        `;
    },

    // Restart the tournament
    restartTournament() {
        Tournament.init();
        Backgrounds.reset();
        this.playerStats = { hp: 100, maxHp: 100, energy: 0 };
        this.currentState = this.STATES.LADDER;
        this.showLadderScreen();
    },

    // Get current game state for integration
    getState() {
        return {
            state: this.currentState,
            playerStats: this.playerStats,
            opponent: Tournament.getCurrentOpponent(),
            opponentAI: OpponentAI.state,
            tournament: Tournament.state
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
}
