<script lang="ts">
	import { Icon, IdentityDetails, IdentityProfile, Spinner, CreateIdentity } from '$components';
	import {
		searchIdentities,
		searchResults,
		selectedIdentity,
		updateSelectedIdentity,
		updateIdentities
	} from '$lib/identity';
	import type { ExtendedUser } from '$lib/types/identity';
	import type { IdentityJson } from 'iota-is-sdk/src';
	import { onMount } from 'svelte';
	import { Col, Column, Input, Table } from 'sveltestrap';
	import Box from '../login-register/box.svelte';

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
</script>

<Box>
	{#if state === State.ListIdentities}
		<div class="identity-manager p-4 w-100 h-100 d-flex flex-column">
			<div class="mb-4 d-flex flex-row align-items-center justify-content-between">
				<h1>Identities</h1>
				<div class="box d-flex align-items-center">
					<button class="btn" on:click={handleOpenModal}>
						<Icon type="plus" />
						<span class="ml-1">Create an identity</span>
					</button>
				</div>
				{#if loading}
					<div class="ms-1">
						<Spinner compact />
					</div>
				{/if}
			</div>
			<div class="position-relative">
				<Input
					type="text"
					placeholder="Search for identities..."
					autofocus
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
				<div class="identities-table mt-4">
					<Table responsive rows={$searchResults} let:row>
						<div
							class="data-wrapper"
							on:click={() => {
								handleSelectIdentity(row);
							}}
						>
							<Column header="Identity" width="8rem">
								<IdentityProfile title={row.username} type={row.type} hideType />
							</Column>
							<Column header="Type" width="8rem">
								{row.type}
							</Column>
							<Column header="Date created" width="8rem">
								{row.registrationDate}
							</Column>
							<Column header="Credentials" width="8rem">
								{row.verifiableCredentials?.length ?? 0}
							</Column>
						</div>
					</Table>
				</div>
			{/if}

			{#if message}
				<Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3 }}>
					<div class="mt-4 text-center">
						{message}
					</div>
				</Col>
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

		button {
			top: 50%;
			left: 8px;
			transform: translateY(-50%);
		}
		.table {
			.data-wrapper {
				display: grid;
				grid-template-columns: repeat(4, 0.5fr);
				align-items: center;
				border-bottom: 1px solid #f2f2f2;
				grid-column-gap: 1rem;
				@media (min-width: 990px) {
					grid-template-columns: repeat(4, 1fr);
				}
			}
		}
	}
	.go-back {
		font-weight: 500;
		color: #828282;
	}
	:global(.form-control) {
		padding-left: 50px;
		&:focus {
			border-color: #ced4d9;
			box-shadow: none;
		}
	}

	:global(.identities-table thead, .identities-table tbody, .identities-table th) {
		border-top: 0 !important;
	}
	:global(tfoot) {
		display: none;
	}
	:global(thead) {
		:global(th) {
			font-size: 14px;
		}
	}
	:global(tbody) {
		:global(tr) {
			vertical-align: middle;
			&:hover {
				background-color: rgb(246, 252, 255);
			}
			:global(td) {
				text-transform: capitalize;
				font-size: 14px;
				@media (min-width: 990px) {
					font-size: 16px;
				}
			}
		}
	}
	:global(.table > :not(caption) > * > *) {
		padding: 16px 6px;
	}
</style>
