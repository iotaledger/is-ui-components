<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import {
        DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
        DEFAULT_TABLE_CONFIGURATION,
        WELCOME_LIST_RESULTS_NUMBER,
    } from '$lib/app/constants/base'
    import { BoxColor } from '$lib/app/constants/colors'
    import {
        addChannelToSearchResults,
        getSubscriptions,
        getSubscriptionStatus,
        isAsyncLoadingChannels,
        isUserOwnerOfChannel,
        isUserSubscribedToChannel,
        requestSubscription,
        requestUnsubscription,
        searchAllChannels,
        searchChannelsSingleRequest,
        searchChannelsResults,
        selectedChannel,
        selectedChannelPageIndex,
        selectedChannelSubscriptions,
        stopChannelsSearch,
        stopReadingChannel,
        channelSearchQuery,
        authorFilterState,
        hasUserRequestedSubscriptionToChannel,
        subscriptionStatus,
        onSubscriptionAction,
        loading,
        onSearch,
        getSearchOptions,
    } from '$lib/app/streams'
    import { get, writable, type Writable } from 'svelte/store'
    import type { ActionButton, FilterCheckbox } from '$lib/app/types/layout'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Box, ChannelDetails, CreateChannelModal, Icon, ListManager, WriteMessageModal } from '$lib/components'
    import type { ChannelInfo } from '@iota/is-client'
    import { onDestroy, onMount } from 'svelte'
    import { formatDateAndTime } from '$lib/app/utils'
    import type { Reset } from '$lib/app/types/stores'
    import { goto } from '$app/navigation'
    import type { SearchOptions } from '$lib/app/types'

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

    enum State {
        ListChannels = 'listChannels',
        ChannelDetail = 'channelDetail',
    }

    let state: State = State.ListChannels

    let isCreateChannelModalOpen: boolean = false
    let isWriteMesageModalOpen: boolean = false

    let subscriptionTimeout: number

    //used to load tabledata when subscribed,revoked or unsubscribed in channel details view and went back to list overview
    let subscriptionStatusChanged: boolean = false

    function onPageChange(page: number) {
        selectedChannelPageIndex.set(page)
    }

    $: $selectedChannel, updateStateMachine()
    $: message = $isAsyncLoadingChannels || $loading || $searchChannelsResults?.length ? null : 'No channels found'
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

    onMount(() => {
        const results = get(searchChannelsResults)
        // Fetch data if cached data is empty
        if (!results || results?.length === 0) {
            searchAllChannels('', getSearchOptions(true))
        }
    })

    onDestroy(() => {
        stopChannelsSearch()
        //stopReadingChannel()
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

    async function updateStateMachine(): Promise<void> {
        subscriptionStatus.set(undefined)
        selectedChannelSubscriptions.set(null)
        if ($selectedChannel) {
            // Load all the necessary data for the selected channel
            // ----------------------------------------------------------------------------

            // TODO: add a button to refresh subscription status as we dont subscribe to it
            const status = await getSubscriptionStatus($selectedChannel?.channelAddress)
            subscriptionStatus.set(status)

            const subscriptions = await getSubscriptions($selectedChannel?.channelAddress)
            selectedChannelSubscriptions.set(subscriptions)

            goto(`streams-manager/${$selectedChannel.channelAddress}`)

            // ----------------------------------------------------------------------------
        } else {
            subscriptionStatus.set(undefined)
        }
    }

    function handleSelectChannel(channel: ChannelInfo): void {
        selectedChannel.set(channel)
    }

    // Add the newly created channel to the search results
    async function onCreateChannelSuccess(channelAddress: string): Promise<void> {
        loading.set(true)
        // If query is not empty, we need to search again to get the match results
        if (get(channelSearchQuery)?.length) {
            onSearch()
        } else {
            // Add the channel to the search results directly, no need to search again
            await addChannelToSearchResults(channelAddress)
        }
        loading.set(false)
    }

    function setFilterState(state: Reset<any>): void {
        // Toggle authorFilterState, subscribedFilterState, requestedSubscriptionFilterState
        state.set(!get(state))
        onSearch()
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
        {onSearch}
        {tableData}
        {message}
        {tableConfiguration}
        title="Channels"
        searchPlaceholder="Search channels"
        selectedPageIndex={$selectedChannelPageIndex}
        {onPageChange}
        {loadMore}
        loading={$loading || $isAsyncLoadingChannels}
        actionButtons={listViewButtons}
        {filters}
        bind:searchQuery={$channelSearchQuery}
    />
</Box>
<CreateChannelModal isOpen={isCreateChannelModalOpen} onModalClose={closeCreateChannelModal} onSuccess={onCreateChannelSuccess} />
