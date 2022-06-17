<script lang="ts">
	import type { TicksStore } from '../stores/games';
	import Play from '../icons/play.svelte';
	import Pause from '../icons/pause.svelte';
	import Toggle from './Toggle.svelte';
	import TicksProgress from './TicksProgress.svelte';

	export let ticks: TicksStore;
	export let nextLogTickNumber: null | number = null;
	export let lastLogTickNumber: null | number = null;
	export let speed = 100;
	export let showIndividualTurns = true;

	export function playOrStop() {
		if (playerInterval !== null) {
			stop();
		} else {
			if ($ticks.hasNext) {
				nextWithSkipTurns();
			}
			play();
		}
	}

	let playerInterval = null;

	$: turns = $ticks.list?.filter((t) => !('playingTeamId' in t)) || [];

	export function stop() {
		clearTimeout(playerInterval);
		playerInterval = null;
	}

	function nextWithSkipTurns() {
		if (showIndividualTurns) {
			ticks.next();
		} else {
			ticks.next();
			while ($ticks.hasNext && 'playingTeamId' in $ticks.current) {
				ticks.next();
			}
		}
	}

	function previousWithSkipTurns() {
		if (showIndividualTurns) {
			ticks.previous();
		} else {
			ticks.previous();
			while ($ticks.hasPrevious && 'playingTeamId' in $ticks.current) {
				ticks.previous();
			}
		}
	}

	function play() {
		playerInterval = setTimeout(() => {
			if ($ticks.hasNext) {
				nextWithSkipTurns();
			}
			if ($ticks.currentIndex < $ticks.lastIndex) {
				play();
			} else {
				stop();
			}
		}, speed);
	}

	function jumpTo(index: number, forceStop = true) {
		if (forceStop) {
			stop();
		}
		ticks.jump(index);
	}

	export function next() {
		stop();
		nextWithSkipTurns();
	}

	export function previous() {
		stop();
		previousWithSkipTurns();
	}
</script>

{#if $ticks.currentIndex >= 0}
	<div class="rows">
		<TicksProgress {ticks} {showIndividualTurns} />
	</div>
	<div class="video-controls rows">
		<div class="buttons">
			<button
				class="control"
				class:disabled={!lastLogTickNumber}
				disabled={!lastLogTickNumber}
				on:click={() => jumpTo(lastLogTickNumber - 1, false)}
			>&larr;</button>
			<button
				class="control"
				disabled={$ticks.currentIndex === $ticks.lastIndex}
				on:click={playOrStop}
			>
				<div class="icon">
					{#if !!playerInterval}
						<Pause />
					{:else}
						<Play />
					{/if}
				</div>
			</button>
			<button
				class="control"
				class:disabled={!nextLogTickNumber}
				disabled={!nextLogTickNumber}
				on:click={() => jumpTo(nextLogTickNumber - 1, false)}
			>&rarr;</button>
		</div>
		<div>
			<span class="text-golden title">SPEED:</span>
			{Math.round((1 / speed) * 1000)} per sec
		</div>
		<!-- <div>
			<span class="text-golden title">TURN:</span> #{$ticks.currentIndex + 1}
			<span class:shown={$ticks.currentIndex !== $ticks.lastIndex}>/{$ticks.lastIndex + 1}</span>
		</div> -->

		<div>
			<Toggle title="Show individual player turns" bind:checked={showIndividualTurns} />
		</div>
		<div>
		{#if showIndividualTurns}
			<span>#{$ticks.currentIndex + 1} <span>/ {$ticks.lastIndex + 1}</span></span>
		{:else}
			<span>#{$ticks.current.tick + 1} <span>/ {turns.length}</span></span>
		{/if}
		</div>
	</div>
{/if}

<style>
	.rows {
		display: flex;
		width: 100%;
	}

	.video-controls {
		display: flex;
		flex-flow: row;
		gap: 25px;
		align-items: center;
	}

	.control:disabled {
		color: var(--blitz-golden-transparent);
		border-color: var(--blitz-golden-transparent);
		pointer-events: none;
	}

	.buttons {
		display: flex;
		justify-content: end;
	}

	.control {
		width: 40px;
		height: 40px;
		margin: 3px;
		background-color: transparent;
		color: var(--blitz-golden);
		border-color: var(--blitz-golden);
		border-radius: 30px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.control:hover {
		background-color: var(--blitz-golden-transparent);
	}

	.control > * {
		height: 15px;
	}
</style>
