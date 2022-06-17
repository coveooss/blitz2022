import { Team } from '../src/game/teams/team';
import { NoopTeam } from './teams/noopteam';
import { TeamStats, Game } from '../src/game/game';
import { roundRobin, sortRankTeams, timeoutAfter, average } from '../src/utils';
import { waitForPromiseResolution } from './testUtils';

describe('Utils', () => {
    describe('average', () => {
        it('should compute the averable properly', () => {
            const numbers = [1, 2, 3, 4, 5];

            const averageResult = average(numbers);

            expect(averageResult).toBe(3);
        });
    });
    describe('timeoutAfter', () => {
        const DEFAULT_TIMEOUT_VALUE = 1000;
        jest.useFakeTimers('legacy');

        it('should only resolve after the specified timeout value', async () => {
            const myTimeout = timeoutAfter(DEFAULT_TIMEOUT_VALUE);
            const onResolve = jest.fn();

            myTimeout.then(onResolve);

            expect(onResolve).not.toHaveBeenCalled();

            jest.advanceTimersByTime(DEFAULT_TIMEOUT_VALUE - 1);
            await waitForPromiseResolution();

            expect(onResolve).not.toHaveBeenCalled();

            jest.advanceTimersByTime(1);
            await waitForPromiseResolution();

            expect(onResolve).toHaveBeenCalled();
        });
    });

    describe('roundRobin', () => {
        it('should round robin the array (duh)', () => {
            const myArray = [1, 2, 3, 4, 5];

            expect(roundRobin(myArray, 0)).toEqual([1, 2, 3, 4, 5]);
            expect(roundRobin(myArray, 1)).toEqual([2, 3, 4, 5, 1]);
            expect(roundRobin(myArray, 2)).toEqual([3, 4, 5, 1, 2]);
            expect(roundRobin(myArray, 3)).toEqual([4, 5, 1, 2, 3]);
            expect(roundRobin(myArray, 4)).toEqual([5, 1, 2, 3, 4]);
            expect(roundRobin(myArray, 5)).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('sort rank', () => {
        let game: Game;
        let stats: Map<Team, TeamStats>;
        let teams: Team[];

        beforeEach(() => {
            game = new Game();
            stats = new Map();

            teams = [new NoopTeam(game), new NoopTeam(game), new NoopTeam(game)];

            teams[0].name = 'FIRST_TEAM';
            teams[1].name = 'SECOND_TEAM';
            teams[2].name = 'THIRD_TEAM';

            teams.forEach((c) => {
                stats.set(c, {
                    nbTimeouts: 0,
                    processingTimePerTicks: [0],
                    responseTimePerTicks: [0],
                    unitsPerTicks: [0],
                });
            });
        });
        it('should sort by score first', () => {
            teams[0].score = 10;
            teams[1].score = 20;
            teams[2].score = 30;

            stats.get(teams[0]).responseTimePerTicks = [100];
            stats.get(teams[1]).responseTimePerTicks = [200];
            stats.get(teams[2]).responseTimePerTicks = [300];

            const rankedArray = teams.sort((a, b) => sortRankTeams(a, b, stats));

            expect(rankedArray[0].name).toBe('THIRD_TEAM');
            expect(rankedArray[1].name).toBe('SECOND_TEAM');
            expect(rankedArray[2].name).toBe('FIRST_TEAM');
        });

        it('should sort by response time last', () => {
            teams[0].score = 10;
            teams[1].score = 10;
            teams[2].score = 10;

            stats.get(teams[0]).responseTimePerTicks = [500];
            stats.get(teams[1]).responseTimePerTicks = [100];
            stats.get(teams[2]).responseTimePerTicks = [250];

            const rankedArray = teams.sort((a, b) => sortRankTeams(a, b, stats));

            expect(rankedArray[0].name).toBe('SECOND_TEAM');
            expect(rankedArray[1].name).toBe('THIRD_TEAM');
            expect(rankedArray[2].name).toBe('FIRST_TEAM');
        });
    });
});
