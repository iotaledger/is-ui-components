<script lang="ts">
	import { identityClient } from '../lib/base';
	import type { IdentityJson } from 'iota-is-sdk';
	import { onMount } from 'svelte';
	import Dropzone from 'svelte-file-dropzone';
	import { Badge, Button } from 'sveltestrap';
	import type { Color } from 'sveltestrap/src/shared';

	type Message = {
		type: Color;
		body: string;
	};

	let fileReader: FileReader;
	let json: IdentityJson;
	let file: File;

	let loading = false;

	let currentMessage: Message;

	const MESSAGES = {
		verified: {
			type: 'success' as Color,
			body: 'Verified'
		},
		notVerified: {
			type: 'danger' as Color,
			body: 'Error!'
		},
		error: {
			type: 'warning' as Color,
			body: 'Not verified!'
		}
	};

	onMount(() => {
		fileReader = new FileReader();
		fileReader.addEventListener('load', loadJson);
		return () => {
			fileReader.removeEventListener('load', loadJson);
		};
	});

	const resetFile = () => (file = undefined);

	const verifyVC = async () => {
		if (json) {
			loading = true;
			let resp = await identityClient.checkCredential(json);
			loading = false;
			currentMessage = resp.isVerified ? MESSAGES.verified : MESSAGES.notVerified;
			json = undefined;
			resetFile();
		} else {
			currentMessage = MESSAGES.error;
		}
	};

	const handleFilesSelect = (e) => {
		// Only shows the last file uploaded
		file = e.detail.acceptedFiles[0];

		fileReader.readAsText(file);
	};

	const loadJson = () => (json = JSON.parse(fileReader.result.toString()));
</script>

<div>
	<div class="drop">
		<Dropzone on:drop={handleFilesSelect} />
		{#if file?.name}
			<div>{file.name}</div>
		{/if}
	</div>
	<Button size="lg" color="primary" type="submit" disabled={!json || loading} on:click={verifyVC}
		>Verify</Button
	>

	{#if currentMessage}
		<div class="mt-4">
			<Badge color={currentMessage.type}>{currentMessage.body}</Badge>
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
	}
</style>
