<script lang="ts">
    import { BoxColor } from './../../lib/constants/colors'
    import {
        ArrowLeft,
        Channel,
        ChevronDown,
        Close,
        Credential,
        Device,
        Download,
        Identity,
        Individual,
        Message,
        Organization,
        Plus,
        Search,
        Trash,
        Warning,
    } from './icons'

    const TYPES = {
        'arrow-left': ArrowLeft,
        'chevron-down': ChevronDown,
        close: Close,
        device: Device,
        download: Download,
        identity: Identity,
        individual: Individual,
        organization: Organization,
        plus: Plus,
        search: Search,
        credential: Credential,
        channel: Channel,
        message: Message,
        trash: Trash,
        warning: Warning,
    }

    export let size: number = 24
    export let type: string = undefined
    export let color: string = '#333333'
    export let boxed: boolean = false
    export let boxColor: BoxColor = BoxColor.Blue

    $: selected = TYPES[type]
</script>

{#if selected}
    {#if boxed}
        <div
            class={`background-${boxColor} position-relative rounded`}
            style={`min-width: ${size * 1.5}px; height: ${size * 1.5}px;`}
        >
            <svg
                class="icon-component position-absolute"
                data-label="icon"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style="--color:{color};"
            >
                <svelte:component this={selected} />
            </svg>
        </div>
    {:else}
        <svg
            class="icon-component"
            data-label="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style="--color:{color};"
        >
            <svelte:component this={selected} />
        </svg>
    {/if}
{/if}

<style lang="scss">
    div {
        .icon-component {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    :global(svg.icon-component path) {
        stroke: var(--color);
    }
</style>
