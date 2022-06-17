<script lang="ts">
    import { UNIT_INDEX_TO_NAME } from "../units";

    export let index: number;
    export let name: string;
    export let unitIndex: number = undefined;
</script>

<span class="text-player-{index + 1} border-player-{index + 1}">
    {name}
    {#if unitIndex !== undefined}
        's {UNIT_INDEX_TO_NAME[unitIndex % UNIT_INDEX_TO_NAME.length]}
    {/if}
</span>

<style>
    span {
        white-space: nowrap;
        padding-right: 5px;
        padding-left: 7px;
        border-radius: 30px;
        border: 1px solid var(--blitz-golden-transparent);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
    }
</style>
