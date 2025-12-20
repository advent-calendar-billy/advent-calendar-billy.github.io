// Tournament Ladder System for Family Fighter
// Fede fights through all opponents, with Billy as the final boss

const Tournament = {
    // Ladder configuration - ordered from easiest to hardest
    // Billy is the final boss
    ladder: [
        {
            id: 'timo',
            name: 'TIMO',
            title: 'The Baby',
            difficulty: 1,
            hp: 80,
            attackChance: 0.02,  // Very low - babies can't fight well
            moveSpeed: 0.8,
            description: 'A crying baby with a flag. How hard can it be?'
        },
        {
            id: 'madonna',
            name: 'MADONNA',
            title: 'Material Girl',
            difficulty: 2,
            hp: 100,
            attackChance: 0.04,
            moveSpeed: 1.0,
            description: 'The Queen of Pop is ready to vogue!'
        },
        {
            id: 'jonas',
            name: 'JONAS M',
            title: 'The Coach',
            difficulty: 3,
            hp: 110,
            attackChance: 0.05,
            moveSpeed: 1.1,
            description: 'Synergy! Paradigm shift! Circle back!'
        },
        {
            id: 'lucas',
            name: 'LUCAS',
            title: 'Soccer Star',
            difficulty: 4,
            hp: 120,
            attackChance: 0.06,
            moveSpeed: 1.3,
            description: 'Cat lover and bicycle kick master.'
        },
        {
            id: 'vicky',
            name: 'VICKY',
            title: 'Christmas Bride',
            difficulty: 5,
            hp: 130,
            attackChance: 0.07,
            moveSpeed: 1.2,
            description: 'The aerial silk queen with holiday spirit!'
        },
        {
            id: 'jonasl',
            name: 'JONAS L',
            title: 'The Bassist',
            difficulty: 6,
            hp: 140,
            attackChance: 0.08,
            moveSpeed: 1.2,
            description: 'Coffee-powered bass-slapping machine.'
        },
        {
            id: 'frank',
            name: 'FRANK',
            title: 'Sweet Transvestite',
            difficulty: 7,
            hp: 150,
            attackChance: 0.10,
            moveSpeed: 1.4,
            specialChance: 0.03,  // Frank starts using special moves
            description: 'Dr. Frank-N-Furter from the Rocky Horror Picture Show!'
        },
        {
            id: 'charly',
            name: 'CHARLY',
            title: 'The Biker',
            difficulty: 8,
            hp: 160,
            attackChance: 0.12,
            moveSpeed: 1.5,
            specialChance: 0.04,
            description: 'Excel spreadsheets by day, highway rider by night.'
        },
        {
            id: 'audrey',
            name: 'AUDREY II',
            title: 'Mean Green Mother',
            difficulty: 9,
            hp: 170,
            attackChance: 0.14,
            moveSpeed: 1.3,
            specialChance: 0.05,
            description: 'Feed me, Seymour! A man-eating plant from outer space.'
        },
        {
            id: 'pancho',
            name: 'PANCHO',
            title: 'Superman',
            difficulty: 10,
            hp: 180,
            attackChance: 0.16,
            moveSpeed: 1.6,
            specialChance: 0.06,
            description: 'Faster than a speeding bullet, can fly!'
        },
        {
            id: 'pato',
            name: 'PATO',
            title: 'The Crypto Bro',
            difficulty: 11,
            hp: 200,
            attackChance: 0.18,
            moveSpeed: 1.5,
            specialChance: 0.07,
            description: 'Bitcoin maximalist, filmmaker, and coder. TO THE MOON!'
        },
        {
            id: 'billy',
            name: 'BILLY',
            title: 'THE FINAL BOSS',
            difficulty: 12,
            hp: 250,
            attackChance: 0.22,
            moveSpeed: 1.8,
            specialChance: 0.10,  // Billy uses specials most often!
            description: 'The Mathematical Mastermind. Q.E.D.!',
            isFinalBoss: true
        }
    ],

    // Current tournament state
    state: {
        currentOpponentIndex: 0,
        playerWins: 0,
        opponentWins: 0,
        roundNumber: 1,
        matchNumber: 1,
        isGameOver: false,
        hasWonTournament: false
    },

    // Initialize/reset tournament
    init() {
        this.state = {
            currentOpponentIndex: 0,
            playerWins: 0,
            opponentWins: 0,
            roundNumber: 1,
            matchNumber: 1,
            isGameOver: false,
            hasWonTournament: false
        };
        return this;
    },

    // Get current opponent
    getCurrentOpponent() {
        return this.ladder[this.state.currentOpponentIndex];
    },

    // Get all opponents for ladder display (with mystery shroud info)
    getLadderDisplay() {
        return this.ladder.map((opponent, index) => ({
            ...opponent,
            isRevealed: index <= this.state.currentOpponentIndex + 1,  // Show current + next
            isCurrent: index === this.state.currentOpponentIndex,
            isDefeated: index < this.state.currentOpponentIndex,
            isNext: index === this.state.currentOpponentIndex + 1
        }));
    },

    // Record round result
    recordRoundWin(playerWon) {
        if (playerWon) {
            this.state.playerWins++;
        } else {
            this.state.opponentWins++;
        }
        this.state.roundNumber++;
    },

    // Check if match is complete (best of 3)
    isMatchComplete() {
        return this.state.playerWins >= 2 || this.state.opponentWins >= 2;
    },

    // Check if player won the match
    didPlayerWinMatch() {
        return this.state.playerWins >= 2;
    },

    // Advance to next opponent (returns false if tournament is complete)
    advanceToNextOpponent() {
        if (!this.didPlayerWinMatch()) {
            // Player lost the tournament
            this.state.isGameOver = true;
            return false;
        }

        this.state.currentOpponentIndex++;
        this.state.matchNumber++;
        this.state.playerWins = 0;
        this.state.opponentWins = 0;
        this.state.roundNumber = 1;

        if (this.state.currentOpponentIndex >= this.ladder.length) {
            // Player won the tournament!
            this.state.hasWonTournament = true;
            this.state.isGameOver = true;
            return false;
        }

        return true;
    },

    // Reset for new round in same match
    resetForNewRound() {
        // Keep wins/opponent, just reset round state
    },

    // Get match status text
    getMatchStatus() {
        return `MATCH ${this.state.matchNumber} - ROUND ${this.state.roundNumber}`;
    },

    // Get score display
    getScoreDisplay() {
        return `FEDE ${this.state.playerWins} - ${this.state.opponentWins} ${this.getCurrentOpponent().name}`;
    },

    // Calculate opponent stats based on difficulty
    getOpponentStats(opponent) {
        return {
            hp: opponent.hp,
            attackChance: opponent.attackChance,
            moveSpeed: opponent.moveSpeed,
            specialChance: opponent.specialChance || 0,
            damage: {
                punch: 5 + Math.floor(opponent.difficulty * 0.5),
                kick: 8 + Math.floor(opponent.difficulty * 0.7),
                special: 15 + Math.floor(opponent.difficulty * 2)
            }
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tournament;
}
