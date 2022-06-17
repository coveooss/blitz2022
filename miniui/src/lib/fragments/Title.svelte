<script lang="ts">
    export let title: string;
    export let center: boolean = false;
</script>

<h2 class="text-golden title" class:center>{title}</h2>

<style>
    h2 {
        font-size: 2rem;
        margin-top: 0px;
        margin-bottom: 20px;
    }

    .center {
        text-align: center;
    }
</style>