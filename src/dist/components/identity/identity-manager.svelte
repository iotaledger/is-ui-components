<script lang="ts">
	import { onMount } from 'svelte';
	import { ListGroup, ListGroupItem, Spinner, Button } from 'sveltestrap';
	// We have to import Input by this way because with a regular import it has SSR issues.
	import Input from 'sveltestrap/src/Input.svelte';
	import Box from '../login-register/box.svelte';
	import { CreateIdentity, Icon, IdentityDetails, IdentityProfile } from './../../components';
	import {
		searchIdentities,
		searchResults,
		selectedIdentity,
		updateIdentities,
		updateSelectedIdentity
	} from './../../lib/identity';
	import type { ExtendedUser } from './../../lib/types/identity';

	enum State {
		ListIdentities = 'listIdentities',
		IdentityDetail = 'identityDetail'
	}

	let state: State = State.ListIdentities;
	let loading = false;
	let query: string = '';
	let message: string;

	let isCreateIdentityOpen = false;
	$: $selectedIdentity, updateState();

	onMount(async () => {
		// Pre-load the first 100 identities
		loading = true;
		$searchResults = await searchIdentities('');
		loading = false;
	});

	async function onSearch() {
		loading = true;
		$searchResults = await searchIdentities(query);
		if ($searchResults?.length) {
			message = undefined;
		} else {
			message = 'No identities found';
		}
		loading = false;
	}

	function updateState(): void {
		if ($selectedIdentity) {
			state = State.IdentityDetail;
		} else {
			state = State.ListIdentities;
		}
	}

	const handleBlackClick = () => {
		$selectedIdentity = undefined;
	};

	function handleSelectIdentity(identity: ExtendedUser) {
		updateSelectedIdentity(identity);
	}

	function handleCloseModal() {
		isCreateIdentityOpen = false;
	}

	function handleOpenModal() {
		isCreateIdentityOpen = true;
	}

	async function updateIdentityList(id: string) {
		const identities = await searchIdentities(id);
		const foundIdentity = identities?.[0];
		updateIdentities(foundIdentity);
	}

	// TODO: improve this. It is used to change the icon color when button is hovered.
	let iconColor = '#333333';
	const switchIconColor = () => {
		iconColor = iconColor === '#333333' ? 'white' : '#333333';
	};
	// ---------------------------------------------------------------------------------------------
</script>

<Box>
	{#if state === State.ListIdentities}
		<div class="identity-manager w-100 h-100 d-flex flex-column">
			<div class="mb-4 d-flex flex-row align-items-center justify-content-between">
				<h1>Identities</h1>
				<div
					class="box d-flex align-items-center"
					on:mouseenter={switchIconColor}
					on:mouseleave={switchIconColor}
				>
					<Button size="sm" outline color="dark" on:click={handleOpenModal}>
						<Icon type="plus" color={iconColor} />
						<span class="ml-1">Create an identity</span>
					</Button>
				</div>
				{#if loading}
					<div class="ms-1">
						<Spinner type="border" color="light" />
					</div>
				{/if}
			</div>
			<div class="search mb-4 position-relative">
				<Input
					type="text"
					placeholder="Search for identities..."
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
					<ListGroupItem>
						<div class="d-flex justify-content-between align-items-center">
							<div class="item">Identity</div>
							<div class="item">Type</div>
							<div class="item">Date created</div>
							<div class="item">Credentials</div>
						</div>
					</ListGroupItem>
					{#each $searchResults as identity}
						<ListGroupItem
							tag="button"
							action
							class="border-bottom"
							on:click={() => {
								handleSelectIdentity(identity);
							}}
						>
							<div class="d-flex justify-content-between align-items-center">
								<div class="item">
									<IdentityProfile title={identity.username} type={identity.type} hideType />
								</div>
								<div class="item">{identity.type}</div>
								<div class="item">{identity.registrationDate}</div>
								<div class="item">{identity.verifiableCredentials?.length ?? 0}</div>
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
	{/if}

	{#if state === State.IdentityDetail}
		<div class="mb-4 align-self-start">
			<button on:click={handleBlackClick} class="go-back btn d-flex align-items-center">
				<Icon type="arrow-left" />
				<span class="ms-2">Back</span>
			</button>
		</div>

		<IdentityDetails
			username={$selectedIdentity.username}
			type={$selectedIdentity.type}
			id={$selectedIdentity.id}
			verifiableCredentials={$selectedIdentity.verifiableCredentials}
		/>
	{/if}
	<CreateIdentity
		isOpen={isCreateIdentityOpen}
		onModalClose={handleCloseModal}
		onCreateSuccess={updateIdentityList}
	/>
</Box>

<style lang="scss">
	.identity-manager {
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
	.go-back {
		font-weight: 500;
	}
</style>
