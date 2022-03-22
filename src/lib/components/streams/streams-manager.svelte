<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import { DEFAULT_TABLE_CONFIGURATION, WELCOME_LIST_RESULTS_NUMBER } from '$lib/app/constants/base'
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
        searchChannelsResults,
        selectedChannel,
        selectedChannelBusy,
        selectedChannelData,
        selectedChannelSubscriptions,
        startReadingChannel,
        stopChannelsSearch,
        stopReadingChannel,
    } from '$lib/app/streams'
    import type { ActionButton } from '$lib/app/types/layout'
    import type { ExtendedChannelInfo } from '$lib/app/types/streams'
    import { SubscriptionState } from '$lib/app/types/streams'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Box, ChannelDetails, CreateChannelModal, Icon, ListManager, WriteMessageModal } from '$lib/components'
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
    export let tableConfiguration: TableConfiguration = DEFAULT_TABLE_CONFIGURATION

    enum State {
        ListChannels = 'listChannels',
        ChannelDetail = 'channelDetail',
    }

    let state: State = State.ListChannels
    let loading: boolean = false
    let query: string = ''

    let isCreateChannelModalOpen: boolean = false
    let isWriteMesageModalOpen: boolean = false

    let subscriptionTimeout: number

    // used to determine the subscription status of the authenticated user on the current channel
    let subscriptionStatus: SubscriptionState

    $: $selectedChannel, updateStateMachine()
    $: message = $isAsyncLoadingChannels || loading || $searchChannelsResults?.length ? null : 'No channels found'
    $: tableData = {
        headings: ['Channel', 'Address', 'Topic types', 'Topic Sources', ''],
        rows: $searchChannelsResults.map((channel) => {
            const isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)
            const isUserSubscribed = isUserSubscribedToChannel($authenticatedUserDID, channel)
            return {
                onClick: () => handleSelectChannel(channel),
                content: [
                    {
                        icon: 'broadcast',
                        boxColor: BoxColor.Blue,
                        // TODO: Change this to real channel name when SDK is ready
                        value: ['Channel name', 'Channel description'],
                    },
                    { value: channel.channelAddress },
                    { value: channel.topics.map((topic) => topic?.type) },
                    { value: channel.topics.map((topic) => topic?.source) },
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

    $: subscriptionStatus, manageChannelData()

    onMount(async () => {
        searchAllChannels('', { limit: WELCOME_LIST_RESULTS_NUMBER })
    })

    onDestroy(() => {
        stopChannelsSearch()
        stopReadingChannel()
    })

    async function onSearch(): Promise<void> {
        await searchAllChannels(query)
    }

    async function updateStateMachine(): Promise<void> {
        subscriptionStatus = undefined
        selectedChannelSubscriptions.set(null)
        if ($selectedChannel) {
            state = State.ChannelDetail

            // Load all the necessary data for the selected channel
            // ----------------------------------------------------------------------------

            // TODO: add a button to refresh subscription status as we dont subscribe to it
            subscriptionStatus = await getSubscriptionStatus($selectedChannel?.channelAddress)
            const subscriptions = await getSubscriptions($selectedChannel?.channelAddress)
            selectedChannelSubscriptions.set(subscriptions)

            // ----------------------------------------------------------------------------
        } else {
            subscriptionStatus = null
            state = State.ListChannels
        }
    }

    function handleSelectChannel(channel: ExtendedChannelInfo): void {
        selectedChannel.set(channel)
    }

    function handleBackClick(): void {
        selectedChannel.set(undefined)
    }

    // Add the newly created channel to the search results
    async function onCreateChannelSuccess(channelAddress: string): Promise<void> {
        loading = true
        // If query is not empty, we need to search again to get the match results
        if (query?.length) {
            await onSearch()
        } else {
            // Add the channel to the search results directly, no need to search again
            await addChannelToSearchResults(channelAddress)
        }
        loading = false
    }

    async function onSubscriptionAction(): Promise<void> {
        subscriptionStatus === SubscriptionState.NotSubscribed ? subscribe() : unsubscribe()
    }

    async function subscribe(): Promise<void> {
        if (!$selectedChannel) {
            return
        }
        loading = true
        const response = await requestSubscription($selectedChannel?.channelAddress)
        if (response) {
            subscriptionStatus = SubscriptionState.Subscribed
        }
        loading = false
    }

    async function unsubscribe(): Promise<void> {
        loading = true
        const response = await requestUnsubscription($selectedChannel?.channelAddress)
        if (response) {
            subscriptionStatus = SubscriptionState.NotSubscribed
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

        await acceptSubscription($selectedChannel?.channelAddress, subscriptionId)
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

        await rejectSubscription($selectedChannel?.channelAddress, subscriptionId)
        await updateSubscriptions()
    }

    async function updateSubscriptions(): Promise<void> {
        const subscriptions = await getSubscriptions($selectedChannel?.channelAddress)
        selectedChannelSubscriptions.set(subscriptions)
    }

    function manageChannelData(): void {
        const isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, $selectedChannel)
        if (isUserOwner || subscriptionStatus === SubscriptionState.Authorized) {
            startReadingChannel($selectedChannel?.channelAddress)
        } else {
            stopReadingChannel()
        }
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
            loading={loading || $isAsyncLoadingChannels}
            actionButtons={listViewButtons}
            bind:searchQuery={query}
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
            {subscriptionStatus}
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
