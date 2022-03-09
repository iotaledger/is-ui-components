<script lang="ts">
    import { Icon } from '$lib/components'
    import { logout } from '$lib/app/identity'
    import { Button } from 'sveltestrap'
    import Box from './box.svelte'

    export let switchToLogin: () => void = () => {}

    const handleLogout = async () => {
        logout()
        switchToLogin()
    }
</script>

<Box>
    <div class="d-flex flex-column text-center align-items-center">
        <div class="mb-4">
            <Icon type="identity" size={48} />
        </div>
        <h1 class="mb-4">Already Authenticated</h1>
    </div>
    <Button size="lg" block color="primary" on:click={handleLogout}>
        <div>Log out</div>
    </Button>
</Box>
