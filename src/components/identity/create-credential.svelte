<script lang="ts">
	import { VC_TEMPLATES } from '$lib/constants/identity';
	import { createVC } from '$lib/identity';
	import { createJsonDataUrl } from '$lib/utils';
	import { CredentialTypes, VerifiableCredentialJson } from 'iota-is-sdk';
	import {
		Button,
		FormGroup,
		Input,
		Label,
		Modal,
		ModalBody,
		ModalHeader,
		Spinner
	} from 'sveltestrap';

	export let isOpen: boolean = false;
	export let onModalClose: () => void = () => {};
	export let onCreateSuccess: () => void = () => {};
	export let targetDid: string = undefined;

	let verifiableCredential: VerifiableCredentialJson;
	let inputFields = {};
	let loading = false;
	let selectedTemplate = VC_TEMPLATES[0];
	let selectedCredential = CredentialTypes.BasicIdentityCredential;

	$: isValid = (): boolean => {
		if (
			inputFields &&
			Object.keys(inputFields).length === 0 &&
			Object.getPrototypeOf(inputFields) === Object.prototype
		) {
			return false;
		} else {
			for (const key in inputFields) {
				const isRequired = selectedTemplate.fields.find((field) => field.required);
				if (!targetDid || (inputFields[key] === '' && isRequired)) {
					return false;
				}
			}
			return true;
		}
	};

	function resetFields(): void {
		inputFields = {};
	}
	function resetCredential(): void {
		verifiableCredential = undefined;
	}

	function handleInputChange(): void {
		resetFields();
		resetCredential();
	}

	// Remove empty fields
	const sanitizeInputFields = () => {
		for (const key in inputFields) {
			if (inputFields[key] === '') {
				delete inputFields[key];
			}
		}
	};

	const handleCreateVC = async () => {
		loading = true;
		sanitizeInputFields();
		verifiableCredential = await createVC(
			undefined,
			targetDid,
			selectedCredential,
			selectedTemplate.userType,
			inputFields
		);
		if (verifiableCredential) {
			onCreateSuccess();
		}
		resetFields();
		loading = false;
	};
</script>

<Modal {isOpen} toggle={onModalClose}>
	<ModalHeader toggle={onModalClose} class="px-4 pt-3">Add a credential</ModalHeader>
	<ModalBody class="px-4 pb-4">
		<div>
			<FormGroup>
				<Label>Credential type</Label>
				<Input
					type="select"
					name="select"
					bind:value={selectedCredential}
					on:change={handleInputChange}
				>
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

			<Label>Template</Label>
			<Input
				type="select"
				name="select"
				bind:value={selectedTemplate}
				on:change={handleInputChange}
			>
				{#each VC_TEMPLATES as template}
					<option value={template}>
						{template.name}
					</option>
				{/each}
			</Input>
			{#if selectedTemplate}
				{#each selectedTemplate.fields as { id, label, type, required }}
					<div class="mb-4">
						<Label>{label}</Label>
						<FormGroup floating label={`${label}${required ? '*' : ''}`}>
							<Input
								{type}
								placeholder={`${label}${required ? '*' : ''}`}
								bind:value={inputFields[id]}
								on:keydown={resetCredential}
							/>
						</FormGroup>
					</div>
				{/each}
			{/if}

			<Button
				size="lg"
				block
				color="primary"
				disabled={!isValid() || loading}
				on:click={handleCreateVC}
			>
				<div class="d-flex justify-content-center align-items-center">
					{loading ? 'Creating VC...' : 'Add a new credential'}
					{#if loading}
						<div class="ms-2"><Spinner size="sm" type="border" color="light" /></div>
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
	</ModalBody>
</Modal>

<style lang="scss">
	div {
		:global(button) {
			margin-top: 20px;
		}
		:global(select) {
			margin-bottom: 20px;
		}
		.download {
			margin-top: 30px;
		}
	}
	:global(.modal-header) {
		border-bottom: 0 !important;
	}
	/* :global(.modal-body) {
		padding: 32px ;
	} */
</style>
