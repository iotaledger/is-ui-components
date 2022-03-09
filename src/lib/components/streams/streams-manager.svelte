<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import { addChannelToSearchResults, searchChannels, searchResults, stopSearch } from '$lib/app/streams'
    import type { ExtendedChannelInfo } from '$lib/app/types/streams'
    import { Box, CreateChannel, Icon, ToastContainer } from '$lib/components'
    import { onDestroy, onMount } from 'svelte'
    import { Badge, Button, ListGroup, ListGroupItem, Spinner } from 'sveltestrap'
    // We have to import Input this way, otherwise it shouts SSR issues.
    import Input from 'sveltestrap/src/Input.svelte'
    import Paginator from '../paginator.svelte'
    import ChannelDetails from './channel-details.svelte'

    let loading = false
    let query: string = ''
    let isCreateChannelOpen = false

    $: message = loading || $searchResults?.length ? null : 'No channels found'

    enum State {
        ListChannels = 'listChannels',
        ChannelDetail = 'channelDetail',
    }

    let state: State = State.ListChannels
    let selectedChannel
    let results = []

    const MAX_CHANNELS_PER_PAGE = 4
    const WELCOME_CHANNELS_NUMBER = 3

    // Pagination
    let currentPage = 1
    let startAt = 0
    let endAt = MAX_CHANNELS_PER_PAGE

    $: selectedChannel, updateState()

    function updateState(): void {
        if (selectedChannel) {
            state = State.ChannelDetail
        } else {
            state = State.ListChannels
        }
    }

    onMount(async () => {
        loading = true
        await searchChannels('', { maxResults: WELCOME_CHANNELS_NUMBER })
        loading = false
    })

    onDestroy(() => {
        stopSearch()
    })

    async function onSearch(resetPage = false) {
        if (resetPage) {
            currentPage = 1
        }
        loading = true
        $searchResults = [] // Reset search results
        await searchChannels(query)
        loading = false
    }

    $: $searchResults, currentPage, updateResults()

    function updateResults() {
        startAt = (currentPage - 1) * MAX_CHANNELS_PER_PAGE
        endAt = startAt + MAX_CHANNELS_PER_PAGE
        results = $searchResults?.slice(startAt, endAt)
    }

    const handleBackClick = () => {
        selectedChannel = undefined
    }

    function handleSelectChannel(channel: ExtendedChannelInfo) {
        selectedChannel = channel
    }

    function handleCloseModal() {
        isCreateChannelOpen = false
    }

    function handleOpenModal() {
        isCreateChannelOpen = true
    }

    // Add the newly created channel to the search results
    async function onCreateChannelSuccess(channelAddress: string) {
        loading = true
        // If query is not empty, we need to search again to get the match results
        if (query?.length) {
            await onSearch(true)
        } else {
            // Adding the channel, improve performance by not searching again
            await addChannelToSearchResults(channelAddress)
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
    {#if state === State.ListChannels}
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
                <div class="d-flex align-items-center" on:mouseenter={switchIconColor} on:mouseleave={switchIconColor}>
                    <Button size="sm" outline color="dark" on:click={handleOpenModal} class="d-flex align-items-center">
                        <Icon type="plus" color={iconColor} size={16} />
                        <span class="ms-1">Create a channel</span>
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
                            <div class="item">Channel</div>
                            <div class="item">Address</div>
                            <div class="item">Topic Types</div>
                            <div class="item">Topic sources</div>
                            <div class="item" />
                        </div>
                    </ListGroupItem>
                    {#each results as channel}
                        <ListGroupItem
                            tag="button"
                            action
                            class="border-bottom"
                            on:click={() => {
                                handleSelectChannel(channel)
                            }}
                        >
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="item d-flex align-items-center">
                                    <Icon type="broadcast" boxed boxColor={BoxColor.Blue} />

                                    <div class="d-flex flex-column align-items-start">
                                        <!-- TODO: remove this when library is updated and returns channel name -->
                                        <div class="ms-2 channel">Channel name</div>
                                        <div class="ms-2 channel description fw-light">Channel description</div>
                                    </div>
                                </div>

                                <div class="item">{channel.channelAddress}</div>
                                <div class="item">
                                    {#each channel.topics as { type }}
                                        <div>{type}</div>
                                    {/each}
                                </div>
                                <div class="item">
                                    {#each channel.topics as { source }}
                                        <div>{source}</div>
                                    {/each}
                                </div>
                                <!-- Temporary solution to display if a user is owner / subscriber of a channel -->
                                <div class="item">
                                    {#if channel?.isOwner}
                                        <Badge class="ms-2" color="info">Owner</Badge>
                                    {/if}
                                    {#if channel?.isSubscriber}
                                        <Badge class="ms-2" color="success">Subscriber</Badge>
                                    {/if}
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
        {#if $searchResults?.length}
            <div class="d-flex align-items-center mt-3">
                <Paginator
                    onPageChange={async (page) => {
                        currentPage = page
                    }}
                    totalCount={$searchResults?.length}
                    pageSize={MAX_CHANNELS_PER_PAGE}
                    {currentPage}
                    siblingsCount={1}
                />
                <!-- {#if $isLoadingIdentities}
                <div class="me-4">
                    <Spinner type="grow" color="secondary" size="sm" />
                </div>
            {/if} -->
            </div>
        {/if}
    {/if}
    {#if state === State.ChannelDetail}
        <div class="mb-4 align-self-start">
            <button on:click={handleBackClick} class="btn d-flex align-items-center">
                <Icon type="arrow-left" size={16} />
                <span class="ms-2">Back</span>
            </button>
        </div>
        <ChannelDetails
            isOwner={selectedChannel.isOwner}
            address={selectedChannel.channelAddress}
            topics={selectedChannel.topics}
            name="Channel name"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium massa in odio
			pellentesque dapibus. Nunc a augue nunc. Morbi fermentum pellentesque quam, nec vulputate
			neque viverra ornare. Etiam efficitur purus vel finibus consequat. Nunc tincidunt pretium mi,
			vel ornare leo vestibulum a. Pellentesque habitant morbi tristique senectus et netus et
			malesuada fames ac turpis egestas."
        />
    {/if}

    <CreateChannel isOpen={isCreateChannelOpen} onModalClose={handleCloseModal} onSuccess={onCreateChannelSuccess} />
</Box>
<ToastContainer />

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
            .channel {
                text-overflow: ellipsis;
                overflow: hidden !important;
                white-space: nowrap;
                width: 50px;
                @media (min-width: 990px) {
                    width: 80px;
                }
                @media (min-width: 1200px) {
                    width: 120px;
                }
                &.description {
                    font-size: 14px;
                }
            }
        }
    }
</style>
