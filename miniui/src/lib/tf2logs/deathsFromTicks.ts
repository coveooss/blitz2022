import type { EnhancedTick, Position, TickTeamUnit } from '../../gametypings';

export interface DeathEntry {
	teamIndex: number;
	unit: TickTeamUnit;
	position: Position;
}

export const getDeathsToShowFromTicks = (
	ticks: EnhancedTick[],
	currentIndex: number
): DeathEntry[] => {
	if (!ticks) {
		return [];
	}
	const deaths: DeathEntry[] = [];
	ticks
		.slice(Math.max(0, currentIndex - 25), currentIndex + 1)
		.filter((tick) => !('playingTeamId' in tick) || tick.index === currentIndex)
		.forEach((tick) => {
			Object.values(tick.allUnitsPerId)
				.filter((unit) => !!unit.lastState.wasAttackedBy && !unit.hasSpawned)
				.forEach((unit) => {
					if (unit.lastState.positionBeforeDying) {
						deaths.push({
							teamIndex: unit.teamIndex,
							unit,
							position: unit.lastState.positionBeforeDying
						});
					} else {
						console.warn(
							"A unit was found that died without 'positionBeforeDying', it will be ignored."
						);
					}
				});
		});
	return deaths;
};
