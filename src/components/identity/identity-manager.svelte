<script lang="ts">
    import { UserType } from 'iota-is-sdk/src'
    import { onDestroy, onMount } from 'svelte'
    import { Button, ListGroup, ListGroupItem, Spinner } from 'sveltestrap'
    // We have to import Input this way, otherwise it shouts SSR issues.
    import Input from 'sveltestrap/src/Input.svelte'
    import Box from '../login-register/box.svelte'
    import Paginator from '../paginator.svelte'
    import { CreateIdentity, Icon, IdentityDetails, ToastContainer } from './../../components'
    import { BoxColor } from './../../lib/constants/colors'
    import { USER_ICONS } from './../../lib/constants/identity'
    import {
        addIdentityToSearchResults,
        searchIdentities,
        searchResults,
        selectedIdentity,
        updateSelectedIdentity,
        isLoadingIdentities,
        stopSearch,
    } from './../../lib/identity'
    import type { ExtendedUser } from './../../lib/types/identity'

    enum State {
        ListIdentities = 'listIdentities',
        IdentityDetail = 'identityDetail',
    }

    let state: State = State.ListIdentities
    let loading = false
    let query: string = ''
    let message: string
    let isCreateIdentityOpen = false

    const MAX_IDENTITIES_PER_PAGE = 8
    const WELCOME_IDENTITIES_NUMBER = 7

    // Pagination
    let currentPage = 1
    let startAt = 0
    let endAt = MAX_IDENTITIES_PER_PAGE

    $: $selectedIdentity, updateState()

    $: message = loading || $searchResults?.length ? null : 'No identities found'

    let results = []

    $: $searchResults, currentPage, updateResults()

    onMount(async () => {
        loading = true
        $searchResults = await searchIdentities('', { maxResults: WELCOME_IDENTITIES_NUMBER })
        loading = false
    })

    onDestroy(() => {
        stopSearch()
    })

    function updateResults() {
        startAt = (currentPage - 1) * MAX_IDENTITIES_PER_PAGE
        endAt = startAt + MAX_IDENTITIES_PER_PAGE
        results = $searchResults?.slice(startAt, endAt)
    }

    async function onSearch(resetPage = false) {
        if (resetPage) {
            currentPage = 1
        }
        loading = true
        $searchResults = await searchIdentities(query)
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
            await onSearch(true)
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
                        if (e.key === 'Enter') onSearch(true)
                    }}
                />
                <button class="border-0 bg-transparent position-absolute" on:click={() => onSearch(true)}>
                    <Icon type="search" size={16} />
                </button>
            </div>
            {#if results?.length}
                <ListGroup flush>
                    <ListGroupItem>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="item">Identity</div>
                            <div class="item">Type</div>
                            <div class="item">Date created</div>
                            <div class="item">Credentials</div>
                        </div>
                    </ListGroupItem>
                    {#each results as identity}
                        <ListGroupItem
                            tag="button"
                            action
                            class="border-bottom"
                            on:click={() => {
                                handleSelectIdentity(identity)
                            }}
                        >
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="item d-flex align-items-center">
                                    <Icon
                                        type={USER_ICONS[identity.claim?.type]?.icon ?? UserType.Unknown}
                                        boxed
                                        boxColor={USER_ICONS[identity.claim?.type]?.boxColor ?? BoxColor.Blue}
                                        size={24}
                                    />
                                    <span class="ms-3 text-truncate">{identity.username}</span>
                                </div>
                                <div class="item">{identity.claim?.type}</div>
                                <div class="item">{identity.registrationDate}</div>
                                <div class="item">{identity.numberOfCredentials}</div>
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
        {#if $isLoadingIdentities}
            <div class="mt-3">
                <Spinner type="border" color="secondary" size="sm" />
            </div>
        {/if}
        <div class="d-flex align-items-center mt-3">
            <Paginator
                onPageChange={async (page) => {
                    currentPage = page
                }}
                totalCount={$searchResults?.length}
                pageSize={MAX_IDENTITIES_PER_PAGE}
                {currentPage}
                siblingsCount={1}
            />
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
<ToastContainer />

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

        .claim {
            font-size: 12px;
        }
    }
</style>
