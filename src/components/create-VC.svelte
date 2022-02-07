<script lang="ts">
	import { Spinner } from '$components';
	import { identityClient, VC_TEMPLATES } from '$lib/app';
	import { jwt } from '$lib/store';
	import { createJsonDataUrl } from '$lib/utils';
	import { CredentialTypes, VerifiableCredentialJson } from 'iota-is-sdk';
	import { onMount } from 'svelte';
	import { Button, FormGroup, Input } from 'sveltestrap';

	let targetDidId: string;
	let verifiableCredential: VerifiableCredentialJson;
	let inputFields = {};
	let loading = false;
	let selectedTemplate = VC_TEMPLATES[0];
	let selectedCredential = CredentialTypes.BasicIdentityCredential;

	onMount(() => {
		identityClient.jwtToken = $jwt;
	});

	$: isValid = (): boolean => {
		if (
			inputFields &&
			Object.keys(inputFields).length === 0 &&
			Object.getPrototypeOf(inputFields) === Object.prototype
		) {
			return false;
		} else {
			for (const key in inputFields) {
				const isRequired = VC_TEMPLATES.find((field) => field.required);
				if (!targetDidId || (inputFields[key] === '' && isRequired)) {
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

<div class="vc-box">
	<FormGroup>
		<FormGroup floating label={`Target DID id*`}>
			<Input type="text" placeholder="Target DID" bind:value={targetDidId} />
		</FormGroup>
		<Input type="select" name="select" bind:value={selectedCredential}>
			{#each Object.values(CredentialTypes) as _credential}
				<option
					value={_credential}
					on:click={() => {
						selectedCredential = _credential;
					}}
				>
					{_credential}
				</option>
			{/each}
		</Input>
	</FormGroup>

	<Input type="select" name="select" bind:value={selectedTemplate} on:change={resetInputFields}>
		{#each VC_TEMPLATES as template}
			<option value={template}>
				{template.name}
			</option>
		{/each}
	</Input>
	{#if selectedTemplate}
		<Input
			type={selectedTemplate.type}
			placeholder={`${selectedTemplate.name}${selectedTemplate.required ? '*' : ''}`}
			bind:value={inputFields[selectedTemplate.id]}
		/>
	{/if}

	<Button
		size="lg"
		color="primary"
		disabled={!isValid() || loading}
		on:click={async () => {
			deleteEmptyAttributes();
			loading = true;
			verifiableCredential = await identityClient.createCredential(
				undefined,
				targetDidId,
				selectedCredential,
				selectedTemplate.userType,
				inputFields
			);
			loading = false;
			resetInputFields();
		}}
	>
		<div class="d-flex justify-content-between">
			{loading ? 'Creating VC...' : 'Create'}
			{#if loading}
				<div class="ms-2"><Spinner compact /></div>
			{/if}
		</div>
	</Button>
	{#if verifiableCredential}
		<div class="download">
			<span>Verifiable credential created. </span>
			<a href={createJsonDataUrl(verifiableCredential)} download="vc.json">Download</a>
		</div>
	{/if}
</div>

<style lang="scss">
	div {
		:global(button) {
			padding: 8px 24px;
			font-size: 14px;
			margin-top: 20px;
		}
		:global(select) {
			margin-bottom: 20px;
		}
		.download {
			margin-top: 30px;
		}
	}
</style>
