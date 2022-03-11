<script lang="ts">
    import { authenticated } from '$lib/app/base'
    import { onMount } from 'svelte'
    import Login from './login.svelte'
    import Register from './register.svelte'
    import Logout from './logout.svelte'
    import { DEFAULT_USERS } from '$lib/app/constants/identity'
    import type { RegistrationUser } from '$lib/app/types/identity'

    export let onLoginSuccess: () => void = () => {}
    export let users: RegistrationUser[] = DEFAULT_USERS

    enum State {
        AlreadyAuthenticated = 'alreadyAuthenticated',
        Login = 'login',
        Register = 'register',
    }

    let state: State

    onMount(() => {
        if ($authenticated) {
            state = State.AlreadyAuthenticated
        } else {
            state = State.Login
        }
    })

    const switchToLogin = () => {
        state = State.Login
    }

    const switchToRegister = () => {
        state = State.Register
    }
</script>

<div>
    {#if state === State.AlreadyAuthenticated}
        <Logout {switchToLogin} />
    {:else if state === State.Login}
        <Login {switchToRegister} onSuccess={onLoginSuccess} />
    {:else if state === State.Register}
        <Register {switchToLogin} {users} />
    {/if}
</div>
