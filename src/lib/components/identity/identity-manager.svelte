<script lang="ts">
    import { DEFAULT_TABLE_CONFIGURATION, WELCOME_LIST_RESULTS_NUMBER } from '$lib/app/constants/base'
    import { DEFAULT_IDENTITIES_TEMPLATES, DEFAULT_VCS_TEMPLATES, USER_ICONS } from '$lib/app/constants/identity'
    import {
        addIdentityToSearchResults,
        getVerifiableCredentials,
        isAsyncLoadingIdentities,
        searchAllIdentities,
        searchIdentitiesResults,
        searchIdentityByDID,
        selectedIdentity,
        stopIdentitiesSearch,
        updateIdentityInSearchResults,
    } from '$lib/app/identity'
    import type { ExtendedUser, IdentityTemplate, VerifiableCredentialTemplate } from '$lib/app/types/identity'
    import type { ActionButton } from '$lib/app/types/layout'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Box, CreateCredentialModal, CreateIdentityModal, Icon, IdentityDetails, ListManager } from '$lib/components'
    import type { IdentityJson } from 'boxfish-studio--iota-is-sdk'
    import { onDestroy, onMount } from 'svelte'

    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES
    export let credentialsTemplate: VerifiableCredentialTemplate[] = DEFAULT_VCS_TEMPLATES
    export let showSearch: boolean = true
    export let listViewButtons: ActionButton[] = [
        {
            label: 'Create an identity',
            onClick: openCreateIdentityModal,
            icon: 'plus',
            color: 'dark',
        },
    ]
    export let tableConfiguration: TableConfiguration = DEFAULT_TABLE_CONFIGURATION
    export let detailViewButtons: ActionButton[] = [
        {
            label: 'Add credential',
            onClick: openCreateCredentialModal,
            icon: 'plus',
            color: 'dark',
        },
    ]

    enum State {
        ListIdentities = 'listIdentities',
        IdentityDetail = 'identityDetail',
    }

    let state: State = State.ListIdentities
    let loading: boolean = false
    let query: string = ''
    let message: string
    let isCreateIdentityModalOpen = false
    let isCreateCredentialModalOpen = false

    $: $selectedIdentity, updateState()
    $: state, loadVCsOnSelectedIdentity()
    $: message = $isAsyncLoadingIdentities || loading || $searchIdentitiesResults?.length ? null : 'No identities found'
    $: tableData = {
        headings: ['Identity', 'Type', 'Date created', 'Credentials'],
        rows: $searchIdentitiesResults.map((identity) => ({
            onClick: () => handleSelectIdentity(identity),
            content: [
                {
                    icon: USER_ICONS[identity.claim?.type]?.icon,
                    boxColor: USER_ICONS[identity.claim?.type]?.boxColor,
                    value: identity?.username,
                },
                { value: identity?.claim?.type },
                { value: identity?.registrationDate },
                { value: identity?.numberOfCredentials ?? 0 },
            ],
        })),
    } as TableData

    onMount(async () => {
        searchAllIdentities('', { limit: WELCOME_LIST_RESULTS_NUMBER })
    })

    onDestroy(() => {
        stopIdentitiesSearch()
    })

    async function onSearch(): Promise<void> {
        await searchAllIdentities(query)
    }

    async function updateState(): Promise<void> {
        if ($selectedIdentity) {
            state = State.IdentityDetail
        } else {
            state = State.ListIdentities
        }
    }

    async function loadVCsOnSelectedIdentity(): Promise<void> {
        if (state === State.IdentityDetail) {
            loading = true
            const vc = await getVerifiableCredentials($selectedIdentity?.id)
            selectedIdentity.update((identity) => ({ ...identity, vc }))
            loading = false
        }
    }

    function handleSelectIdentity(identity: ExtendedUser): void {
        selectedIdentity.set(identity)
    }

    function handleBackClick(): void {
        selectedIdentity.set(null)
    }

    // Add the newly created identity to the search results
    async function onCreateIdentitySuccess(identity: IdentityJson): Promise<void> {
        loading = true
        // If query is not empty, we need to search again to get the match results
        if (query?.length) {
            await onSearch()
        } else {
            // Add the identity to the search results directly, no need to search again
            await addIdentityToSearchResults(identity?.doc?.id)
        }
        loading = false
    }

    // Add the newly created credential to the selected identity
    async function onCreateCredentialSuccess(): Promise<void> {
        loading = true
        let identity = await searchIdentityByDID($selectedIdentity?.id)
        identity = { ...identity, numberOfCredentials: identity?.numberOfCredentials ?? 0 }
        if (identity) {
            updateIdentityInSearchResults(identity)
        }
        const vc = await getVerifiableCredentials($selectedIdentity?.id)
        selectedIdentity.update((identity) => ({ ...identity, vc }))
        loading = false
    }

    function openCreateIdentityModal(): void {
        isCreateIdentityModalOpen = true
    }

    function closeCreateIdentityModal(): void {
        isCreateIdentityModalOpen = false
    }

    function openCreateCredentialModal(): void {
        isCreateCredentialModalOpen = true
    }

    function closeCreateCredentialModal(): void {
        isCreateCredentialModalOpen = false
    }
</script>

<Box>
    {#if state === State.ListIdentities}
        <ListManager
            {showSearch}
            {onSearch}
            {tableData}
            {message}
            {tableConfiguration}
            title="Identities"
            searchPlaceholder="Search identities"
            loading={loading || $isAsyncLoadingIdentities}
            actionButtons={listViewButtons}
            bind:searchQuery={query}
        />
    {:else if state === State.IdentityDetail}
        <div class="mb-4 align-self-start">
            <button on:click={handleBackClick} class="btn d-flex align-items-center">
                <Icon type="arrow-left" size={16} />
                <span class="ms-2">Back</span>
            </button>
        </div>
        <IdentityDetails
            {loading}
            actionButtons={detailViewButtons}
            onRevokeSuccess={updateIdentityInSearchResults}
            identity={$selectedIdentity}
        />
    {/if}
</Box>
<CreateIdentityModal
    isOpen={isCreateIdentityModalOpen}
    onModalClose={closeCreateIdentityModal}
    onSuccess={onCreateIdentitySuccess}
    {identitiesTemplate}
/>
<!-- TODO: add possility to not pass targetDid here -->
<CreateCredentialModal
    isOpen={isCreateCredentialModalOpen}
    onModalClose={closeCreateCredentialModal}
    targetDid={$selectedIdentity?.id}
    onSuccess={onCreateCredentialSuccess}
    {credentialsTemplate}
/>