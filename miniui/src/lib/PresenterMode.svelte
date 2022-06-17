<script lang="ts">
	import type { ViewerTick } from '../../../game/dist/game/types';
	import PlayerPastille from './fragments/PlayerPastille.svelte';
	import Title from './fragments/Title.svelte';

	export let tick: ViewerTick;

</script>

{#if tick}
	<section>
		<Title title="Stats" />
		{#each tick.teams as team, index}
			{#if team.stats}
				<div class="stats">
					<div class="team">
						<PlayerPastille index={index} name={team.name} />
					</div>
					<span class="stats-details">
						<span>S: {team.stats.summonCount} A: {team.stats.attackCount} D: {team.stats.dropCount} V: {team.stats.vineCount}</span>
					</span>
				</div>
			{/if}
		{/each}
	</section>
{/if}

<style>
	.stats {	
		display: flex;
		flex-flow: row;
	}
	.team {
		flex-shrink: 1;
		flex-grow: 1;
		width: 0;
	}
	.stats-details {
		padding-left: 5px;
		flex-shrink: 0;
	}

	section > div + div {
		margin-top: 10px;
	}
</style>
