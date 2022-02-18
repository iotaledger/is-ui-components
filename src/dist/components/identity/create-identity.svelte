<script lang="ts">
	import type { IdentityJson } from 'iota-is-sdk';
	import { UserType } from 'iota-is-sdk';
	import { Button, Spinner, FormGroup, Input, Label, ModalBody, ModalHeader } from 'sveltestrap';
	// We have to import Modal by this way because with a regular import it has SSR issues.
	import Modal from 'sveltestrap/src/Modal.svelte';
	import { USERS } from './../../lib/constants/identity';
	import { register } from './../../lib/identity';
	import type { IUser } from './../../lib/types/identity';

	export let isOpen: boolean = false;
	export let onModalClose: () => void = () => {};
	export let onCreateSuccess: (id: string) => void = () => {};

	let selectedUser: IUser;
	let inputFields = {};
	let loading = false;
	let registeredIdentity: IdentityJson;
	let selectedUserType = UserType.Person;

	const MIN_USERNAME_LENGTH = 3;

	$: selectedUser = USERS.find((user) => user.type === selectedUserType);

	let isValid: boolean = false;
	$: inputFields, validate();

	function sanitizeInputFields(): void {
		for (const key in inputFields) {
			if (inputFields[key] === '') {
				delete inputFields[key];
			}
		}
	}

	async function handleRegister(): Promise<void> {
		loading = true;
		sanitizeInputFields();
		let { username, ...claims } = inputFields;
		registeredIdentity = await register(inputFields['username'], selectedUser.type, claims);
		if (registeredIdentity) {
			onCreateSuccess(registeredIdentity?.doc?.id);
		}
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

<Modal {isOpen} toggle={onModalClose}>
	<ModalHeader toggle={onModalClose} class="px-4 pt-3">Create identity</ModalHeader>

	<ModalBody class="px-4 pb-4">
		<div>
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
		</div>
		<Button
			size="lg"
			color="primary"
			block
			class="mt-4"
			disabled={!isValid || loading}
			type="submit"
			on:click={handleRegister}
			><div class="d-flex justify-content-center align-items-center">
				{loading ? 'Creating...' : 'Create identity'}
				{#if loading}
					<div class="ms-2"><Spinner size="sm" type="border" color="light" /></div>
				{/if}
			</div>
		</Button>

		{#if registeredIdentity}
			<div class="mt-4">Identity created succesfully</div>
		{/if}
	</ModalBody>
</Modal>
