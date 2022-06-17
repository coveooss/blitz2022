import type { EnhancedTick, EnhancedTickTeam, ViewerTick } from '../../gametypings';

export const enhanceTick = (tick: ViewerTick, index: number): EnhancedTick => {
	const teams: EnhancedTickTeam[] = tick.teams.map(({ units, ...team }, teamIndex) => ({
		...team,
		units: units.map((unit, unitIndex) => ({
			...unit,
			team,
			teamIndex,
			unitIndex
		}))
	}));
	return {
		...tick,
		index,
		teams,
		diamondsPerId: tick.map.diamonds.reduce(
			(all, diamond) => ({
				...all,
				[diamond.id]: diamond
			}),
			{}
		),
		allUnitsPerId: teams
			.flatMap((team) => team.units)
			.reduce(
				(all, unit) => ({
					...all,
					[unit.id]: unit
				}),
				{}
			)
	};
};
