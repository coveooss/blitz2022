/* eslint-disable @typescript-eslint/no-unused-vars */
import { Game } from '../../src/game/game';
import { Team } from '../../src/game/teams/team';
import { Command, CommandAction, PlayerTick } from '../../src/game/types';
import { Unit } from '../../src/game/units/unit';
import { SCORE } from '../../src/game/config';
import { NoopTeam } from '../teams/noopteam';

const EXPECTED_TEAM_ID = 'test-id';
const EXPECTED_TEAM_NAME = 'test-name';

class TestTeam extends Team {
    constructor(public game: Game) {
        super(game, EXPECTED_TEAM_NAME);
        this.id = EXPECTED_TEAM_ID;
    }

    async getNextCommand(tick: PlayerTick): Promise<Command> {
        return Promise.reject();
    }
}

describe('Team', () => {
    let myTeam: Team;
    let units: Unit[];

    beforeEach(() => {
        myTeam = new NoopTeam(new Game({ gameMapFile: 'empty' }));
        units = [new Unit(myTeam), new Unit(myTeam), new Unit(myTeam)];
        myTeam.units = units;
        units.forEach((unit) => (unit.hasSpawned = true));
        units[0].position = { x: 0, y: 0 };
        units[1].position = { x: 0, y: 1 };
        units[2].position = { x: 0, y: 2 };
    });

    describe('apply command', () => {
        it('shoud throw on undefined action', () => {
            myTeam.applyCommand({
                actions: [undefined],
            });

            expect(myTeam.errors.length).toBe(1);
        });
        it('shoud throw on invalid action', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 2 };
            const action: any = {
                type: 'UNIT',
                action: 'INVALID',
                target: target,
                unitId: targetUnit.id,
            };
            myTeam.applyCommand({
                actions: [action],
            });

            expect(myTeam.errors.length).toBe(1);
        });
        it('shoud throw on invalid attack action', () => {
            const targetUnit = units[1];
            const target = { x: 0 };
            const action: any = {
                type: 'UNIT',
                action: 'ATTACK',
                target: target,
                unitId: targetUnit.id,
            };
            myTeam.applyCommand({
                actions: [action],
            });

            expect(myTeam.errors.length).toBe(1);
        });
        it('shoud throw on action without unit ID', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 0 };
            const action: CommandAction = {
                type: 'UNIT',
                action: 'ATTACK',
                target: target,
                unitId: undefined,
            };
            myTeam.applyCommand({
                actions: [action],
            });

            expect(myTeam.errors.length).toBe(1);
        });
        it('shoud throw on action with wrong type', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 2 };
            const action: any = {
                type: 'INVALID',
                action: 'ATTACK',
                target: target,
                unitId: undefined,
            };
            myTeam.applyCommand({
                actions: [action],
            });

            expect(myTeam.errors.length).toBe(1);
        });
        it('shoud add error if more than one command was for a single unit', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 2 };
            const action: CommandAction = {
                type: 'UNIT',
                action: 'MOVE',
                target: target,
                unitId: targetUnit.id,
            };

            targetUnit.move = jest.fn();

            myTeam.applyCommand({
                actions: [action, action],
            });

            expect(myTeam.errors.length).toBe(1);
            expect(targetUnit.move).toHaveBeenCalledTimes(1);
            expect(targetUnit.move).toHaveBeenCalledWith(target);
        });
        it('should add error if the unit id is not found', () => {
            myTeam.applyCommand({
                actions: [
                    {
                        type: 'UNIT',
                        action: 'MOVE',
                        target: { x: 0, y: 0 },
                        unitId: 'INVALID_ID_123',
                    },
                ],
            });

            expect(myTeam.errors.length).toBe(1);
        });

        it('should send the move command to the proper unit', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 2 };

            targetUnit.move = jest.fn();

            myTeam.applyCommand({
                actions: [
                    {
                        type: 'UNIT',
                        action: 'MOVE',
                        target: target,
                        unitId: targetUnit.id,
                    },
                ],
            });

            expect(targetUnit.move).toHaveBeenCalledWith(target);
        });
        it('should do nothing on NONE action', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 2 };

            targetUnit.attack = jest.fn();
            targetUnit.move = jest.fn();
            targetUnit.vine = jest.fn();
            targetUnit.spawn = jest.fn();

            myTeam.applyCommand({
                actions: [
                    {
                        type: 'UNIT',
                        action: 'NONE',
                        target: target,
                        unitId: targetUnit.id,
                    },
                ],
            });

            expect(targetUnit.attack).toHaveBeenCalledTimes(0);
            expect(targetUnit.move).toHaveBeenCalledTimes(0);
            expect(targetUnit.vine).toHaveBeenCalledTimes(0);
            expect(targetUnit.spawn).toHaveBeenCalledTimes(0);
        });
        it('should rethrow unexpected error', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 0 };

            targetUnit.vine = jest.fn().mockImplementation(() => {
                throw new Error();
            });

            expect(() =>
                myTeam.applyCommand({
                    actions: [
                        {
                            type: 'UNIT',
                            action: 'VINE',
                            target: target,
                            unitId: targetUnit.id,
                        },
                    ],
                }),
            ).toThrowError();
        });
        it('should send the vine command to the proper unit', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 0 };

            targetUnit.vine = jest.fn();

            myTeam.applyCommand({
                actions: [
                    {
                        type: 'UNIT',
                        action: 'VINE',
                        target: target,
                        unitId: targetUnit.id,
                    },
                ],
            });

            expect(targetUnit.vine).toHaveBeenCalledWith(target);
        });
        it('should send the spawn command to the proper unit', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 2 };

            targetUnit.spawn = jest.fn();

            myTeam.applyCommand({
                actions: [
                    {
                        type: 'UNIT',
                        action: 'SPAWN',
                        target: target,
                        unitId: targetUnit.id,
                    },
                ],
            });

            expect(targetUnit.spawn).toHaveBeenCalledWith(target);
        });
        it('should send the attack command to the proper unit', () => {
            const targetUnit = units[1];
            const target = { x: 0, y: 2 };

            targetUnit.attack = jest.fn();

            myTeam.applyCommand({
                actions: [
                    {
                        type: 'UNIT',
                        action: 'ATTACK',
                        target: target,
                        unitId: targetUnit.id,
                    },
                ],
            });

            expect(targetUnit.attack).toHaveBeenCalledWith(target);
        });
    });
    describe('serialize', () => {
        it('should serialize its default state', () => {
            const team = new TestTeam(new Game());

            it.todo('serialize units');
            it.todo('serialize errors');
        });
    });
});
