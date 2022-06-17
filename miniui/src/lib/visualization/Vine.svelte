<script>
    export let isVertical = false;
    export let teamIndex;

    const colorsByTeams = [
        {medium: "#EB1D1D", light: "#FF9D9D", dark: "#DD4D4D"},
        {medium: "#2859BE", light: "#6C9CFF", dark: "#3D5B99"},
        {medium: "#16793E", light: "#94EB8C", dark: "#2E7B3A"},
        {medium: "#E5B91B", light: "#FFF8BA", dark: "#DB763C"},
    ]

    $: colors = colorsByTeams[teamIndex];

    let transform = isVertical ? "rotate(90 20 20)" : "";
</script>

<svg class="vine" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" >
    <g transform={transform}>
        <path fill="url(#a)" d="M21 0h40v4H21z" transform="rotate(90 21 0)"/>
        <path stroke="url(#b)" d="M21 40c0-2.5-4.5-4.5-4.5-9s8.5-9.5 4-14c-3.7-3.7-4-6-3.5-9s4-3.5 4-8"/>
        <path fill="url(#d)" d="M15 22.2s-2 .1-2.8 2.7c-.5 1.4-1.9 1.6-1.9 1.6s4.3 3 6.8-.3c1.2-1.5 1-4.4-2.1-4Z"/>
        <path fill="url(#e)" d="M11.6 26.7c1.7-.4 3-1 4-1.6 0 .4-.2 1.5-1.1 2 .8-.3 1.2-.8 1.4-2.2 1-.7 1.5-1.3 1.5-1.3l-.3-.7s-.3.6-1 1.3c-.7-.8-1.9-.8-2.4-.7 1.2 0 1.9.5 2.1.9l-1.1.9a3 3 0 0 0-1.8-.2c.3 0 1 0 1.6.3-.7.5-1.7 1-3 1.3Z"/>
        <path fill="url(#f)" d="M15.7 11s-1.8.3-3.1-2c-.7-1.1-2-1-2-1s3.3-3.7 6.3-1.1c1.4 1.2 1.8 3.9-1.2 4.1Z"/>
        <path fill="url(#g)" d="M11.7 7.5c1.7 0 3 .3 4 .7 0-.4-.4-1.3-1.4-1.7.8.2 1.3.5 1.7 1.8 1.1.5 1.7 1 1.7 1l-.2.6-1.2-1c-.4 1-1.5 1.1-2 1.1 1-.1 1.6-.8 1.8-1.2a9 9 0 0 0-1.2-.6c-.5.3-1.1.6-1.7.5.3 0 1-.1 1.5-.6-.8-.3-1.8-.5-3-.6Z"/>
        <path fill="url(#h)" d="M21 32s1.6 1.8 4.6.6a3 3 0 0 1 3 .5s-.3-6.4-5.5-6.3c-2.3 0-5 2.5-2.2 5.2Z"/>
        <path fill="url(#i)" d="M27.9 31.8a15.2 15.2 0 0 0-4.6-2.7c.4-.4 1.6-1 2.8-.5-.9-.5-1.7-.6-3.2.3-1.5-.5-2.5-.5-2.5-.5l-.3.8h2c-.4 1.3.5 2.5 1 2.9a3 3 0 0 1-.7-2.8l1.7.5c.2.7.6 1.5 1.2 2-.3-.3-.8-1-1-1.9 1.1.4 2.3 1 3.6 2Z"/>
        <path fill="url(#j)" d="M22.6 17.2s2.2.2 3.7-2.5a2.9 2.9 0 0 1 2.4-1.5s-4.3-4.3-7.8-1c-1.6 1.6-2 4.9 1.7 5Z"/>
        <path fill="url(#k)" d="M27.7 13.2a15 15 0 0 0-5.3.5c.1-.5.7-1.6 2-2-1 .2-1.8.6-2.4 2.2-1.5.5-2.3 1-2.3 1l.2.9s.5-.6 1.6-1.2c.5 1.2 1.9 1.6 2.6 1.6a3 3 0 0 1-2.3-1.7c.5-.2 1-.5 1.7-.6.5.3 1.3.8 2 .8-.3 0-1.2-.3-1.8-1l4-.5Z"/>
    </g>
    <defs>
        <linearGradient id="a" x1="35" x2="35" y1="0" y2="6.3" gradientUnits="userSpaceOnUse">
            <stop stop-color={colors.medium} />
            <stop offset=".4" stop-color={colors.light} />
            <stop offset="1" stop-color={colors.dark} />
        </linearGradient>
        <linearGradient id="b" x1="14" x2="21.1" y1="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0B1D41"/>
            <stop offset=".9" stop-color="#064642"/>
        </linearGradient>
        <linearGradient id="d" x1="17.1" x2="11.8" y1="24.1" y2="24.8" gradientUnits="userSpaceOnUse">
            <stop stop-color="#064642"/>
            <stop offset="1" stop-color="#04663D"/>
        </linearGradient>
        <linearGradient id="e" x1="15.1" x2="16.9" y1="24.8" y2="23.4" gradientUnits="userSpaceOnUse">
            <stop stop-color="#06343E"/>
            <stop offset="1" stop-color="#06343E" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="f" x1="17.3" x2="12.2" y1="8.8" y2="9.2" gradientUnits="userSpaceOnUse">
            <stop stop-color="#064642"/>
            <stop offset="1" stop-color="#04663D"/>
        </linearGradient>
        <linearGradient id="g" x1="15.3" x2="17.3" y1="8.6" y2="9.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#06343E"/>
            <stop offset="1" stop-color="#06343E" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="h" x1="20" x2="27" y1="29.5" y2="33" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0B1D41"/>
            <stop offset=".5" stop-color="#064642"/>
            <stop offset="1" stop-color="#04663D"/>
        </linearGradient>
        <linearGradient id="i" x1="23.4" x2="20.6" y1="29.8" y2="29.1" gradientUnits="userSpaceOnUse">
            <stop stop-color="#06343E"/>
            <stop offset="1" stop-color="#06343E" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="j" x1="19.9" x2="29.1" y1="15.8" y2="12.6" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0A1B3E"/>
            <stop offset=".4" stop-color="#064246"/>
            <stop offset=".9" stop-color="#04663D"/>
        </linearGradient>
        <linearGradient id="k" x1="25.6" x2="19.7" y1="14.7" y2="15.3" gradientUnits="userSpaceOnUse">
            <stop stop-color="#06343E"/>
            <stop offset="1" stop-color="#06343E" stop-opacity="0"/>
        </linearGradient>
    </defs>
</svg>

<style>
    .vine {
        width: 100% !important;
        height: 100% !important;
    }
</style>
