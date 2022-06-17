import { Game } from '../../src/game/game';
import { GameMap } from '../../src/game/map';
import { Team } from '../../src/game/teams/team';
import { CommandActionUnit, Position, TileType } from '../../src/game/types';
import { Unit } from '../../src/game/units/unit';
import { NoopTeam } from './noopteam';

describe('Team', () => {
    const FIRST_UNIT_POSITION = { x: 5, y: 5 };

    let game: Game;
    let map: GameMap;

    let myTeam: Team;
    let firstUnit: Unit;

    beforeEach(() => {
        map = GameMap.empty(6);
        game = new Game();
        game.map = map;

        myTeam = new NoopTeam(game);
        firstUnit = myTeam.units[0];
        firstUnit.position = FIRST_UNIT_POSITION;
        firstUnit.hasSpawned = true;

        firstUnit.move = jest.fn();
        firstUnit.attack = jest.fn();
        firstUnit.vine = jest.fn();
        firstUnit.spawn = jest.fn();
        firstUnit.drop = jest.fn();
        firstUnit.summon = jest.fn();
        firstUnit.validateCommand = jest.fn();
    });

    describe('validateActionAndGetUnit', () => {
        it('undefined command validation', () => {
            expect(() => myTeam.validateActionAndGetUnit(undefined)).toThrowError();
        });
        it('invalid type command validation', () => {
            expect(() =>
                myTeam.validateActionAndGetUnit({ type: 'ALLO' as any, action: 'NONE', unitId: firstUnit.id }),
            ).toThrowError();
        });
        it('non existing unit command validation', () => {
            expect(() => myTeam.validateActionAndGetUnit({ type: 'UNIT', action: 'NONE', unitId: 'non existing' })).toThrowError();
        });
        it('NONE command validation', () => {
            mockUnitTile('EMPTY', firstUnit.position);

            const unit = myTeam.validateActionAndGetUnit({ type: 'UNIT', action: 'NONE', unitId: firstUnit.id });

            expect(unit).toBe(firstUnit);
        });
        it('SUMMON command validation', () => {
            mockUnitTile('EMPTY', firstUnit.position);

            const unit = myTeam.validateActionAndGetUnit({ type: 'UNIT', action: 'SUMMON', unitId: firstUnit.id });

            expect(unit).toBe(firstUnit);
        });
        it('target required command validation', () => {
            mockUnitTile('EMPTY', firstUnit.position);

            ['MOVE', 'SPAWN', 'DROP', 'VINE', 'ATTACK'].forEach((action) => {
                expect(() =>
                    myTeam.validateActionAndGetUnit({
                        type: 'UNIT',
                        action: action as any,
                        unitId: firstUnit.id,
                    }),
                ).toThrowError();
            });
        });
        it('target required valid command validation', () => {
            mockUnitTile('EMPTY', firstUnit.position);

            ['MOVE', 'SPAWN', 'DROP', 'VINE', 'ATTACK'].forEach((action) => {
                const unit = myTeam.validateActionAndGetUnit({
                    type: 'UNIT',
                    action: action as any,
                    unitId: firstUnit.id,
                    target: firstUnit.position,
                });

                expect(unit).toBe(firstUnit);
            });
        });
    });

    describe('applyCommand', () => {
        it('should throw on duplicated command on unit', () => {
            myTeam.applyCommand({
                actions: [
                    { type: 'UNIT', action: 'SUMMON', unitId: firstUnit.id },
                    { type: 'UNIT', action: 'SUMMON', unitId: firstUnit.id },
                ],
            });

            expect(myTeam.errors.length).toStrictEqual(1);
        });

        it('should pass summon action to unit', () => {
            myTeam.applyCommand({
                actions: [{ type: 'UNIT', action: 'SUMMON', unitId: firstUnit.id }],
            });

            expect(firstUnit.summon).toHaveBeenCalledTimes(1);
        });
        it('should pass drop action to unit', () => {
            myTeam.applyCommand({
                actions: [{ type: 'UNIT', action: 'DROP', unitId: firstUnit.id, target: firstUnit.position }],
            });

            expect(firstUnit.drop).toHaveBeenCalledTimes(1);
        });
        it('should pass spawn action to unit', () => {
            myTeam.applyCommand({
                actions: [{ type: 'UNIT', action: 'SPAWN', unitId: firstUnit.id, target: firstUnit.position }],
            });

            expect(firstUnit.spawn).toHaveBeenCalledTimes(1);
        });
        it('should pass vine action to unit', () => {
            myTeam.applyCommand({
                actions: [{ type: 'UNIT', action: 'VINE', unitId: firstUnit.id, target: firstUnit.position }],
            });

            expect(firstUnit.vine).toHaveBeenCalledTimes(1);
        });
        it('should pass attack action to unit', () => {
            myTeam.applyCommand({
                actions: [{ type: 'UNIT', action: 'ATTACK', unitId: firstUnit.id, target: firstUnit.position }],
            });

            expect(firstUnit.attack).toHaveBeenCalledTimes(1);
        });
        it('should pass move action to unit', () => {
            myTeam.applyCommand({
                actions: [{ type: 'UNIT', action: 'MOVE', unitId: firstUnit.id, target: firstUnit.position }],
            });

            expect(firstUnit.move).toHaveBeenCalledTimes(1);
        });
    });

    function mockUnitTile(tileType: TileType, position: Position) {
        const tile = { type: tileType, position: position };
        map.getTile = jest.fn(() => tile);
    }
});
