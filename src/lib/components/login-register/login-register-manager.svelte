<script lang="ts">
    import { isAuthenticated } from '$lib/app/base'
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { Login, Logout, Register } from '$lib/components'

    export let onLoginSuccess = (..._: any[]): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES

    enum State {
        AlreadyAuthenticated = 'alreadyAuthenticated',
        Login = 'login',
        Register = 'register',
    }

    let state: State

    $: if ($isAuthenticated) {
        state = State.AlreadyAuthenticated
    } else {
        state = State.Login
    }

    function switchToLogin(): void {
        state = State.Login
    }

    function switchToRegister(): void {
        state = State.Register
    }
</script>

<div>
    {#if state === State.AlreadyAuthenticated}
        <Logout {switchToLogin} />
    {:else if state === State.Login}
        <Login {switchToRegister} onSuccess={onLoginSuccess} />
    {:else if state === State.Register}
        <Register {switchToLogin} {identitiesTemplate} isCreateIdentityModalOpen={true} />
    {/if}
</div>
