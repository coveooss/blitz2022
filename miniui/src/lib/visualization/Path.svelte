<script lang="ts">
	import { onMount } from 'svelte';

	export let currentPosition: HTMLElement;
	export let paths: HTMLElement[] = [];
	export let player: number;

	onMount(() => {
		window.addEventListener('resize', recalculateStyles);
	});

	function recalculateStyles() {
		currentPos = middleOfElement(currentPosition);
		allPos = paths?.map(middleOfElement);
	}

	interface Pos {
		x: number;
		y: number;
	}
	let allPos: Pos[];

	function middleOfElement(element: HTMLElement) {
		return {
			x: element ? element.offsetLeft + element.offsetWidth / 2 : 0,
			y: element ? element.offsetTop + element.offsetHeight / 2 : 0
		};
	}

	$: currentPos = middleOfElement(currentPosition);
	$: allPos = paths?.map(middleOfElement);
</script>

{#if allPos?.length > 1}
	{#each allPos as pos, index}
		<line
			class="line-{player}"
			x1={index === 0 ? currentPos.x : allPos[index - 1].x}
			y1={index === 0 ? currentPos.y : allPos[index - 1].y}
			x2={pos.x}
			y2={pos.y}
			stroke-width="1"
			fill="none"
		/>
	{/each}
{/if}

<style>
	line {
		stroke-dasharray: 4, 8;
		stroke-width: 3;
		stroke-linecap: round;
	}

	.line-1 {
		stroke: var(--player-1-color);
	}
	.line-2 {
		stroke: var(--player-2-color);
	}
	.line-3 {
		stroke: var(--player-3-color);
	}
	.line-4 {
		stroke: var(--player-4-color);
	}
</style>
