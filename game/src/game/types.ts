import { DIAMOND, MAP, SCORE } from './config';

export type TileType = 'EMPTY' | 'WALL' | 'SPAWN' | 'DIAMOND';

export type Position = { x: number; y: number };

export interface Tile {
    type: TileType;
    position: Position;
    number?: number;
}

export interface Diamond {
    id: string;
    position: Position;
    summonLevel: number;
    points: number;
    ownerId?: string;
}

export interface Path {
    status: 'success' | 'noPath' | 'timeout';
    path: Position[];
    cost: number;
}

export interface TickTeam {
    id: string;
    isDead: boolean;
    name: string;
    score: number;
    units: TickTeamUnit[];
    errors: string[];
}

export class TickTeamStats {
    summonCount = 0;
    attackCount = 0;
    dropCount = 0;
    vineCount = 0;
}

export interface TickTeamEvent {
    action: 'SUMMON' | 'DROP' | 'VINE' | 'ATTACK' | 'DISCONNECT' | 'COMMAND_TIMEOUT';
    unitId?: string;
    attackEvent?: TickTeamAttackEvent;
    summonEvent?: TickTeamSummonEvent;
    dropEvent?: TickTeamDropEvent;
    vineEvent?: TickTeamVineEvent;
}

export interface TickTeamAttackEvent {
    targetUnitId: string;
}
export interface TickTeamSummonEvent {
    diamondPoints: number;
    diamondCurrentSummonLevel: number;
}
export interface TickTeamDropEvent {
    dropPosition: Position;
    diamondId: string;
    pointsScored: number;
    diamondSummonLevel: number;
}
export interface TickTeamVineEvent {
    vineUnitId: string;
    diamondSummonLevel: number | null;
    diamondPoints: number | null;
}

export interface TickTeamUnitState {
    positionBefore?: Position;
    wasVinedBy?: string;
    wasAttackedBy?: string;
    positionBeforeDying?: Position;
    hasSummoned?: boolean;
}

export interface TickTeamUnit {
    id: string;
    teamId: string;
    position: Position;
    path: Position[];
    hasDiamond: boolean;
    diamondId?: string;
    isSummoning: boolean;
    hasSpawned: boolean;
    lastState: TickTeamUnitState;
}

export interface TickMap {
    tiles: TileType[][];
    diamonds: Diamond[];
}

export class TickGameConfig {
    warmUpPeriod: number = SCORE.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD;
    pointsPerDiamond: number = SCORE.POINTS_PER_DIAMOND;
    maximumDiamondSummonLevel: number = DIAMOND.MAXIMUM_SUMMON_LEVEL;
    initialDiamondSummonLevel: number = DIAMOND.INITIAL_SUMMON_LEVEL;
    maximumUnitPerPosition: number = MAP.MAX_UNITS_ON_A_POSITION;
}

export interface Tick {
    tick: number;
    totalTick: number;
    teams: TickTeam[];
    map: TickMap;
    gameConfig: TickGameConfig;
    playingTeamId?: string;
    teamPlayOrderings: TeamPlayOrderings;
}

export interface TeamPlayOrderings {
    [tick: number]: string[];
}

export interface PlayerTick extends Tick {
    teamId: string;
}

export interface CommandActionUnit {
    type: 'UNIT';
    action: 'SPAWN' | 'MOVE' | 'SUMMON' | 'DROP' | 'VINE' | 'ATTACK' | 'NONE';
    unitId: string;
    target?: Position;
}

export type CommandAction = CommandActionUnit;

export interface Command {
    actions: CommandAction[];
}

export interface ViewerTick extends Omit<Tick, 'map' | 'teamPlayOrderings' | 'teams'> {
    map: ViewerTickMap;
    teams: ViewerTickTeam[];
}

export interface ViewerTickTeam extends TickTeam {
    events: TickTeamEvent[];
    stats: TickTeamStats;
}

export interface ViewerTickMap extends Omit<TickMap, 'tiles'> {
    viewerTiles: number[][];
}

export enum ViewerTiles {
    FLOOR = 0,
    SPAWN = 1,
    DIAMOND = 2,
    WATERWALL = 3,
    STONEWALL = 4,
    TRAP = 5,
}
