<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Button, Spinner, Toast, Badge } from 'sveltestrap';
	import { Icon, JSONViewer, WriteMessage } from './../../components';
	import { BoxColor } from './../../lib/constants/colors';
	import { channelData, readChannel, stopData } from './../../lib/streams';

	export let address: string;
	export let name: string;

	let isOpen: boolean = false;

	export let topics;
	onMount(async () => {
		await readChannel(address, true);
	});
	onDestroy(() => {
		stopData();
	});

	function onModalClose() {
		isOpen = !isOpen;
	}
	// TODO: improve this. It is used to change the icon color when button is hovered.
	let addIconColor = '#333333';
	let messageIconColor = '#333333';

	const switchIconColor = (icon: 'add' | 'message') => {
		if (icon === 'add') {
			addIconColor = addIconColor === '#333333' ? 'white' : '#333333';
		}
		if (icon === 'message') {
			messageIconColor = messageIconColor === '#333333' ? 'white' : '#333333';
		}
	};

	// ---------------------------------------------------------------------------------------------
</script>

<div class="w-100">
	<div
		class="d-flex align-items-center justify-content-between bg-light rounded p-4 flex-column flex-lg-row"
	>
		<div class="d-flex align-items-center">
			<Icon type="channel" size={64} boxed boxColor={BoxColor.Blue} />
			<div class="ms-4">
				<div class="fs-4 fw-bold">{name}</div>
				{#each topics as { type, source }}
					<Badge color="primary" class="me-1">{type}</Badge>
					<Badge color="secondary" class="me-2">{source}</Badge>
				{/each}
				<div class="text-secondary text-break fw-bolder mt-1 text-break">{address}</div>
			</div>
		</div>
		<div class="d-flex align-items-center ms-lg-3">
			<div
				on:mouseenter={() => switchIconColor('add')}
				on:mouseleave={() => switchIconColor('add')}
			>
				<Button
					size="sm"
					outline
					color="dark"
					on:click={() => {
						console.log('TODO: Subscribe channel');
					}}
					class="mt-3 mt-lg-0  d-flex align-items-center"
				>
					<Icon type="plus" size={24} color={addIconColor} />
					<span class="ml-1">Subscribe</span>
				</Button>
			</div>
		</div>
	</div>

	<div class="my-4">
		<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
			<Toast class="d-flex w-auto">
				<div class="p-3 d-flex align-items-center w-100">
					<div class="me-2">Looking for new channel data...</div>
					<Spinner type="grow" size="sm" color="secondary" />
				</div>
			</Toast>
			<div
				class="d-flex"
				on:mouseenter={() => switchIconColor('message')}
				on:mouseleave={() => switchIconColor('message')}
			>
				<Button size="sm" outline color="dark" class="mt-3 mt-md-0" on:click={onModalClose}>
					<span class="me-2">Write a message</span>
					<Icon type="message" color={messageIconColor} />
				</Button>
			</div>
		</div>
		{#each $channelData as msg}
			<div class="p-4 bg-light my-4">
				<div class="d-flex flex-column flex-lg-row">
					<div class="info-box my-4 my-lg-0">
						<div class="text-secondary">Message id</div>
						<div class="text-break">{msg.messageId}</div>
					</div>
					<div class="my-4 my-lg-0 mx-lg-4">
						<div class="text-secondary">Timestamp</div>
						<div class="text-break">{msg.imported}</div>
					</div>
					<div class="info-box my-4 my-lg-0">
						<div class="text-secondary">Link</div>
						<div class="text-break">{msg.link}</div>
					</div>
				</div>
				<div class="my-4">
					<div class="text-secondary">Log</div>
					<JSONViewer json={JSON.stringify(msg.log, null, '\t')} />
				</div>
			</div>
		{/each}
	</div>
	<WriteMessage {isOpen} {onModalClose} {address} />
</div>

<style lang="scss">
	.info-box {
		flex: 1 1 0;
	}
</style>
