<script lang="ts">
	import type { IUser } from '$lib/app';
	import { identityClient, USERS } from '$lib/app';
	import { createJsonDataUrl } from '$lib/utils';
	import { IdentityJson, UserType } from 'iota-is-sdk';
	import { Button, Form, FormGroup, Input } from 'sveltestrap';
	import { Spinner } from '.';

	let selectedUser: IUser;
	let inputFields = {};
	let loading = false;
	let identity: IdentityJson;

	// Workaround to fix svelte bug in version 3.42.1 and higher, it allows to show the default selected option in a HTML selector
	let selected_type = UserType.Person;
	$: selectedUser = USERS.find((user) => user.type === selected_type);

	$: isValid = (): boolean => {
		if (
			inputFields &&
			Object.keys(inputFields).length === 0 &&
			Object.getPrototypeOf(inputFields) === Object.prototype
		) {
			return false;
		} else {
			for (const key in inputFields) {
				const isRequired = selectedUser.inputFields?.find((field) => field.name === key)?.required;
				if ((inputFields[key] === '' && isRequired) || inputFields['username']?.length < 3) {
					return false;
				}
			}
			return true;
		}
	};

	const resetInputFields = () => (inputFields = {});

	const deleteEmptyAttributes = () => {
		for (const key in inputFields) {
			if (inputFields[key] === '') {
				delete inputFields[key];
			}
		}
	};
</script>

<div>
	<Form>
		<FormGroup>
			<Input type="select" name="select" bind:value={selected_type} on:change={resetInputFields}>
				{#each USERS as _user, i}
					<option value={_user.type}>
						{_user.type}
					</option>
				{/each}
			</Input>
		</FormGroup>
		{#if selectedUser}
			{#each selectedUser?.fields as { name, required }}
				<FormGroup floating label={`${name}${required ? '*' : ''}`}>
					<Input
						id={`input-${name}-${selectedUser.type}`}
						placeholder={name}
						bind:value={inputFields[name]}
						{required}
						on:keydown={() => (identity = undefined)}
					/>
				</FormGroup>
			{/each}
		{/if}
	</Form>
	<Button
		size="lg"
		color="primary"
		disabled={!isValid() || loading}
		type="submit"
		on:click={async () => {
			deleteEmptyAttributes();
			let { username, ...claims } = inputFields;
			loading = true;
			identity = await identityClient.create(inputFields['username'], selectedUser.type, claims);
			loading = false;
			resetInputFields();
		}}
	>
		<div class="d-flex justify-content-between">
			{loading ? 'Registering identity...' : 'Register'}
			{#if loading}
				<div class="ms-2"><Spinner compact /></div>
			{/if}
		</div>
	</Button>
	{#if identity}
		<div class="mt-4">
			<span>Identity created. </span>
			<a href={createJsonDataUrl(identity)} download="identity.json">Download</a>
		</div>
	{/if}
</div>

<style lang="scss">
	div {
		:global(input) {
			padding-bottom: 12px;
			border-radius: 10px;
			&::placeholder {
				font-size: 12px;
			}
		}
		:global(button) {
			padding: 8px 24px;
			font-size: 14px;
		}
	}
</style>
