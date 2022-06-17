<script lang="ts">
	import { onMount } from 'svelte';

	import type { EnhancedTick, ViewerTick } from '../gametypings';

	import BoardOfImportantStuff from './BoardOfImportantStuff.svelte';
	import TicksControls from './controls/TicksControls.svelte';
	import Options from './Options.svelte';
	import PresenterMode from './PresenterMode.svelte';
	import Overlay from './fragments/Overlay.svelte';
	import Scoreboard from './Scoreboard.svelte';
	import { createHistory } from './stores/history';
	import Styles from './Styles.svelte';
	import {getLogsFromTicks, getNextImportantTick, getPreviousImportantTick} from './tf2logs/logsFromTicks';
	import { enhanceTick } from './ticks/ticksenhancer';
	import TicksViewer from './TicksViewer.svelte';
	import Hotkeys from './Hotkeys.svelte';
	import DiamondAndPoints from './DiamondAndPoints.svelte';
	import PreloadImages from './PreloadImages.svelte';

	// Use ticks for a recorded game, ticksStore for a live game.
	export let ticks: ViewerTick[] = [];
	export let ticksStore = createHistory<EnhancedTick>(ticks.map(enhanceTick));
	export let infos: null | Record<'title' | 'downloadLogs' | 'gameLogs' | 'downloadLogsLink' | 'gameLogsLink' | 'map', string> = null;

	let coordinatesVisible = false;
	let pathsVisible = false;
	let hotkeysVisible = false;
	let presenterMode = false;
	let diamondAndPointsVisible = false;
	let speed = 500;
	let playOrStop;
	let next;
	let stop;
	let previous;
	let showIndividualTurns;

	$: logs = getLogsFromTicks($ticksStore.list, $ticksStore.currentIndex);
	$: lastLogTickNumber = getPreviousImportantTick($ticksStore.list, $ticksStore.currentIndex);
	$: nextLogTickNumber = getNextImportantTick($ticksStore.list, $ticksStore.currentIndex);

	function toggleHotkeys() {
		diamondAndPointsVisible = false;
		hotkeysVisible = !hotkeysVisible;
	}
	function toggleOptions() {
		diamondAndPointsVisible = false;
		presenterMode = !presenterMode;
	}
	function toggleDiamondAndPoints() {
		hotkeysVisible = false;
		diamondAndPointsVisible = !diamondAndPointsVisible;
	}
	function toggleCoordinates() {
		coordinatesVisible = !coordinatesVisible;
	}

	onMount(() => {
		playOrStop();
	});

	function onKeyPress(event: KeyboardEvent) {
		switch (event.key) {
			case 's':
				toggleOptions();
				break;
			case 'h':
				toggleHotkeys();
				break;
			case 'p':
				pathsVisible = !pathsVisible;
				break;
			case 'd':
				toggleDiamondAndPoints();
				break;
			case 'g':
				toggleCoordinates();
				break;
			case 'z':
				ticksStore.jump(0);
				break;
			case 'x':
				ticksStore.jump($ticksStore.lastIndex);
				break;
			case ',':
				previous?.();
				break;
			case '.':
				next?.();
				break;
			case ' ':
				playOrStop();
				event.preventDefault();
				break;
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				speed = Math.max(2000 / Math.pow(parseInt(event.key, 10), 2), 0);
				break;
			case '0':
				speed = 0;
				break;
			default:
				break;
		}
	}

	function onKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowLeft':
				if(lastLogTickNumber){
					stop();
					ticksStore.jump(lastLogTickNumber - 1);
				}
				break;
				case 'ArrowRight':
				if(nextLogTickNumber){
					stop();
					ticksStore.jump(nextLogTickNumber - 1);
				}
				break;
			default:
				break;
		}
	}
</script>

<svelte:window on:keypress={onKeyPress} on:keydown={onKeyDown} />

<Styles />
<PreloadImages />

<div class="game-content">
	<div class="game-player">
		<TicksViewer
			ticks={$ticksStore.list}
			tickIndex={$ticksStore.currentIndex}
			showCoordinates={coordinatesVisible}
			showPaths={pathsVisible}
		/>
		<TicksControls
			ticks={ticksStore}
			{lastLogTickNumber}
			{nextLogTickNumber}
			{speed}
			bind:playOrStop
			bind:stop
			bind:next
			bind:previous
			bind:showIndividualTurns
		/>
		{#if hotkeysVisible || diamondAndPointsVisible}
			<Overlay>
				{#if hotkeysVisible}
					<Hotkeys />
				{/if}
				{#if diamondAndPointsVisible}
					<DiamondAndPoints />
				{/if}
			</Overlay>
		{/if}
	</div>
	<div class="game-info">
		{#if infos !== null}
			<section>
				<h2>{infos.title}</h2>
				{#if infos.map}
					<span class="game-map">Map: {infos.map}</span>
				{/if}
				<ul class="game-logs">
					<li>
						<a
							class="game-bot-logs-link"
							href={infos.downloadLogsLink}
							download={`bot-logs.zip`}
							target="_blank"
						>
							{infos.downloadLogs}
						</a>
					</li>
					<li>
						<a
							class="game-debug-link"
							href={infos.gameLogsLink}
							download={`game-logs.zip`}
							target="_blank"
						>
							{infos.gameLogs}
						</a>
					</li>
				</ul>
			</section>
		{/if}
		<Scoreboard tick={$ticksStore.current} />
		<BoardOfImportantStuff
			on:select={(event) => {
				stop();
				ticksStore.jump(event.detail.index);
				}
			}
			logs={logs}
			ticks={$ticksStore.list}
			showIndividualTurns={showIndividualTurns}
		/>
		{#if presenterMode}
			<PresenterMode tick={$ticksStore.current}/>
		{:else}
			<Options {toggleHotkeys} {toggleCoordinates} {toggleDiamondAndPoints} />
		{/if}
	</div>
</div>

<style>
	.game-content {
		height: 100%;
		display: grid;
		grid-template-areas: 'info gameplayer';
		grid-template-columns: 300px 1fr;
		grid-gap: 25px;
	}

	.game-player {
      display: grid;
      grid-template-rows: min-content 22px 46px;
      position: relative;
      flex-flow: column;
      grid-area: gameplayer;
      gap: 10px;
	}

	.game-info {
		display: flex;
		flex-direction: column;
		width: 300px;
		grid-area: info;
	}
</style>
