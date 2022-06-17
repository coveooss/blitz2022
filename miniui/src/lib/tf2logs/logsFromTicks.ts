import type { EnhancedTick } from '../../gametypings';
import Attack from './Attack.svelte';
import Drop from './Drop.svelte';
import Summon from './Summon.svelte';
import Vine from './Vine.svelte';
import CommandTimeout from './CommandTimeout.svelte';
import TeamDisconnect from './TeamDisconnect.svelte';

export interface GameLogEntry {
	// The Svelte component to render
	component: any;
	// The props to pass to the Svelte component. Make sure they match!
	componentProps: any;
	key: string;
	tick: number;
	index: number;
}

export const getLogsFromTicks = (ticks: EnhancedTick[], currentIndex: number): GameLogEntry[] => {
	if (!ticks) {
		return [];
	}

	return getGameLogEntries(ticks.slice(Math.max(0, currentIndex - 100), currentIndex + 1));
};

// Has to be in-sync with the `getLogsFromTicks` method
export const getNextImportantTick = (
	ticks: EnhancedTick[],
	currentIndex: number
): number | undefined => {
	if (!ticks) {
		return undefined;
	}

	return getGameLogEntries(ticks.slice(currentIndex + 1)).shift()?.index;
};

// Has to be in-sync with the `getLogsFromTicks` method
export const getPreviousImportantTick = (
	ticks: EnhancedTick[],
	currentIndex: number
): number | undefined => {
	if (!ticks) {
		return undefined;
	}

	return getGameLogEntries(ticks.slice(0, currentIndex)).pop()?.index;
};

function getGameLogEntries(ticks: EnhancedTick[]): GameLogEntry[] {
	const logs: GameLogEntry[] = [];
	ticks.forEach((tick) => {
		const team = tick.teams.find((t) => t.id === tick.playingTeamId);

		team?.events?.forEach((event) => {
			if (event.action === 'COMMAND_TIMEOUT') {
				const firstUnit = team.units[0];
				logs.push({
					component: CommandTimeout,
					componentProps: {
						unit: firstUnit
					},
					tick: tick.tick + 1,
					index: tick.index + 1,
					key: tick.tick + '-' + event.action + '-' + event.unitId
				});
			}
			if (event.action === 'DISCONNECT') {
				const firstUnit = team.units[0];
				logs.push({
					component: TeamDisconnect,
					componentProps: {
						unit: firstUnit
					},
					tick: tick.tick + 1,
					index: tick.index + 1,
					key: tick.tick + '-' + event.action + '-' + event.unitId
				});
			}
			if (event.action === 'ATTACK') {
				const receivingUnit = tick.allUnitsPerId[event.attackEvent.targetUnitId];
				const attackingUnit = tick.allUnitsPerId[event.unitId];
				logs.push({
					component: Attack,
					componentProps: {
						attackingUnit: attackingUnit,
						receivingUnit: receivingUnit,
						diamond: tick.diamondsPerId?.[attackingUnit.diamondId] ?? null
					},
					tick: tick.tick + 1,
					index: tick.index + 1,
					key: tick.tick + '-' + event.action + '-' + event.unitId
				});
			}
			if (event.action === 'DROP') {
				const unit = tick.allUnitsPerId[event.unitId];
				logs.push({
					component: Drop,
					componentProps: {
						unit: unit,
						pointsScored: event.dropEvent.pointsScored,
						diamondSummonLevel: event.dropEvent.diamondSummonLevel
					},
					tick: tick.tick + 1,
					index: tick.index + 1,
					key: tick.tick + '-' + event.action + '-' + event.unitId
				});
			}
			if (event.action === 'SUMMON') {
				const unit = tick.allUnitsPerId[event.unitId];
				logs.push({
					component: Summon,
					componentProps: {
						unit: unit,
						points: event.summonEvent.diamondPoints,
						diamondCurrentSummonLevel: event.summonEvent.diamondCurrentSummonLevel
					},
					tick: tick.tick + 1,
					index: tick.index + 1,
					key: tick.tick + '-' + event.action + '-' + event.unitId
				});
			}
			if (event.action === 'VINE') {
				const receivingUnit = tick.allUnitsPerId[event.vineEvent.vineUnitId];
				const viningUnit = tick.allUnitsPerId[event.unitId];
				logs.push({
					component: Vine,
					componentProps: {
						viningUnit: viningUnit,
						receivingUnit: receivingUnit,
						diamondSummonLevel: event.vineEvent.diamondSummonLevel,
						diamondPoints: event.vineEvent.diamondPoints
					},
					tick: tick.tick + 1,
					index: tick.index + 1,
					key: tick.tick + '-' + event.action + '-' + event.unitId
				});
			}
		});
	});
	return logs;
}
