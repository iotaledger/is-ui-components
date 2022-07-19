<script lang="ts">
    import { BoxColor, type ExtendedUser, type IdentityTemplate } from '$lib/app'
    import { UserType } from '@iota/is-client'
    import { DEFAULT_SDK_CLIENT_REQUEST_LIMIT, DEFAULT_TABLE_CONFIGURATION } from '$lib/app/constants/base'
    import { DEFAULT_IDENTITIES_TEMPLATES, USER_ICONS } from '$lib/app/constants/identity'
    import { get } from 'svelte/store'
    import {
        addIdentityToSortedSearchResults,
        isAsyncLoadingIdentities,
        searchAllIdentities,
        searchIdentitiesSingleRequest,
        searchIdentitiesResults,
        selectedIdentityPageIndex,
        selectedIdentity,
        stopIdentitiesSearch,
        identitySearchQuery,
        creatorFilterState,
        getIdentitySearchOptions,
        onIdentitySearch,
        loadingIdentity,
    } from '$lib/app/identity'
    import type { ActionButton, FilterCheckbox } from '$lib/app/types/layout'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Box, CreateIdentityModal, ListManager } from '$lib/components'
    import type { IdentityJson } from '@iota/is-client'
    import { onDestroy, onMount } from 'svelte'
    import { formatDate } from '$lib/app/utils'
    import { goto } from '$app/navigation'

    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES
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
    $: identityFilter = [
        {
            label: 'Show own identities',
            onChange: onOnlyOwnIdentities,
            // Get the current filter state from store
            state: $creatorFilterState,
        },
    ] as FilterCheckbox[]

    let message: string
    let isCreateIdentityModalOpen = false
    let isNewIdentityCreated = false

    $: message = $isAsyncLoadingIdentities || $loadingIdentity || $searchIdentitiesResults?.length ? null : 'No identities found'
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
        // Fetch data if cached data is empty
        if (!results || results?.length === 0) {
            searchAllIdentities('', getIdentitySearchOptions(true))
        }
    })

    onDestroy(() => {
        stopIdentitiesSearch()
    })

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

    function handleSelectIdentity(identity: ExtendedUser): void {
        selectedIdentity.set(identity)
        goto(`/identity-manager/${$selectedIdentity.id}`)
    }

    // Add the newly created identity to the search results
    async function onCreateIdentitySuccess(identity: IdentityJson): Promise<void> {
        loadingIdentity.set(true)
        // If query is not empty, we need to search again to get the match results
        if (get(identitySearchQuery)?.length) {
            await onIdentitySearch()
        } else {
            // Add the identity to the search results directly, no need to search again
            await addIdentityToSortedSearchResults(identity?.doc?.id)
        }
        loadingIdentity.set(false)
    }

    function onOnlyOwnIdentities(): void {
        // Toggle authorFilterState
        creatorFilterState.set(!get(creatorFilterState))
        onIdentitySearch()
    }

    function openCreateIdentityModal(): void {
        isCreateIdentityModalOpen = true
    }

    function closeCreateIdentityModal(): void {
        isCreateIdentityModalOpen = false
        isNewIdentityCreated = false
    }
</script>

<Box>
    <ListManager
        {showSearch}
        onSearch={onIdentitySearch}
        {loadMore}
        {tableData}
        {message}
        {tableConfiguration}
        selectedPageIndex={$selectedIdentityPageIndex}
        {onPageChange}
        title="Identities"
        searchPlaceholder="Search identities"
        loading={$loadingIdentity || $isAsyncLoadingIdentities}
        actionButtons={listViewButtons}
        filters={identityFilter}
        bind:searchQuery={$identitySearchQuery}
    />
</Box>
<CreateIdentityModal
    isOpen={isCreateIdentityModalOpen}
    onModalClose={closeCreateIdentityModal}
    onSuccess={onCreateIdentitySuccess}
    {identitiesTemplate}
    bind:isCreated={isNewIdentityCreated}
/>
