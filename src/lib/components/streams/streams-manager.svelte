<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import { MAX_CHANNELS_PER_PAGE, WELCOME_CHANNELS_NUMBER } from '$lib/app/constants/streams'
    import { addChannelToSearchResults, isLoadingChannels, searchChannels, searchResults, stopSearch } from '$lib/app/streams'
    import type { ExtendedChannelInfo } from '$lib/app/types/streams'
    import type { TableData } from '$lib/app/types/table'
    import { Box, CreateChannel, Icon, Table } from '$lib/components'
    import { onDestroy, onMount } from 'svelte'
    import { Button, Spinner } from 'sveltestrap'
    // We have to import Input this way, otherwise it shouts SSR issues.
    import Input from 'sveltestrap/src/Input.svelte'
    import ChannelDetails from './channel-details.svelte'

    enum State {
        ListChannels = 'listChannels',
        ChannelDetail = 'channelDetail',
    }

    let loading = false
    let query: string = ''
    let isCreateChannelOpen = false
    let state: State = State.ListChannels
    let selectedChannel

    $: message = loading || $searchResults?.length ? null : 'No channels found'
    $: selectedChannel, updateState()

    onMount(async () => {
        loading = true
        await searchChannels('', { limit: WELCOME_CHANNELS_NUMBER })
        loading = false
    })

    onDestroy(() => {
        stopSearch()
    })

    async function onSearch() {
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

    function handleSelectChannel(channel: ExtendedChannelInfo) {
        selectedChannel = channel
    }

    const handleBackClick = () => {
        selectedChannel = undefined
    }

    function handleOpenModal() {
        isCreateChannelOpen = true
    }
    function handleCloseModal() {
        isCreateChannelOpen = false
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

    $: tableData = {
        headings: ['Channel', 'Address', 'Topic types', 'Topic Sources', ''],
        rows: $searchResults.map((channel) => ({
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
                        if (e.key === 'Enter') onSearch()
                    }}
                />
                <button class="border-0 bg-transparent position-absolute" on:click={() => onSearch()}>
                    <Icon type="search" size={16} />
                </button>
            </div>
            {#if $searchResults?.length}
                <Table
                    data={tableData}
                    isPaginated={true}
                    pageSize={MAX_CHANNELS_PER_PAGE}
                    isLoading={$isLoadingChannels}
                    siblingsCount={2}
                />
            {:else if message && !$isLoadingChannels}
                <div class="text-center">
                    {message}
                </div>
            {/if}
        </div>
    {/if}
    {#if state === State.ChannelDetail}
        <div class="mb-4 align-self-start">
            <button on:click={handleBackClick} class="btn d-flex align-items-center">
                <Icon type="arrow-left" size={16} />
                <span class="ms-2">Back</span>
            </button>
        </div>
        <ChannelDetails
            isOwned={selectedChannel.isOwned}
            address={selectedChannel.channelAddress}
            topics={selectedChannel.topics}
            subscribers={selectedChannel.subscriberIds}
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
