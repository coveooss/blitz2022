<script lang="ts">
	import { onMount } from 'svelte';
	import { USE_IMAGE_VINE } from '../env';

	export let moveFrom: HTMLElement;
	export let moveTo: HTMLElement;
	export let vineFrom: HTMLElement;
	export let vinePlayer: number;
	export let vineedPlayer: number;

	onMount(() => {
		window.addEventListener('resize', recalculateStyles);
	});

	function recalculateStyles() {
		posFrom = middleOfElement(moveFrom);
		posTo = middleOfElement(moveTo);
		posVine = middleOfElement(vineFrom);
	}

	interface Pos {
		x: number;
		y: number;
	}
	let posFrom: Pos;
	let posTo: Pos;
	let posVine: Pos;
	$: moveFrom && moveTo && recalculateStyles();

	function middleOfElement(element: HTMLElement) {
		return {
			x: element ? element.offsetLeft + element.offsetWidth / 2 : 0,
			y: element ? element.offsetTop + element.offsetHeight / 2 : 0
		};
	}

	$: posFrom = middleOfElement(moveFrom);
	$: posTo = middleOfElement(moveTo);
	$: posVine = middleOfElement(vineFrom);

	// $: isVertical = posTo.x - posVine.x === 0;
</script>

{#if moveFrom && moveTo}
	{#if posFrom.x !== posTo.x || posFrom.y !== posTo.y}
		<line
			class="line-{vineedPlayer}"
			x1={posFrom.x}
			y1={posFrom.y}
			x2={posTo.x}
			y2={posTo.y}
			stroke-width="2"
			fill="none"
			style="stroke-dasharray: 11, 5; marker-end: url(#arrow-{vineedPlayer});"
		/>
	{/if}
	{#if USE_IMAGE_VINE}
		<path
			d="M {posTo.x},{posTo.y} L {posVine.x},{posVine.y} Z"
			stroke="black"
			stroke-width="10"
			fill="url(#vine)"
		/>
		<!-- 
			class="line-{vinePlayer}"
	x={posVine.x}
			y={posVine.y}
			width={Math.max(20, posTo.x - posVine.x)}
			height={Math.max(20, posTo.y - posVine.y)}

			xlink:href="/tileset/Vine (Lasso){isVertical ? ' Vertical' : ''}.png"

		-->
	{:else}
		<line
			class="line-{vinePlayer}"
			x1={posVine.x}
			y1={posVine.y}
			x2={posTo.x}
			y2={posTo.y}
			stroke-width="2"
			fill="none"
		/>
	{/if}
{/if}

<style>
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

	.vine {
		background-repeat: repeat;
		background-image: url('/tileset/Vine (Lasso).png');
	}
	.vine.vertical {
		background-image: url('/tileset/Vine (Lasso) Vertical.png');
	}
</style>
