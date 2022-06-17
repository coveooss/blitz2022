<script lang="ts">
    import {getDiamondLevelForPoints} from '../units';
    import type { TickTeam, TickTeamUnit } from '../../../../game/dist/game/types';

    export let unit: TickTeamUnit & { team: TickTeam; teamIndex: number; unitIndex: number };
    export let points: number | null = null;
    export let diamondSummonLevel: number | null = null;
</script>

{#if unit}
    <div class="unit animal-{unit.teamIndex + 1}{unit.isSummoning ? '-summon' : ''} animal-{unit.teamIndex + 1}-{unit.unitIndex + 1}{unit.isSummoning ? '-summon' : ''}"
         class:summons={unit.isSummoning}>
        {#if points !== undefined && diamondSummonLevel !== undefined}
            <div class="diamond diamond-{diamondSummonLevel}-{getDiamondLevelForPoints(points)}" />
        {/if}
    </div>
{/if}

<style>
    .unit, .diamond {
        display: inline-block;
        aspect-ratio: 1;
        width: 2rem;
        background-size: contain;
    }
    .diamond {
        position: absolute;
    }

    .unit {
        display: inline-block;
        aspect-ratio: 1;
        width: 2rem;
        background-size: contain;
    }
    .unit.summons-1 {
        --summon-level: 5px;
    }
    .unit.summons-2 {
        --summon-level: 10px;
    }
    .unit.summons-3 {
        --summon-level: 20px;
    }
    .unit.summons-4 {
        --summon-level: 30px;
    }
    .unit.summons-5 {
        --summon-level: 40px;
    }

    .unit.summons {
        box-shadow: 0 0 var(--summon-level) var(--jewel-turquoise);
    }
</style>
