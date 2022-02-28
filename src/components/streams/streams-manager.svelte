<script lang="ts">
    import { onMount } from 'svelte'
    import { Badge, Button, Input, ListGroup, ListGroupItem, Spinner } from 'sveltestrap'
    import { Box, ChannelDetails, CreateChannel, Icon } from './../../components'
    import { BoxColor } from './../../lib/constants/colors'
    import { addChannelToSearchResults, searchChannels, searchResults } from './../../lib/streams'
    import type { ExtendedChannelInfo } from './../../lib/types/streams'

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

    $: selectedChannel, updateState()

    function updateState(): void {
        if (selectedChannel) {
            state = State.ChannelDetail
        } else {
            state = State.ListChannels
        }
    }

    onMount(async () => {
        // Pre-load the first 100 identities
        loading = true
        $searchResults = await searchChannels('', true)
        loading = false
    })

    async function onSearch() {
        loading = true
        $searchResults = await searchChannels(query)
        loading = false
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
            await onSearch()
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
                    <Button size="sm" outline color="dark" on:click={handleOpenModal}>
                        <Icon type="plus" color={iconColor} />
                        <span class="ml-1">Create a channel</span>
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
                        if (e.key === 'Enter') onSearch()
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
                            <div class="item">Channel</div>
                            <div class="item">Address</div>
                            <div class="item">Topic Types</div>
                            <div class="item">Topic sources</div>
                            <div class="item" />
                        </div>
                    </ListGroupItem>
                    {#each $searchResults as channel}
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
                                    <Icon type="channel" boxed boxColor={BoxColor.Blue} size={24} />

                                    <div class="d-flex flex-column align-items-start">
                                        <!-- TODO: remove this when library is updated and returns channel name -->
                                        <span class="ms-2 text-truncate">Channel name</span>
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
    {/if}
    {#if state === State.ChannelDetail}
        <div class="mb-4 align-self-start">
            <button on:click={handleBackClick} class="go-back btn d-flex align-items-center">
                <Icon type="arrow-left" />
                <span class="ms-2">Back</span>
            </button>
        </div>
        <ChannelDetails
            isOwner={selectedChannel.isOwner}
            address={selectedChannel.channelAddress}
            topics={selectedChannel.topics}
            name="Channel name"
        />
    {/if}

    <CreateChannel isOpen={isCreateChannelOpen} onModalClose={handleCloseModal} onSuccess={onCreateChannelSuccess} />
</Box>

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
        }
    }
</style>
