<script lang="ts">
	import { identityClient } from '$lib/app';
	import { jwt } from '$lib/store';
	import type { IdentityJson } from 'iota-is-sdk/src';
	import { onMount } from 'svelte';
	import Dropzone from 'svelte-file-dropzone';
	import { Button } from 'sveltestrap';
	import { Spinner } from '.';

	let fileReader: FileReader;
	let json: IdentityJson;
	let file: File;
	let loading = false;

	onMount(() => {
		fileReader = new FileReader();
		fileReader.addEventListener('load', loadJson);
		return () => {
			fileReader.removeEventListener('load', loadJson);
		};
	});

	const onSubmit = async () => {
		loading = true;
		if (json.doc?.id) {
			await identityClient.authenticate(json.doc.id, json.key?.secret);
			$jwt = identityClient.jwtToken;
		}
		loading = false;
	};

	const handleFilesSelect = (e) => {
		// Only shows the last file uploaded
		file = e.detail.acceptedFiles[0];

		fileReader.readAsText(file);
	};

	const loadJson = () => (json = JSON.parse(fileReader.result.toString()));
</script>

<div class="login-box">
	<div class="drop">
		<Dropzone on:drop={handleFilesSelect}>
			{#if file?.name}
				<p>JSON file accepted</p>
			{:else}
				<p>Upload a JSON file or drag and drop</p>
			{/if}
		</Dropzone>
		{#if file?.name}
			<div class="file">{file?.name}</div>
		{/if}
	</div>
	<Button size="lg" color="primary" disabled={file === undefined || loading} on:click={onSubmit}>
		<div class="d-flex justify-content-between">
			{loading ? 'Processing...' : 'Login'}
			{#if loading}
				<div>
					<Spinner compact />
				</div>
			{/if}
		</div>
	</Button>
</div>

<style lang="scss">
	.login-box {
		.drop {
			margin-top: 20px;
			.file {
				margin-top: 20px;
			}
		}
		:global(button) {
			padding: 8px 24px;
			font-size: 14px;
			margin-top: 30px;
		}
		.message {
			margin-top: 30px;
		}
	}
</style>
