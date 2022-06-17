import { NoopTeam } from './teams/noopteam';
import { Game } from '../src/game/game';
import { GameMap } from '../src/game/map';
import { TileType, Tile, ViewerTiles } from '../src/game/types';
import { DIAMOND } from '../src/game/config';

describe('Map', () => {
    let game: Game;

    const SIMPLE_MAP: ViewerTiles[][] = [
        [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR],
        [ViewerTiles.WATERWALL, ViewerTiles.SPAWN, ViewerTiles.WATERWALL, ViewerTiles.WATERWALL, ViewerTiles.FLOOR],
        [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.DIAMOND, ViewerTiles.FLOOR, ViewerTiles.FLOOR],
        [ViewerTiles.FLOOR, ViewerTiles.WATERWALL, ViewerTiles.WATERWALL, ViewerTiles.WATERWALL, ViewerTiles.WATERWALL],
        [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR],
        [ViewerTiles.WATERWALL, ViewerTiles.WATERWALL, ViewerTiles.WATERWALL, ViewerTiles.SPAWN, ViewerTiles.WATERWALL],
    ];

    const DEFAULT_TILE: Tile = { type: 'EMPTY', position: { x: 0, y: 0 } };

    const SIMPLE_MAP_HEIGHT = 6;
    const SIMPLE_MAP_WIDTH = 5;

    it('should return undefined for an invalid x/y', () => {
        const gameMap = GameMap.fromArray(SIMPLE_MAP);

        expect(gameMap.getTile({ x: 1000000, y: 10000000 })).toBeFalsy();
    });
    it('should return the correct walkable status from tiles', () => {
        const gameMap = GameMap.fromArray(SIMPLE_MAP);
        game = new Game();
        game.map = gameMap;

        new NoopTeam(game);

        expect(gameMap.isWalkableTile({ ...DEFAULT_TILE, type: 'WALL' }, game, false, false)).toBeFalsy();

        expect(gameMap.isWalkableTile({ ...DEFAULT_TILE, type: 'SPAWN' }, game, false, false)).toBeFalsy();

        expect(gameMap.isWalkableTile({ ...DEFAULT_TILE, type: 'EMPTY' }, game, false, false)).toBeTruthy();

        expect(gameMap.isWalkableTile({ ...DEFAULT_TILE, type: 'DIAMOND' }, game, false, false)).toBeTruthy();
        expect(gameMap.isWalkableTile({ type: 'EMPTY', position: { x: 2, y: 2 } }, game, false, true)).toBeFalsy();

        expect(gameMap.isWalkableTile({ ...DEFAULT_TILE, type: 'SPAWN' }, game, true, false)).toBeTruthy();
    });

    it('should import the map from an array', () => {
        const gameMap = GameMap.fromArray(SIMPLE_MAP);

        expect(gameMap.height).toBe(SIMPLE_MAP_HEIGHT);
        expect(gameMap.width).toBe(SIMPLE_MAP_WIDTH);

        expect(gameMap.getTile({ x: 0, y: 0 })).toEqual({
            position: { x: 0, y: 0 },
            type: 'EMPTY',
            number: 0,
        });
        expect(gameMap.getTile({ x: 5, y: 4 })).toEqual({
            position: { x: 5, y: 4 },
            type: 'WALL',
            number: 3,
        });
        expect(gameMap.getTile({ x: 1, y: 2 })).toEqual({
            position: { x: 1, y: 2 },
            type: 'WALL',
            number: 3,
        });
        expect(gameMap.getTile({ x: 2, y: 2 })).toEqual({
            position: { x: 2, y: 2 },
            type: 'EMPTY',
            number: 0,
        });
        expect(gameMap.getTile({ x: 1, y: 1 })).toEqual({
            position: { x: 1, y: 1 },
            type: 'SPAWN',
            number: 1,
        });
    });

    it('should serialize the map correctly', () => {
        const gameMap = GameMap.fromArray(SIMPLE_MAP);
        const mapCopy = JSON.parse(JSON.stringify(SIMPLE_MAP)) as ViewerTiles[][];
        const tileMapCopy: TileType[][] = [];
        mapCopy.forEach((row, xIndex) => {
            tileMapCopy[xIndex] = [];
            row.forEach((tile, yIndex, array) => {
                if (tile === ViewerTiles.DIAMOND) {
                    array[yIndex] = ViewerTiles.FLOOR;
                }
                tileMapCopy[xIndex][yIndex] = gameMap.getTileTypeFromOrdinal(tile);
            });
        });

        expect(gameMap.serialize()).toEqual({
            tiles: tileMapCopy,
            diamonds: [{ id: expect.any(String), points: 0, summonLevel: DIAMOND.INITIAL_SUMMON_LEVEL, position: { x: 2, y: 2 } }],
        });
    });
});
