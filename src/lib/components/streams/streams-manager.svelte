<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import { DEFAULT_SDK_CLIENT_REQUEST_LIMIT, DEFAULT_TABLE_CONFIGURATION } from '$lib/app/constants/base'
    import { BoxColor } from '$lib/app/constants/colors'
    import {
        addChannelToSearchResults,
        isAsyncLoadingChannels,
        isUserOwnerOfChannel,
        isUserSubscribedToChannel,
        searchAllChannels,
        searchChannelsSingleRequest,
        searchChannelsResults,
        selectedChannel,
        selectedChannelPageIndex,
        stopChannelsSearch,
        channelSearchQuery,
        authorFilterState,
        hasUserRequestedSubscriptionToChannel,
        loadingChannel,
        onChannelSearch,
        getChannelSearchOptions,
    } from '$lib/app/streams'
    import { get } from 'svelte/store'
    import type { ActionButton, FilterCheckbox } from '$lib/app/types/layout'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Box, CreateChannelModal, ListManager } from '$lib/components'
    import type { ChannelInfo } from '@iota/is-client'
    import { onDestroy, onMount } from 'svelte'
    import { formatDateAndTime } from '$lib/app/utils'
    import type { Reset } from '$lib/app/types/stores'
    import { goto } from '$app/navigation'

    export let showSearch: boolean = true
    export let listViewButtons: ActionButton[] = [
        {
            label: 'Create a channel',
            onClick: openCreateChannelModal,
            icon: 'plus',
            color: 'dark',
        },
    ]

    $: filters = [
        {
            label: 'Show related channels',
            onChange: () => setFilterState(authorFilterState),
            state: $authorFilterState,
        },
    ] as FilterCheckbox[]

    export let tableConfiguration: TableConfiguration = DEFAULT_TABLE_CONFIGURATION
    let isCreateChannelModalOpen: boolean = false

    function onPageChange(page: number) {
        selectedChannelPageIndex.set(page)
    }

    $: message = $isAsyncLoadingChannels || $loadingChannel || $searchChannelsResults?.length ? null : 'No channels found'
    $: tableData = {
        headings: ['Channel', 'Address', 'Topic types', 'Topic Sources', 'Date Created', ''],
        rows: $searchChannelsResults.map((channel) => {
            const isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)
            const isUserSubscribed = isUserSubscribedToChannel($authenticatedUserDID, channel)
            const hasUserRequestedSubscription = hasUserRequestedSubscriptionToChannel($authenticatedUserDID, channel)
            return {
                onClick: () => handleSelectChannel(channel),
                content: [
                    {
                        icon: 'broadcast',
                        boxColor: BoxColor.Blue,
                        value: [channel.name || '-', channel.description || '-'],
                    },
                    { value: channel.channelAddress },
                    { value: channel.topics.map((topic) => topic?.type) },
                    { value: channel.topics.map((topic) => topic?.source) },
                    {
                        value: formatDateAndTime(channel.created),
                    },
                    {
                        pills:
                            isUserOwner || isUserSubscribed
                                ? [
                                      {
                                          color: isUserOwner ? 'success' : 'info',
                                          text: isUserOwner ? 'Owner' : 'Subscriber',
                                      },
                                  ]
                                : [
                                      {
                                          color: hasUserRequestedSubscription ? 'secondary' : '',
                                          text: hasUserRequestedSubscription ? 'Requested' : '',
                                      },
                                  ],
                    },
                ],
            }
        }),
    } as TableData

    onMount(async () => {
        const results = get(searchChannelsResults)
        // Fetch data if cached data is empty
        if (!results || results?.length === 0) {
            await searchAllChannels('', getChannelSearchOptions(true))
        }
    })

    onDestroy(() => {
        stopChannelsSearch()
    })

    async function loadMore(entries: number): Promise<void> {
        const _isAuthorId = (q: string): boolean => q?.startsWith('did:iota:')

        const newChannels = await searchChannelsSingleRequest(
            get(channelSearchQuery),
            _isAuthorId(get(channelSearchQuery)),
            !_isAuthorId(get(channelSearchQuery)),
            {
                limit: DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
                index: Math.ceil(entries / DEFAULT_SDK_CLIENT_REQUEST_LIMIT),
            }
        )
        searchChannelsResults.update((results) => [...results, ...newChannels])
    }

    async function handleSelectChannel(channel: ChannelInfo): Promise<void> {
        selectedChannel.set(channel)
        goto(`streams-manager/${channel?.channelAddress}`)
    }

    // Add the newly created channel to the search results
    async function onCreateChannelSuccess(channelAddress: string): Promise<void> {
        loadingChannel.set(true)
        // If query is not empty, we need to search again to get the match results
        if (get(channelSearchQuery)?.length) {
            onChannelSearch()
        } else {
            // Add the channel to the search results directly, no need to search again
            await addChannelToSearchResults(channelAddress)
        }
        loadingChannel.set(false)
    }

    function setFilterState(state: Reset<any>): void {
        // Toggle authorFilterState, subscribedFilterState, requestedSubscriptionFilterState
        state.set(!get(state))
        onChannelSearch()
    }

    function openCreateChannelModal(): void {
        isCreateChannelModalOpen = true
    }
    function closeCreateChannelModal(): void {
        isCreateChannelModalOpen = false
    }
</script>

<Box>
    <ListManager
        {showSearch}
        onSearch={onChannelSearch}
        {tableData}
        {message}
        {tableConfiguration}
        title="Channels"
        searchPlaceholder="Search channels"
        selectedPageIndex={$selectedChannelPageIndex}
        {onPageChange}
        {loadMore}
        loading={$loadingChannel || $isAsyncLoadingChannels}
        actionButtons={listViewButtons}
        {filters}
        bind:searchQuery={$channelSearchQuery}
    />
</Box>

<CreateChannelModal isOpen={isCreateChannelModalOpen} onModalClose={closeCreateChannelModal} onSuccess={onCreateChannelSuccess} />
