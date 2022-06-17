import { Position } from './types';

export const isAdjacent = (a: Position, b: Position): boolean => {
    return (a.x === b.x && (a.y === b.y - 1 || a.y === b.y + 1)) || (a.y === b.y && (a.x === b.x - 1 || a.x === b.x + 1));
};

export const distanceBetween = (from: Position, to: Position): number => {
    return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
};

export const hash = (position: Position): string => `${position.x}|${position.y}`;

export const equal = (a: Position, b: Position): boolean => {
    return a && b && a.x === b.x && a.y === b.y;
};

export const flatIndex = (a: Position, rowSize: number): number => {
    return a.x * rowSize + a.y;
};

export const toString = (a: Position): string => {
    return `[x: ${a.x}, y: ${a.y}]`;
};
