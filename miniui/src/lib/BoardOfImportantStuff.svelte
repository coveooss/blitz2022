<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { EnhancedTick } from '../gametypings';
	import type { GameLogEntry } from './tf2logs/logsFromTicks';

	export let ticks: EnhancedTick[];
	export let showIndividualTurns = true;
	export let logs: GameLogEntry[];

	$: logsToShow = logs.slice(-5);

	interface BoardOfImportantStuffEvents {
		select: {
			tick: EnhancedTick;
			index: number;
		};
	}

	const dispatch = createEventDispatcher<BoardOfImportantStuffEvents>();
	function onClick(index: number) {
		dispatch('select', {
			tick: ticks[index],
			index: index
		});
	}
</script>

<section>
	<div class="board">
		{#each logsToShow as { component, componentProps, tick, index, key } (key)}
			<div class="bubble" transition:slide on:click={() => onClick(index - 1)}>
				<span class="text-golden title">{showIndividualTurns ? index  : tick} - </span>
				<svelte:component this={component} {...componentProps} />
			</div>
		{/each}
	</div>
</section>

<style>
	.board {
		border: 1px solid var(--blitz-golden-transparent);
		background-color: var(--blitz-background-color);
		min-height: 250px;
	}

	.bubble {
		color: white;
		padding: 5px;
		border-radius: 5px;
		margin: 5px 0px;

		cursor: pointer;
		transition: color 0.2s;

		display: flex;
		align-items: center;
	}

	.bubble:hover {
		color: var(--blitz-golden);
	}
</style>
