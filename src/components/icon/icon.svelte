<script lang="ts">
    import { BoxColor } from './../../lib/constants/colors'
    import { Close, Credential, Identity } from './icons'
    import { Icon } from 'sveltestrap'
    import CustomIcon from './custom-icon.svelte'

    const TYPES = {
        close: Close,
        identity: Identity,
        credential: Credential,
    }

    export let size: number = 24
    export let type: string = undefined
    export let color: string = '#333333'
    export let boxed: boolean = false
    export let boxColor: BoxColor = BoxColor.Blue

    $: customIcon = TYPES[type]
</script>

{#if boxed}
    <div
        class={`background-${boxColor} position-relative rounded`}
        style={` min-width: ${size * 1.5}px; height: ${size * 1.5}px;`}
    >
        {#if customIcon}
            <div class="icon-component position-absolute">
                <CustomIcon {size} {color} icon={customIcon} />
            </div>
        {:else}
            <div class="icon-component position-absolute" style="--size:{size}px;">
                <Icon name={type} />
            </div>
        {/if}
    </div>
{:else if customIcon}
    <CustomIcon {size} {color} icon={customIcon} />
{:else}
    <div style="--size:{size}px;">
        <Icon name={type} />
    </div>
{/if}

<style lang="scss">
    div {
        font-size: var(--size);
        .icon-component {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
</style>
