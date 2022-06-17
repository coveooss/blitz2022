<script lang="ts">
    export let key: string;
</script>

<span class="key text-golden">
    <span class="key-position-adjustements">
    {key}
</span>
</span>

<style>
    .key {
        margin-left: 5px;
        padding: 0px 5px;
        border-radius: 3px;
        border: 1px solid var(--blitz-golden-transparent);
    }

    .key-position-adjustements {
        position: relative;
        top: 2px;
    }
</style>