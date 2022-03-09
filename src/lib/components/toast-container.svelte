<script lang="ts">
    import { Toast } from '$lib/components'
    import { notifications } from '$lib/app/notificacion'
    import { fade } from 'svelte/transition'
</script>

<div class="toast-container position-fixed">
    <ul class="list-unstyled d-flex flex-column">
        {#each $notifications as notification}
            <li in:fade={{ duration: 100 }} out:fade={{ duration: 100 }}>
                <Toast {...notification} title={notification.type} />
            </li>
        {/each}
    </ul>
</div>

<style type="text/scss">
    .toast-container {
        right: 20px;
        bottom: 50px;
        width: 100%;
        z-index: 2000;
        @media (min-width: 600px) {
            width: 400px;
        }
        ul {
            gap: 8px;
        }
    }
</style>
