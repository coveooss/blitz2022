<script lang="ts">
    import Unit from './Unit.svelte';
    import type { TickTeam, TickTeamUnit } from '../../../../game/dist/game/types';

    export let viningUnit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number };
    export let receivingUnit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number; };
    export let diamondSummonLevel: number | null = null;
    export let diamondPoints: number | null = null;
</script>

{#if viningUnit && receivingUnit}
    <div class="attack-log">
        <Unit unit={viningUnit} />
        <span class="action">vined</span>
        <Unit unit={receivingUnit} points={diamondPoints} diamondSummonLevel={diamondSummonLevel} />
        {#if diamondPoints !== null && viningUnit.teamId !== receivingUnit.teamId}
		<span class="action">
			{diamondPoints} dropped
		</span>
        {/if}
    </div>
{/if}

<style>
    .attack-log {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
    }
    .action {
        line-height: 2rem;
    }
</style>