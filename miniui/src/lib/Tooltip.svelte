<script lang="ts">
	export let width = 200;
	export let offsetX = 0;
</script>

<div class="tooltip" style="width: {width}px; left: -{(width / 2) - offsetX}px">
	<slot />
</div>

<style>
	.tooltip {
		pointer-events: none;
		position: absolute;
		bottom: 100%;
		z-index: 1;
		background-color: var(--blitz-background-color);
		border: 1px solid var(--jewel-turquoise);
		box-shadow: 0 0 8px 4px rgba(1, 16, 17, 0.81);
		border-radius: 8px;
		padding: 4px 8px;
	}
</style>
