import Libhoney from 'libhoney';
import { Team } from './game/teams/team';
import { TeamStats } from './game/game';

export const hny = new Libhoney({
    writeKey: process.env.HONEYCOMB_KEY,
    dataset: 'Blitz',
    disabled: process.env.HONEYCOMB_KEY === undefined,
});

export const roundRobin = <T>(array: T[], from: number): T[] => {
    const newArray: T[] = [];
    for (let i = 0; i < array.length; i++) {
        newArray.push(array[(i + from) % array.length]);
    }

    return newArray;
};

export function shuffle<T>(original: T[]): T[] {
    const a = [...original];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function average(array: number[]): number {
    return array.reduce((a, b) => a + b, 0) / array.length;
}

export const timeoutAfter = async (timeout: number): Promise<void> =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), timeout));

export const sortRankTeams = (a: Team, b: Team, responseTimePerTeam: Map<Team, TeamStats>): number => {
    return (
        b.score - a.score || // Check for current score
        b.getPendingPoints() - a.getPendingPoints() || // Check for pending points
        a.numberOfDeaths - b.numberOfDeaths || // Check for number of deaths
        average(responseTimePerTeam.get(a).responseTimePerTicks) - // Then its down to response time,
            average(responseTimePerTeam.get(b).responseTimePerTicks)
    ); // this should sort them out.
};
