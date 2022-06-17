<script>
	export const ssr = false;

	import { isConnected as isViewerConnected } from '$lib/stores/games';
	import { games } from '$lib/stores/games';
	import GamesControls from '$lib/controls/GamesControls.svelte';
	import TeamsDebug from '$lib/TeamsDebug.svelte';
	import Styles from '$lib/Styles.svelte';
	import BlitzViz from '$lib/BlitzViz.svelte';

	$: currentGame = $games.current;
	$: ticks = $currentGame?.list;
	$: tickIndex = $currentGame?.currentIndex;
	$: currentTick = ticks?.[tickIndex];
</script>

<div class="container">
	<h1>Blitz 2022 Local UI <span class="connexion-info">({$isViewerConnected ? 'Connected' : 'Disconnected'})</span></h1>
	<div class="game">

		{#if currentGame}
			<Styles />
			<GamesControls />
			<BlitzViz ticksStore={currentGame} />
			<TeamsDebug tick={currentTick} />
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-flow: column;
	}
	.connexion-info {
			font-size: 0.6em;
	}
</style>
