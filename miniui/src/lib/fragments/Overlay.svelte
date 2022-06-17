<div class="overlay">
    <slot />
</div>

<style>
    .overlay {
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        background-color: var(--blitz-background-color-transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
    }
</style>