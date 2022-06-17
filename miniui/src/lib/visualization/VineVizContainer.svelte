<script lang="ts">
	import { onMount } from 'svelte';

	export let container: HTMLElement;

	function recalculateStyles() {
		containerWidth = container ? container.clientWidth : 0;
		containerHeight = container ? container.clientHeight : 0;
	}

	onMount(() => {
		window.addEventListener('resize', recalculateStyles);
	});

	$: containerWidth = container ? container.clientWidth : 0;
	$: containerHeight = container ? container.clientHeight : 0;

	const allPlayers = [1, 2, 3, 4];
</script>

<div class="container">
	{#if container}
		<svg
			width="100%"
			height="100%"
			viewBox="0 0 {containerWidth} {containerHeight}"
			xmlns="http://www.w3.org/2000/svg"
			preserveAspectRatio="xMidYMin meet"
		>
			<defs>
				{#each allPlayers as player}
					<marker
						class="fill-{player}"
						id="arrow-{player}"
						markerWidth="7"
						markerHeight="7"
						refX="13"
						refY="3.5"
						orient="auto"
					>
						<path d="M 0 0 L 7 3.5 L 0 7 z" />
					</marker>
				{/each}
				<pattern id="vine" patternUnits="userSpaceOnUse" width="1" height="1">
					<image width="32" height="32" xlink:href="/tileset/Vine (Lasso).png"></image>
				</pattern>
				<pattern id="vine-vertical" patternUnits="userSpaceOnUse" width="1" height="1">
					<image width="32" height="32" xlink:href="/tileset/Vine (Lasso) Vertical.png"></image>
				</pattern>
			</defs>
			<slot />
		</svg>
	{/if}
</div>

<style>
	.container {
		pointer-events: none;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}

	.fill-1 {
		fill: var(--player-1-color);
	}
	.fill-2 {
		fill: var(--player-2-color);
	}
	.fill-3 {
		fill: var(--player-3-color);
	}
	.fill-4 {
		fill: var(--player-4-color);
	}
</style>
