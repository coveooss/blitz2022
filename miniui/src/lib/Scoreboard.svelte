<script lang="ts">
	import { flip } from 'svelte/animate';
	import type { ViewerTick } from '../../../game/dist/game/types';
	import PlayerPastille from './fragments/PlayerPastille.svelte';
	import Title from './fragments/Title.svelte';

	export let tick: ViewerTick;

	$: pointsPerTeam =
		tick?.map.diamonds
			.filter((diamond) => diamond.ownerId)
			.reduce(
				(cumulator, diamond) => {
					const teamIndex = tick.teams.findIndex((team) =>
						team.units.some((unit) => unit.diamondId === diamond.id)
					);
					cumulator[teamIndex] += diamond.points;
					return cumulator;
				},
				[0, 0, 0, 0]
			) || [];
	$: sortedTeams = [...tick?.teams || []].sort((t1, t2) => t2.score > t1.score ? 1 : t2.score < t1.score ? -1 : 0);
	$: teamIndexes = sortedTeams.map(t => (tick?.teams || []).findIndex(tickTeam => tickTeam.id === t.id));
</script>

{#if tick}
	<section>
		<Title title="Scoreboard" />
		{#each sortedTeams as team, index (team.id)}
			<div class="team-score" animate:flip={{duration: 33}}>
				<div class="team">
					<PlayerPastille index={teamIndexes[index]} name={team.isDead ? "(🪦) " : ''}{team.name} />
				</div>
				<span class="score">
					{team.score}
					<span>({pointsPerTeam?.[teamIndexes[index]] ?? 0} pending)</span>
				</span>
			</div>
		{/each}
	</section>
{/if}

<style>
	.team-score {
		display: flex;
		flex-flow: row;
	}
	.team {
		flex-shrink: 1;
		flex-grow: 1;
		width: 0;
	}
	.score {
		padding-left: 5px;
		flex-shrink: 0;
	}

	section > div + div {
		margin-top: 10px;
	}
</style>
