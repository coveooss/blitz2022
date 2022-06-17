<script lang="ts">
	import Unit from './Unit.svelte';
	import type { TickTeam, TickTeamUnit } from '../../../../game/dist/game/types';

	export let unit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number };
	export let pointsScored: number;
	export let diamondSummonLevel: number;
</script>

{#if unit}
	<span class="drop-log">
		<Unit {unit} points={pointsScored} {diamondSummonLevel} />
		<div class="action">dropped for {pointsScored} points!</div>
	</span>
{/if}

<style>
	.drop-log {
		display: flex;
		flex-flow: row wrap;
		align-items: center;
	}
	.action {
		line-height: 2rem;
	}
</style>
