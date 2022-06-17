import { equal } from './position';

import { Diamond, Position } from './types';
import { Unit } from './units/unit';
import { DIAMOND } from './config';

export const MAP_FILE_FOLDER = './maps/';

export class Diamonds {
    readonly owners: Map<string, Unit> = new Map<string, Unit>();

    constructor(private diamonds: Diamond[]) {}

    updateDiamondPositionsAfterTurn(): void {
        this.diamonds
            .filter((diamond) => diamond.ownerId)
            .forEach((diamond) => {
                diamond.position = this.owners.get(diamond.ownerId).position;
            });
    }

    incrementPoints(): void {
        this.diamonds
            .filter((diamond) => diamond.ownerId)
            .forEach((diamond) => {
                diamond.points = diamond.points + diamond.summonLevel;
            });
    }

    findOwnerIdFromDiamondId(diamondId: string): string | undefined {
        return this.findDiamondById(diamondId)?.ownerId;
    }

    getDiamondIdFromPosition(from: Position): string | undefined {
        return this.findDiamondByPosition(from)?.id;
    }

    isADiamond(from: Position): boolean {
        return !!this.findDiamondByPosition(from);
    }

    isADiamondAndFree(from: Position): boolean {
        const diamond = this.findDiamondByPosition(from);
        return diamond && !diamond.ownerId;
    }

    getSummonLevel(diamondId: string): number {
        const diamond = this.findDiamondById(diamondId);
        return !!diamond && diamond.summonLevel;
    }

    transfer(diamondId: string, destinationUnit: Unit): void {
        const diamond = this.findDiamondById(diamondId);
        this.owners.delete(diamond.ownerId);
        diamond.position = destinationUnit.position;
        diamond.ownerId = destinationUnit.id;
        this.owners.set(destinationUnit.id, destinationUnit);
    }

    summon(diamondId: string): void {
        const diamond = this.findDiamondById(diamondId);
        if (!!diamond && diamond.ownerId && diamond.summonLevel < DIAMOND.MAXIMUM_SUMMON_LEVEL) {
            diamond.summonLevel++;
        }
    }

    drop(diamondId: string, to: Position): void {
        const diamond = this.findDiamondById(diamondId);
        const owner = this.owners.get(diamond.ownerId);
        owner.scorePoints(diamond.points);
        this.owners.delete(diamond.ownerId);
        diamond.position = to;
        diamond.ownerId = null;
        diamond.summonLevel = DIAMOND.INITIAL_SUMMON_LEVEL;
        diamond.points = 0;
    }

    dropDontScorePoints(diamondId: string, to: Position): void {
        const diamond = this.findDiamondById(diamondId);
        this.owners.delete(diamond.ownerId);
        diamond.ownerId = null;
        diamond.position = to;
    }

    pickUp(from: Position, unit: Unit): string {
        const diamond = this.findDiamondsByPosition(from).sort((d1, d2) => d2.points - d1.points)[0];
        diamond.ownerId = unit.id;
        this.owners.set(unit.id, unit);
        return diamond.id;
    }

    getPendingPointsForOwnerId(ownerId: string): number {
        return this.diamonds
            .filter((diamond) => diamond.ownerId === ownerId)
            .map((diamond) => diamond.points)
            .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }

    serialize(): Diamond[] {
        return this.diamonds.map((diamond) => ({ ...diamond }));
    }

    findDiamondById(id: string): Diamond {
        return this.diamonds.find((diamond) => diamond.id === id);
    }

    private findDiamondByPosition(from: Position): Diamond {
        return this.diamonds.find((diamond) =>
            equal(diamond.ownerId ? this.owners.get(diamond.ownerId).position : diamond.position, from),
        );
    }
    private findDiamondsByPosition(from: Position): Diamond[] {
        return this.diamonds.filter((diamond) =>
            equal(diamond.ownerId ? this.owners.get(diamond.ownerId).position : diamond.position, from),
        );
    }
}
