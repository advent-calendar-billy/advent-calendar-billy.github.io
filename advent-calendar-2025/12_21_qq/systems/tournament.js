/**
 * Tournament System - Ladder progression and match management
 *
 * Manages:
 * - 12 opponent ladder (Timo to Billy)
 * - Best-of-3 round tracking
 * - Win/loss progression
 * - State transitions
 */

const TournamentSystem = {
    // Tournament opponents in order of difficulty
    LADDER: [
        { id: 'timo', name: 'TIMO', title: 'The Baby', difficulty: 1, hp: 60, attackChance: 0.08, specialChance: 0.02 },
        { id: 'madonna', name: 'MADONNA', title: 'Material Girl', difficulty: 2, hp: 100, attackChance: 0.10, specialChance: 0.05 },
        { id: 'jonas', name: 'JONAS', title: 'The Coach', difficulty: 3, hp: 115, attackChance: 0.10, specialChance: 0.05 },
        { id: 'lucas', name: 'LUCAS', title: 'Soccer Star', difficulty: 4, hp: 130, attackChance: 0.10, specialChance: 0.06 },
        { id: 'vicky', name: 'VICKY', title: 'Christmas Bride', difficulty: 5, hp: 145, attackChance: 0.10, specialChance: 0.06 },
        { id: 'jonasl', name: 'JONASL', title: 'The Bassist', difficulty: 6, hp: 160, attackChance: 0.12, specialChance: 0.07 },
        { id: 'frank', name: 'FRANK', title: 'Sweet Transvestite', difficulty: 7, hp: 150, attackChance: 0.12, specialChance: 0.08 },
        { id: 'charly', name: 'CHARLY', title: 'The Biker', difficulty: 8, hp: 160, attackChance: 0.14, specialChance: 0.08 },
        { id: 'audrey', name: 'AUDREY II', title: 'Mean Green Mother', difficulty: 9, hp: 170, attackChance: 0.14, specialChance: 0.09 },
        { id: 'pancho', name: 'PANCHO', title: 'Superman', difficulty: 10, hp: 180, attackChance: 0.16, specialChance: 0.10 },
        { id: 'pato', name: 'PATO', title: 'The Crypto Bro', difficulty: 11, hp: 200, attackChance: 0.18, specialChance: 0.12 },
        { id: 'billy', name: 'BILLY', title: 'Mathematical Mastermind', difficulty: 12, hp: 250, attackChance: 0.22, specialChance: 0.15 }
    ],

    // Tournament state
    state: {
        currentOpponentIndex: 0,
        playerRoundWins: 0,
        opponentRoundWins: 0,
        roundNumber: 1,
        tournamentComplete: false,
        gameOver: false,
        matchesWon: 0,
        totalRoundsWon: 0,
        totalRoundsLost: 0
    },

    // Callbacks for UI updates
    callbacks: {
        onOpponentChange: null,
        onRoundStart: null,
        onRoundEnd: null,
        onMatchEnd: null,
        onTournamentEnd: null,
        onGameOver: null
    },

    // Initialize tournament
    init() {
        this.reset();
        console.log('[Tournament] Initialized with', this.LADDER.length, 'opponents');
        return this;
    },

    // Reset tournament to beginning
    reset() {
        this.state = {
            currentOpponentIndex: 0,
            playerRoundWins: 0,
            opponentRoundWins: 0,
            roundNumber: 1,
            tournamentComplete: false,
            gameOver: false,
            matchesWon: 0,
            totalRoundsWon: 0,
            totalRoundsLost: 0
        };
    },

    // Get current opponent
    getCurrentOpponent() {
        return this.LADDER[this.state.currentOpponentIndex];
    },

    // Get opponent by index
    getOpponent(index) {
        return this.LADDER[index] || null;
    },

    // Get all opponents with unlocked status
    getLadderStatus() {
        return this.LADDER.map((opponent, index) => ({
            ...opponent,
            unlocked: index <= this.state.currentOpponentIndex,
            defeated: index < this.state.currentOpponentIndex,
            current: index === this.state.currentOpponentIndex
        }));
    },

    // Start a new match against current opponent
    startMatch() {
        this.state.playerRoundWins = 0;
        this.state.opponentRoundWins = 0;
        this.state.roundNumber = 1;

        const opponent = this.getCurrentOpponent();
        console.log('[Tournament] Starting match vs', opponent.name);

        if (this.callbacks.onRoundStart) {
            this.callbacks.onRoundStart(this.state.roundNumber, opponent);
        }

        return opponent;
    },

    // Start next round in current match
    startRound() {
        const opponent = this.getCurrentOpponent();

        console.log('[Tournament] Round', this.state.roundNumber, 'vs', opponent.name);
        console.log('[Tournament] Score: Player', this.state.playerRoundWins, '- Opponent', this.state.opponentRoundWins);

        if (this.callbacks.onRoundStart) {
            this.callbacks.onRoundStart(this.state.roundNumber, opponent);
        }

        return {
            roundNumber: this.state.roundNumber,
            playerWins: this.state.playerRoundWins,
            opponentWins: this.state.opponentRoundWins,
            opponent: opponent
        };
    },

    // Report round result
    endRound(playerWon) {
        if (playerWon) {
            this.state.playerRoundWins++;
            this.state.totalRoundsWon++;
        } else {
            this.state.opponentRoundWins++;
            this.state.totalRoundsLost++;
        }

        const opponent = this.getCurrentOpponent();

        console.log('[Tournament] Round ended - Player:', this.state.playerRoundWins, 'Opponent:', this.state.opponentRoundWins);

        if (this.callbacks.onRoundEnd) {
            this.callbacks.onRoundEnd(playerWon, this.state.playerRoundWins, this.state.opponentRoundWins);
        }

        // Check for match end (best of 3 = first to 2 wins)
        if (this.state.playerRoundWins >= 2) {
            return this.endMatch(true);
        } else if (this.state.opponentRoundWins >= 2) {
            return this.endMatch(false);
        }

        // Match continues
        this.state.roundNumber++;
        return {
            matchEnded: false,
            playerWon: playerWon,
            roundNumber: this.state.roundNumber,
            playerRoundWins: this.state.playerRoundWins,
            opponentRoundWins: this.state.opponentRoundWins
        };
    },

    // Handle match end
    endMatch(playerWon) {
        const opponent = this.getCurrentOpponent();

        console.log('[Tournament] Match ended -', playerWon ? 'PLAYER WINS' : 'OPPONENT WINS');

        if (playerWon) {
            this.state.matchesWon++;

            // Check if this was the final boss
            if (this.state.currentOpponentIndex >= this.LADDER.length - 1) {
                return this.endTournament(true);
            }

            // Advance to next opponent
            this.state.currentOpponentIndex++;
            const nextOpponent = this.getCurrentOpponent();

            if (this.callbacks.onMatchEnd) {
                this.callbacks.onMatchEnd(true, opponent, nextOpponent);
            }

            return {
                matchEnded: true,
                playerWon: true,
                tournamentEnded: false,
                defeatedOpponent: opponent,
                nextOpponent: nextOpponent
            };
        } else {
            // Player lost - game over
            this.state.gameOver = true;

            if (this.callbacks.onMatchEnd) {
                this.callbacks.onMatchEnd(false, opponent, null);
            }

            if (this.callbacks.onGameOver) {
                this.callbacks.onGameOver(opponent, this.state.matchesWon);
            }

            return {
                matchEnded: true,
                playerWon: false,
                tournamentEnded: true,
                gameOver: true,
                defeatedBy: opponent,
                progress: this.state.currentOpponentIndex,
                totalOpponents: this.LADDER.length
            };
        }
    },

    // Handle tournament victory
    endTournament(playerWon) {
        this.state.tournamentComplete = true;

        const stats = {
            matchesWon: this.state.matchesWon,
            totalRoundsWon: this.state.totalRoundsWon,
            totalRoundsLost: this.state.totalRoundsLost,
            perfectMatches: 0, // Could track this
            finalBoss: this.LADDER[this.LADDER.length - 1]
        };

        console.log('[Tournament] TOURNAMENT COMPLETE!');
        console.log('[Tournament] Stats:', stats);

        if (this.callbacks.onTournamentEnd) {
            this.callbacks.onTournamentEnd(stats);
        }

        return {
            matchEnded: true,
            playerWon: true,
            tournamentEnded: true,
            victory: true,
            stats: stats
        };
    },

    // Get tournament progress for display
    getProgress() {
        return {
            current: this.state.currentOpponentIndex + 1,
            total: this.LADDER.length,
            percentage: Math.round((this.state.currentOpponentIndex / this.LADDER.length) * 100),
            matchesWon: this.state.matchesWon,
            roundsWon: this.state.totalRoundsWon,
            roundsLost: this.state.totalRoundsLost
        };
    },

    // Get match status for UI
    getMatchStatus() {
        return {
            opponent: this.getCurrentOpponent(),
            roundNumber: this.state.roundNumber,
            playerRoundWins: this.state.playerRoundWins,
            opponentRoundWins: this.state.opponentRoundWins,
            isMatchPoint: this.state.playerRoundWins === 1 || this.state.opponentRoundWins === 1
        };
    },

    // Skip to specific opponent (for debugging)
    skipToOpponent(opponentId) {
        const index = this.LADDER.findIndex(o => o.id === opponentId);
        if (index !== -1) {
            this.state.currentOpponentIndex = index;
            this.state.matchesWon = index;
            console.log('[Tournament] Skipped to opponent:', this.getCurrentOpponent().name);
            return true;
        }
        return false;
    },

    // Set callbacks
    on(event, callback) {
        const callbackName = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
        if (this.callbacks.hasOwnProperty(callbackName)) {
            this.callbacks[callbackName] = callback;
        }
        return this;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentSystem;
}
