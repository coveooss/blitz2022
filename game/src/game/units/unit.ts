import { equal, isAdjacent, toString } from '../position';
import { UnitError } from '../error';
import { Team } from '../teams/team';
import { CommandAction, Position, TickTeamUnit, TickTeamUnitState } from '../types';
import { shuffle } from '../../utils';
import { DIAMOND, SCORE } from '../config';

export type OnUnitMove<T> = (unit: T, previousPosition: Position, newPosition: Position) => void;

export class Unit {
    public static nextId = 0;

    public readonly id: string;

    public hasSpawned: boolean;
    public hasDiamond: boolean;
    public diamondId: string;
    public summonLevel = 0;
    public isSummoning = false;
    public path: Position[] = [];
    public position: Position;
    public stateOfTurn: TickTeamUnitState;

    constructor(private _team: Team) {
        this.id = (++Unit.nextId).toString();
        this._team.units.push(this);
        this.hasDiamond = false;
        this.hasSpawned = false;
        this.stateOfTurn = {};
    }

    public get team(): Team {
        return this._team;
    }

    private kill(killerUnit: Unit): void {
        if (this.hasDiamond) {
            this._team.game.map.diamonds.transfer(this.diamondId, killerUnit);
            killerUnit.hasDiamond = true;
            killerUnit.diamondId = this.diamondId;
        }
        this.stateOfTurn.wasAttackedBy = killerUnit.id;
        this.stateOfTurn.positionBeforeDying = this.position;
        this.hasDiamond = false;
        this.diamondId = null;
        this.summonLevel = 0;
        this.isSummoning = false;
        this.position = null;
        this.path = [];
        this.hasSpawned = false;
        this.team.numberOfDeaths++;
    }

    public isAlive(): boolean {
        return this.hasSpawned;
    }

    public isDead(): boolean {
        return !this.isAlive();
    }

    public validateCommand(action: CommandAction): void {
        if (this.isDead() && action.action !== 'SPAWN') {
            throw new UnitError(this, `Unit is dead!`);
        }

        if (
            this.isAlive() &&
            action.action !== 'NONE' &&
            action.action !== 'MOVE' &&
            this._team.game.map.getTile(this.position).type === 'SPAWN'
        ) {
            throw new UnitError(this, `Invalid action, you cannot execute action '${action.action}' on a spawn point`);
        }

        if (this.isSummoning && action.action !== 'SUMMON' && action.action !== 'NONE') {
            throw new UnitError(this, `Invalid action, you cannot execute action '${action.action}' while summoning!`);
        }
    }

    public spawn(target: Position): void {
        if (this.isAlive()) {
            throw new UnitError(this, 'Unit has already spawned');
        }

        const map = this._team.game.map;

        const spawnTile = map.getTile(target);
        if (!map.isInBound(target) || spawnTile.type !== 'SPAWN') {
            throw new UnitError(this, `Target is not a spawn point: ${toString(target)}`);
        }

        const isSpawnUnavailable = !map.isWalkableTileForUnit(spawnTile, this._team.game, this);
        if (isSpawnUnavailable) {
            const walkableNeighbors = map
                .getWalkableNeighbors(target, this._team.game, true, false)
                .filter((tile) => tile.type == 'SPAWN');
            if (walkableNeighbors.length === 0) {
                throw new UnitError(
                    this,
                    `A unit is already on that location: ${toString(target)}. No alternative spawn is available either!`,
                );
            }
            const shuffledWalkableNeighbors = shuffle(walkableNeighbors);
            target = shuffledWalkableNeighbors.shift().position;
        }

        this.position = target;
        this.hasSpawned = true;
    }

    public none(): void {
        if (this.isAlive()) {
            this.maybePickUpDiamond();
        }
        this.resetPath();
    }

    public move(target: Position): void {
        this.throwIfUnitIsDead();

        if (this.stateOfTurn.wasVinedBy) {
            this.resetPath();
            this.maybePickUpDiamond();
            return;
        }

        if (equal(this.position, target)) {
            this.resetPath();
            this.maybePickUpDiamond();
            return;
        }

        if (!this.isTargetWalkable(target)) {
            this.resetPath();
            if (SCORE.isTickWithinWarmUpPeriod(this._team.game.currentTick) && this._team.game.map.diamonds.isADiamond(target)) {
                throw new UnitError(this, `Diamond cannot be targeted during the warm up period : ${toString(target)}`);
            }
            throw new UnitError(this, `Target destination is not walkable: ${toString(target)}`);
        }

        if (isAdjacent(this.position, target)) {
            this.path = [];
            this.position = target;
            this.maybePickUpDiamond();
            return;
        }

        const pathLength = this.path.length;
        if (pathLength !== 0 && equal(target, this.path[pathLength - 1])) {
            // Same target, keep the original A* and just advance the unit if possible
            const nextPosition = this.path[0];
            if (!!nextPosition && this.isTargetWalkable(nextPosition)) {
                this.position = nextPosition;
                this.path = this.path.slice(1);
                this.maybePickUpDiamond();
                return;
            }
        }

        const result = this._team.game.computePathForUnitTo(this, target);
        if (result.status === 'noPath' || result.status === 'timeout') {
            this.resetPath();
            throw new UnitError(this, `No path to ${toString(target)}`);
        }

        this.path = result.path;
        this.position = this.path[1];
        this.path = this.path.slice(2);

        this.maybePickUpDiamond();
    }

    private maybePickUpDiamond(): void {
        if (
            !SCORE.isTickWithinWarmUpPeriod(this._team.game.currentTick) &&
            !this.hasDiamond &&
            this._team.game.map.diamonds.isADiamond(this.position)
        ) {
            const diamondId = this._team.game.map.diamonds.pickUp(this.position, this);
            this.hasDiamond = true;
            this.diamondId = diamondId;
        }
    }

    public incrementSummonLevel(): void {
        if (this.isSummoning) {
            this.stateOfTurn.hasSummoned = true;
            this.summonLevel++;

            const diamonds = this._team.game.map.diamonds;
            if (this.summonLevel >= diamonds.getSummonLevel(this.diamondId) + 1) {
                diamonds.summon(this.diamondId);
                this.summonLevel = 0;
                this.isSummoning = false;
            }
        }
    }

    public summon(): void {
        this.throwIfUnitDoesntHaveDiamond();
        this.throwIfUnitIsDead();
        this.resetPath();

        const diamonds = this._team.game.map.diamonds;

        const diamondSummonLevel = diamonds.getSummonLevel(this.diamondId);
        if (diamondSummonLevel === DIAMOND.MAXIMUM_SUMMON_LEVEL) {
            throw new UnitError(this, `Diamond with id '${this.diamondId} is already at the maximum summon level!`);
        }

        if (!this.isSummoning) {
            this.team.pushEvent({
                action: 'SUMMON',
                unitId: this.id,
                summonEvent: {
                    diamondCurrentSummonLevel: diamonds.getSummonLevel(this.diamondId),
                    diamondPoints: diamonds.findDiamondById(this.diamondId).points,
                },
            });
        }
        this.isSummoning = true;
        this.stateOfTurn.hasSummoned = true;
    }

    public drop(target: Position): void {
        this.throwIfUnitDoesntHaveDiamond();
        this.throwIfUnitIsDead();
        this.resetPath();

        if (!isAdjacent(this.position, target)) {
            throw new UnitError(this, `Target is not adjacent : ${toString(target)}`);
        }

        if (this._team.game.map.getTile(target).type !== 'EMPTY') {
            throw new UnitError(this, `Can only drop on empty tile : ${toString(target)}`);
        }

        const diamonds = this._team.game.map.diamonds;
        const unitOnTarget = this._team.game.getUnitAtPosition(target);
        if (unitOnTarget) {
            if (unitOnTarget.hasDiamond) {
                throw new UnitError(this, `Cannot drop a diamond on a user that has a diamond : ${toString(target)}`);
            }
            diamonds.transfer(this.diamondId, unitOnTarget);
            unitOnTarget.hasDiamond = true;
            unitOnTarget.diamondId = this.diamondId;
        } else {
            this.team.pushEvent({
                action: 'DROP',
                unitId: this.id,
                dropEvent: {
                    diamondId: this.diamondId,
                    dropPosition: target,
                    pointsScored: diamonds.findDiamondById(this.diamondId).points,
                    diamondSummonLevel: diamonds.getSummonLevel(this.diamondId),
                },
            });
            diamonds.drop(this.diamondId, target);
        }
        this.hasDiamond = false;
        this.diamondId = null;
    }

    public attack(target: Position): void {
        this.throwIfUnitHasDiamond();
        this.throwIfUnitIsDead();
        this.throwIfUnitIsOnASpawn();
        this.resetPath();

        const { game } = this._team;
        const enemy = game.getUnitAtPosition(target);

        if (!enemy) {
            throw new UnitError(this, `There is no unit on position : ${toString(target)}`);
        }

        if (!isAdjacent(this.position, enemy.position)) {
            throw new UnitError(this, `Enemy is not reachable for an attack : ${toString(target)}`);
        }

        if (enemy.isUnitOnSpawn()) {
            throw new UnitError(this, `Target is on a spawn point, impossible to kill : ${toString(target)}`);
        }

        if (enemy.isDead()) {
            throw new UnitError(this, `Target is already dead, impossible to kill : ${toString(target)}`);
        }

        enemy.kill(this);
        this.team.pushEvent({ action: 'ATTACK', unitId: this.id, attackEvent: { targetUnitId: enemy.id } });
    }

    public vine(target: Position): void {
        this.throwIfUnitHasDiamond();
        this.throwIfUnitIsDead();
        this.resetPath();

        const { game } = this._team;
        const vinedUnit = game.getUnitAtPosition(target);

        if (!vinedUnit) {
            throw new UnitError(this, `There is no unit on position : ${toString(this.position)}`);
        }

        if (equal(this.position, vinedUnit.position)) {
            throw new UnitError(this, 'Cannot vine a unit on your position');
        }
        if (isAdjacent(this.position, vinedUnit.position)) {
            throw new UnitError(this, 'Cannot vine on an adjacent position');
        }
        if (vinedUnit.isDead()) {
            throw new UnitError(this, `Target is already dead, impossible to vine : ${toString(this.position)}`);
        }
        if (vinedUnit.isUnitOnSpawn()) {
            throw new UnitError(this, `Target is on a spawn point, impossible to vine : ${toString(this.position)}`);
        }

        const range = game.map.getSpacesBetween(this.position, vinedUnit.position);

        if (range.length === 0 || range.some((r) => !game.map.isNotBlockingLineOfSight(r, false))) {
            throw new UnitError(this, `Target is not in your line of sight, impossible to vine : ${toString(this.position)}`);
        }

        const firstEmptySpot = range.find((range) =>
            game.map.isWalkableTileForUnit(game.map.getTile(range.position), game, vinedUnit),
        );

        if (!firstEmptySpot) {
            throw new UnitError(this, `Could not find any suitable vine location, impossible to vine: ${toString(this.position)}`);
        }

        const diamondId = vinedUnit.diamondId;
        vinedUnit.getVinedTo(firstEmptySpot.position, this);

        const diamonds = this._team.game.map.diamonds;
        this.team.pushEvent({
            action: 'VINE',
            unitId: this.id,
            vineEvent: {
                vineUnitId: vinedUnit.id,
                diamondSummonLevel: diamondId ? diamonds.getSummonLevel(diamondId) : null,
                diamondPoints: diamondId ? diamonds.findDiamondById(diamondId).points : null,
            },
        });
    }

    public scorePoints(numberOfPoints: number): void {
        if (!SCORE.isTickWithinWarmUpPeriod(this._team.game.currentTick)) {
            this._team.score += numberOfPoints;
        }
    }

    public getVinedTo(target: Position, wasVinedBy: Unit): void {
        if (this.hasDiamond && this._team.id !== wasVinedBy.team.id) {
            this._team.game.map.diamonds.dropDontScorePoints(this.diamondId, this.position);
            this.hasDiamond = false;
            this.diamondId = null;
            this.isSummoning = false;
            this.summonLevel = 0;
        }
        this.stateOfTurn.wasVinedBy = wasVinedBy.id;
        this.stateOfTurn.positionBefore = this.position;
        this.position = target;
        this.path = [];
        this.maybePickUpDiamond();
    }

    public computeStartOfTurn(): void {
        this.stateOfTurn.positionBefore = this.position;
        this.stateOfTurn.hasSummoned = false;
    }

    public resetStateOfTurn(): void {
        this.stateOfTurn = {
            positionBefore: this.position,
        };
    }

    private isTargetWalkable(target: Position) {
        const map = this._team.game.map;
        const destinationTile = map.getTile(target);
        return !!destinationTile && this._team.game.map.isWalkableTileForUnit(destinationTile, this._team.game, this);
    }

    public serialize(): TickTeamUnit {
        const state: TickTeamUnit = {
            id: this.id,
            teamId: this._team.id,
            position: this.position,
            path: [...this.path],
            hasDiamond: this.hasDiamond,
            hasSpawned: this.hasSpawned,
            isSummoning: this.isSummoning,
            lastState: {
                positionBefore: this.stateOfTurn.positionBefore,
                positionBeforeDying: this.stateOfTurn.positionBeforeDying,
                wasVinedBy: this.stateOfTurn.wasVinedBy,
                wasAttackedBy: this.stateOfTurn.wasAttackedBy,
                hasSummoned: this.stateOfTurn.hasSummoned,
            },
        };
        if (this.hasDiamond) {
            state.diamondId = this.diamondId;
        }
        return state;
    }

    public toString(): string {
        return `(id: ${this.id}|position: ${this.position ? JSON.stringify(this.position) : 'notSpawned'}))`;
    }

    public isUnitOnSpawn(): boolean {
        return this.position && this._team.game.map.getTile(this.position).type === 'SPAWN';
    }

    public isUnitDeadOrOnSpawn(): boolean {
        return !this.position || this._team.game.map.getTile(this.position).type === 'SPAWN';
    }

    private throwIfUnitIsDead(): void {
        if (this.isDead()) {
            throw new UnitError(this, 'Unit is dead!');
        }
    }
    private resetPath(): void {
        this.path = [];
    }

    private throwIfUnitHasDiamond(): void {
        if (this.hasDiamond) {
            throw new UnitError(this, 'Unit has a diamond and cannot do this action!');
        }
    }

    private throwIfUnitDoesntHaveDiamond(): void {
        if (!this.hasDiamond) {
            throw new UnitError(this, 'Unit does not have diamond!');
        }
    }

    private throwIfUnitIsOnASpawn(): void {
        if (this.isUnitOnSpawn()) {
            throw new UnitError(this, 'Unit is on a spawn and cannot do this action!');
        }
    }
}
