<script lang="ts">
    import Key from "./fragments/Key.svelte";
    import Title from "./fragments/Title.svelte";

    export let toggleHotkeys;
    export let toggleCoordinates;
    export let toggleDiamondAndPoints;
</script>

<section>
    <Title title='OPTIONS' />
    <div on:click={toggleHotkeys} class="clickable">Show Hotkey menu <Key key='H' /> </div>
    <div on:click={toggleDiamondAndPoints} class="clickable">Show Diamonds & Points <Key key='D' /> </div>
    <div on:click={toggleCoordinates} class="clickable">Show coordinates <Key key='G' /> </div>
</section>

<style>
    section > div + div {
        margin-top: 8px;
    }

    .clickable {
        cursor: pointer;
    }
</style>