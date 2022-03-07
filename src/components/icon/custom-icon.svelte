<script lang="ts">
    export let size: number = 24
    export let color: string = '#333333'
    export let icon: any = undefined
</script>

<svg
    class="icon-component"
    data-label="icon"
    width={size}
    height={size}
    viewBox="0 0 {size} {size}"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="--color:{color};"
>
    <svelte:component this={icon} />
</svg>

<style lang="scss">
    :global(svg.icon-component path) {
        stroke: var(--color);
    }
</style>
