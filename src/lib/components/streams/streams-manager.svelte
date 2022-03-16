<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import { MAX_CHANNELS_PER_PAGE, WELCOME_CHANNELS_NUMBER } from '$lib/app/constants/streams'
    import {
        addChannelToSearchResults,
        isAsyncLoadingChannels,
        searchChannels,
        searchChannelsResults,
        stopChannelsSearch,
    } from '$lib/app/streams'
    import type { ExtendedChannelInfo } from '$lib/app/types/streams'
    import type { TableData } from '$lib/app/types/table'
    import { Box, CreateChannelModal, Icon, SearchInput, Table } from '$lib/components'
    import { onDestroy, onMount } from 'svelte'
    import { Button, Spinner } from 'sveltestrap'
    import ChannelDetails from './channel-details.svelte'

    enum State {
        ListChannels = 'listChannels',
        ChannelDetail = 'channelDetail',
    }

    let loading: boolean = false
    let query: string = ''
    let isCreateChannelOpen: boolean = false
    let state: State = State.ListChannels
    let selectedChannel: ExtendedChannelInfo

    $: message = $isAsyncLoadingChannels || loading || $searchChannelsResults?.length ? null : 'No channels found'
    $: selectedChannel, updateState()
    $: tableData = {
        headings: ['Channel', 'Address', 'Topic types', 'Topic Sources', ''],
        rows: $searchChannelsResults.map((channel) => ({
            onClick: () => handleSelectChannel(channel),
            content: [
                {
                    icon: 'broadcast',
                    boxColor: BoxColor.Blue,
                    // Change this to real channel name when SDK is ready
                    value: ['Channel name', 'Channel description'],
                },
                { value: channel.channelAddress },
                { value: channel.topics.map((topic) => topic?.type) },
                { value: channel.topics.map((topic) => topic?.source) },
                {
                    pills:
                        channel.isOwned || channel.isSubscribed
                            ? [
                                  {
                                      color: channel.isOwned ? 'success' : 'info',
                                      text: channel.isOwned ? 'Owner' : 'Subscriber',
                                  },
                              ]
                            : undefined,
                },
            ],
        })),
    } as TableData

    onMount(async () => {
        loading = true
        await searchChannels('', { limit: WELCOME_CHANNELS_NUMBER })
        loading = false
    })

    onDestroy(() => {
        stopChannelsSearch()
    })

    async function onSearch(): Promise<void> {
        loading = true
        await searchChannels(query)
        loading = false
    }
    function updateState(): void {
        if (selectedChannel) {
            state = State.ChannelDetail
        } else {
            state = State.ListChannels
        }
    }

    function handleSelectChannel(channel: ExtendedChannelInfo): void {
        selectedChannel = channel
    }

    function handleBackClick(): void {
        selectedChannel = undefined
    }

    function handleOpenModal(): void {
        isCreateChannelOpen = true
    }
    function handleCloseModal(): void {
        isCreateChannelOpen = false
    }

    // Add the newly created channel to the search results
    async function onCreateChannelSuccess(channelAddress: string): Promise<void> {
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
</script>

<Box>
    {#if state === State.ListChannels}
        <div class="streams-manager w-100 h-100 d-flex flex-column">
            <div class="mb-4 d-flex flex-row align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <h1>Channels</h1>
                    {#if loading || $isAsyncLoadingChannels}
                        <div class="ms-4">
                            <Spinner type="border" color="secondary" size="sm" />
                        </div>
                    {/if}
                </div>
                <div class="d-flex align-items-center">
                    <Button size="sm" outline color="dark" on:click={handleOpenModal} class="d-flex align-items-center">
                        <Icon type="plus" size={16} />
                        <span class="ms-1">Create a channel</span>
                    </Button>
                </div>
            </div>
            <div class="mb-4">
                <SearchInput placeholder="Search for channels" bind:value={query} onSubmit={onSearch} />
            </div>
            {#if $searchChannelsResults?.length}
                <Table
                    data={tableData}
                    isPaginated={true}
                    pageSize={MAX_CHANNELS_PER_PAGE}
                    loading={loading || $isAsyncLoadingChannels}
                    siblingsCount={2}
                />
            {:else if message}
                <div class="text-center">
                    {message}
                </div>
            {/if}
        </div>
    {:else if state === State.ChannelDetail}
        <div class="mb-4 align-self-start">
            <button on:click={handleBackClick} class="btn d-flex align-items-center">
                <Icon type="arrow-left" size={16} />
                <span class="ms-2">Back</span>
            </button>
        </div>
        <ChannelDetails channel={selectedChannel} />
    {/if}
    <CreateChannelModal isOpen={isCreateChannelOpen} onModalClose={handleCloseModal} onSuccess={onCreateChannelSuccess} />
</Box>
