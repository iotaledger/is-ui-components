<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge, Button, ListGroup, ListGroupItem, Spinner } from 'sveltestrap';
	// We have to import Input this way, otherwise it shouts SSR issues.
	import Input from 'sveltestrap/src/Input.svelte';
	import Box from '../login-register/box.svelte';
	import { Icon } from './../../components';
	import { BoxColor } from './../../lib/constants/colors';
	import { searchChannels, searchResults } from './../../lib/streams';

	let loading = false;
	let query: string = '';

	$: message = loading || $searchResults?.length ? null : 'No channels found';

	onMount(async () => {
		// Pre-load the first 100 identities
		loading = true;
		$searchResults = await searchChannels('', true);
		loading = false;
	});

	async function onSearch() {
		loading = true;
		$searchResults = await searchChannels(query);
		loading = false;
	}

	// TODO: improve this. It is used to change the icon color when button is hovered.
	let iconColor = '#333333';
	const switchIconColor = () => {
		iconColor = iconColor === '#333333' ? 'white' : '#333333';
	};
	// ---------------------------------------------------------------------------------------------
</script>

<Box>
	<div class="streams-manager w-100 h-100 d-flex flex-column">
		<div class="mb-4 d-flex flex-row align-items-center justify-content-between">
			<div class="d-flex align-items-center">
				<h1>Channels</h1>
				{#if loading}
					<div class="ms-4">
						<Spinner type="border" color="secondary" size="sm" />
					</div>
				{/if}
			</div>
			<div
				class="box d-flex align-items-center"
				on:mouseenter={switchIconColor}
				on:mouseleave={switchIconColor}
			>
				<Button
					size="sm"
					outline
					color="dark"
					on:click={() => {
						console.log('TODO: Create a channel');
					}}
				>
					<Icon type="plus" color={iconColor} />
					<span class="ml-1">Create a channel</span>
				</Button>
			</div>
		</div>
		<div class="search mb-4 position-relative">
			<Input
				type="text"
				placeholder="Search for channels..."
				autofocus
				class="position-relative ps-5"
				bind:value={query}
				on:keypress={(e) => {
					if (e.key === 'Enter') onSearch();
				}}
			/>
			<button class="border-0 bg-transparent position-absolute" on:click={onSearch}>
				<Icon type="search" />
			</button>
		</div>
		{#if $searchResults?.length}
			<ListGroup flush>
				{#each $searchResults as { channelAddress, isOwner, isSubscriber }}
					<ListGroupItem
						tag="button"
						action
						class="border-bottom"
						on:click={() => {
							// TODO: Go to channel details
							console.log('Clicked on channel: ', channelAddress);
						}}
					>
						<div class="item d-flex align-items-center">
							<Icon type="credential" boxed boxColor={BoxColor.Blue} size={24} />
							<div class="overflow-hidden">
								<div class="ms-3">
									<div class="d-flex align-items-center">
										<!-- TODO: remove this when library is updated and returns channel name -->
										<span class="fs-6 fw-bold">Channel name</span>
										<!-- Temporary solution to display if a user is owner / subscriber of a channel -->
										{#if isOwner}
											<Badge class="ms-2" color="info">owner</Badge>
										{/if}
										{#if isSubscriber}
											<Badge color="success">subscriber</Badge>
										{/if}
									</div>
								</div>
								<div class="ms-3 fs-6 text-secondary text-truncate">{channelAddress}</div>
							</div>
						</div>
					</ListGroupItem>
				{/each}
			</ListGroup>
		{/if}

		{#if message}
			<div class="text-center">
				{message}
			</div>
		{/if}
	</div>
</Box>

<style lang="scss">
	.streams-manager {
		.search {
			button {
				top: 50%;
				left: 8px;
				transform: translateY(-50%);
			}
		}
		.item {
			flex: 1 1 0;
			white-space: nowrap;
			overflow: hidden !important;
			text-overflow: ellipsis;
			margin-right: 20px;
			&:last-child {
				margin-right: 0px;
			}
		}
	}
</style>
