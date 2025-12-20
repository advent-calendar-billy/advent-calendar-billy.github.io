/**
 * Tournament System Tests
 *
 * Tests for TournamentSystem - ladder progression, round/match management
 */

// Mock TournamentSystem for testing
const TournamentSystem = {
    LADDER: [
        { id: 'timo', name: 'TIMO', title: 'The Baby', difficulty: 1, hp: 60, attackChance: 0.08 },
        { id: 'madonna', name: 'MADONNA', title: 'Material Girl', difficulty: 2, hp: 100, attackChance: 0.10 },
        { id: 'jonas', name: 'JONAS', title: 'The Coach', difficulty: 3, hp: 115, attackChance: 0.10 },
        { id: 'lucas', name: 'LUCAS', title: 'Soccer Star', difficulty: 4, hp: 130, attackChance: 0.10 },
        { id: 'vicky', name: 'VICKY', title: 'Christmas Bride', difficulty: 5, hp: 145, attackChance: 0.10 },
        { id: 'jonasl', name: 'JONASL', title: 'The Bassist', difficulty: 6, hp: 160, attackChance: 0.12 },
        { id: 'frank', name: 'FRANK', title: 'Sweet Transvestite', difficulty: 7, hp: 150, attackChance: 0.12 },
        { id: 'charly', name: 'CHARLY', title: 'The Biker', difficulty: 8, hp: 160, attackChance: 0.14 },
        { id: 'audrey', name: 'AUDREY II', title: 'Mean Green Mother', difficulty: 9, hp: 170, attackChance: 0.14 },
        { id: 'pancho', name: 'PANCHO', title: 'Superman', difficulty: 10, hp: 180, attackChance: 0.16 },
        { id: 'pato', name: 'PATO', title: 'The Crypto Bro', difficulty: 11, hp: 200, attackChance: 0.18 },
        { id: 'billy', name: 'BILLY', title: 'Mathematical Mastermind', difficulty: 12, hp: 250, attackChance: 0.22 }
    ],

    state: {},

    init() {
        this.reset();
        return this;
    },

    reset() {
        this.state = {
            currentOpponentIndex: 0,
            playerRoundWins: 0,
            opponentRoundWins: 0,
            roundNumber: 1,
            tournamentComplete: false,
            gameOver: false,
            matchesWon: 0
        };
    },

    getCurrentOpponent() {
        return this.LADDER[this.state.currentOpponentIndex];
    },

    startMatch() {
        this.state.playerRoundWins = 0;
        this.state.opponentRoundWins = 0;
        this.state.roundNumber = 1;
        return this.getCurrentOpponent();
    },

    endRound(playerWon) {
        if (playerWon) {
            this.state.playerRoundWins++;
        } else {
            this.state.opponentRoundWins++;
        }

        if (this.state.playerRoundWins >= 2) {
            return this.endMatch(true);
        } else if (this.state.opponentRoundWins >= 2) {
            return this.endMatch(false);
        }

        this.state.roundNumber++;
        return { matchEnded: false, playerWon };
    },

    endMatch(playerWon) {
        const opponent = this.getCurrentOpponent();

        if (playerWon) {
            this.state.matchesWon++;
            if (this.state.currentOpponentIndex >= this.LADDER.length - 1) {
                this.state.tournamentComplete = true;
                return { matchEnded: true, playerWon: true, tournamentEnded: true, victory: true };
            }
            this.state.currentOpponentIndex++;
            return { matchEnded: true, playerWon: true, tournamentEnded: false };
        } else {
            this.state.gameOver = true;
            return { matchEnded: true, playerWon: false, tournamentEnded: true, gameOver: true, defeatedBy: opponent };
        }
    }
};

describe('Tournament Ladder', () => {
    test('has exactly 12 opponents', () => {
        expect(TournamentSystem.LADDER).toHaveLength(12);
    });

    test('first opponent is Timo (easiest)', () => {
        expect(TournamentSystem.LADDER[0].id).toBe('timo');
        expect(TournamentSystem.LADDER[0].difficulty).toBe(1);
        expect(TournamentSystem.LADDER[0].hp).toBe(60);
    });

    test('last opponent is Billy (final boss)', () => {
        const lastIndex = TournamentSystem.LADDER.length - 1;
        expect(TournamentSystem.LADDER[lastIndex].id).toBe('billy');
        expect(TournamentSystem.LADDER[lastIndex].difficulty).toBe(12);
        expect(TournamentSystem.LADDER[lastIndex].hp).toBe(250);
    });

    test('difficulty increases through ladder', () => {
        for (let i = 1; i < TournamentSystem.LADDER.length; i++) {
            expect(TournamentSystem.LADDER[i].difficulty).toBeGreaterThan(
                TournamentSystem.LADDER[i - 1].difficulty
            );
        }
    });

    test('all opponents have required properties', () => {
        TournamentSystem.LADDER.forEach(opponent => {
            expect(opponent).toHaveProperty('id');
            expect(opponent).toHaveProperty('name');
            expect(opponent).toHaveProperty('title');
            expect(opponent).toHaveProperty('difficulty');
            expect(opponent).toHaveProperty('hp');
            expect(opponent).toHaveProperty('attackChance');
        });
    });
});

describe('Tournament State Management', () => {
    beforeEach(() => {
        TournamentSystem.init();
    });

    test('init resets all state', () => {
        TournamentSystem.state.currentOpponentIndex = 5;
        TournamentSystem.state.matchesWon = 3;
        TournamentSystem.init();

        expect(TournamentSystem.state.currentOpponentIndex).toBe(0);
        expect(TournamentSystem.state.matchesWon).toBe(0);
        expect(TournamentSystem.state.playerRoundWins).toBe(0);
        expect(TournamentSystem.state.opponentRoundWins).toBe(0);
    });

    test('getCurrentOpponent returns correct opponent', () => {
        const opponent = TournamentSystem.getCurrentOpponent();
        expect(opponent.id).toBe('timo');

        TournamentSystem.state.currentOpponentIndex = 5;
        expect(TournamentSystem.getCurrentOpponent().id).toBe('jonasl');
    });

    test('startMatch resets round state', () => {
        TournamentSystem.state.playerRoundWins = 1;
        TournamentSystem.state.opponentRoundWins = 1;
        TournamentSystem.state.roundNumber = 3;

        TournamentSystem.startMatch();

        expect(TournamentSystem.state.playerRoundWins).toBe(0);
        expect(TournamentSystem.state.opponentRoundWins).toBe(0);
        expect(TournamentSystem.state.roundNumber).toBe(1);
    });
});

describe('Round Progression', () => {
    beforeEach(() => {
        TournamentSystem.init();
        TournamentSystem.startMatch();
    });

    test('winning round 1 increments player wins', () => {
        const result = TournamentSystem.endRound(true);

        expect(TournamentSystem.state.playerRoundWins).toBe(1);
        expect(result.matchEnded).toBe(false);
    });

    test('losing round 1 increments opponent wins', () => {
        const result = TournamentSystem.endRound(false);

        expect(TournamentSystem.state.opponentRoundWins).toBe(1);
        expect(result.matchEnded).toBe(false);
    });

    test('winning 2 rounds wins the match', () => {
        TournamentSystem.endRound(true);  // 1-0
        const result = TournamentSystem.endRound(true);  // 2-0

        expect(result.matchEnded).toBe(true);
        expect(result.playerWon).toBe(true);
    });

    test('losing 2 rounds loses the match', () => {
        TournamentSystem.endRound(false);  // 0-1
        const result = TournamentSystem.endRound(false);  // 0-2

        expect(result.matchEnded).toBe(true);
        expect(result.playerWon).toBe(false);
        expect(result.gameOver).toBe(true);
    });

    test('best of 3 can go to round 3', () => {
        TournamentSystem.endRound(true);   // 1-0
        TournamentSystem.endRound(false);  // 1-1
        expect(TournamentSystem.state.roundNumber).toBe(3);

        const result = TournamentSystem.endRound(true);  // 2-1
        expect(result.matchEnded).toBe(true);
        expect(result.playerWon).toBe(true);
    });
});

describe('Match Progression', () => {
    beforeEach(() => {
        TournamentSystem.init();
    });

    test('winning match advances to next opponent', () => {
        TournamentSystem.startMatch();
        TournamentSystem.endRound(true);
        const result = TournamentSystem.endRound(true);

        expect(result.matchEnded).toBe(true);
        expect(result.tournamentEnded).toBe(false);
        expect(TournamentSystem.state.currentOpponentIndex).toBe(1);
        expect(TournamentSystem.getCurrentOpponent().id).toBe('madonna');
    });

    test('losing match ends tournament with game over', () => {
        TournamentSystem.startMatch();
        TournamentSystem.endRound(false);
        const result = TournamentSystem.endRound(false);

        expect(result.matchEnded).toBe(true);
        expect(result.gameOver).toBe(true);
        expect(result.defeatedBy.id).toBe('timo');
    });

    test('defeating final boss wins tournament', () => {
        // Skip to Billy
        TournamentSystem.state.currentOpponentIndex = 11;

        TournamentSystem.startMatch();
        TournamentSystem.endRound(true);
        const result = TournamentSystem.endRound(true);

        expect(result.victory).toBe(true);
        expect(result.tournamentEnded).toBe(true);
        expect(TournamentSystem.state.tournamentComplete).toBe(true);
    });
});

describe('Tournament Progress Tracking', () => {
    beforeEach(() => {
        TournamentSystem.init();
    });

    test('matchesWon increments on victories', () => {
        expect(TournamentSystem.state.matchesWon).toBe(0);

        TournamentSystem.startMatch();
        TournamentSystem.endRound(true);
        TournamentSystem.endRound(true);

        expect(TournamentSystem.state.matchesWon).toBe(1);

        TournamentSystem.startMatch();
        TournamentSystem.endRound(true);
        TournamentSystem.endRound(true);

        expect(TournamentSystem.state.matchesWon).toBe(2);
    });

    test('losing does not increment matchesWon', () => {
        TournamentSystem.startMatch();
        TournamentSystem.endRound(false);
        TournamentSystem.endRound(false);

        expect(TournamentSystem.state.matchesWon).toBe(0);
    });
});

describe('Opponent HP Scaling', () => {
    test('Timo has lowest HP (60)', () => {
        expect(TournamentSystem.LADDER[0].hp).toBe(60);
    });

    test('Billy has highest HP (250)', () => {
        expect(TournamentSystem.LADDER[11].hp).toBe(250);
    });

    test('HP generally increases with difficulty', () => {
        const timo = TournamentSystem.LADDER[0];
        const pato = TournamentSystem.LADDER[10];
        const billy = TournamentSystem.LADDER[11];

        expect(pato.hp).toBeGreaterThan(timo.hp);
        expect(billy.hp).toBeGreaterThan(pato.hp);
    });
});

describe('Opponent Attack Chance Scaling', () => {
    test('Timo has lowest attack chance (0.08)', () => {
        expect(TournamentSystem.LADDER[0].attackChance).toBe(0.08);
    });

    test('Billy has highest attack chance (0.22)', () => {
        expect(TournamentSystem.LADDER[11].attackChance).toBe(0.22);
    });

    test('attack chance increases with difficulty', () => {
        const first = TournamentSystem.LADDER[0].attackChance;
        const last = TournamentSystem.LADDER[11].attackChance;

        expect(last).toBeGreaterThan(first);
    });
});
