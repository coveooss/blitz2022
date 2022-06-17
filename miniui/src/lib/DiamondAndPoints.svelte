<script lang="ts">
	import Title from './fragments/Title.svelte';
	import Next from './icons/next.svelte';
	import { getDiamondLevelForPoints, POINTS_THRESHOLDS } from './units';

	const numbers = Array.from(new Array(5)).map((_, i) => i);
	const pointsThresholds = [0, ...POINTS_THRESHOLDS];

	let turn = 0
	setInterval(() => {
		if (turn < 110) {
			turn += 1;
		} else {
			turn = 0;
		}
	}, 750);
</script>

<section>
	<Title title="Diamonds & POINTS" center />
	<div>
		Diamonds come in 5 different shapes.<br />Each diamond will change in complexity, and yield more
		points as a result.
	</div>
	<div class="diamonds-with-points">
		{#each numbers as _, index}
			<div>
				<div class="diamond diamond-5-{index + 1}" />
				<div class="text-golden">{pointsThresholds[index]}{pointsThresholds?.[index + 1] ? `-${pointsThresholds?.[index + 1] - 1}` : '+'} pts</div>
			</div>
		{/each}
	</div>
	<div>
		Diamonds also come in different color tiers, and each color tier represents a multiplier.
		<br />
        <br />
		To pass to the next tier and increase the multiplier, a player must “summon” the jungle spirits while
		in possession of a given diamond
	</div>
	<div class="diamonds-grid">
		{#each numbers as _, x}
			{#if x > 0}
				<div class="summon-info">
					{x + 1} turns
					<div class="svg-container"><Next /></div>
				</div>
				<div class="spacer" />
			{:else}
				<div class="first-spacer" />
			{/if}
		{/each}
		{#each numbers as _, x}
			<div class="diamond-container">
				<div class="diamond {`diamond-${x + 1}-${getDiamondLevelForPoints(turn * (x + 1))}`}" />
				<span>{turn * (x + 1)}pts</span>
			</div>
		{/each}
		<div class="turn-info">Turn {turn}</div>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		text-align: center;
		align-items: center;
		padding: 50px;
	}

	.diamonds-with-points {
		display: flex;
		gap: 15px;
	}

	.first-spacer {
		grid-column: span 2;
	}

	.summon-info {
		grid-column: span 2;
		align-self: end;
		margin-bottom: -24px
	}

	.summon-info .svg-container {
		width: 16px;
		margin: 0 auto;
		color: var(--blitz-golden)
	}

	.diamond-container {
		grid-column: span 3;
		grid-row: 2;
		place-self: center;
	}

	.diamond {
		background-size: contain;
		width: 64px;
		height: 64px;
		margin-bottom: -24px;
	}

	.diamonds-grid {
		display: grid;
		grid-gap: 10px;
		grid-template-columns: repeat(15, 1fr) min-content;
		grid-template-rows: 52px 1fr 40px min-content;
	}

	.turn-info {
		grid-row: 3;
		grid-column: span 15;
	}

	section > div + div {
		margin-top: 32px;
	}
</style>
