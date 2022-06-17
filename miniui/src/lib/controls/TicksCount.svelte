<script lang="ts">
	import PlayerPastille from '../fragments/PlayerPastille.svelte';
	import Title from '../fragments/Title.svelte';
	import type { TicksStore } from '../stores/games';

	export let ticks: TicksStore;
	export let showIndividualTurns: boolean;

	$: turns = $ticks.list?.filter((t) => !('playingTeamId' in t)) || [];

	$: currentPlayingTeamIndex =
		$ticks.current &&
		$ticks.current.teams.findIndex((crew) => crew.id === $ticks.current.playingTeamId);
	$: currentPlayingTeam = $ticks.current && $ticks.current.teams[currentPlayingTeamIndex];
</script>

{#if $ticks.currentIndex >= 0}
	<section>
		<Title title="TICKS" />
		<span class="text-golden title">TICK:</span>
		<span>#{$ticks.current.tick + 1} <span>/ {turns.length}</span></span>

		<div>
			{#if $ticks.current.playingTeamId}
				<div class="text-golden">CURRENTLY PLAYING:</div>
				<div><PlayerPastille index={currentPlayingTeamIndex} name={currentPlayingTeam.name} /></div>
			{:else if showIndividualTurns}
				<div class="text-golden">END OF TICK</div>
				<div>&nbsp</div>
			{:else}
				<div>&nbsp</div>
				<div>&nbsp</div>
			{/if}
		</div>
	</section>
{/if}
