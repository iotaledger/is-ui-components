<script lang="ts">
    import { authenticationData, isAuthenticated } from '$lib/app/base'
    import { logout } from '$lib/app/identity'
    import { LoginRegisterManager } from '$lib/components'
    import { Button, Container, Row } from 'sveltestrap'
</script>

<Container class="py-5">
    <Row class="mb-4">
        <h1>Demo 1: Authentication</h1>
    </Row>
    {#if $isAuthenticated}
        <Button size="sm" outline color="primary" on:click={logout} class="mb-2 d-flex align-items-center">
            <span class="ms-1">Logout</span>
        </Button>
        <p class="text-break">JWT: {$authenticationData?.jwt}</p>
        <p class="text-break">DID: {$authenticationData?.did}</p>
    {:else}
        <Row class="mb-4">
            <LoginRegisterManager />
        </Row>
    {/if}
</Container>
