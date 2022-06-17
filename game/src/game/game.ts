import { Team } from './teams/team';
import { logger } from '../logger';
import { hny, shuffle, sortRankTeams, timeoutAfter } from '../utils';
import { ArgumentError, TeamError } from './error';
import { Command, Path, PlayerTick, Position, TeamPlayOrderings, Tick, TickGameConfig, Tile, ViewerTick } from './types';
import { GameMap } from './map';
import { distanceBetween, hash } from './position';
import { Viewer } from './viewer';
import { Unit } from './units/unit';
import { MAP_FILE_FOLDER } from './map';
import aStar from 'a-star';
import fs from 'fs';
import { GAME, UNIT } from './config';

export interface GameOptions {
    gameMapFile: string;
    numberOfTicks: number;
    timeMsAllowedPerTicks: number;
    delayMsBetweenTicks: number;
    maxWaitTimeMsBeforeStartingGame: number;
    expectedNumberOfTeams: number;
    numberOfUnitsPerTeam: number;
}

export interface GameResult {
    teamName: string;
    rank: number;
    score: number;
}

export interface TeamStats {
    responseTimePerTicks: number[];
    processingTimePerTicks: number[];
    unitsPerTicks: number[];
    nbTimeouts: number;
}

export class Game {
    public static readonly DEFAULT_GAME_OPTIONS: GameOptions = {
        gameMapFile: '',
        numberOfTicks: 100,
        timeMsAllowedPerTicks: 0,
        maxWaitTimeMsBeforeStartingGame: 0,
        expectedNumberOfTeams: 3,
        delayMsBetweenTicks: 0,
        numberOfUnitsPerTeam: UNIT.INITIAL_UNIT_COUNT,
    };

    public map: GameMap;

    private callbackOnGameCompleted: ((gameResults: GameResult[], err?: Error) => any)[] = [];
    private callbackOnTick: ((tick: number) => any)[] = [];
    private callbackOnCommand: ((team: Team) => any)[] = [];
    private _isRunning = false;
    private _isCompleted = false;
    private maxWaitTimeInterval: NodeJS.Timeout;
    private teamPlayOrderings: TeamPlayOrderings;

    public currentTick = 0;
    public readonly teams: Team[] = [];
    public readonly viewers: Viewer[] = [];

    public readonly responseTimePerTeam: Map<Team, TeamStats>;

    constructor(public options?: Partial<GameOptions>) {
        this.options = {
            ...Game.DEFAULT_GAME_OPTIONS,
            ...options,
        };

        this.validateOptions(this.options);

        Unit.nextId = 0;
        this.responseTimePerTeam = new Map<Team, TeamStats>();

        if (!this.options.gameMapFile || this.options.gameMapFile === '') {
            const files = shuffle(fs.readdirSync(MAP_FILE_FOLDER));
            logger.info(`Using a random map : ${files[0]}`);
            this.map = GameMap.fromFile(MAP_FILE_FOLDER + files[0]);
        } else if (this.options.gameMapFile === 'empty') {
            logger.info(`Using empty map`);
            this.map = GameMap.empty(50);
        } else {
            try {
                this.map = GameMap.fromFile(this.options.gameMapFile);
                logger.info(`Using ${this.options.gameMapFile}`);
            } catch (ex) {
                throw new ArgumentError('mapName', `the map ${this.options.gameMapFile} is invalid`);
            }
        }

        if (this.options.expectedNumberOfTeams === undefined) {
            this.options.expectedNumberOfTeams = 4;
        }

        ArgumentError.validateNonZeroPositiveNumber(this.options.expectedNumberOfTeams, 'expectedNumberOfTeams');
        logger.info(
            `The game will have ${this.options.expectedNumberOfTeams} team(s) and ${this.options.numberOfUnitsPerTeam} unit(s) per team.`,
        );

        if (this.options.maxWaitTimeMsBeforeStartingGame !== 0) {
            ArgumentError.validateNonZeroPositiveNumber(
                this.options.maxWaitTimeMsBeforeStartingGame,
                'maxWaitTimeMsBeforeStartingGame',
            );
            logger.info(
                `The game will start automatically after ${this.options.maxWaitTimeMsBeforeStartingGame} ms or when ${this.options.expectedNumberOfTeams} teams will have joined, whichever come first.`,
            );

            this.maxWaitTimeInterval = setTimeout(() => {
                if (!this.isRunning && !this.isCompleted) {
                    if (this.teams.length === 0) {
                        this.notifyGameCompleted(
                            [],
                            new Error(
                                `Max wait time for the game to start of ${this.options.maxWaitTimeMsBeforeStartingGame} ms exceeded but no teams were registered.`,
                            ),
                        );
                    } else {
                        logger.info(
                            `Starting the game automatically after waiting for ${this.options.maxWaitTimeMsBeforeStartingGame} ms with ${this.teams.length} teams.`,
                        );

                        this.play();
                    }
                }
            }, this.options.maxWaitTimeMsBeforeStartingGame);
        } else if (this.options.expectedNumberOfTeams) {
            logger.info(`The game will start as soon as ${this.options.expectedNumberOfTeams} team(s) will join.`);
        }

        this.callbackOnCommand.push((team) => team.units.forEach((unit) => unit.incrementSummonLevel()));
        this.callbackOnCommand.push(() => this.map.diamonds.updateDiamondPositionsAfterTurn());
        this.callbackOnTick.push(() => this.map.diamonds.updateDiamondPositionsAfterTurn());
        this.callbackOnTick.push(() => this.map.diamonds.incrementPoints());
    }

    public registerTeam(team: Team): void {
        if (this.isRunning || this.isCompleted) {
            throw new TeamError(team, `Game already running of completed, can't add team`);
        }

        if (this.teams.indexOf(team) !== -1) {
            throw new TeamError(team, `Team already registed.`);
        }

        logger.info(`Registering new ${team} to the game.`);
        this.teams.push(team);

        if (this.teams.length === this.options.expectedNumberOfTeams) {
            setImmediate(() => {
                logger.info(`Number of expected teams (${this.options.expectedNumberOfTeams}) reached, starting the game.`);
                this.play();
            });
        }
    }

    public registerViewer(v: Viewer): void {
        this.viewers.push(v);
    }

    public deregisterViewer(v: Viewer): void {
        this.viewers.splice(this.viewers.indexOf(v), 1);
    }

    private notifyGameCompleted(gameResults: GameResult[], err?: Error) {
        this.callbackOnGameCompleted.forEach((cb) => cb(gameResults, err));
    }

    private notifyCommandApplied(team: Team) {
        this.callbackOnCommand.forEach((callback) => callback(team));
    }

    private notifyTickApplied(tick: number) {
        this.callbackOnTick.forEach((cb) => cb(tick));
    }

    public getTeam(teamId: string): Team {
        return this.teams.find((c) => c.id === teamId);
    }

    public getUnit(unitId: string): Unit {
        return this.teams.flatMap((c) => c.getUnit(unitId)).find((unit) => !!unit);
    }

    public getUnitAtPosition(position: Position): Unit {
        return this.teams.flatMap((team) => team.getUnitAtPosition(position)).filter((team) => !!team)[0];
    }

    public onGameCompleted(cb: (gameResults: GameResult[], err?: Error) => any): void {
        this.callbackOnGameCompleted.push(cb);
    }

    public onTick(cb: (tick: number) => any): void {
        this.callbackOnTick.push(cb);
    }

    public onCommand(cb: (team: Team) => any): void {
        this.callbackOnCommand.push(cb);
    }

    get isRunning(): boolean {
        return this._isRunning;
    }

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    public hasUnitOnPosition(position: Position): boolean {
        return !!this.getUnitAtPosition(position);
    }

    public getLegalTilesForUnit(unit: Unit, atPosition?: Position): Tile[] {
        const target = atPosition || unit.position;

        return this.map.getWalkableNeighborsForUnit(target, unit);
    }

    public computePathForUnitTo(unit: Unit, to: Position): Path {
        return aStar<Position>({
            start: unit.position,
            isEnd: (node) => hash(node) === hash(to),
            neighbor: (node) => this.getLegalTilesForUnit(unit, node).map((tile) => tile.position),
            distance: distanceBetween,
            hash: hash,
            heuristic: () => 1,
        });
    }

    public async play(): Promise<void> {
        if (this.maxWaitTimeInterval) {
            clearTimeout(this.maxWaitTimeInterval);
        }

        if (this.isRunning) {
            throw new Error(`Game is already running.`);
        }

        this.teams.forEach((team) => {
            team.score = 0;

            this.responseTimePerTeam.set(team, {
                responseTimePerTicks: [],
                processingTimePerTicks: [],
                unitsPerTicks: [],
                nbTimeouts: 0,
            });
        });

        this.computeAllTeamPlayOrderings();

        this._isRunning = true;

        for (let tick = 0; tick < this.options.numberOfTicks; tick++) {
            await this.playOneTurn(tick);
            if (this.teams.length === 0 || this.teams.every((team) => team.isDead)) {
                logger.info('Closing game as no more teams are responding');
                break;
            }
        }
        this.currentTick++;

        this._isCompleted = true;
        this._isRunning = false;

        this.teams.forEach((c) => {
            logger.info(`Sending stats for ${c}`);

            const stat = this.responseTimePerTeam.get(c);
            const event = hny.newEvent();
            event.addField('game.team_name', c.name);
            event.addField('game.score', c.score);
            event.addField('game.nb_of_units', c.units.length);
            event.addField(
                'game.response_time_avg',
                stat.responseTimePerTicks.reduce((a, b) => a + b, 0) / stat.responseTimePerTicks.length,
            );
            event.addField(
                'game.processing_times_avg',
                stat.processingTimePerTicks.reduce((a, b) => a + b, 0) / stat.processingTimePerTicks.length,
            );
            event.addField('game.nb_of_timeouts', stat.nbTimeouts);

            event.addField('service_name', 'game');
            event.addField('name', 'game_stats');

            event.send();
        });

        this.notifyGameCompleted(
            this.teams
                .sort((a, b) => sortRankTeams(a, b, this.responseTimePerTeam))
                .map((c, i) => ({
                    rank: i + 1,
                    teamName: c.name,
                    score: c.score,
                })),
        );
    }

    private async playOneTurn(tick: number) {
        logger.info(`Playing tick ${tick + 1} of ${this.options.numberOfTicks}`);

        this.currentTick = tick;
        this.teams.forEach((team) => team.computeStartOfTurn());
        const startingState = this.serialize();
        this.teams.forEach((team) => team.resetStateOfTurn());

        logger.debug(`Sending Tick ${tick}: ${startingState}`);

        const allTickCommandsWaiting = this.teams
            .filter((team) => !team.isDead)
            .map(async (team) => {
                try {
                    const stat = this.responseTimePerTeam.get(team);
                    let command: Command | void = null;

                    if (this.options.timeMsAllowedPerTicks !== 0) {
                        const timeWhenStarted = new Date().getTime();
                        const additionalDelay =
                            tick < GAME.NUMBER_OF_TICKS_WITH_ADDITIONAL_RESPONSE_DELAY ? GAME.ADDITIONAL_DELAY_MS : 0;
                        const timeout = this.options.timeMsAllowedPerTicks + additionalDelay;

                        command = await Promise.race([
                            timeoutAfter(timeout),
                            team.getNextCommand(this.createStateForPlayer(team, startingState)),
                        ]);

                        stat.responseTimePerTicks.push(new Date().getTime() - timeWhenStarted);
                        stat.unitsPerTicks.push(team.units.length);
                    } else {
                        command = await team.getNextCommand(this.createStateForPlayer(team, startingState));
                    }

                    this.responseTimePerTeam.set(team, stat);
                    return { command: command, team: team };
                } catch (ex) {
                    logger.warn(`Error while fetching ${team} command for tick ${tick}. Exception : ${ex}. Stack : ${ex.stack}`);
                    this.viewers.forEach((viewer) => viewer.onCommand(this.serializeForViewer(), team.id));
                }
                return Promise.reject();
            });

        try {
            const allCommandsAndTeams: { command: Command | void; team: Team }[] = [];
            await Promise.allSettled(allTickCommandsWaiting).then((results) => {
                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        if (result.value) {
                            allCommandsAndTeams.push(result.value);
                        }
                    }
                });
            });

            const tickPlayOrder = this.teamPlayOrderings[this.currentTick];
            allCommandsAndTeams.sort(
                (firstEl, secondEl) => tickPlayOrder.indexOf(firstEl.team.id) - tickPlayOrder.indexOf(secondEl.team.id),
            );

            allCommandsAndTeams.forEach((commandAndTeam) => {
                const command = commandAndTeam.command;
                const team = commandAndTeam.team;
                const stat = this.responseTimePerTeam.get(team);
                if (command) {
                    logger.debug(`Command received for ${team}`, command);

                    const timeWhenStarted = new Date().getTime();
                    team.applyCommand(command);
                    stat.processingTimePerTicks.push(new Date().getTime() - timeWhenStarted);

                    this.notifyCommandApplied(team);
                } else {
                    stat.nbTimeouts = stat.nbTimeouts + 1;
                    team.errors.push(
                        `No command was received in time on tick ${tick}. Timeout value : ${this.options.timeMsAllowedPerTicks}`,
                    );
                    team.events.push({ action: 'COMMAND_TIMEOUT' });
                    logger.info(`No command was received in time for ${team} on tick ${tick}`);
                }
                this.viewers.forEach((viewer) => viewer.onCommand(this.serializeForViewer(), team.id));
                this.responseTimePerTeam.set(team, stat);
            });

            this.viewers.forEach((v) => v.onTick(this.serializeForViewer()));

            if (this.options.delayMsBetweenTicks !== 0) {
                await timeoutAfter(this.options.delayMsBetweenTicks);
            }

            this.notifyTickApplied(tick);
        } catch (ex) {
            logger.error(`An unhandled error occured : ${ex.stack}`);

            this._isRunning = false;
            this.notifyGameCompleted([], ex);

            throw ex;
        }
    }

    private createStateForPlayer({ id: playerId }: Team, { teams: teams, ...tick }: Tick): PlayerTick {
        return {
            ...tick,
            teamId: playerId,
            teams: teams.map(({ id, errors, ...team }) => ({
                ...team,
                id,
                errors: playerId === id ? errors : [],
            })),
        };
    }

    public serialize(): Tick {
        return {
            teams: this.teams.map((c) => c.serialize()),
            tick: this.currentTick,
            totalTick: this.options.numberOfTicks,
            map: this.map?.serialize?.() ?? { tiles: [], diamonds: [] },
            gameConfig: new TickGameConfig(),
            teamPlayOrderings: this.getTeamPlayOrderingsForTick(this.currentTick, this.options.numberOfTicks),
        };
    }

    public serializeForViewer(): ViewerTick {
        return {
            teams: this.teams.map((team) => {
                return { ...team.serialize(), events: [...team.events], stats: team.stats };
            }),
            tick: this.currentTick,
            totalTick: this.options.numberOfTicks,
            map: this.map?.serializeForViewer?.() ?? { viewerTiles: [], diamonds: [] },
            gameConfig: new TickGameConfig(),
        };
    }

    private computeAllTeamPlayOrderings(): void {
        if (!this.teamPlayOrderings) {
            const teamPlayOrderings: TeamPlayOrderings = {};
            let initialOrdering = shuffle(this.teams.map((team) => team.id));
            const reshuffleTick = Math.pow(this.teams.length, 2);
            for (let tick = 0; tick < this.options.numberOfTicks; tick++) {
                if (tick % reshuffleTick === 0) {
                    initialOrdering = shuffle(this.teams.map((team) => team.id));
                }
                initialOrdering.push(initialOrdering.shift());
                teamPlayOrderings[tick] = [...initialOrdering];
            }
            this.teamPlayOrderings = teamPlayOrderings;
        }
    }

    private getTeamPlayOrderingsForTick(currentTick: number, numberOfTicks: number): TeamPlayOrderings {
        const teamPlayOrderings: TeamPlayOrderings = {};
        if (this.teamPlayOrderings) {
            const endTick = Math.min(numberOfTicks, currentTick + GAME.TEAM_PLAY_ORDERINGS_HORIZON);
            for (let tick = this.currentTick; tick < endTick; tick++) {
                teamPlayOrderings[tick] = this.teamPlayOrderings[tick];
            }
        }
        return teamPlayOrderings;
    }

    private validateOptions(options: Partial<GameOptions>) {
        ArgumentError.validatePositiveNumber(options.delayMsBetweenTicks, 'delayBetweenTicksMs');
        ArgumentError.validatePositiveNumber(options.timeMsAllowedPerTicks, 'timePerTickMs');

        ArgumentError.validateNonZeroPositiveNumber(options.numberOfTicks, 'nbOfTicks');
        ArgumentError.validateNonZeroPositiveNumber(options.numberOfUnitsPerTeam, 'nbOfUnitsPerTeam');
    }
}
