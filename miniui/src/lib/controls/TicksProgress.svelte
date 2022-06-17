<script lang="ts">
	import throttle from 'just-throttle';
	import type { TicksStore } from '../stores/games';
	import MoveWithMouse from '../MoveWithMouse.svelte';
	import {afterUpdate} from 'svelte';

	let progress: HTMLProgressElement;
	let hoverProgress: null | number = null;
	let isDragging = false;
	let mouseX = 0;
	export let ticks: TicksStore;
	export let showIndividualTurns = true;

	$: turns = $ticks.list?.filter((t) => !('playingTeamId' in t)) || [];

	$: currentTick = showIndividualTurns ? $ticks.currentIndex + 1 : $ticks.current.tick + 1;
	$: maxTick = showIndividualTurns ? $ticks.lastIndex + 1 : turns.length;

	afterUpdate(() => {
		if (hoverProgress !== null) {
			updateTooltip();
		}
	});

	function clickProgressBar(e: MouseEvent) {
		mouseX = e.pageX - progress.getBoundingClientRect().x;
		const clickedValue = Math.round((mouseX * maxTick) / progress.offsetWidth);

		if (showIndividualTurns) {
			ticks.jump(clickedValue);
		} else {
			ticks.jump(turns[clickedValue].index);
		}
	}
	function updateTooltip() {
		hoverProgress = Math.round((mouseX * progress.max) / progress.offsetWidth);
	}
	function moveProgressBar(e: MouseEvent) {
		mouseX = e.pageX - progress.getBoundingClientRect().x;
		updateTooltip();
		if (isDragging) {
			clickProgressBar(e);
		}
	}
	function mouseOut(e: MouseEvent) {
		hoverProgress = null;
		isDragging = false;
	}
</script>

{#if $ticks.currentIndex >= 0}
	<div class="progress-container">
		<progress
			bind:this={progress}
			on:click={clickProgressBar}
			on:mousedown={() => isDragging = true}
			on:mouseup={() => isDragging = false}
			on:mousemove={throttle(moveProgressBar, 100)}
			on:mouseout={mouseOut}
			on:blur={mouseOut}
			value={currentTick}
			max={maxTick}
			class="progress"></progress>
		<MoveWithMouse paddingX={0} paddingY={-40}>
			{#if hoverProgress !== null}
				<div class="hovered-progress">
					{Math.min(hoverProgress + 1, maxTick)}
				</div>
			{/if}
		</MoveWithMouse>
	</div>
{/if}

<style>
	.progress-container {
		position: relative;
		width: 100%;
	}
	.progress {
		width: 100%;
	}
	.hovered-progress {
		text-align: center;
		color: #fff;
	}
	progress {
		/* reset appearance */
		appearance: none;
		/* remove border in Firefox */
		border: 1px solid var(--blitz-golden-transparent);
		background: transparent;

		border-radius: 3px;
		height: 22px;
	}
	progress::-webkit-progress-bar {
		background-color: transparent;
		border-radius: 3px;
	}
	progress::-webkit-progress-value {
		background-color: var(--blitz-golden);
		border-radius: 3px 0 0 3px;
	}
	progress::-moz-progress-bar {
		background-color: var(--blitz-golden);
	}
</style>
