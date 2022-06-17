<script lang="ts">
	import type { ViewerTick } from '../gametypings';

	export let tick: ViewerTick;
</script>

{#if tick}
	<div>
		<h3>Debug stuff</h3>
		<ul>
			{#each tick.teams as team, index}
				<li class="player-{index + 1}">{team.name}: {team.errors.join(' ')}</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
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
