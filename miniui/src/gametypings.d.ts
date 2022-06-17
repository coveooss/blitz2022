// Here import the types from the other game project. Cherry-pick what will be useful here.

import type {
	ViewerTick,
	TickTeam,
	TickTeamUnit,
	Diamond,
	ViewerTickTeam
} from '../../game/dist/game/types';

export * from '../../game/dist/game/types';

// Makes it easier to cross-reference stuff with these types.
export interface EnhancedTick extends ViewerTick {
	index: number;
	teams: EnhancedTickTeam[];
	allUnitsPerId: {
		[id: string]: EnhancedTickTeamUnit;
	};
	diamondsPerId: {
		[id: string]: Diamond;
	};
}

export interface EnhancedTickTeam extends ViewerTickTeam {
	units: EnhancedTickTeamUnit[];
}

export interface EnhancedTickTeamUnit extends TickTeamUnit {
	team: Omit<TickTeam, 'units'>;
	teamIndex: number;
	unitIndex: number;
}
