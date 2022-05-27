<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import {
        DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
        DEFAULT_TABLE_CONFIGURATION,
        WELCOME_LIST_RESULTS_NUMBER,
    } from '$lib/app/constants/base'
    import { BoxColor } from '$lib/app/constants/colors'
    import {
        acceptSubscription,
        addChannelToSearchResults,
        getSubscriptions,
        getSubscriptionStatus,
        isAsyncLoadingChannels,
        isUserOwnerOfChannel,
        isUserSubscribedToChannel,
        rejectSubscription,
        requestSubscription,
        requestUnsubscription,
        searchAllChannels,
        searchChannelsSingleRequest,
        searchChannelsResults,
        selectedChannel,
        selectedChannelPageIndex,
        selectedChannelBusy,
        selectedChannelData,
        selectedChannelSubscriptions,
        stopChannelsSearch,
        stopReadingChannel,
        channelSearchQuery,
        channelFilterOptions,
        previousAuthenticatedStreamsUserDID,
    } from '$lib/app/streams'
    import { get, writable, type Writable } from 'svelte/store'
    import type { ActionButton, FilterCheckbox } from '$lib/app/types/layout'
    import { SubscriptionState } from '$lib/app/types/streams'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Box, ChannelDetails, CreateChannelModal, Icon, ListManager, WriteMessageModal } from '$lib/components'
    import type { ChannelInfo } from '@iota/is-client'
    import { onDestroy, onMount } from 'svelte'

    export let showSearch: boolean = true
    export let listViewButtons: ActionButton[] = [
        {
            label: 'Create a channel',
            onClick: openCreateChannelModal,
            icon: 'plus',
            color: 'dark',
        },
    ]
    export let messageFeedButtons: ActionButton[] = [
        {
            label: 'Write a message',
            onClick: openWriteMessageModal,
            icon: 'chat-square-dots',
            color: 'dark',
        },
    ]
    export let streamsFilter: FilterCheckbox[] = [
        {
            label: 'Only own channels',
            onChange: onOnlyOwnChannels,
        },
    ]
    export let tableConfiguration: TableConfiguration = DEFAULT_TABLE_CONFIGURATION

    enum State {
        ListChannels = 'listChannels',
        ChannelDetail = 'channelDetail',
    }

    let state: State = State.ListChannels
    let loading: boolean = false

    let isCreateChannelModalOpen: boolean = false
    let isWriteMesageModalOpen: boolean = false

    let subscriptionTimeout: number

    function onPageChange(page) {
        selectedChannelPageIndex.set(page)
    }

    // used to determine the subscription status of the authenticated user on the current channel
    let subscriptionStatus: Writable<SubscriptionState> = writable(undefined)

    $: $selectedChannel, updateStateMachine()
    $: message = $isAsyncLoadingChannels || loading || $searchChannelsResults?.length ? null : 'No channels found'
    $: tableData = {
        headings: ['Channel', 'Address', 'Topic types', 'Topic Sources', 'Date Created', ''],
        rows: $searchChannelsResults.map((channel) => {
            const isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)
            const isUserSubscribed = isUserSubscribedToChannel($authenticatedUserDID, channel)
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
                    { value: channel.created },
                    {
                        pills:
                            isUserOwner || isUserSubscribed
                                ? [
                                      {
                                          color: isUserOwner ? 'success' : 'info',
                                          text: isUserOwner ? 'Owner' : 'Subscriber',
                                      },
                                  ]
                                : undefined,
                    },
                ],
            }
        }),
    } as TableData

    onMount(async () => {
        // Get the current filter state from store and set value accordingly
        const { authorFilterState } = get(channelFilterOptions)
        streamsFilter[0].value = authorFilterState ? get(authenticatedUserDID) : undefined

        const results = get(searchChannelsResults)
        // Fetch data if cached data is empty or user has changed
        if (!results || results?.length === 0 || userChanged()) {
            searchAllChannels('', getSearchOptions(true))
            // Used for determining if user has changed from previous onMount() call
            previousAuthenticatedStreamsUserDID.set(get(authenticatedUserDID))
        }
    })

    onDestroy(() => {
        stopChannelsSearch()
        stopReadingChannel()
    })

    async function onSearch(): Promise<void> {
        selectedChannelPageIndex.set(1) // reset index
        await searchAllChannels(get(channelSearchQuery), getSearchOptions())
    }

    function getSearchOptions(firstLoad = false): { limit: number; authorId: string } {
        const { authorFilterState } = get(channelFilterOptions)
        const authorId = authorFilterState ? streamsFilter[0].value : undefined
        const limit = firstLoad ? WELCOME_LIST_RESULTS_NUMBER : DEFAULT_SDK_CLIENT_REQUEST_LIMIT
        return { limit, authorId }
    }

    /**
     * Check if the cached authorId (set in onMount()) is the same as the current user
     */
    function userChanged(): boolean {
        return get(previousAuthenticatedStreamsUserDID) !== get(authenticatedUserDID)
    }

    async function loadMore(entries: number): Promise<void> {
        const _isAuthorId = (q: string): boolean => q?.startsWith('did:iota:')

        const newChannels = await searchChannelsSingleRequest(get(channelSearchQuery), {
            searchByAuthorId: _isAuthorId(get(channelSearchQuery)),
            searchBySource: !_isAuthorId(get(channelSearchQuery)),
            limit: DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
            index: entries / DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
        })
        searchChannelsResults.update((results) => [...results, ...newChannels])
    }

    async function updateStateMachine(): Promise<void> {
        subscriptionStatus.set(undefined)
        selectedChannelSubscriptions.set(null)
        if ($selectedChannel) {
            state = State.ChannelDetail

            // Load all the necessary data for the selected channel
            // ----------------------------------------------------------------------------

            // TODO: add a button to refresh subscription status as we dont subscribe to it
            const status = await getSubscriptionStatus($selectedChannel?.channelAddress)
            subscriptionStatus.set(status)

            const subscriptions = await getSubscriptions($selectedChannel?.channelAddress)
            selectedChannelSubscriptions.set(subscriptions)

            // ----------------------------------------------------------------------------
        } else {
            subscriptionStatus.set(undefined)
            state = State.ListChannels
        }
    }

    function handleSelectChannel(channel: ChannelInfo): void {
        selectedChannel.set(channel)
    }

    function handleBackClick(): void {
        selectedChannel.set(undefined)
    }

    // Add the newly created channel to the search results
    async function onCreateChannelSuccess(channelAddress: string): Promise<void> {
        loading = true
        // If query is not empty, we need to search again to get the match results
        if (get(channelSearchQuery)?.length) {
            await onSearch()
        } else {
            // Add the channel to the search results directly, no need to search again
            await addChannelToSearchResults(channelAddress)
        }
        loading = false
    }

    async function onSubscriptionAction(): Promise<void> {
        get(subscriptionStatus) === SubscriptionState.NotSubscribed ? subscribe() : unsubscribe()
    }

    async function subscribe(): Promise<void> {
        if (!$selectedChannel) {
            return
        }
        loading = true
        const response = await requestSubscription($selectedChannel?.channelAddress)
        if (response) {
            subscriptionStatus.set(SubscriptionState.Subscribed)
        }
        loading = false
    }

    async function unsubscribe(): Promise<void> {
        loading = true
        const response = await requestUnsubscription($selectedChannel?.channelAddress)
        if (response) {
            subscriptionStatus.set(SubscriptionState.NotSubscribed)
        }
        loading = false
    }

    async function handleAcceptSubscription(subscriptionId: string): Promise<void> {
        // ---- Avoid locked channel error when accepting subscriptions ----
        while ($selectedChannelBusy) {
            if (subscriptionTimeout) {
                clearTimeout(subscriptionTimeout)
            }
            subscriptionTimeout = setTimeout(handleAcceptSubscription, 100)
            return
        }
        // ----------------------------------------------------------

        await acceptSubscription($selectedChannel?.channelAddress, subscriptionId, true)
        await updateSubscriptions()
    }

    async function handleRejectSubscription(subscriptionId: string): Promise<void> {
        // ---- Avoid locked channel error when rejecting subscriptions ----
        while ($selectedChannelBusy) {
            if (subscriptionTimeout) {
                clearTimeout(subscriptionTimeout)
            }
            subscriptionTimeout = setTimeout(handleRejectSubscription, 100)
            return
        }
        // ----------------------------------------------------------

        await rejectSubscription($selectedChannel?.channelAddress, subscriptionId, true)
        await updateSubscriptions()
    }

    async function updateSubscriptions(): Promise<void> {
        const subscriptions = await getSubscriptions($selectedChannel?.channelAddress)
        selectedChannelSubscriptions.set(subscriptions)
    }

    /**
     * Toggle if channels should be filtered by current user
     */
    function onOnlyOwnChannels(): void {
        const currentFilter = get(channelFilterOptions)
        const authorFilterState = !currentFilter.authorFilterState
        // Set local filter value depending on state in store
        streamsFilter[0].value = authorFilterState ? get(authenticatedUserDID) : undefined
        channelFilterOptions.set({ ...currentFilter, authorFilterState })
        onSearch()
    }

    function openCreateChannelModal(): void {
        isCreateChannelModalOpen = true
    }
    function closeCreateChannelModal(): void {
        isCreateChannelModalOpen = false
    }
    function openWriteMessageModal(): void {
        isWriteMesageModalOpen = true
    }
    function closeWriteMessageModal(): void {
        isWriteMesageModalOpen = false
    }
</script>

<Box>
    {#if state === State.ListChannels}
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
            loading={loading || $isAsyncLoadingChannels}
            actionButtons={listViewButtons}
            filters={streamsFilter}
            bind:searchQuery={$channelSearchQuery}
        />
    {:else if state === State.ChannelDetail}
        <div class="mb-4 align-self-start">
            <button on:click={handleBackClick} class="btn d-flex align-items-center">
                <Icon type="arrow-left" size={16} />
                <span class="ms-2">Back</span>
            </button>
        </div>
        <ChannelDetails
            {handleRejectSubscription}
            {handleAcceptSubscription}
            {onSubscriptionAction}
            {loading}
            subscriptionStatus={$subscriptionStatus}
            subscriptions={$selectedChannelSubscriptions}
            channel={$selectedChannel}
            channelData={$selectedChannelData}
            {messageFeedButtons}
        />
    {/if}
</Box>
<CreateChannelModal isOpen={isCreateChannelModalOpen} onModalClose={closeCreateChannelModal} onSuccess={onCreateChannelSuccess} />
<WriteMessageModal
    isOpen={isWriteMesageModalOpen}
    onModalClose={closeWriteMessageModal}
    address={$selectedChannel?.channelAddress}
/>
