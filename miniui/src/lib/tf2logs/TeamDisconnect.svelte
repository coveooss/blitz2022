<script lang="ts">
	import Unit from './Unit.svelte';
	import type { TickTeam, TickTeamUnit } from '../../../../game/dist/game/types';
	export let unit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number; };
</script>

{#if unit}
	<div class="team-disconnect-log">
		<Unit unit={unit} />
		<span class="action">disconnected 🪦</span>
	</div>
{/if}

<style>
	.team-disconnect-log {
		display: flex;
		flex-flow: row wrap;
		align-items: center;
	}
	.action {
		line-height: 2rem;
	}
</style>