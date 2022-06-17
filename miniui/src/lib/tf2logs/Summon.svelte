<script lang="ts">
    import Unit from './Unit.svelte';
    import type { TickTeam, TickTeamUnit } from '../../../../game/dist/game/types';

    export let unit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number };
    export let points: number;
    export let diamondCurrentSummonLevel: number;
</script>

{#if unit}
	<span class="drop-log">
		<Unit {unit} points={points} diamondSummonLevel={diamondCurrentSummonLevel} />
		<div class="action">is summoning</div>
	</span>
{/if}

<style>
    .drop-log {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
    }
    .action {
        line-height: 2rem;
    }
</style>
