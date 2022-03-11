<script lang="ts">
    import { MAX_IDENTITIES_PER_PAGE, USER_ICONS, WELCOME_IDENTITIES_NUMBER } from '$lib/app/constants/identity'
    import {
        addIdentityToSearchResults,
        isLoadingIdentities,
        searchIdentities,
        searchIdentitiesResults,
        selectedIdentity,
        stopIdentitiesSearch,
        updateSelectedIdentity,
    } from '$lib/app/identity'
    import type { ExtendedUser } from '$lib/app/types/identity'
    import type { TableData } from '$lib/app/types/table'
    import { Box, CreateIdentity, Icon, IdentityDetails, Table } from '$lib/components'
    import { onDestroy, onMount } from 'svelte'
    import { Button, Spinner } from 'sveltestrap'
    // We have to import Input this way, otherwise it shouts SSR issues.
    import Input from 'sveltestrap/src/Input.svelte'

    enum State {
        ListIdentities = 'listIdentities',
        IdentityDetail = 'identityDetail',
    }

    let state: State = State.ListIdentities
    let loading = false
    let query: string = ''
    let message: string
    let isCreateIdentityOpen = false

    $: $selectedIdentity, updateState()
    $: message = loading || $searchIdentitiesResults?.length ? null : 'No identities found'

    onMount(async () => {
        loading = true
        await searchIdentities('', { limit: WELCOME_IDENTITIES_NUMBER })
        loading = false
    })

    onDestroy(() => {
        stopIdentitiesSearch()
    })

    async function onSearch() {
        loading = true
        await searchIdentities(query)
        loading = false
    }

    function updateState(): void {
        if ($selectedIdentity) {
            state = State.IdentityDetail
        } else {
            state = State.ListIdentities
        }
    }

    const handleBackClick = () => {
        $selectedIdentity = undefined
    }

    function handleSelectIdentity(identity: ExtendedUser) {
        updateSelectedIdentity(identity)
    }

    function handleCloseModal() {
        isCreateIdentityOpen = false
    }

    function handleOpenModal() {
        isCreateIdentityOpen = true
    }

    // Add the newly created identity to the search results
    async function onCreateIdentitySuccess(id: string) {
        loading = true
        // If query is not empty, we need to search again to get the match results
        if (query?.length) {
            await onSearch()
        } else {
            // Adding the identity, improve performance by not searching again
            await addIdentityToSearchResults(id)
        }
        loading = false
    }

    // TODO: improve this. It is used to change the icon color when button is hovered.
    let iconColor = '#333333'
    const switchIconColor = () => {
        iconColor = iconColor === '#333333' ? 'white' : '#333333'
    }
    // ---------------------------------------------------------------------------------------------

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
                { value: identity.claim?.type },
                { value: identity.registrationDate },
                { value: identity?.numberOfCredentials ?? 0 },
            ],
        })),
    } as TableData
</script>

<Box>
    {#if state === State.ListIdentities}
        <div class="identity-manager w-100 h-100 d-flex flex-column">
            <div class="mb-4 d-flex flex-row align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <h1>Identities</h1>
                    {#if loading}
                        <div class="ms-4">
                            <Spinner type="border" color="secondary" size="sm" />
                        </div>
                    {/if}
                </div>
                <div class="box d-flex align-items-center" on:mouseenter={switchIconColor} on:mouseleave={switchIconColor}>
                    <Button size="sm" outline color="dark" on:click={handleOpenModal} class="d-flex align-items-center">
                        <Icon type="plus" color={iconColor} size={16} />
                        <span class="ms-1">Create an identity</span>
                    </Button>
                </div>
            </div>
            <div class="search mb-4 position-relative">
                <Input
                    type="text"
                    placeholder="Search for identities..."
                    autofocus
                    class="position-relative ps-5"
                    bind:value={query}
                    on:keypress={(e) => {
                        if (e.key === 'Enter') onSearch()
                    }}
                />
                <button class="border-0 bg-transparent position-absolute" on:click={() => onSearch()}>
                    <Icon type="search" size={16} />
                </button>
            </div>
            {#if $searchIdentitiesResults?.length}
                <Table
                    data={tableData}
                    isPaginated={true}
                    isLoading={$isLoadingIdentities}
                    siblingsCount={2}
                    pageSize={MAX_IDENTITIES_PER_PAGE}
                />
            {:else if message && !$isLoadingIdentities}
                <div class="text-center">
                    {message}
                </div>
            {/if}
        </div>
    {/if}
    {#if state === State.IdentityDetail}
        <div class="mb-4 align-self-start">
            <button on:click={handleBackClick} class="btn d-flex align-items-center">
                <Icon type="arrow-left" size={16} />
                <span class="ms-2">Back</span>
            </button>
        </div>

        <IdentityDetails identity={$selectedIdentity} />
    {/if}
    <CreateIdentity isOpen={isCreateIdentityOpen} onModalClose={handleCloseModal} onSuccess={onCreateIdentitySuccess} />
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
        .claim {
            font-size: 12px;
        }
    }
</style>
