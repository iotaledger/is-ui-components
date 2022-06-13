<script lang="ts">
    import { BoxColor } from '$lib/app'

    import { UserType } from '@iota/is-client'
    import {
        DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
        DEFAULT_TABLE_CONFIGURATION,
        WELCOME_LIST_RESULTS_NUMBER,
    } from '$lib/app/constants/base'
    import { DEFAULT_IDENTITIES_TEMPLATES, DEFAULT_VCS_TEMPLATES, USER_ICONS } from '$lib/app/constants/identity'
    import { get } from 'svelte/store'
    import {
        addIdentityToSortedSearchResults,
        getIdentityClaim,
        getVerifiableCredentials,
        isAsyncLoadingIdentities,
        searchAllIdentities,
        searchIdentitiesSingleRequest,
        searchIdentitiesResults,
        searchIdentityByDID,
        selectedIdentityPageIndex,
        selectedIdentity,
        stopIdentitiesSearch,
        updateIdentityInSearchResults,
        identitySearchQuery,
        previousAuthenticatedIdentityUserDID,
        creatorFilterState,
    } from '$lib/app/identity'
    import {
        UserRoles,
        type ExtendedUser,
        type IdentityTemplate,
        type VerifiableCredentialTemplate,
    } from '$lib/app/types/identity'
    import type { ActionButton, FilterCheckbox } from '$lib/app/types/layout'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Box, CreateCredentialModal, CreateIdentityModal, Icon, IdentityDetails, ListManager } from '$lib/components'
    import type { IdentityJson } from '@iota/is-client'
    import { onDestroy, onMount } from 'svelte'
    import { authenticatedUserDID, authenticatedUserRole } from '../../app/base'
    import { formatDate } from '$lib/app/utils'

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
            hidden: $authenticatedUserRole !== UserRoles.Admin,
        },
    ]
    $: identityFilter = [
        {
            label: 'Only own identities',
            onChange: onOnlyOwnIdentities,
            // Get the current filter state from store
            state: $creatorFilterState,
        },
    ] as FilterCheckbox[]

    enum State {
        ListIdentities = 'listIdentities',
        IdentityDetail = 'identityDetail',
    }
    let state: State = State.ListIdentities
    let loading: boolean = false
    let message: string
    let isCreateIdentityModalOpen = false
    let isCreateCredentialModalOpen = false

    $: $selectedIdentity, updateState()
    $: state, loadIdentityDetails()
    $: message = $isAsyncLoadingIdentities || loading || $searchIdentitiesResults?.length ? null : 'No identities found'
    $: tableData = {
        headings: ['Identity', 'Type', 'Date Created', 'Credentials'],
        rows: $searchIdentitiesResults.map((identity) => ({
            onClick: () => handleSelectIdentity(identity),
            content: [
                {
                    icon: USER_ICONS[identity.claim?.type]?.icon ?? 'gear',
                    boxColor: USER_ICONS[identity.claim?.type]?.boxColor ?? BoxColor.Purple,
                    value: identity?.username,
                },
                { value: identity?.claim?.type },
                { value: formatDate(identity?.registrationDate) },
                { value: identity?.numberOfCredentials ?? 0 },
            ],
        })),
    } as TableData

    onMount(() => {
        const results = get(searchIdentitiesResults)
        // Fetch data if cached data is empty or user has changed
        if (!results || results?.length === 0 || userChanged()) {
            searchAllIdentities('', getSearchOptions(true))
            // Used for determining if user has changed from previous onMount() call
            previousAuthenticatedIdentityUserDID.set(get(authenticatedUserDID))
        }
    })

    onDestroy(() => {
        stopIdentitiesSearch()
    })

    async function onSearch(): Promise<void> {
        selectedIdentityPageIndex.set(1) // reset index
        await searchAllIdentities(get(identitySearchQuery), getSearchOptions())
    }

    function getSearchOptions(firstLoad = false): { limit: number; creator: string } {
        const creator = get(creatorFilterState) ? get(authenticatedUserDID) : undefined
        const limit = firstLoad ? WELCOME_LIST_RESULTS_NUMBER : DEFAULT_SDK_CLIENT_REQUEST_LIMIT
        return { limit, creator }
    }

    /**
     * Check if the cached userDID (set in onMount()) is the same as the current userDID
     */
    function userChanged(): boolean {
        return get(previousAuthenticatedIdentityUserDID) !== get(authenticatedUserDID)
    }

    function onPageChange(page: number) {
        selectedIdentityPageIndex.set(page)
    }

    async function loadMore(entries: number): Promise<void> {
        const _isType = (q: string): boolean =>
            Object.values(UserType).some((userType) => userType?.toLowerCase() === q?.toLowerCase())

        const newIdentities = await searchIdentitiesSingleRequest(get(identitySearchQuery), {
            searchByType: _isType(get(identitySearchQuery)),
            searchByUsername: !_isType(get(identitySearchQuery)),
            limit: DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
            index: Math.ceil(entries / DEFAULT_SDK_CLIENT_REQUEST_LIMIT),
        })
        searchIdentitiesResults.update((results) => [...results, ...newIdentities])
    }

    async function updateState(): Promise<void> {
        if ($selectedIdentity) {
            state = State.IdentityDetail
        } else {
            state = State.ListIdentities
        }
    }

    async function loadIdentityDetails(): Promise<void> {
        if (state === State.IdentityDetail) {
            loading = true
            const vc = await getVerifiableCredentials($selectedIdentity?.id)
            const claim = (await getIdentityClaim($selectedIdentity?.id)) as {}
            selectedIdentity.update((identity) => ({
                ...identity,
                vc,
                claim: { ...claim, type: $selectedIdentity?.claim?.type },
            }))
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
        if (get(identitySearchQuery)?.length) {
            await onSearch()
        } else {
            // Add the identity to the search results directly, no need to search again
            await addIdentityToSortedSearchResults(identity?.doc?.id)
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

    function onOnlyOwnIdentities(): void {
        // Toggle authorFilterState
        creatorFilterState.set(!get(creatorFilterState))
        onSearch()
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
            {loadMore}
            {tableData}
            {message}
            {tableConfiguration}
            selectedPageIndex={$selectedIdentityPageIndex}
            {onPageChange}
            title="Identities"
            searchPlaceholder="Search identities"
            loading={loading || $isAsyncLoadingIdentities}
            actionButtons={listViewButtons}
            filters={identityFilter}
            bind:searchQuery={$identitySearchQuery}
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
