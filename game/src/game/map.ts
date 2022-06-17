import bmp from 'bmp-js';
import fs from 'fs';
import { Diamond, Position, TickMap, Tile, TileType, ViewerTickMap, ViewerTiles } from './types';
import { Unit } from './units/unit';
import { Game } from './game';
import { MAP, DIAMOND, SCORE } from './config';
import { v4 as uuid } from 'uuid';
import { Diamonds } from './diamonds';

export const MAP_FILE_FOLDER = './maps/';

export class GameMap {
    public diamonds: Diamonds;
    public spawnPoints: Position[] = [];
    public viewerTiles: number[][];
    public playerTiles: TileType[][];

    private static VIEWER_TILE_TO_PLAYER_TILE: { [tile: number]: TileType } = {
        [ViewerTiles.FLOOR]: 'EMPTY',
        [ViewerTiles.SPAWN]: 'SPAWN',
        [ViewerTiles.DIAMOND]: 'EMPTY',
        [ViewerTiles.TRAP]: 'EMPTY',
        [ViewerTiles.WATERWALL]: 'WALL',
        [ViewerTiles.STONEWALL]: 'WALL',
    };

    constructor(tiles: number[][], private _height: number, private _width: number) {
        this.viewerTiles = Array.from(new Array(_height)).map(() => []);
        this.playerTiles = Array.from(new Array(_height)).map(() => []);
        const diamonds: Diamond[] = [];
        tiles.forEach((row, colIndex) => {
            row.forEach((tile, rowIndex) => {
                const position: Position = {
                    x: colIndex,
                    y: rowIndex,
                };
                this.viewerTiles[colIndex][rowIndex] = tile;
                this.playerTiles[colIndex][rowIndex] = GameMap.VIEWER_TILE_TO_PLAYER_TILE[tile];

                if (!this.playerTiles[colIndex][rowIndex]) {
                    throw new Error(
                        `The tile ${tile} has no proper mapping to tile type. Please add one in the VIEWER_TILE_TO_PLAYER_TILE object.`,
                    );
                }

                if (tile === ViewerTiles.DIAMOND) {
                    diamonds.push({
                        id: uuid(),
                        position,
                        summonLevel: DIAMOND.INITIAL_SUMMON_LEVEL,
                        points: 0,
                    });

                    this.viewerTiles[colIndex][rowIndex] = ViewerTiles.FLOOR;
                    row[rowIndex] = ViewerTiles.FLOOR;
                }

                if (tile === ViewerTiles.SPAWN) {
                    this.spawnPoints.push(position);
                }
            });
        });
        this.diamonds = new Diamonds(diamonds);
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    public getTileTypeFromOrdinal(ordinal: number): TileType {
        return GameMap.VIEWER_TILE_TO_PLAYER_TILE[ordinal];
    }

    public getTile(from: Position): Tile {
        const tileNumber = this.viewerTiles?.[from.x]?.[from.y];
        const tileType = this.playerTiles?.[from.x]?.[from.y];
        return (
            tileNumber !== undefined &&
            tileType !== undefined && {
                position: from,
                number: tileNumber,
                type: tileType,
            }
        );
    }

    public getNeighborPositions(from: Position): Position[] {
        return [
            { x: from.x, y: from.y - 1 },
            { x: from.x, y: from.y + 1 },
            { x: from.x - 1, y: from.y },
            { x: from.x + 1, y: from.y },
        ].filter((position) => this.isInBound(position));
    }

    public getNeighbors(from: Position): Tile[] {
        return this.getNeighborPositions(from).map((position) => this.getTile(position));
    }

    public getWalkableNeighborsForUnit(from: Position, unit: Unit): Tile[] {
        return this.getWalkableNeighbors(from, unit.team.game, unit.isUnitOnSpawn(), unit.hasDiamond);
    }

    public getWalkableNeighbors(from: Position, game: Game, isUnitOnSpawn: boolean, doesUnitHaveDiamond: boolean): Tile[] {
        return this.getNeighbors(from).filter((tile) => this.isWalkableTile(tile, game, isUnitOnSpawn, doesUnitHaveDiamond));
    }

    public getSpacesBetween(from: Position, to: Position): Tile[] {
        const deltaX = from.x - to.x;
        const deltaY = from.y - to.y;

        if (deltaX !== 0 && deltaY !== 0) {
            return [];
        }

        /*
         * range(10, 12) gives 11, 12.
         * range(20, 18) gives 19, 18.
         * So this returns the positions from the original position to the target, excluding the original position.
         */
        const range = (a: number, b: number) => {
            const lower = Math.min(a, b);
            const currentPositionOffset = a < b ? 1 : 0;
            const values = [...Array(Math.abs(b - a)).keys()].map((i) => i + lower + currentPositionOffset);
            return a < b ? values : values.reverse();
        };

        return [
            ...range(from.x, to.x).map((x) => ({
                x,
                y: from.y,
            })),
            ...range(from.y, to.y).map((y) => ({
                x: from.x,
                y,
            })),
        ].map((position) => this.getTile(position));
    }

    public isNotBlockingLineOfSight(tile: Tile, isUnitOnSpawn: boolean): boolean {
        return tile.type !== 'WALL' && (isUnitOnSpawn || tile.type !== 'SPAWN');
    }

    public isWalkableTile(tile: Tile, game: Game, isUnitOnSpawnOrDead: boolean, doesUnitHaveDiamond: boolean): boolean {
        const isADiamondOnTile = game.map.diamonds.isADiamond(tile.position);
        return (
            tile.type !== 'WALL' &&
            (isUnitOnSpawnOrDead || tile.type !== 'SPAWN') &&
            (!doesUnitHaveDiamond || !isADiamondOnTile) &&
            (!isADiamondOnTile || !SCORE.isTickWithinWarmUpPeriod(game.currentTick)) &&
            this.doesPositionHaveSpaceLeftForUnit(game, tile)
        );
    }

    public isWalkableTileForUnit(tile: Tile, game: Game, unit: Unit): boolean {
        return this.isWalkableTile(tile, game, unit.isUnitDeadOrOnSpawn(), unit.hasDiamond);
    }

    public isInBound(from: Position): boolean {
        return from.x >= 0 && from.y >= 0 && from.x < this.height && from.y < this.width;
    }

    public serialize(): TickMap {
        return { tiles: [...this.playerTiles], diamonds: this.diamonds.serialize() };
    }

    public serializeForViewer(): ViewerTickMap {
        return { viewerTiles: [...this.viewerTiles], diamonds: this.diamonds.serialize() };
    }

    public static fromArray(array: number[][]): GameMap {
        const height = array.length;
        const width = array[0]?.length || 0;

        return new GameMap(
            array.map((row) => row.slice()),
            height,
            width,
        );
    }

    public static fromFile(mapFile: string): GameMap {
        const COLOR_TO_TILE = new Map<number, ViewerTiles>([
            [0x00, ViewerTiles.STONEWALL], // BLACK
            [0x333333, ViewerTiles.WATERWALL], // DARK GRAY rgb(51, 51, 51);
            [0x0000ff, ViewerTiles.SPAWN], // RED rgb(255, 0, 0);
            [0x00ff00, ViewerTiles.DIAMOND], // GREEN rgb(0, 255, 0);
            [0xcccccc, ViewerTiles.TRAP], // ALMOST WHITE rgb(204, 204, 204);
            [0xffffff, ViewerTiles.FLOOR], // WHITE
        ]);

        const bmpBuffer = fs.readFileSync(mapFile);
        const bmpData = bmp.decode(bmpBuffer);

        const tiles: number[][] = new Array(bmpData.width);
        for (let x = 0; x < bmpData.width; x++) {
            tiles[x] = new Array(bmpData.height);

            for (let y = 0; y < bmpData.height; y++) {
                const rawValue = bmpData.data.readUIntBE((y * bmpData.width + x) * 4 + 1, 3);
                if (COLOR_TO_TILE.has(rawValue)) {
                    tiles[x][y] = COLOR_TO_TILE.get(rawValue);
                } else {
                    throw new Error(
                        `Error parsing file ${mapFile}, pixel 0x${rawValue.toString(
                            16,
                        )} on position [${x},${y}] doesn't match ${Array.from(COLOR_TO_TILE.keys()).map(
                            (c) => `0x${c.toString(16)}`,
                        )} for ${COLOR_TO_TILE.values()}`,
                    );
                }
            }
        }

        return GameMap.fromArray(tiles);
    }

    public static empty(size: number): GameMap {
        const tiles = [];
        for (let i = 0; i < size; i++) {
            tiles[i] = Array(size).fill(ViewerTiles.FLOOR);
        }

        tiles[0][0] = ViewerTiles.SPAWN;
        tiles[size - 1][0] = ViewerTiles.SPAWN;
        tiles[0][size - 1] = ViewerTiles.SPAWN;
        tiles[size - 1][size - 1] = ViewerTiles.SPAWN;
        tiles[size / 2][size / 2] = ViewerTiles.DIAMOND;

        return GameMap.fromArray(tiles);
    }

    private doesPositionHaveSpaceLeftForUnit(game: Game, tile: Tile): boolean {
        return (
            game.teams.flatMap((team) => team.getUnitAtPosition(tile.position)).filter((unit) => !!unit).length <
            MAP.MAX_UNITS_ON_A_POSITION
        );
    }
}
