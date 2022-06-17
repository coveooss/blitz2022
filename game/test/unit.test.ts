import { Team } from '../src/game/teams/team';
import { NoopTeam } from './teams/noopteam';
import { Game } from '../src/game/game';
import { GameMap } from '../src/game/map';
import { Unit } from '../src/game/units/unit';
import { CommandAction, Diamond, Path, Position, ViewerTiles } from '../src/game/types';
import { DIAMOND, MAP, SCORE } from '../src/game/config';

const FIRST_DIAMOND_POSITION: Position = { x: 3, y: 4 };
describe('Unit', () => {
    let game: Game;
    let map: GameMap;

    let myTeam: Team;
    let unit: Unit;

    let badBoysEnemyTeam: Team;
    let firstBadBoysUnit: Unit;
    let secondBadBoysUnit: Unit;

    let badGirlsEnemyTeam: Team;
    let firstBadGirlsUnit: Unit;
    let secondBadGirlsUnit: Unit;

    let command: CommandAction;

    let firstDiamondId: string;

    beforeEach(() => {
        // prettier-ignore
        map = GameMap.fromArray([
            // The map is actually flipped 90deg, so right now, this is height: 8, width: 6
            // Spawns are { x: 1, y: 1 } { x: 1, y: 2 } { x: 2, y: 4 } { x: 2, y: 6 }
            // Diamond is at { x: 3, y: 4 }
            [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.WATERWALL, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.WATERWALL, ViewerTiles.FLOOR],
            [ViewerTiles.FLOOR, ViewerTiles.SPAWN, ViewerTiles.SPAWN, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.WATERWALL, ViewerTiles.WATERWALL],
            [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.SPAWN, ViewerTiles.FLOOR, ViewerTiles.SPAWN, ViewerTiles.FLOOR],
            [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.DIAMOND, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR],
            [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR],
            [ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR, ViewerTiles.FLOOR],
        ]);

        game = new Game();
        game.map = map;
        game.currentTick = 100;

        firstDiamondId = game.map.diamonds.getDiamondIdFromPosition(FIRST_DIAMOND_POSITION);

        myTeam = new NoopTeam(game);
        unit = myTeam.units[0];
        unit.position = { x: 0, y: 0 };
        unit.hasSpawned = true;

        badBoysEnemyTeam = new NoopTeam(game);
        firstBadBoysUnit = badBoysEnemyTeam.units[0];
        firstBadBoysUnit.position = { x: 0, y: 6 };
        secondBadBoysUnit = badBoysEnemyTeam.units[1];
        secondBadBoysUnit.position = { x: 0, y: 6 };

        badGirlsEnemyTeam = new NoopTeam(game);
        firstBadGirlsUnit = badGirlsEnemyTeam.units[0];
        firstBadGirlsUnit.position = { x: 0, y: 6 };
        secondBadGirlsUnit = badGirlsEnemyTeam.units[1];
        secondBadGirlsUnit.position = { x: 0, y: 6 };

        command = { action: 'MOVE', unitId: '', target: { x: 0, y: 0 }, type: 'UNIT' };
    });

    describe('validateCommand', () => {
        it('should throw if user is dead and command is not spawn', () => {
            unit.hasSpawned = false;

            expect(() => unit.validateCommand(command)).toThrowError();
        });
        it('should throw if user is summoning and command is not SUMMON', () => {
            unit.hasSpawned = true;
            unit.isSummoning = true;
            command.action = 'ATTACK';

            expect(() => unit.validateCommand(command)).toThrowError();
        });
        it('should not throw if user is summoning and command is SUMMON', () => {
            unit.hasSpawned = true;
            unit.isSummoning = true;
            unit.diamondId = firstDiamondId;
            command.action = 'SUMMON';

            unit.validateCommand(command);
        });
        it('should not throw if user is summoning and command is SUMMON', () => {
            unit.hasSpawned = true;
            unit.isSummoning = true;
            unit.diamondId = firstDiamondId;
            command.action = 'NONE';

            unit.validateCommand(command);
        });

        it('should throw if user is doing an non move action on a spawn', () => {
            unit.hasSpawned = true;
            unit.position = { x: 1, y: 1 };
            command.action = 'ATTACK';

            expect(() => unit.validateCommand(command)).toThrowError();
        });
        it('should not throw if user is doing NONE on a spawn', () => {
            unit.hasSpawned = true;
            unit.position = { x: 1, y: 1 };
            command.action = 'NONE';

            unit.validateCommand(command);
        });
    });
    describe('summon', () => {
        it('should throw if user is dead', () => {
            unit.hasSpawned = false;

            expect(() => unit.summon()).toThrowError();
        });
        it('should throw if user does not have a diamond', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = false;

            expect(() => unit.summon()).toThrowError();
        });
        it('should throw if user have a diamond at max summon level', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = true;
            unit.team.game.map.diamonds.getSummonLevel = jest.fn(() => DIAMOND.MAXIMUM_SUMMON_LEVEL);

            expect(() => unit.summon()).toThrowError();
        });
        it('should set isSummoning on user', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = true;
            unit.isSummoning = false;
            unit.team.game.map.diamonds.getSummonLevel = jest.fn(() => 1);
            unit.team.game.map.diamonds.findDiamondById = jest.fn(() => ({ points: 0 } as Diamond));

            unit.summon();

            expect(unit.isSummoning).toStrictEqual(true);
        });
    });
    describe('incrementSummonLevel', () => {
        it('should do nothing if user is dead', () => {
            unit.hasSpawned = false;

            unit.incrementSummonLevel();

            expect(unit.isSummoning).toStrictEqual(false);
            expect(unit.hasSpawned).toStrictEqual(false);
        });
        it('should do nothing if user is not summoning', () => {
            unit.hasSpawned = true;
            unit.isSummoning = false;

            unit.incrementSummonLevel();

            expect(unit.isSummoning).toStrictEqual(false);
            expect(unit.hasSpawned).toStrictEqual(true);
        });
        it('should increment summon level', () => {
            unit.hasSpawned = true;
            unit.isSummoning = true;
            unit.summonLevel = 0;
            unit.team.game.map.diamonds.getSummonLevel = jest.fn(() => 2);

            unit.incrementSummonLevel();

            expect(unit.isSummoning).toStrictEqual(true);
            expect(unit.summonLevel).toStrictEqual(1);
        });
        it('should summon diamond when at the proper summonLevel', () => {
            unit.hasSpawned = true;
            unit.isSummoning = true;
            unit.summonLevel = 2;
            unit.team.game.map.diamonds.getSummonLevel = jest.fn(() => 2);
            unit.team.game.map.diamonds.summon = jest.fn();

            unit.incrementSummonLevel();

            expect(unit.isSummoning).toStrictEqual(false);
            expect(unit.summonLevel).toStrictEqual(0);
            expect(unit.team.game.map.diamonds.summon).toHaveBeenCalledTimes(1);
        });
    });
    describe('drop', () => {
        it('should pass drop command if unit does have a diamond', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 0 };
            unit.hasDiamond = true;
            unit.team.game.map.diamonds.drop = jest.fn();
            unit.team.game.map.diamonds.findDiamondById = jest.fn(() => ({ points: 0 } as Diamond));

            unit.drop({ x: 2, y: 1 });

            expect(unit.team.game.map.diamonds.drop).toHaveBeenCalledTimes(1);
            expect(unit.hasDiamond).toBe(false);
            expect(unit.diamondId).toBeNull();
        });
        it('should transfer the diamond if unit does have a diamond but drops it to a tile with another unit', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 0 };
            unit.hasDiamond = true;
            unit.diamondId = 'diamondId';
            firstBadBoysUnit.position = { x: 2, y: 1 };
            unit.team.game.map.diamonds.transfer = jest.fn();

            unit.drop(firstBadBoysUnit.position);

            expect(unit.team.game.map.diamonds.transfer).toHaveBeenCalledTimes(1);
            expect(unit.hasDiamond).toBe(false);
            expect(unit.diamondId).toBeNull();
            expect(firstBadBoysUnit.hasDiamond).toBe(true);
            expect(firstBadBoysUnit.diamondId).toStrictEqual('diamondId');
        });
        it('should throw if user is dead', () => {
            unit.hasSpawned = false;

            expect(() => unit.drop({ x: 2, y: 0 })).toThrowError();
        });
        it('should throw if user does not have a diamond', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = false;

            expect(() => unit.drop({ x: 2, y: 0 })).toThrowError();
        });
        it('should throw if user drop on itself', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = true;
            unit.position = { x: 2, y: 2 };

            expect(() => unit.drop({ x: 2, y: 2 })).toThrowError();
        });
        it('should throw if user drop on non adjacent spot', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = true;
            unit.position = { x: 2, y: 0 };

            expect(() => unit.drop({ x: 2, y: 2 })).toThrowError();
        });
        it('should throw if user does not drop on empty tile', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = true;
            unit.position = { x: 0, y: 2 };

            expect(() => unit.drop({ x: 0, y: 3 })).toThrowError();
        });
        it('should throw if user drops on a tile with a user that has a diamond', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 0 };
            unit.hasDiamond = true;
            unit.diamondId = 'diamondId';
            firstBadBoysUnit.position = { x: 2, y: 1 };
            firstBadBoysUnit.hasDiamond = true;

            expect(() => unit.drop(firstBadBoysUnit.position)).toThrowError();
        });
    });
    describe('move', () => {
        it('should not be allowed to move on diamond during warm up period', () => {
            if (SCORE.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD !== 0) {
                unit.hasDiamond = false;
                unit.diamondId = null;
                unit.position = { x: 3, y: 3 };
                unit.team.game.currentTick = 0;

                expect(() => unit.move({ ...unit.position, y: 4 })).toThrowError();
            }
        });
        it('should ignore move command if unit has been lassoed', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 4 };
            unit.stateOfTurn.wasVinedBy = 'allo';

            unit.move({ x: 2, y: 7 });

            expect(unit.path).toStrictEqual([]);
        });
        it('should pick up diamond if unit has been lassoed on one', () => {
            unit.hasSpawned = true;
            unit.position = { x: 3, y: 4 };
            unit.stateOfTurn.wasVinedBy = 'allo';

            unit.move({ x: 3, y: 5 });

            expect(unit.hasDiamond).toStrictEqual(true);
        });
        it('should pick up diamond if unit moves on itself and somehow does not have the diamond yet', () => {
            unit.hasSpawned = true;
            unit.position = { x: 3, y: 4 };

            unit.move({ x: 3, y: 4 });

            expect(unit.hasDiamond).toStrictEqual(true);
        });
        it('should throw if target is not walkable', () => {
            unit.hasSpawned = true;
            unit.hasDiamond = true;
            unit.position = { x: 2, y: 4 };

            expect(() => unit.move({ x: 3, y: 4 })).toThrowError();
        });
        it('should move if target is adjacent', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 4 };

            unit.move({ x: 2, y: 5 });

            expect(unit.position).toStrictEqual({ x: 2, y: 5 });
        });
        it('should pick up diamond after move to an adjacent target', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 4 };

            unit.move({ x: 3, y: 4 });

            expect(unit.position).toStrictEqual({ x: 3, y: 4 });
            expect(unit.hasDiamond).toStrictEqual(true);
        });
        it('should throw if the target is out of bounds', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 4 };

            expect(() => unit.move({ x: 1000, y: 1000 })).toThrowError();
        });
        it('should recompute a* when final target has changed', () => {
            unit.hasSpawned = true;
            unit.position = { x: 4, y: 4 };

            unit.move({ x: 4, y: 7 });

            expect(unit.position).toStrictEqual({ x: 4, y: 5 });
            expect(unit.path).toStrictEqual([
                { x: 4, y: 6 },
                { x: 4, y: 7 },
            ]);

            unit.move({ x: 4, y: 1 });

            expect(unit.position).toStrictEqual({ x: 4, y: 4 });
            expect(unit.path).toStrictEqual([
                { x: 4, y: 3 },
                { x: 4, y: 2 },
                { x: 4, y: 1 },
            ]);
        });
        it('should recompute a* when the path is no longer possible because of spawn', () => {
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 4 };

            unit.move({ x: 2, y: 7 });

            expect(unit.position).toStrictEqual({ x: 2, y: 5 });

            unit.move({ x: 2, y: 7 });

            expect(unit.position).not.toStrictEqual({ x: 2, y: 6 });
        });
        it('should recompute a* when the path is no longer possible because of 2 enemies', () => {
            unit.hasSpawned = true;
            unit.position = { x: 3, y: 0 };

            unit.move({ x: 3, y: 3 });

            expect(unit.position).toStrictEqual({ x: 3, y: 1 });

            firstBadBoysUnit.position = { x: 3, y: 2 };
            secondBadBoysUnit.position = { x: 3, y: 2 };
            unit.move({ x: 3, y: 3 });

            expect(unit.position).not.toStrictEqual({ x: 3, y: 2 });
        });
        it('should allow passing through diamond with path finding if user has no diamond', () => {
            unit.hasSpawned = true;
            unit.position = { x: 3, y: 3 };

            unit.move({ x: 3, y: 5 });

            expect(unit.position).toStrictEqual({ x: 3, y: 4 });
        });
        it('should not allow passing through diamond with path finding if user has a diamond', () => {
            unit.hasSpawned = true;
            unit.position = { x: 3, y: 3 };
            unit.hasDiamond = true;
            unit.diamondId = 'who cares';

            unit.move({ x: 3, y: 5 });

            expect(unit.position).not.toStrictEqual({ x: 3, y: 4 });
        });

        it('should not recompute a* when the path is clear', () => {
            const path: Path = {
                status: 'success',
                path: [
                    { x: 3, y: 0 },
                    { x: 3, y: 1 },
                    { x: 3, y: 2 },
                    { x: 3, y: 3 },
                ],
                cost: 0,
            };
            game.computePathForUnitTo = jest.fn(() => path);

            unit.hasSpawned = true;
            unit.position = { x: 3, y: 0 };
            const destination = { x: 3, y: 3 };

            unit.move(destination);

            expect(unit.position).toStrictEqual({ x: 3, y: 1 });

            unit.move(destination);

            expect(unit.position).toStrictEqual({ x: 3, y: 2 });
            expect(game.computePathForUnitTo).toHaveBeenCalledTimes(1);
        });
        it('should throw if there is not path possible', () => {
            expect(() => unit.move({ x: 0, y: 7 })).toThrowError();
        });

        it('should let you move on another spawn if already on a spawn', () => {
            unit.position = { x: 1, y: 1 };

            unit.move({ x: 1, y: 2 });

            expect(unit.position).toEqual({ x: 1, y: 2 });
        });

        it('should throw if you move on a spawn when not on a spawn', () => {
            unit.position = { x: 0, y: 1 };
            expect(map.getTile(unit.position).type).toEqual('EMPTY');

            const spawnPosition = { x: 1, y: 1 };
            expect(map.getTile(spawnPosition).type).toEqual('SPAWN');

            expect(() => unit.move(spawnPosition)).toThrowError();
        });
        it('should throw if unit is dead', () => {
            const unitPosition = { x: 1, y: 1 };
            unit.hasSpawned = false;
            unit.position = unitPosition;

            expect(() => unit.move(unitPosition)).toThrowError();
        });

        it('should throw if trying to move on a occupied place', () => {
            unit.position = { x: 0, y: 0 };
            firstBadBoysUnit.position = { x: 2, y: 0 };
            secondBadBoysUnit.position = { x: 2, y: 0 };

            expect(() => unit.move(firstBadBoysUnit.position)).toThrowError();
        });
        it('should move to the first node of the path towards the target', () => {
            expect(unit.position).toEqual({ x: 0, y: 0 });

            unit.move({ x: 0, y: 2 });

            expect(unit.position).toEqual({ x: 0, y: 1 });
            expect(unit.path).toEqual([{ x: 0, y: 2 }]);
        });

        it('should use the precalculated path towards the target on next move', () => {
            expect(unit.position).toEqual({ x: 0, y: 0 });

            unit.move({ x: 0, y: 2 });

            expect(unit.position).toEqual({ x: 0, y: 1 });
            expect(unit.path).toEqual([{ x: 0, y: 2 }]);

            unit.move({ x: 0, y: 2 });

            expect(unit.position).toEqual({ x: 0, y: 2 });
            expect(unit.path).toEqual([]);
        });

        it('should move to the target if adjacent node', () => {
            expect(unit.position).toEqual({ x: 0, y: 0 });

            unit.move({ x: 0, y: 1 });

            expect(unit.position).toEqual({ x: 0, y: 1 });
            expect(unit.path).toEqual([]);
        });

        it('should stay in place if the target is the current position', () => {
            expect(unit.position).toEqual({ x: 0, y: 0 });

            unit.move({ x: 0, y: 0 });

            expect(unit.position).toEqual({ x: 0, y: 0 });
            expect(unit.path).toEqual([]);
        });
    });
    describe('spawn', () => {
        it('should respawn the target', () => {
            unit.position = undefined;
            unit.hasSpawned = false;

            unit.spawn({ x: 1, y: 1 });

            expect(unit.position).toStrictEqual({ x: 1, y: 1 });
            expect(unit.isAlive()).toBeTruthy();
        });

        it('should throw when unit is already spawned', () => {
            unit.position = { x: 1, y: 1 };
            unit.hasSpawned = true;

            expect(() => unit.spawn({ x: 1, y: 1 })).toThrowError();
        });

        it('should throw when trying to spawn on an off limit location', () => {
            unit.hasSpawned = false;

            expect(() => unit.spawn({ x: 1000, y: 1 })).toThrowError();
        });

        it('should throw when trying to spawn on a non spawn location', () => {
            unit.hasSpawned = false;

            expect(() => unit.spawn({ x: 0, y: 0 })).toThrowError();
        });

        it('should throw when trying to spawn on a spawn already occupied by 2 units and no other spawn available', () => {
            unit.hasSpawned = false;
            const occupiedSpawnPosition = { x: 2, y: 6 };
            firstBadBoysUnit.position = occupiedSpawnPosition;
            secondBadBoysUnit.position = occupiedSpawnPosition;

            expect(() => unit.spawn(occupiedSpawnPosition)).toThrowError();
        });
        it('should find another spawn nearby if one is available without a unit', () => {
            const occupiedSpawnPosition = { x: 1, y: 1 };
            unit.hasSpawned = false;
            firstBadBoysUnit.position = occupiedSpawnPosition;
            secondBadBoysUnit.position = occupiedSpawnPosition;

            unit.spawn(occupiedSpawnPosition);

            expect(unit.position).toStrictEqual({ x: 1, y: 2 });
            expect(unit.isAlive()).toBeTruthy();
        });
        it('should find another spawn nearby if one is available with only 1 unit depending on the max unit count per tile', () => {
            const occupiedSpawnPosition = { x: 1, y: 1 };
            const expectedSpawnPosition = { x: 1, y: 2 };

            unit.hasSpawned = false;
            firstBadBoysUnit.position = occupiedSpawnPosition;
            if (MAP.MAX_UNITS_ON_A_POSITION > 1) {
                secondBadBoysUnit.position = occupiedSpawnPosition;
                firstBadGirlsUnit.position = expectedSpawnPosition;
            }

            unit.spawn(occupiedSpawnPosition);

            expect(unit.position).toStrictEqual(expectedSpawnPosition);
            expect(unit.isAlive()).toBeTruthy();
        });
    });

    describe('diamond auto pick up', () => {
        it('should pick up diamond if the unit moves on one', () => {
            unit.hasDiamond = false;
            unit.diamondId = null;
            unit.position = { x: 3, y: 3 };

            unit.move({ ...unit.position, y: 4 });

            expect(unit.hasDiamond).toBe(true);
            expect(unit.diamondId).toBeTruthy();
        });
    });

    describe('attack', () => {
        it('should throw if target does not exist', () => {
            unit.position = { x: 1, y: 3 };

            expect(() => unit.attack({ x: 1, y: 0 })).toThrowError();
        });
        it('should throw if target is on spawn', () => {
            unit.position = { x: 1, y: 0 };
            firstBadBoysUnit.position = { x: 1, y: 1 };
            firstBadBoysUnit.hasSpawned = true;
            firstBadBoysUnit.stateOfTurn.wasAttackedBy = '';

            expect(() => unit.attack({ x: 1, y: 1 })).toThrowError();
        });
        it('should throw if target is dead', () => {
            unit.position = { x: 1, y: 3 };
            firstBadBoysUnit.position = { x: 1, y: 4 };
            firstBadBoysUnit.hasSpawned = false;

            expect(() => unit.attack({ x: 1, y: 4 })).toThrowError();
        });
        it('should kill the target and set it to be spawned', () => {
            unit.position = { x: 1, y: 3 };
            firstBadBoysUnit.position = { x: 1, y: 4 };
            firstBadBoysUnit.hasSpawned = true;
            firstBadBoysUnit.stateOfTurn.wasAttackedBy = '';
            unit.attack(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.stateOfTurn.wasAttackedBy).toBe(unit.id);
            expect(firstBadBoysUnit.hasDiamond).toBe(false);
            expect(firstBadBoysUnit.hasSpawned).toBe(false);
            expect(firstBadBoysUnit.position).toBeNull();
            expect(firstBadBoysUnit.diamondId).toBeNull();
            expect(firstBadBoysUnit.path).toStrictEqual([]);
        });

        it('should allow targetting a unit that moved in the same turn', () => {
            unit.position = { x: 1, y: 3 };
            firstBadBoysUnit.position = { x: 1, y: 3 };
            firstBadBoysUnit.hasSpawned = true;
            firstBadBoysUnit.stateOfTurn.wasAttackedBy = '';
            unit.computeStartOfTurn();
            firstBadBoysUnit.position = { x: 1, y: 4 };
            unit.attack(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.stateOfTurn.wasAttackedBy).toBe(unit.id);
        });

        it('should throw if target is not on the same spot', () => {
            firstBadBoysUnit.position = { x: 0, y: 2 };
            expect(() => unit.attack(firstBadBoysUnit.position)).toThrowError();
        });

        it('should throw if target is on same spot but on a spawn', () => {
            unit.position = { x: 1, y: 1 };
            firstBadBoysUnit.position = { x: 1, y: 1 };

            expect(() => unit.attack(firstBadBoysUnit.position)).toThrowError();
        });

        it('should throw if the unit has a diamond', () => {
            unit.position = { x: 0, y: 1 };
            unit.hasDiamond = true;
            firstBadBoysUnit.position = { x: 0, y: 1 };

            expect(() => unit.attack(firstBadBoysUnit.position)).toThrowError();
        });

        it('should throw if target is already dead', () => {
            unit.position = { x: 0, y: 1 };
            firstBadBoysUnit.position = { x: 0, y: 1 };
            firstBadBoysUnit.hasSpawned = false;

            expect(() => unit.attack(firstBadBoysUnit.position)).toThrowError();
        });

        it('should transfer the diamond to the attacking user', () => {
            const diamondId = map.diamonds.getDiamondIdFromPosition(FIRST_DIAMOND_POSITION);
            firstBadBoysUnit.hasDiamond = true;
            firstBadBoysUnit.diamondId = diamondId;
            firstBadBoysUnit.position = { x: 1, y: 0 };
            firstBadBoysUnit.hasSpawned = true;
            firstBadBoysUnit.stateOfTurn.wasAttackedBy = unit.id;

            unit.attack(firstBadBoysUnit.position);

            expect(map.diamonds.findOwnerIdFromDiamondId(firstDiamondId)).toBe(unit.id);
            expect(unit.hasDiamond).toBe(true);
            expect(unit.diamondId).toBe(diamondId);
            expect(firstBadBoysUnit.hasDiamond).toBe(false);
            expect(firstBadBoysUnit.diamondId).toBeNull();
            expect(firstBadBoysUnit.position).toBeNull();
            expect(firstBadBoysUnit.path).toStrictEqual([]);
            expect(firstBadBoysUnit.hasSpawned).toBe(false);
        });
    });
    describe('vine', () => {
        // It should have two empty spots on each horizontal and vertical tiles.
        const basePosition = {
            x: 3,
            y: 3,
        };

        it('should not allow vine when a diamond is the only empty spot during warm up period', () => {
            if (SCORE.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD !== 0) {
                unit.position = { x: 2, y: 4 };
                firstBadBoysUnit.position = { x: 4, y: 4 };
                firstBadBoysUnit.hasSpawned = true;
                game.currentTick = 0;

                expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
            }
        });
        it('should not allow vine when a diamond is the only empty spot after warm up period when vined unit has diamond', () => {
            unit.position = { x: 2, y: 4 };
            firstBadBoysUnit.position = { x: 4, y: 4 };
            firstBadBoysUnit.hasSpawned = true;
            firstBadBoysUnit.hasDiamond = true;
            game.currentTick = SCORE.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD + 1;

            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });
        it('should allow vine when a diamond is the only empty spot after warm up period', () => {
            unit.position = { x: 2, y: 4 };
            firstBadBoysUnit.position = { x: 4, y: 4 };
            firstBadBoysUnit.hasSpawned = true;
            game.currentTick = SCORE.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD + 1;

            unit.vine(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.position).toEqual({ x: 3, y: 4 });
            expect(firstBadBoysUnit.hasDiamond).toEqual(true);
            expect(firstBadBoysUnit.stateOfTurn.wasVinedBy).toBe(unit.id);
        });

        it('should not allow vine when unit non existant', () => {
            unit.position = { x: 1, y: 1 };
            firstBadBoysUnit.position = { ...basePosition, x: basePosition.x - 2 };
            firstBadBoysUnit.hasSpawned = true;

            expect(() => unit.vine({ x: 10, y: 10 })).toThrowError();
        });

        it('should not allow vine when unit is dead', () => {
            unit.position = { x: 1, y: 1 };
            firstBadBoysUnit.position = basePosition;
            firstBadBoysUnit.hasSpawned = false;

            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });
        it('should not allow vine when unit is on a spawn point', () => {
            unit.position = { x: 1, y: 4 };
            firstBadBoysUnit.position = { x: 1, y: 1 };
            firstBadBoysUnit.hasSpawned = true;

            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });
        it('should not allow vine when target is adjacent', () => {
            unit.position = { x: 1, y: 1 };
            firstBadBoysUnit.position = { x: 1, y: 2 };
            firstBadBoysUnit.hasSpawned = true;

            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });
        it('should not allow vine on equal position as viner', () => {
            unit.position = { x: 1, y: 1 };
            firstBadBoysUnit.position = { x: 1, y: 2 };
            firstBadBoysUnit.hasSpawned = true;

            expect(() => unit.vine({ x: 1, y: 1 })).toThrowError();
        });
        it('should not allow vine if no position is available between viner and vined', () => {
            unit.position = { x: 4, y: 1 };
            firstBadBoysUnit.position = { x: 4, y: 3 };
            firstBadBoysUnit.hasSpawned = true;
            secondBadBoysUnit.position = { x: 4, y: 2 };
            secondBadBoysUnit.hasSpawned = true;

            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });
        it('should allow targetting a unit from left', () => {
            unit.position = basePosition;
            firstBadBoysUnit.position = { ...basePosition, x: basePosition.x - 2 };
            firstBadBoysUnit.hasSpawned = true;
            unit.vine(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.position).toEqual({ ...basePosition, x: basePosition.x - 1 });
            expect(firstBadBoysUnit.stateOfTurn.wasVinedBy).toBe(unit.id);
        });

        it('should allow targetting a unit from right', () => {
            unit.position = basePosition;
            firstBadBoysUnit.position = { ...basePosition, x: basePosition.x + 2 };
            firstBadBoysUnit.hasSpawned = true;
            unit.vine(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.position).toEqual({ ...basePosition, x: basePosition.x + 1 });
            expect(firstBadBoysUnit.stateOfTurn.wasVinedBy).toBe(unit.id);
        });

        it('should allow targetting a unit from bottom', () => {
            unit.position = basePosition;
            firstBadBoysUnit.position = { ...basePosition, y: basePosition.y + 2 };
            firstBadBoysUnit.hasSpawned = true;
            unit.vine(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.position).toEqual({ ...basePosition, y: basePosition.y + 1 });
            expect(firstBadBoysUnit.stateOfTurn.wasVinedBy).toBe(unit.id);
        });

        it('should allow targetting a unit from top', () => {
            unit.position = basePosition;
            firstBadBoysUnit.position = { ...basePosition, y: basePosition.y - 2 };
            firstBadBoysUnit.hasSpawned = true;
            unit.vine(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.position).toEqual({ ...basePosition, y: basePosition.y - 1 });
            expect(firstBadBoysUnit.stateOfTurn.wasVinedBy).toBe(unit.id);
        });

        it('should allow targetting a unit that moved in the same turn', () => {
            unit.position = basePosition;
            firstBadBoysUnit.position = { ...basePosition, y: basePosition.y - 2 };
            firstBadBoysUnit.hasSpawned = true;
            unit.computeStartOfTurn();
            firstBadBoysUnit.position = { ...basePosition, y: basePosition.y - 3 };
            unit.vine(firstBadBoysUnit.position);

            expect(firstBadBoysUnit.position).toEqual({ ...basePosition, y: basePosition.y - 1 });
            expect(firstBadBoysUnit.stateOfTurn.wasVinedBy).toBe(unit.id);
        });

        it('should not allow targetting a dead unit', () => {
            unit.position = { x: 2, y: 1 };
            firstBadBoysUnit.position = { x: 1, y: 1 };
            firstBadBoysUnit.hasSpawned = false;
            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });

        it('should not allow targetting a unit on spawn', () => {
            unit.position = { x: 2, y: 1 };
            firstBadBoysUnit.position = { x: 1, y: 1 };
            firstBadBoysUnit.hasSpawned = true;
            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });

        it('should not allow targetting a unit through a spawn', () => {
            unit.position = { x: 0, y: 1 };
            firstBadBoysUnit.position = { x: 3, y: 1 };
            firstBadBoysUnit.hasSpawned = true;
            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });

        it('should not allow targetting if the unit has a flag', () => {
            unit.position = basePosition;
            unit.hasDiamond = true;
            firstBadBoysUnit.position = { ...basePosition, x: basePosition.x - 2 };
            firstBadBoysUnit.hasSpawned = true;

            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });

        it('should not allow targetting a unit through a wall', () => {
            unit.position = { x: 0, y: 1 };
            firstBadBoysUnit.position = { x: 0, y: 4 };
            firstBadBoysUnit.hasSpawned = true;
            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });

        it('should not allow targetting a unit in a diagonal', () => {
            unit.position = basePosition;
            firstBadBoysUnit.position = { x: basePosition.x + 1, y: basePosition.y + 1 };
            firstBadBoysUnit.hasSpawned = true;

            expect(() => unit.vine(firstBadBoysUnit.position)).toThrowError();
        });
    });
    describe('getVinedTo', () => {
        it('should vine with diamond if vining unit is friendly', () => {
            firstBadBoysUnit.position = { x: 0, y: 4 };
            firstBadBoysUnit.hasSpawned = true;
            firstBadBoysUnit.hasDiamond = true;
            secondBadBoysUnit.position = { x: 0, y: 6 };
            secondBadBoysUnit.hasSpawned = true;

            firstBadBoysUnit.getVinedTo({ x: 0, y: 5 }, secondBadBoysUnit);

            expect(firstBadBoysUnit.hasDiamond).toStrictEqual(true);
            expect(firstBadBoysUnit.position).toStrictEqual({ x: 0, y: 5 });
            expect(firstBadBoysUnit.path).toStrictEqual([]);
        });
        it('should drop the diamond in its state if vining unit is not friendly', () => {
            firstBadBoysUnit.position = { x: 0, y: 4 };
            firstBadBoysUnit.hasSpawned = true;
            firstBadBoysUnit.diamondId = 'irrelevant';
            firstBadBoysUnit.hasDiamond = true;
            game.map.diamonds.dropDontScorePoints = jest.fn();

            firstBadBoysUnit.getVinedTo({ x: 0, y: 5 }, unit);

            expect(firstBadBoysUnit.hasDiamond).toStrictEqual(false);
            expect(firstBadBoysUnit.diamondId).toBeNull();
            expect(firstBadBoysUnit.position).toStrictEqual({ x: 0, y: 5 });
            expect(firstBadBoysUnit.path).toStrictEqual([]);
            expect(game.map.diamonds.dropDontScorePoints).toHaveBeenCalledTimes(1);
        });
    });
    describe('scorePoints', () => {
        it('should add points when grace period is over', () => {
            unit.team.game.currentTick = SCORE.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD;

            unit.scorePoints(1);

            expect(unit.team.score).toStrictEqual(1);
        });
        it('should not add points when grace period is not over', () => {
            unit.team.game.currentTick = SCORE.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD - 1;

            unit.scorePoints(1);

            expect(unit.team.score).toStrictEqual(0);
        });
    });

    describe('utilitary methods', () => {
        it('should translate if unit is on spawn correctly when on a spawn', () => {
            unit = new Unit(myTeam);
            unit.hasSpawned = true;
            unit.position = { x: 1, y: 1 };
            expect(unit.isUnitOnSpawn()).toBe(true);
        });
        it('should translate if unit is on spawn correctly when not on a spawn', () => {
            unit = new Unit(myTeam);
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 2 };
            expect(unit.isUnitOnSpawn()).toBe(false);
        });
        it('should translate if unit is dead or on spawn correctly when on a spawn', () => {
            unit = new Unit(myTeam);
            unit.hasSpawned = true;
            unit.position = { x: 1, y: 1 };
            expect(unit.isUnitDeadOrOnSpawn()).toBe(true);
        });
        it('should translate if unit is dead or on spawn correctly when on a spawn', () => {
            unit = new Unit(myTeam);
            unit.hasSpawned = false;
            unit.position = null;
            expect(unit.isUnitDeadOrOnSpawn()).toBe(true);
        });
        it('should translate if unit is dead or on spawn correctly when not on a spawn', () => {
            unit = new Unit(myTeam);
            unit.hasSpawned = true;
            unit.position = { x: 2, y: 2 };
            expect(unit.isUnitDeadOrOnSpawn()).toBe(false);
        });
    });

    describe('serialize', () => {
        it('should serialize its state', () => {
            unit = new Unit(myTeam);
            unit.hasSpawned = true;
            unit.position = { x: 4, y: 3 };

            expect(unit.serialize()).toStrictEqual({
                id: expect.any(String),
                teamId: expect.any(String),
                path: [],
                hasDiamond: false,
                hasSpawned: true,
                isSummoning: false,
                position: { x: 4, y: 3 },
                lastState: {
                    hasSummoned: undefined,
                    positionBeforeDying: undefined,
                    wasVinedBy: undefined,
                    positionBefore: undefined,
                    wasAttackedBy: undefined,
                },
            });
        });

        it('should serialize its spawned state', () => {
            unit = new Unit(myTeam);
            unit.spawn({ x: 1, y: 1 });

            expect(unit.serialize()).toStrictEqual({
                id: expect.any(String),
                teamId: expect.any(String),
                path: [],
                hasDiamond: false,
                hasSpawned: true,
                isSummoning: false,
                position: { x: 1, y: 1 },
                lastState: {
                    hasSummoned: undefined,
                    positionBeforeDying: undefined,
                    wasVinedBy: undefined,
                    positionBefore: undefined,
                    wasAttackedBy: undefined,
                },
            });
        });
        it('should serialize its hasDiamond state', () => {
            unit = new Unit(myTeam);
            unit.spawn({ x: 1, y: 1 });
            unit.hasDiamond = true;
            unit.diamondId = 'someId';

            expect(unit.serialize()).toStrictEqual({
                id: expect.any(String),
                teamId: expect.any(String),
                path: [],
                hasDiamond: true,
                diamondId: 'someId',
                hasSpawned: true,
                isSummoning: false,
                position: { x: 1, y: 1 },
                lastState: {
                    hasSummoned: undefined,
                    wasVinedBy: undefined,
                    positionBeforeDying: undefined,
                    positionBefore: undefined,
                    wasAttackedBy: undefined,
                },
            });
        });

        it('should serialize its wasAttacked state', () => {
            const unitPosition = { x: 2, y: 1 };
            unit = new Unit(myTeam);
            unit.hasSpawned = true;
            unit.position = unitPosition;
            unit.computeStartOfTurn();
            unit.resetStateOfTurn();

            firstBadGirlsUnit.hasSpawned = true;
            firstBadGirlsUnit.position = { x: 2, y: 2 };
            firstBadGirlsUnit.computeStartOfTurn();
            firstBadGirlsUnit.resetStateOfTurn();

            firstBadGirlsUnit.attack(unit.position);

            expect(unit.serialize()).toStrictEqual({
                id: expect.any(String),
                teamId: expect.any(String),
                path: [],
                hasDiamond: false,
                hasSpawned: false,
                position: null,
                isSummoning: false,
                lastState: {
                    hasSummoned: undefined,
                    wasVinedBy: undefined,
                    positionBefore: unitPosition,
                    wasAttackedBy: firstBadGirlsUnit.id,
                    positionBeforeDying: unitPosition,
                },
            });
        });
    });
});
