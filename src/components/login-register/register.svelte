<script lang="ts">
	import { Icon, Spinner } from '$components';
	import { USERS } from '$lib/constants/identity';
	import { register } from '$lib/identity';
	import type { RegistrationUser } from '$lib/types/identity';
	import type { IdentityJson } from 'iota-is-sdk';
	import { UserType } from 'iota-is-sdk';
	import { Button, Form, FormGroup, Input, Label } from 'sveltestrap';
	import Box from './box.svelte';
	import RegisterSuccess from './register-success.svelte';

	export let switchToLogin: () => void = () => {};

	let selectedUser: RegistrationUser;
	let inputFields = {};
	let loading = false;
	let registeredIdentity: IdentityJson;
	let selectedUserType = UserType.Person;

	const MIN_USERNAME_LENGTH = 3;

	$: selectedUser = USERS.find((user) => user.type === selectedUserType);

	let isValid: boolean = false;
	$: inputFields, validate();

	function deleteEmptyAttributes(): void {
		for (const key in inputFields) {
			if (inputFields[key] === '') {
				delete inputFields[key];
			}
		}
	}

	async function handleRegister(): Promise<void> {
		loading = true;
		deleteEmptyAttributes();
		let { username, ...claims } = inputFields;
		registeredIdentity = await register(inputFields['username'], selectedUser.type, claims);
		loading = false;
	}

	function resetInputFields(): void {
		inputFields = {};
	}

	function validate(): void {
		if (
			inputFields &&
			Object.keys(inputFields).length === 0 &&
			Object.getPrototypeOf(inputFields) === Object.prototype
		) {
			isValid = false;
		} else {
			for (const key in inputFields) {
				const isRequired = selectedUser.inputFields?.find((field) => field.name === key)?.required;
				if (
					(inputFields[key] === '' && isRequired) ||
					inputFields['username']?.length < MIN_USERNAME_LENGTH
				) {
					isValid = false;
					return;
				}
			}
			isValid = true;
		}
	}
</script>

{#if !registeredIdentity}
	<Box>
		<div class="mb-4 d-flex flex-column align-items-center">
			<div class="mb-4">
				<Icon type="identity" size={48} />
			</div>
			<h1 class="mb-1">Register a new DID</h1>
			<div>
				or
				<span class="text-primary cursor-pointer" on:click={switchToLogin}>log in with DID</span>
			</div>
		</div>

		<div class="w-100">
			<Form>
				<FormGroup class="mb-4">
					<Label class="mb-2">ID type</Label>
					<Input
						class="py-3 ps-3"
						type="select"
						name="select"
						bind:value={selectedUserType}
						on:change={resetInputFields}
					>
						{#each USERS as _user, i}
							<option value={_user.type}>
								{_user.type}
							</option>
						{/each}
					</Input>
				</FormGroup>
				{#if selectedUser}
					{#each selectedUser?.fields as { name, required }}
						<FormGroup class="mb-4">
							<Label class="text-capitalize mb-2">{`${name}${required ? '*' : ''}`}</Label>
							<Input
								id={`input-${name}-${selectedUser.type}`}
								class="py-3 ps-3"
								placeholder={name}
								bind:value={inputFields[name]}
								{required}
								on:keydown={() => (registeredIdentity = null)}
							/>
						</FormGroup>
					{/each}
				{/if}
			</Form>
		</div>
		<Button
			size="lg"
			color="primary"
			block
			class="mt-4"
			disabled={!isValid || loading}
			type="submit"
			on:click={handleRegister}
		>
			<div class="text-center d-flex flex-row align-items-center justify-content-center">
				{#if loading}
					<div class="me-1">Registering identity...</div>
					<Spinner compact />
				{:else}
					<div>Register a new DID</div>
				{/if}
			</div>
		</Button>
	</Box>
{:else}
	<RegisterSuccess
		identity={registeredIdentity}
		type={selectedUser.type}
		username={selectedUser.username}
		{switchToLogin}
	/>
{/if}
