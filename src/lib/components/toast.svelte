<script lang="ts">
    import { NotificationType } from '$lib/app/types/notification'
    import { Icon } from '$lib/components'
    import { fade } from 'svelte/transition'
    import { Toast, ToastBody, ToastHeader } from 'sveltestrap'

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
                {#if type === NotificationType.Error}
                    <div class="me-2">
                        <Icon type="exclamation-circle" size={12} />
                    </div>
                {/if}
                {#if title}
                    <span class="text-capitalize">{title}</span>
                {/if}
            </div>
        </ToastHeader>
        <ToastBody>{message}</ToastBody>
    </Toast>
</div>
