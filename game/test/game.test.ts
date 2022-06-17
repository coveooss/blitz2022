import { Game } from '../src/game/game';
import { NoopTeam } from './teams/noopteam';
import { TickGameConfig } from '../src/game/types';

jest.useFakeTimers('legacy');

describe('Game', () => {
    const NUMBER_OF_TICKS = 20;
    const MAX_WAIT_TIME_BEFORE_STARTING = 1000;
    const EXPECTED_NUMBER_OF_TEAMS = 3;
    const TIMEOUT_TICK = 100;

    let game: Game;

    beforeEach(() => {
        game = new Game({
            numberOfTicks: NUMBER_OF_TICKS,
            expectedNumberOfTeams: EXPECTED_NUMBER_OF_TEAMS,
            maxWaitTimeMsBeforeStartingGame: MAX_WAIT_TIME_BEFORE_STARTING,
            timeMsAllowedPerTicks: TIMEOUT_TICK,
        });
    });

    it('should order commands given the proper map', async () => {
        game = new Game({
            numberOfTicks: 1,
            expectedNumberOfTeams: EXPECTED_NUMBER_OF_TEAMS,
            maxWaitTimeMsBeforeStartingGame: MAX_WAIT_TIME_BEFORE_STARTING,
            timeMsAllowedPerTicks: TIMEOUT_TICK,
        });
        const myFirstTeam = new NoopTeam(game);
        const mySecondTeam = new NoopTeam(game);

        const myFirstCommand = { command: 1 };
        const mySecondCommand = { command: 2 };

        myFirstTeam.getNextCommand = jest.fn(() => Promise.resolve(myFirstCommand));
        mySecondTeam.getNextCommand = jest.fn(() => Promise.resolve(mySecondCommand));

        const firstTeamApplyCommandSpy = jest.spyOn(myFirstTeam, 'applyCommand');
        const secondTeamApplyCommandSpy = jest.spyOn(mySecondTeam, 'applyCommand');

        game['teamPlayOrderings'] = { '0': [mySecondTeam.id, myFirstTeam.id] };
        await game.play();

        const firstTeamCommandOrder = firstTeamApplyCommandSpy.mock.invocationCallOrder[0];
        const secondTeamCommandOrder = secondTeamApplyCommandSpy.mock.invocationCallOrder[0];
        expect(secondTeamCommandOrder).toBeLessThan(firstTeamCommandOrder);
    });
    it('should apply the received command to the proper team', async () => {
        const myFirstTeam = new NoopTeam(game);
        const mySecondTeam = new NoopTeam(game);

        const myFirstCommand = { command: 1 };
        const mySecondCommand = { command: 2 };

        myFirstTeam.getNextCommand = jest.fn(() => Promise.resolve(myFirstCommand));
        mySecondTeam.getNextCommand = jest.fn(() => Promise.resolve(mySecondCommand));

        myFirstTeam.applyCommand = jest.fn();
        mySecondTeam.applyCommand = jest.fn();

        await game.play();

        expect(myFirstTeam.applyCommand).toHaveBeenNthCalledWith(NUMBER_OF_TICKS, myFirstCommand);
        expect(mySecondTeam.applyCommand).toHaveBeenNthCalledWith(NUMBER_OF_TICKS, mySecondCommand);
    });

    it('should ask the teams for their commands on each tick', async () => {
        const myFirstTeam = new NoopTeam(game);
        const mySecondTeam = new NoopTeam(game);

        myFirstTeam.getNextCommand = jest.fn(() => Promise.resolve({}));
        mySecondTeam.getNextCommand = jest.fn(() => Promise.resolve({}));

        await game.play();

        expect(myFirstTeam.getNextCommand).toHaveBeenCalledTimes(NUMBER_OF_TICKS);
        expect(mySecondTeam.getNextCommand).toHaveBeenCalledTimes(NUMBER_OF_TICKS);
    });

    it('should send the errors from the tick only to the respective players', async () => {
        const SOME_ERROR = ':ohno:';

        const myFirstTeam = new NoopTeam(game);
        myFirstTeam.errors.push(SOME_ERROR);
        const mySecondTeam = new NoopTeam(game);
        mySecondTeam.errors.push(SOME_ERROR);

        myFirstTeam.getNextCommand = jest.fn(() => Promise.resolve({}));
        mySecondTeam.getNextCommand = jest.fn(() => Promise.resolve({}));

        await game.play();

        const expectTeamWithError = () => expect.objectContaining({ errors: expect.arrayContaining([SOME_ERROR]) });
        const expectTeamWithoutError = () => expect.objectContaining({ errors: [] });

        expect(myFirstTeam.getNextCommand).toHaveBeenCalledWith(
            expect.objectContaining({
                teams: [expectTeamWithError(), expectTeamWithoutError()],
            }),
        );
        expect(mySecondTeam.getNextCommand).toHaveBeenCalledWith(
            expect.objectContaining({
                teams: [expectTeamWithoutError(), expectTeamWithError()],
            }),
        );
    });

    it('should start the game after the max wait time', async () => {
        expect(game.isRunning).toBe(false);
        expect(game.isCompleted).toBe(false);

        new NoopTeam(game);
        new NoopTeam(game);

        jest.advanceTimersByTime(MAX_WAIT_TIME_BEFORE_STARTING - 1);

        expect(game.isRunning).toBe(false);
        expect(game.isCompleted).toBe(false);

        jest.advanceTimersByTime(1);

        expect(game.isRunning).toBe(true);
        expect(game.isCompleted).toBe(false);
    });

    it('should not start the game after the max wait time if there is no teams', async () => {
        expect(game.isRunning).toBe(false);
        expect(game.isCompleted).toBe(false);

        jest.advanceTimersByTime(MAX_WAIT_TIME_BEFORE_STARTING - 1);

        expect(game.isRunning).toBe(false);
        expect(game.isCompleted).toBe(false);

        jest.advanceTimersByTime(1);

        expect(game.isRunning).toBe(false);
        expect(game.isCompleted).toBe(false);
    });

    it('should start the game when the expected numbers of teams have joined', () => {
        for (let i = 0; i < EXPECTED_NUMBER_OF_TEAMS - 1; i++) {
            new NoopTeam(game);
        }

        jest.runAllImmediates();
        expect(game.teams.length).toBe(EXPECTED_NUMBER_OF_TEAMS - 1);
        expect(game.isRunning).toBe(false);

        new NoopTeam(game);

        jest.runAllImmediates();
        expect(game.teams.length).toBe(EXPECTED_NUMBER_OF_TEAMS);
        expect(game.isRunning).toBe(true);
    });

    it('should notify handlers when the game is completed', async () => {
        const firstOnGameCompleted = jest.fn();
        const secondOnGameCompleted = jest.fn();

        game.onGameCompleted(firstOnGameCompleted);
        game.onGameCompleted(secondOnGameCompleted);

        expect(game.isCompleted).toBe(false);
        expect(firstOnGameCompleted).not.toHaveBeenCalled();
        expect(secondOnGameCompleted).not.toHaveBeenCalled();

        new NoopTeam(game);
        await game.play();

        expect(firstOnGameCompleted).toHaveBeenCalledTimes(1);
        expect(secondOnGameCompleted).toHaveBeenCalledTimes(1);
    });

    it('should notify tick handlers when a tick occur', async () => {
        const firstOnTick = jest.fn();
        const secondOnTick = jest.fn();

        game.onTick(firstOnTick);
        game.onTick(secondOnTick);

        expect(firstOnTick).not.toHaveBeenCalled();
        expect(secondOnTick).not.toHaveBeenCalled();

        new NoopTeam(game);
        await game.play();

        expect(firstOnTick).toHaveBeenCalledTimes(NUMBER_OF_TICKS);
        expect(secondOnTick).toHaveBeenCalledTimes(NUMBER_OF_TICKS);
    });

    it('should notify command handlers when a command occur', async () => {
        const firstOnCommand = jest.fn();
        const secondOnCommand = jest.fn();

        game.onCommand(firstOnCommand);
        game.onCommand(secondOnCommand);

        expect(firstOnCommand).not.toHaveBeenCalled();
        expect(secondOnCommand).not.toHaveBeenCalled();

        new NoopTeam(game);
        new NoopTeam(game);
        new NoopTeam(game);

        await game.play();

        expect(firstOnCommand).toHaveBeenCalledTimes(NUMBER_OF_TICKS * 3);
        expect(secondOnCommand).toHaveBeenCalledTimes(NUMBER_OF_TICKS * 3);
    });

    describe('serialize', () => {
        it('serialize its state', () => {
            expect(game.serialize()).toStrictEqual({
                teams: [],
                tick: 0,
                totalTick: NUMBER_OF_TICKS,
                teamPlayOrderings: {},
                map: { tiles: expect.any(Array), diamonds: expect.any(Array) },
                gameConfig: new TickGameConfig(),
            });
        });

        it('serialize its teams', async () => {
            new NoopTeam(game);
            new NoopTeam(game);
            new NoopTeam(game);

            expect(game.serialize()).toStrictEqual({
                teams: [expect.any(Object), expect.any(Object), expect.any(Object)],
                tick: 0,
                totalTick: NUMBER_OF_TICKS,
                teamPlayOrderings: {},
                map: { tiles: expect.any(Array), diamonds: expect.any(Array) },
                gameConfig: new TickGameConfig(),
            });
        });

        it('serialize its tick value', async () => {
            new NoopTeam(game);

            await game.play();

            expect(game.serialize()).toStrictEqual({
                teams: [expect.any(Object)],
                tick: NUMBER_OF_TICKS,
                totalTick: NUMBER_OF_TICKS,
                teamPlayOrderings: {},
                map: { tiles: expect.any(Array), diamonds: expect.any(Array) },
                gameConfig: new TickGameConfig(),
            });
        });
    });
});
