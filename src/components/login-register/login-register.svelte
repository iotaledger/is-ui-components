<script lang="ts">
	import { authenticated } from '$lib/identity';
	import { onMount } from 'svelte';
	import Login from './login.svelte';
	import Register from './register.svelte';
	import Logout from './logout.svelte';

	export let onLoginSuccess: () => void = () => {};

	enum State {
		AlreadyAuthenticated = 'alreadyAuthenticated',
		Login = 'login',
		Register = 'register'
	}

	let state: State;

	onMount(() => {
		if ($authenticated) {
			state = State.AlreadyAuthenticated;
		} else {
			state = State.Login;
		}
	});

	const switchToLogin = () => {
		state = State.Login;
	};

	const switchToRegister = () => {
		state = State.Register;
	};
</script>

<div class="login-register">
	{#if state === State.AlreadyAuthenticated}
		<Logout {switchToLogin} />
	{:else if state === State.Login}
		<Login {switchToRegister} onSuccess={onLoginSuccess} />
	{:else if state === State.Register}
		<Register {switchToLogin} />
	{/if}
</div>
