<script lang="ts">
	import Vine from './visualization/Vine.svelte';
	import { afterUpdate } from 'svelte';
	import type { EnhancedTick, EnhancedTickTeamUnit, Position } from '../gametypings';
	import Tooltip from './Tooltip.svelte';
	import { getDeathsToShowFromTicks } from './tf2logs/deathsFromTicks';
	import VineViz from './visualization/VineViz.svelte';
	import VineVizContainer from './visualization/VineVizContainer.svelte';
	import Path from './visualization/Path.svelte';
	import { getDiamondLevelForPoints, UNIT_INDEX_TO_NAME } from './units';
	import type { Diamond } from '../../../game/dist/game/types';

	export let ticks: EnhancedTick[] = [];
	export let tickIndex: number = 0;
	export let showPaths: boolean = false;
	export let showCoordinates: boolean = false;

	$: tick = ticks?.[tickIndex];

	$: numberOfRows = tick?.map?.viewerTiles?.length || 0;
	$: numberOfColumns = tick?.map?.viewerTiles?.[0]?.length || 0;

	$: deaths = getDeathsToShowFromTicks(ticks, tickIndex);

	// Ensure this is big enough for the whole map width, otherwise you will get "Cannot set {number} of undefined" on "bind:this={gridElements[rowIndex][colIndex]}".
	// It is more efficient to just use a constant array instead of recreating it each time the rows and columns change.
	const gridElements: HTMLElement[][] = Array.from(new Array(100)).map(() => []);

	afterUpdate(() => {
		if (lastHoveredUnit !== null) {
			let unit: EnhancedTickTeamUnit;
			tick.teams.forEach(t => t.units.forEach(u => {
				if (u.id === lastHoveredUnit.id) {
					unit = u;
				}
			}));
			if (lastHoveredUnit.position.x !== unit?.position?.x || lastHoveredUnit.position.y !== unit?.position?.y) {
				lastHoveredUnit = null;
			}
		}
	});

	let lastHoveredUnit: null | EnhancedTickTeamUnit = null;
	function hoverUnits(node: HTMLElement, {unit}) {
		function remove() {
			lastHoveredUnit = null;
		}
		node.addEventListener('mouseenter', () => {
			lastHoveredUnit = unit;
		});
		node.addEventListener('mouseleave', remove);
		node.addEventListener('mouseout', remove);
	}

	let lastHoveredDiamond: null | Diamond = null;
	function hoverDiamond(node: HTMLElement, {diamond}) {
		function remove() {
			lastHoveredDiamond = null;
		}
		node.addEventListener('mouseenter', () => {
			lastHoveredDiamond = diamond;
		});
		node.addEventListener('mouseleave', remove);
		node.addEventListener('mouseout', remove);
	}

	let container;

	function elementAtPosition(position: Position) {
		// console.log(gridElements, position, gridElements[position.x], gridElements[position.x]?.[position.y]);
		return gridElements[position.x][position.y];
	}

	function classForDiamond(diamond: Diamond) {
		return `diamond-${diamond.summonLevel}-${getDiamondLevelForPoints(diamond.points)}`;
	}

	function unitIsAtPosition(unit: EnhancedTickTeamUnit, row: number, column: number, isEndOfTurnTick: boolean) {
		if (!unit.hasSpawned) {
			return false;
		}

		if (isEndOfTurnTick && unit.lastState.wasVinedBy) {
			return unit.lastState.positionBefore.x === row && unit.lastState.positionBefore.y == column;
		} else {
			return unit.position.x === row && unit.position.y === column;
		}
	}

	$: vines = tick?.teams.flatMap((team) => team.units.flatMap((unit) => {
		if (unit.hasSpawned && unit.lastState.wasVinedBy) {
			const to = unit.lastState.positionBefore;
			const from = tick.allUnitsPerId[unit.lastState.wasVinedBy].lastState.positionBefore;
			if (to && from) {
				const minX = Math.min(from.x, to.x);
				const maxX = Math.max(from.x, to.x);
				const minY = Math.min(from.y, to.y);
				const maxY = Math.max(from.y, to.y);
				const isVertical = minY === maxY;
				const vines = [];
				const vinedByTeamIndex = tick.allUnitsPerId[unit.lastState.wasVinedBy].teamIndex;
				for (let x = minX; x <= maxX; x++) {
					for (let y = minY; y <= maxY; y++) {
						const isOnEnd = (to.x === x && to.y === y) || (from.x === x && from.y === y);
						if (!isOnEnd) {
							vines.push({x, y, vinedByTeamIndex, isVertical});
						}
					}
				}
				return vines;
			}
		}
	}).filter(Boolean)) ?? [];
</script>

{#if tick && numberOfRows > 0 && numberOfColumns > 0}
	<div
		bind:this={container}
		class="grid"
		style="aspect-ratio:{numberOfRows} / {numberOfColumns};grid-template-columns: repeat({numberOfRows}, minmax(2px, 1fr)); grid-template-rows: repeat({numberOfColumns}, minmax(2px, 1fr))"
	>
		{#each tick.map.viewerTiles as row, rowIndex}
			{#each row as tile, colIndex}
				<div
					bind:this={gridElements[rowIndex][colIndex]}
					class="tile background-tile-{tile} center-child"
				>
					<div class="absolute center-child units">
						{#each tick.teams as team, teamIndex}
							{#each team.units as unit, unitIndex (unit.id)}
								{#if unitIsAtPosition(unit, rowIndex, colIndex, 'playingTeamId' in tick)}
									<div
										use:hoverUnits={{ unit }}
										class="unit animal-{teamIndex + 1}{unit.isSummoning ? '-summon' : ''} animal-{teamIndex + 1}-{unitIndex + 1}{unit.isSummoning ? '-summon' : ''} {unit.lastState.wasVinedBy
											? `vine-${tick.allUnitsPerId[unit.lastState.wasVinedBy].teamIndex + 1}`
											: ''} {unit.isSummoning ? `summons-${tick.diamondsPerId[unit.diamondId]?.summonLevel}` : ''}"
										class:summons={unit.isSummoning}
										class:vine={unit.lastState.wasVinedBy}
									>
										{#if unit.hasDiamond}
											<div
												class="holding-diamond {unit.hasDiamond
													? classForDiamond(tick.diamondsPerId[unit.diamondId])
													: ''}"
											/>
										{/if}
										{#if lastHoveredUnit?.id === unit.id}
											<Tooltip offsetX={gridElements[rowIndex][colIndex]?.clientWidth / 2}>
												<div class="unit-data player-{teamIndex + 1}">
													<div class="unit-data-team">
														{team.name}'s {UNIT_INDEX_TO_NAME[unitIndex % UNIT_INDEX_TO_NAME.length]}
													</div>
													{#if unit.hasDiamond}
														<span class="unit-data-score">
															💎 LVL {tick.diamondsPerId[unit.diamondId].summonLevel}, {tick.diamondsPerId[unit.diamondId].points}pts
														</span>
													{/if}
												</div>
											</Tooltip>
										{/if}
									</div>
								{/if}
							{/each}
						{/each}
					</div>
					<div class="absolute center-child">
						{#each tick.map.diamonds as diamond}
							{#if !diamond.ownerId && diamond.position.x === rowIndex && diamond.position.y === colIndex}
								<div use:hoverDiamond={{ diamond }} class="diamond {classForDiamond(diamond)}">
									{#if lastHoveredDiamond?.id === diamond.id}
										<Tooltip offsetX={gridElements[rowIndex][colIndex]?.clientWidth / 2}>
											<div class="diamond-data">
												<span class="diamond-data-score">
													💎 LVL {diamond.summonLevel}, {diamond.points}pts
												</span>
											</div>
										</Tooltip>
									{/if}
								</div>
							{/if}
						{/each}
						{#each deaths as { position, unit, teamIndex }}
							{#if position.x === rowIndex && position.y === colIndex}
								<div class="death death-{teamIndex + 1}" />
							{/if}
						{/each}
					</div>
					{#if showCoordinates}
						<div class="absolute coordinates">{rowIndex},{colIndex}</div>
					{/if}
					<div class="absolute vines">
						{#each vines as { x, y, isHalf, isRightHalf, vinedByTeamIndex, isVertical }}
							{#if x === rowIndex && y === colIndex}
								<Vine {isVertical} teamIndex={vinedByTeamIndex} />
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		{/each}
		<VineVizContainer {container}>
			{#each tick.teams as team, teamIndex}
				{#each team.units as unit}
					{#if showPaths && unit?.path?.length > 0}
						<Path
							player={teamIndex + 1}
							currentPosition={elementAtPosition(unit.position)}
							paths={unit.path.map(elementAtPosition)}
						/>
					{/if}
					{#if false && unit.hasSpawned && unit.lastState.wasVinedBy}
						<VineViz
							moveFrom={elementAtPosition(unit.lastState.positionBefore)}
							moveTo={elementAtPosition(('playingTeamId' in tick) ? unit.lastState.positionBefore : unit.position)}
							vineedPlayer={teamIndex + 1}
							vinePlayer={tick.allUnitsPerId[unit.lastState.wasVinedBy].teamIndex + 1}
							vineFrom={elementAtPosition(
								tick.allUnitsPerId[unit.lastState.wasVinedBy].lastState.positionBefore
							)}
						/>
					{/if}
				{/each}
			{/each}
		</VineVizContainer>
	</div>
{:else}
	<div data-ohno="no-ticks-yet" />
{/if}



<style>
	.grid {
		position: relative;
		display: grid;
		/* Map is y,x instead of x,y. This flips the map to its real representation. */
		grid-auto-flow: column;
		border: 1px solid var(--blitz-golden-transparent);
		justify-self: stretch;
		grid-gap: 0;
		max-height: calc(100vh - 217px);
	}

	.center-child {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.tile {
		position: relative;
		aspect-ratio: 1;
		background-color: var(--blitz-background-color);
		background-size: contain;
	}

	.tile:hover {
		box-shadow: 0 0 0 1px var(--jewel-turquoise) inset;
	}

	.tile > *:nth-child(5) {
		display: none;
	}
	.tile > *:nth-child(6) {
		display: none;
	}
	.tile > *:nth-child(7) {
		display: none;
	}
	.tile > *:nth-child(8) {
		display: none;
	}

	.holding-diamond {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		background-size: cover;
	}

	.diamond {
		height: 50%;
		width: 50%;
		border-radius: 30px;
		background-color: var(--blitz-background-color);
		background-size: cover;
	}

	.diamond:only-child {
		height: 80%;
		width: 80%;
	}

	.unit.summons-1 {
		--summon-level: 5px;
	}
	.unit.summons-2 {
		--summon-level: 10px;
	}
	.unit.summons-3 {
		--summon-level: 20px;
	}
	.unit.summons-4 {
		--summon-level: 30px;
	}
	.unit.summons-5 {
		--summon-level: 40px;
	}

	.unit.summons {
		box-shadow: 0 0 var(--summon-level) var(--jewel-turquoise);
	}

	.absolute {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}

	.coordinates {
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
		font-size: 0.5em;
		top: auto;
		right: auto;
		padding: 1px;
		color: var(--jewel-turquoise);
		background-color: var(--blitz-background-color);
		pointer-events: none;
	}

	.death {
		height: 50%;
		width: 50%;
		opacity: 0.7;
		background-size: cover;
		background-image: url('/tileset/Skull (Player Death).png');
	}
	.death:only-child {
		height: 80%;
		width: 80%;
	}

	.unit {
		height: 45%;
		width: 45%;
		border-radius: 30px;
		box-sizing: border-box;
		background-size: contain;
		z-index: 1;
		position: relative;
	}

	.unit:hover {
			z-index: 2;
	}

	.unit:only-child {
		height: 80%;
		width: 80%;
	}

	.unit.vine-1 {
		border: 2px solid var(--player-1-color);
	}
	.unit.vine-2 {
		border: 2px solid var(--player-2-color);
	}
	.unit.vine-3 {
		border: 2px solid var(--player-3-color);
	}
	.unit.vine-4 {
		border: 2px solid var(--player-4-color);
	}

	.unit-data, .diamond-data {
			display: flex;
			flex-flow: column;
			align-items: center;
			justify-content: flex-end;
	}

	.unit-data-team, .unit-data-score, .diamond-data-score {
			display: inline-block;
	}

	.diamond-data {
			color: #fff;
	}

	.player-1 {
		color: var(--player-1-color);
	}
	.player-2 {
		color: var(--player-2-color);
	}
	.player-3 {
		color: var(--player-3-color);
	}
	.player-4 {
		color: var(--player-4-color);
	}
</style>
