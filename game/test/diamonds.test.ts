import { DIAMOND } from '../src/game/config';
import { Diamonds } from '../src/game/diamonds';
import { Game } from '../src/game/game';
import { GameMap } from '../src/game/map';
import { NoopTeam } from './teams/noopteam';
import { Team } from '../src/game/teams/team';
import { Diamond } from '../src/game/types';
import { Unit } from '../src/game/units/unit';

class TestDiamonds extends Diamonds {
    public findDiamond(id: string): Diamond {
        return this.findDiamondById(id);
    }
}

describe('Diamonds', () => {
    const FIRST_DIAMOND_ID = 'i love';
    const FIRST_DIAMOND_POSITION = { x: 0, y: 0 };

    const SECOND_DIAMOND_ID = 'blitz';
    const SECOND_DIAMOND_POSITION = { x: 0, y: 1 };

    const FIRST_UNIT_POSITION = { x: 5, y: 5 };
    const SECOND_UNIT_POSITION = { x: 6, y: 6 };

    let firstDiamond: Diamond;
    let secondDiamond: Diamond;

    let game: Game;
    let map: GameMap;

    let myTeam: Team;
    let firstUnit: Unit;
    let secondUnit: Unit;

    let diamonds: TestDiamonds;

    beforeEach(() => {
        firstDiamond = {
            id: FIRST_DIAMOND_ID,
            position: FIRST_DIAMOND_POSITION,
            summonLevel: DIAMOND.INITIAL_SUMMON_LEVEL,
            points: 0,
        };
        secondDiamond = {
            id: SECOND_DIAMOND_ID,
            position: SECOND_DIAMOND_POSITION,
            summonLevel: DIAMOND.INITIAL_SUMMON_LEVEL,
            points: 0,
        };

        game = new Game();
        game.map = map;

        myTeam = new NoopTeam(game);
        firstUnit = myTeam.units[0];
        firstUnit.position = FIRST_UNIT_POSITION;
        firstUnit.hasSpawned = true;

        secondUnit = myTeam.units[1];
        secondUnit.position = SECOND_UNIT_POSITION;
        secondUnit.hasSpawned = true;

        diamonds = new TestDiamonds([firstDiamond, secondDiamond]);
    });

    describe('updateDiamondPositionsAfterTurn', () => {
        it('should update the diamond position according to owner id when picked up', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            diamonds.updateDiamondPositionsAfterTurn();

            expect(firstDiamond.position).toStrictEqual(FIRST_UNIT_POSITION);
        });
        it('should not update the diamond position when diamond is not picked up', () => {
            diamonds.updateDiamondPositionsAfterTurn();

            expect(firstDiamond.position).toStrictEqual(FIRST_DIAMOND_POSITION);
            expect(secondDiamond.position).toStrictEqual(SECOND_DIAMOND_POSITION);
        });
    });
    describe('incrementPoints', () => {
        it('should update the points when diamond is owned', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);
            expect(firstDiamond.points).toStrictEqual(0);

            diamonds.incrementPoints();

            expect(firstDiamond.points).toStrictEqual(1);
        });
        it('should update the points when diamond is owned and summon level is upgraded', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);
            diamonds.summon(FIRST_DIAMOND_ID);
            expect(firstDiamond.points).toStrictEqual(0);

            diamonds.incrementPoints();

            expect(firstDiamond.points).toStrictEqual(2);
        });
        it('should not update the points when diamond is not owned', () => {
            expect(firstDiamond.points).toStrictEqual(0);
            expect(secondDiamond.points).toStrictEqual(0);

            diamonds.updateDiamondPositionsAfterTurn();

            expect(firstDiamond.points).toStrictEqual(0);
            expect(secondDiamond.points).toStrictEqual(0);
        });
    });
    describe('findOwnerIdFromDiamondId', () => {
        it('should find the owner id when diamond is owned', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            const ownerId = diamonds.findOwnerIdFromDiamondId(FIRST_DIAMOND_ID);

            expect(ownerId).toStrictEqual(firstUnit.id);
        });
        it('should update the diamond position according to owner id when picked up', () => {
            const ownerId = diamonds.findOwnerIdFromDiamondId(FIRST_DIAMOND_ID);

            expect(ownerId).toBeUndefined();
        });
    });
    describe('getDiamondIdFromPosition', () => {
        it('should find the diamondId when position is correct', () => {
            const diamondId = diamonds.getDiamondIdFromPosition(FIRST_DIAMOND_POSITION);

            expect(diamondId).toStrictEqual(FIRST_DIAMOND_ID);
        });
        it('should find the diamondId when diamond is owned', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            const diamondId = diamonds.getDiamondIdFromPosition(firstUnit.position);
            const diamondIdFromOriginalLocation = diamonds.getDiamondIdFromPosition(FIRST_DIAMOND_POSITION);

            expect(diamondId).toStrictEqual(FIRST_DIAMOND_ID);
            expect(diamondIdFromOriginalLocation).toBeUndefined();
        });
        it('should return undefined when position is not a diamond', () => {
            const diamondId = diamonds.getDiamondIdFromPosition({ x: 10000, y: 10000 });

            expect(diamondId).toBeUndefined();
        });
    });
    describe('isADiamond', () => {
        it('should return true if position is a diamond', () => {
            const isADiamond = diamonds.isADiamond(FIRST_DIAMOND_POSITION);

            expect(isADiamond).toStrictEqual(true);
        });
        it('should return false if position is not a diamond', () => {
            const isADiamond = diamonds.isADiamond({ x: 10000, y: 10000 });

            expect(isADiamond).toStrictEqual(false);
        });
    });
    describe('isADiamondAndFree', () => {
        it('should return true if position is a diamond and free', () => {
            const isADiamond = diamonds.isADiamondAndFree(FIRST_DIAMOND_POSITION);

            expect(isADiamond).toStrictEqual(true);
        });
        it('should return false if position is a diamond and not free', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            const isADiamond = diamonds.isADiamondAndFree(firstUnit.position);

            expect(isADiamond).toStrictEqual(false);
        });
    });
    describe('transfer', () => {
        it('should execute transfer properly', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            diamonds.transfer(FIRST_DIAMOND_ID, secondUnit);

            expect(diamonds.findOwnerIdFromDiamondId(FIRST_DIAMOND_ID)).toStrictEqual(secondUnit.id);
            expect(diamonds.getDiamondIdFromPosition(secondUnit.position)).toStrictEqual(FIRST_DIAMOND_ID);
        });
    });
    describe('summon', () => {
        it('should summon properly when diamond is owned and under the max level', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            diamonds.summon(FIRST_DIAMOND_ID);

            const diamond = diamonds.findDiamond(FIRST_DIAMOND_ID);
            expect(diamond.summonLevel).toStrictEqual(DIAMOND.INITIAL_SUMMON_LEVEL + 1);
        });
        it('should not summon if diamond is not owned', () => {
            diamonds.summon(FIRST_DIAMOND_ID);

            const diamond = diamonds.findDiamond(FIRST_DIAMOND_ID);
            expect(diamond.summonLevel).toStrictEqual(DIAMOND.INITIAL_SUMMON_LEVEL);
        });
        it('should not summon if diamond is over the max threshold', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            for (let i = 0; i < 100; i++) {
                diamonds.summon(FIRST_DIAMOND_ID);
            }

            const diamond = diamonds.findDiamond(FIRST_DIAMOND_ID);
            expect(diamond.summonLevel).toStrictEqual(DIAMOND.MAXIMUM_SUMMON_LEVEL);
        });
    });
    describe('drop', () => {
        it('should reset diamond state and score points on valid drop', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);
            firstUnit.scorePoints = jest.fn();
            const position = { x: 10, y: 10 };

            diamonds.drop(FIRST_DIAMOND_ID, position);

            const diamond = diamonds.findDiamond(FIRST_DIAMOND_ID);
            expect(diamond.summonLevel).toStrictEqual(DIAMOND.INITIAL_SUMMON_LEVEL);
            expect(diamond.position).toStrictEqual(position);
            expect(diamond.points).toStrictEqual(0);
            expect(diamond.ownerId).toBeNull();
            expect(firstUnit.scorePoints).toHaveBeenCalled();
        });
    });
    describe('dropDontScorePoints', () => {
        it('should drop the diamond in its current state on valid drop', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);
            firstDiamond.points = 2;
            firstDiamond.summonLevel = 2;
            firstUnit.scorePoints = jest.fn();
            const position = { x: 10, y: 10 };

            diamonds.dropDontScorePoints(FIRST_DIAMOND_ID, position);

            const diamond = diamonds.findDiamond(FIRST_DIAMOND_ID);
            expect(diamond.position).toStrictEqual(position);
            expect(diamond.points).toStrictEqual(2);
            expect(diamond.summonLevel).toStrictEqual(2);
            expect(diamond.ownerId).toBeNull();
            expect(firstUnit.scorePoints).toHaveBeenCalledTimes(0);
        });
    });
    describe('pickUp', () => {
        it('should pick up properly on valid move', () => {
            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            const diamond = diamonds.findDiamond(FIRST_DIAMOND_ID);
            expect(diamond.ownerId).toStrictEqual(firstUnit.id);
        });
        it('should pick up diamond with highest pending points properly on valid move', () => {
            secondDiamond.position = FIRST_DIAMOND_POSITION;
            firstDiamond.points = 1;
            secondDiamond.points = 2;

            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            const pendingPoints = diamonds.getPendingPointsForOwnerId(firstUnit.id);
            expect(pendingPoints).toStrictEqual(2);
        });
        it('should pick up diamond with highest pending points properly on valid move', () => {
            secondDiamond.position = FIRST_DIAMOND_POSITION;
            firstDiamond.points = 2;
            secondDiamond.points = 1;

            diamonds.pickUp(FIRST_DIAMOND_POSITION, firstUnit);

            const pendingPoints = diamonds.getPendingPointsForOwnerId(firstUnit.id);
            expect(pendingPoints).toStrictEqual(2);
        });
    });
    describe('getPendingPointsForOwnerId', () => {
        it('should return pending point for diamonds with with id', () => {
            firstDiamond.points = 2;
            firstDiamond.ownerId = firstUnit.id;

            const pendingPoints = diamonds.getPendingPointsForOwnerId(firstUnit.id);

            expect(pendingPoints).toStrictEqual(2);
        });
        it('should return 0 pending points when unit id does not possess diamond', () => {
            firstDiamond.points = 2;
            firstDiamond.ownerId = 'someId';

            const pendingPoints = diamonds.getPendingPointsForOwnerId(firstUnit.id);

            expect(pendingPoints).toStrictEqual(0);
        });
    });
});
