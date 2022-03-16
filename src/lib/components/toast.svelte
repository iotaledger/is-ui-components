<script lang="ts">
    import { NotificationType } from '$lib/app/types/notification'
    import { fade } from 'svelte/transition'
    import { Toast,ToastBody,ToastHeader } from 'sveltestrap'
    import Icon from './icon/icon.svelte'

    export let title: string | undefined = undefined
    export let message: string
    export let type: NotificationType

    let showToast: boolean = true

    $: color = type === NotificationType.Error ? 'danger' : 'secondary'

    function toggle(): void {
        showToast = !showToast
    }
</script>

<div in:fade out:fade class="mb-3">
    <Toast isOpen={showToast}>
        <ToastHeader {toggle}>
            <div class="d-flex align-items-center text-{color}">
                <Icon type="exclamation-circle" size={12} />
                {#if title}
                    <span class="ms-2 text-capitalize">{title}</span>
                {/if}
            </div>
        </ToastHeader>
        <ToastBody>{message}</ToastBody>
    </Toast>
</div>
