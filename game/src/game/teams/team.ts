import { CommandActionError, UnitError } from '../error';
import { Command, CommandAction, PlayerTick, Position, TickTeam, TickTeamEvent, TickTeamStats } from '../types';
import { Unit } from '../units/unit';
import { v4 as uuid } from 'uuid';
import { Game } from '../game';
import { equal } from '../position';

export abstract class Team {
    public id: string;
    public score: number;
    public numberOfDeaths = 0;

    public units: Unit[] = [];
    public errors: string[] = [];

    public isDead = false;

    public events: TickTeamEvent[] = [];

    public stats: TickTeamStats = new TickTeamStats();

    constructor(public game: Game, public name: string) {
        this.score = 0;
        this.units = [];
        this.id = uuid();

        this.game.registerTeam(this);

        for (let i = 0; i < game.options.numberOfUnitsPerTeam; i++) {
            new Unit(this);
        }
    }

    public pushEvent(event: TickTeamEvent): void {
        if (event) {
            if (event.action === 'SUMMON') {
                this.stats.summonCount++;
            }
            if (event.action === 'DROP') {
                this.stats.dropCount++;
            }
            if (event.action === 'VINE') {
                this.stats.vineCount++;
            }
            if (event.action === 'ATTACK') {
                this.stats.attackCount++;
            }
            this.events.push(event);
        }
    }

    public kill() {
        this.isDead = true;
    }

    public getPendingPoints(): number {
        return this.units
            .map((unit) => this.game.map.diamonds.getPendingPointsForOwnerId(unit.id))
            .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }

    public computeStartOfTurn(): void {
        this.events = [];
        this.units.forEach((unit) => unit.computeStartOfTurn());
    }

    public resetStateOfTurn(): void {
        this.units.forEach((unit) => unit.resetStateOfTurn());
    }

    public getUnit(unitId: string): Unit | undefined {
        return this.units.find((u) => u.id.toLowerCase() === unitId.toLowerCase());
    }

    public getUnitAtPosition(position: Position): Unit | undefined {
        return this.units.find((unit) => equal(unit.position, position));
    }

    public validateActionAndGetUnit(action: CommandAction): Unit {
        if (!action) {
            throw new CommandActionError(action, `Empty action was sent`);
        }

        if (action.type === 'UNIT') {
            if (!['MOVE', 'SPAWN', 'SUMMON', 'DROP', 'VINE', 'ATTACK', 'NONE'].includes(action.action)) {
                throw new CommandActionError(action, `Invalid action was sent ${JSON.stringify(action)}`);
            }

            if (
                ['MOVE', 'SPAWN', 'DROP', 'VINE', 'ATTACK'].includes(action.action) &&
                (action.target?.x === undefined || action.target?.y === undefined)
            ) {
                throw new CommandActionError(action, `Invalid target was sent ${JSON.stringify(action)}`);
            }

            if (!action.unitId) {
                throw new CommandActionError(action, `No unitId was sent ${JSON.stringify(action)}`);
            }

            const unit = this.getUnit(action.unitId);
            if (!unit) {
                throw new CommandActionError(action, `Unit ${action.unitId} doesn't exists!`);
            }

            unit.validateCommand(action);

            return unit;
        } else {
            throw new CommandActionError(action, `Action type ${action.type} is invalid!`);
        }
    }

    public applyCommand(command: Command): void {
        const alreadyReceivedCommand: Unit[] = [];
        this.errors = [];

        if (command.actions === undefined || !Array.isArray(command.actions)) {
            this.errors.push(`No actions received`);
            return;
        }

        command.actions.forEach((action) => {
            try {
                const unit = this.validateActionAndGetUnit(action);

                if (alreadyReceivedCommand.includes(unit)) {
                    throw new CommandActionError(action, `Unit ${unit} already received a command!`);
                }

                alreadyReceivedCommand.push(unit);

                if (action.action === 'NONE') {
                    unit.none();
                    return;
                }

                const target = action.target;
                if (action.action === 'MOVE') {
                    unit.move(target);
                    return;
                }

                if (action.action === 'ATTACK') {
                    unit.attack(target);
                    return;
                }

                if (action.action === 'VINE') {
                    unit.vine(target);
                    return;
                }

                if (action.action === 'SPAWN') {
                    unit.spawn(target);
                    return;
                }

                if (action.action === 'DROP') {
                    unit.drop(target);
                    return;
                }

                if (action.action === 'SUMMON') {
                    unit.summon();
                    return;
                }

                //Never supposed to happen since it was validated just up there but hey :shrug:
                throw new CommandActionError(action, `Invalid action ${action.action}`);
            } catch (ex) {
                if (ex instanceof UnitError || ex instanceof CommandActionError) {
                    this.errors.push(ex.message);
                } else {
                    throw ex;
                }
            }
        });
    }

    public abstract getNextCommand(tick: PlayerTick): Promise<Command>;

    public toString(): string {
        return `([Team] ${this.id} - ${this.name})`;
    }

    public serialize(): TickTeam {
        return {
            id: this.id,
            isDead: this.isDead,
            name: this.name,
            score: this.score,
            errors: [...this.errors],
            units: this.units.map((unit) => unit.serialize()),
        };
    }
}
