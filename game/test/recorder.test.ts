import fs from 'fs';
import { Recorder, RecorderMode } from '../src/recorder/recorder';
import { Game } from '../src/game/game';
import { NoopTeam } from './teams/noopteam';
import { TickGameConfig, ViewerTick } from '../src/game/types';

jest.mock('fs');
jest.useFakeTimers('legacy');

const NUMBER_OF_TICKS = 5;
const NUMBER_OF_TEAMS = 2;

describe('Recorder', () => {
    let game: Game;

    const givenTwoTeams = () => {
        return new Promise<void>((resolve) => {
            const myFirstTeam = new NoopTeam(game);
            const mySecondTeam = new NoopTeam(game);

            myFirstTeam.getNextCommand = jest.fn(() => Promise.resolve({}));
            mySecondTeam.getNextCommand = jest.fn(() => Promise.resolve({}));

            setImmediate(() => resolve());
        });
    };

    describe('RecorderMode.Command', () => {
        it('should serialize the game for all received command', async () => {
            game = new Game({
                numberOfTicks: NUMBER_OF_TICKS,
                expectedNumberOfTeams: NUMBER_OF_TEAMS,
                maxWaitTimeMsBeforeStartingGame: 0,
                gameMapFile: 'empty',
            });
            game.serializeForViewer = jest.fn(() => {
                return {} as ViewerTick;
            });
            new Recorder(game, RecorderMode.Command);

            await givenTwoTeams();

            // Game is serialized once for the each command, then once per end of turn.
            expect(game.serializeForViewer).toHaveBeenCalledTimes(NUMBER_OF_TICKS + NUMBER_OF_TEAMS * NUMBER_OF_TICKS);
        });

        it('should append to the buffer for all received command', async () => {
            game = new Game({
                numberOfTicks: NUMBER_OF_TICKS,
                expectedNumberOfTeams: NUMBER_OF_TEAMS,
                maxWaitTimeMsBeforeStartingGame: 0,
                gameMapFile: 'empty',
            });
            const recorder = new Recorder(game, RecorderMode.Command);

            await givenTwoTeams();

            expect(recorder.buffer.length).toBe(NUMBER_OF_TICKS * NUMBER_OF_TEAMS + NUMBER_OF_TICKS);
        });
    });

    describe('RecorderMode.Tick', () => {
        it('should serialize the game for every tick', async () => {
            const serializeSpy = jest.spyOn(Game.prototype, 'serializeForViewer').mockReturnValue({} as ViewerTick);
            game = new Game({
                numberOfTicks: NUMBER_OF_TICKS,
                expectedNumberOfTeams: NUMBER_OF_TEAMS,
                maxWaitTimeMsBeforeStartingGame: 0,
                gameMapFile: 'empty',
            });
            new Recorder(game, RecorderMode.Tick);

            await givenTwoTeams();

            // The game serialize itself once per tick to send to all players
            // The recorder serialize the game once per tick
            expect(serializeSpy).toHaveBeenCalledTimes(NUMBER_OF_TICKS);
        });

        it('should modify the buffer for every tick', async () => {
            game = new Game({
                numberOfTicks: NUMBER_OF_TICKS,
                expectedNumberOfTeams: NUMBER_OF_TEAMS,
                maxWaitTimeMsBeforeStartingGame: 0,
                gameMapFile: 'empty',
            });
            const recorder = new Recorder(game, RecorderMode.Tick);

            await givenTwoTeams();

            expect(recorder.buffer.length).toBe(NUMBER_OF_TICKS);
        });
    });

    describe('saveToFile', () => {
        let recorder: Recorder;

        beforeEach(() => {
            recorder = new Recorder(new Game({ gameMapFile: 'empty' }), RecorderMode.Command);
        });

        it('should save an object to a file', () => {
            recorder.saveToFile('path/to/file');

            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        });

        it('should save on the expected path', () => {
            recorder.saveToFile('path/to/file');

            expect(fs.writeFileSync).toHaveBeenCalledWith('path/to/file', '[]');
        });

        it('should stringify the object', () => {
            recorder.buffer = [
                {
                    teams: [],
                    map: { viewerTiles: [[]], diamonds: [] },
                    tick: 0,
                    totalTick: 10,
                    gameConfig: new TickGameConfig(),
                },
            ];
            recorder.saveToFile('path/to/file');

            expect(fs.writeFileSync).toHaveBeenCalledWith('path/to/file', JSON.stringify(recorder.buffer, null, 2));
        });
    });
});
