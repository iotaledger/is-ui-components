<script lang="ts">
	import { Button, FormGroup, Input, Label, ModalBody, ModalHeader, Spinner } from 'sveltestrap';
	// We have to import Modal this way, otherwise it shouts SSR issues.
	import Modal from 'sveltestrap/src/Modal.svelte';
	import { createChannel } from './../../lib/streams';
	import { Icon } from '../../components';

	export let isOpen: boolean = false;
	export let onModalClose: () => void = () => {};
	export let onSuccess: (channelAddress: string) => void = () => {};

	let loading = false;
	let topics: { type: string; source: string }[] = [
		{
			type: '',
			source: ''
		}
	];

	function resetTopics(): void {
		topics = [
			{
				type: '',
				source: ''
			}
		];
	}
	async function handleCreateChannel() {
		loading = true;
		let channel = await createChannel(topics);
		if (channel) {
			resetTopics();
			onSuccess(channel.channelAddress);
		}
		loading = false;
	}

	function handleAddTopic() {
		topics = [
			...topics,
			{
				type: '',
				source: ''
			}
		];
	}

	function handleRemoveTopic(i) {
		topics = [...topics.slice(0, i), ...topics.slice(i + 1)];
	}

	$: isValid = (): boolean => {
		return topics.find((topic) => topic['type'] === '' || topic['source'] === '') === undefined;
	};
</script>

<Modal {isOpen} toggle={onModalClose}>
	<ModalHeader toggle={onModalClose} class="px-4 pt-3">Create channel</ModalHeader>

	<ModalBody class="px-4 pb-4">
		{#each topics as topic, i}
			<div class="my-4 p-4 bg-light ">
				<Label class="d-flex justify-content-between align-items-center">
					Topic
					{#if topics.length > 1}
						<button class="border-0 bg-transparent" on:click={() => handleRemoveTopic(i)}>
							<Icon type="trash" boxColor="transparent" boxed size={20} />
						</button>
					{/if}
				</Label>

				<FormGroup floating label="Type*">
					<Input placeholder="Type" type="text" bind:value={topic['type']} required />
				</FormGroup>
				<FormGroup floating label="Source*">
					<Input placeholder="Source" type="text" bind:value={topic['source']} required />
				</FormGroup>
			</div>
		{/each}
		<div class="w-100 d-flex align-items-center justify-content-end">
			<Button size="sm" color="light" on:click={handleAddTopic}>
				<Icon type="plus" />
				<span class="ml-1">Add new topic</span>
			</Button>
		</div>
		<Button
			size="lg"
			block
			class="mt-4"
			color="primary"
			disabled={!isValid() || loading}
			on:click={handleCreateChannel}
		>
			<div class="d-flex justify-content-center align-items-center">
				{loading ? 'Creating channel...' : 'Create channel'}
				{#if loading}
					<div class="ms-2"><Spinner size="sm" type="border" color="light" /></div>
				{/if}
			</div>
		</Button>
	</ModalBody>
</Modal>
