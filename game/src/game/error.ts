import { Unit } from './units/unit';
import { Team } from './teams/team';
import { CommandAction } from './types';

export class FatalError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class SocketRegisteringError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class CommandActionError extends Error {
    constructor(action: CommandAction, message: string) {
        super(`${action} ${message}`);
    }
}

export class TeamError extends Error {
    constructor(team: Team, message: string) {
        super(`${team} ${message}`);
    }
}

export class SocketClosedError extends Error {
    constructor(team: Team, message: string) {
        super(`${team} ${message}`);
    }
}

export class UnitError extends Error {
    constructor(unit: Unit, message: string) {
        super(`${unit} ${message}`);
    }
}

export class ArgumentError extends Error {
    constructor(argumentName: string, validValueMessage: string) {
        super(`The argument '${argumentName}' is invalid: ${validValueMessage}.`);
    }

    public static validateNonZeroPositiveNumber(num: number, argumentName: string): void {
        if (!num || num <= 0) {
            throw new ArgumentError(argumentName, `the value ${num} needs to be a non-zero positive integer`);
        }
    }

    public static validatePositiveNumber(num: number, argumentName: string): void {
        if (num === undefined || num === null || num < 0) {
            throw new ArgumentError(argumentName, `the value ${num} needs to be a positive integer`);
        }
    }
}
