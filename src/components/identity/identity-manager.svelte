<script lang="ts">
	import { IdentityProfile, Spinner } from '$components';
	import { Search as SearchIcon } from '$icons';
	import { searchIdentities } from '$lib/identity';
	import type { User, UserType } from 'iota-is-sdk';
	import { onMount } from 'svelte';
	import { Column, Input, Table, Col } from 'sveltestrap';

	enum State {
		ListIdentities = 'listIdentities',
		IdentityDetail = 'identityDetail'
	}

	let state: State = State.ListIdentities;
	let loading = false;
	let query: string = '';
	let searchResult: (User & { type?: UserType; vc?: number })[] = [];
	let message: string;

	onMount(async () => {
		// Pre-load the first 100 identities
		searchResult = await searchIdentities('');
	});

	async function onSearch() {
		loading = true;
		searchResult = await searchIdentities(query);
		if (searchResult?.length) {
			message = undefined;
		} else {
			message = 'No identities found';
		}
		loading = false;
	}
</script>

{#if state === State.ListIdentities}
	<div class="identity-manager p-4 w-100 h-100 d-flex flex-column">
		<div class="mb-4 d-flex flex-row align-items-center">
			<h1>Identities</h1>
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
				<SearchIcon />
			</button>
		</div>
		{#if searchResult?.length}
			<div class="identities-table mt-4">
				<Table responsive rows={searchResult} let:row>
					<Column header="Identity" width="4rem">
						<IdentityProfile username={row.username} type={row.type} />
					</Column>
					<Column header="Type" width="4rem">
						{row.type}
					</Column>
					<Column header="Date created" width="4rem">
						{row.registrationDate}
					</Column>
					<Column header="Credentials" width="3rem">
						{row.vc ?? 0}
					</Column>
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

<style lang="scss">
	.identity-manager {
		min-height: 460px;

		button {
			top: 50%;
			left: 8px;
			transform: translateY(-50%);
		}
		:global(.form-control) {
			padding-left: 50px;
			&:focus {
				border-color: #ced4d9;
				box-shadow: none;
			}
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
