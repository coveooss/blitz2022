<script lang="ts">
	import { games } from '../stores/games';
</script>

{#if $games.lastIndex > 0}
	<div>
		<button class="hidden" class:shown={$games.hasPrevious} on:click={games.previous}
			>Previous</button
		>
		<span>Game {$games.currentIndex + 1}</span>
		<span class:shown={$games.currentIndex !== $games.lastIndex}>/{$games.lastIndex + 1}</span>
		<button class="hidden" class:shown={$games.hasNext} on:click={games.next}>Next</button>
	</div>
{/if}

<style>
	.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.hidden.shown {
		opacity: 1;
		pointer-events: all;
	}
</style>
