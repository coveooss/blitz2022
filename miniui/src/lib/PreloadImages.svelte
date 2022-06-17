<script lang="ts">
    const numbersOfDiamonds = Array.from(new Array(5)).map((_ ,i) => i);
    const numbersOfDiamondsLevels = Array.from(new Array(5)).map((_ ,i) => i);
    const numberOfTiles = Array.from(new Array(6)).map((_ ,i) => i);
    const numberOfTeams = Array.from(new Array(4)).map((_ ,i) => i);
    const numberOfUnits = Array.from(new Array(4)).map((_ ,i) => i);
</script>

<div class="container">
    {#each numbersOfDiamonds as _, x}
        {#each numbersOfDiamondsLevels as _, y}
            <div class="diamond-{x + 1}-{y + 1}" />
        {/each}
    {/each}
    {#each numberOfTiles as _, x}
        <div class="background-tile-{x + 1}" />
    {/each}
    {#each numberOfTeams as _, x}
        {#each numberOfUnits as _, y}
            <div class="animal-{x + 1}-{y + 1}" />
            <div class="animal-{x + 1}-{y + 1}-summon" />
        {/each}
    {/each}
    <div class="death" />
</div>

<style>
    .container {
        opacity: 0;
        position: fixed;
        pointer-events: none;
    }

    .death {
        background-image: url('/tileset/Skull (Player Death).png');
    }
</style>