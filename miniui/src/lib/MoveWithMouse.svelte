<script lang="ts">
	export let paddingX: number = 50;
	export let paddingY: number = 20;
	export let width: number = 200;
	let m = { x: -1, y: -1 };

	function handleMouseOut() {
		m.x = -1;
		m.y = -1;
	}

	function handleMousemove(event: MouseEvent) {
		m.x = event.clientX + paddingX - (width / 2);
		m.y = event.clientY + paddingY;
	}
</script>

<svelte:window
	on:mouseout={handleMouseOut}
	on:blur={handleMouseOut}
	on:mousemove={handleMousemove}
/>

{#if m.x >= 0  && m.y >= 0}
	<div class="hover" style="width: {width}px; left: {m.x}px; top: {m.y}px">
		<slot />
	</div>
{/if}

<style>
	.hover {
		pointer-events: none;
		position: fixed;
		z-index: 1;
	}
</style>