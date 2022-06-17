<script lang="ts">
	import Unit from './Unit.svelte';
	import type { Diamond, TickTeam, TickTeamUnit } from '../../../../game/dist/game/types';

	export let attackingUnit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number };
	export let receivingUnit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number; };
	export let diamond: Diamond = undefined;
</script>

{#if attackingUnit && receivingUnit}
	<div class="attack-log">
		<Unit unit={attackingUnit} />
		<span class="action">killed</span>
		<Unit unit={receivingUnit} points={diamond?.points} diamondSummonLevel={diamond?.summonLevel} />
		{#if diamond}
		<span class="action">
			with {diamond.points} points
		</span>
		{/if}
	</div>
{/if}

<style>
	.attack-log {
		display: flex;
		flex-flow: row wrap;
		align-items: center;
	}
	.action {
		line-height: 2rem;
	}
</style>