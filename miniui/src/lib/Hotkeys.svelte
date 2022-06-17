<script lang="ts">
    import Key from "./fragments/Key.svelte";
    import Title from "./fragments/Title.svelte";
</script>

<section>
    <Title title='HOTKEYS' center />
    <div>Adjust game playback speed <Key key='1' /> to<Key key='9' /> </div>
    <div>Play/Pause <Key key='Spacebar' /> </div>
    <div>Jump to the start of the game <Key key='Z' /> </div>
    <div>Jump to the end of the game <Key key='X' /> </div>
    <div>Go back one player's turn (comma) <Key key=',' /> </div>
    <div>Go forward one player's turn (period) <Key key='.' /> </div>
    <div>Display points chart <Key key='D' /> </div>
    <div>Show/Hide planned paths <Key key='P' /> </div>
    <div>Show/Hide (x,y) tile coordinates <Key key='G' /> </div>
    <div>Jump to the next event <Key key='🡢' /> </div>
    <div>Jump to the previous event <Key key='🡠' /> </div>
    <div>Close this menu <Key key='H' /> </div>
    <div>Presenter mode <Key key='S' /> </div>
</section>

<style>
    section > div + div {
        margin-top: 12px;
    }
</style>