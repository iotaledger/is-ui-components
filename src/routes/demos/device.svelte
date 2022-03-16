<script lang="ts">
    import { USER_ICONS, WELCOME_IDENTITIES_NUMBER } from '$lib/app/constants/identity'
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
    import type { ExtendedUser, IdentityTemplate } from '$lib/app/types/identity'
    import { FieldType } from '$lib/app/types/identity'
    import type { ActionButton } from '$lib/app/types/layout'
    import type { TableData } from '$lib/app/types/table'
    import { CreateCredentialModal, CreateIdentityModal, Icon, IdentityDetails, IdentityList } from '$lib/components'
    import type { IdentityJson } from 'boxfish-studio--iota-is-sdk'
    import { UserType } from 'boxfish-studio--iota-is-sdk'
    import { onDestroy, onMount } from 'svelte'
    import { Container } from 'sveltestrap'

    const SOFTWARE_VERSIONS = ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0']
    const DEVICE_TEMPLATE: IdentityTemplate[] = [
        {
            type: UserType.Device,
            fields: [
                {
                    id: 'username',
                    name: 'username',
                    type: FieldType.String,
                    required: true,
                },
                {
                    id: 'softwareVersion',
                    name: 'Software Version',
                    type: FieldType.Selector,
                    options: SOFTWARE_VERSIONS,
                    required: true,
                },
                {
                    id: 'channel',
                    name: 'Streams Channel',
                    type: FieldType.String,
                    required: true,
                },
            ],
        },
    ]
    const IDENTITY_LIST_BUTTONS: ActionButton[] = [
        {
            label: 'Add device',
            onClick: openCreateDevice,
            icon: 'plus',
            color: 'dark',
        },
        {
            label: 'Create an identity',
            onClick: openCreateIdentityModal,
            icon: 'plus',
            color: 'dark',
        },
    ]
    const IDENTITY_DETAILS_BUTTONS: ActionButton[] = [
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
    let isCreateIdentityOpen = false
    let isCreateCredentialOpen = false
    let isCreateDeviceOpen = false

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
        searchAllIdentities('', { limit: WELCOME_IDENTITIES_NUMBER })
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
        isCreateIdentityOpen = true
    }

    function closeCreateIdentityModal(): void {
        isCreateIdentityOpen = false
    }

    function openCreateCredentialModal(): void {
        isCreateCredentialOpen = true
    }

    function closeCreateCredentialModal(): void {
        isCreateCredentialOpen = false
    }
    function openCreateDevice(): void {
        isCreateDeviceOpen = true
    }
    function closeCreateDevice(): void {
        isCreateDeviceOpen = false
    }
</script>

<Container class="py-5">
    <h1 class="mb-4">Demo 2: Device</h1>
    {#if state === State.ListIdentities}
        <IdentityList
            showSearch
            {onSearch}
            {tableData}
            {message}
            loading={loading || $isAsyncLoadingIdentities}
            actionButtons={IDENTITY_LIST_BUTTONS}
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
            actionButtons={IDENTITY_DETAILS_BUTTONS}
            {loading}
            onRevokeSuccess={updateIdentityInSearchResults}
            identity={$selectedIdentity}
        />
    {/if}
</Container>
<CreateIdentityModal isOpen={isCreateIdentityOpen} onModalClose={closeCreateIdentityModal} onSuccess={onCreateIdentitySuccess} />
<!-- TODO: add possility to not use targetDid here -->
<CreateCredentialModal
    isOpen={isCreateCredentialOpen}
    onModalClose={closeCreateCredentialModal}
    targetDid={$selectedIdentity?.id}
    onSuccess={onCreateCredentialSuccess}
/>
<!-- Custom modal for devices -->
<CreateIdentityModal isOpen={isCreateDeviceOpen} onModalClose={closeCreateDevice} identitiesTemplate={DEVICE_TEMPLATE} />
