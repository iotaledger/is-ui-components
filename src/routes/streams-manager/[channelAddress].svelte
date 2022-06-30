<script context="module" lang="ts">
    export const prerender = true
</script>

<script lang="ts">
    import { ChannelDetails, Icon, WriteMessageModal } from '$lib/components'
    import { Col, Container, Row } from 'sveltestrap'
    import { onDestroy, onMount } from 'svelte'
    import {
        selectedChannel,
        selectedChannelData,
        selectedChannelSubscriptions,
        subscriptionStatus,
        loading,
        onSearch,
        acceptSubscription,
        rejectSubscription,
        getSubscriptions,
        selectedChannelBusy,
        requestSubscription,
        requestUnsubscription,
        getSubscriptionStatus,
        getChannelInfo,
        searchChannelsSingleRequest,
        stopReadingChannel,
        stopChannelsSearch,
    } from '$lib/app/streams'
    import { goto } from '$app/navigation'
    import { ChannelType, SubscriptionState, type SearchOptions } from '$lib/app/types/streams'
    import { get } from 'svelte/store'
    import { page } from '$app/stores'
    import type { ActionButton } from '$lib/app/types'
    import { authenticatedUserDID } from '$lib'

    let loadingValue = undefined
    loading.subscribe((val) => {
        loadingValue = val
    })

    let subscriptionStatusValue = $subscriptionStatus
    let channel = $selectedChannel
    let subscriptions = $selectedChannelSubscriptions

    let isWriteMesageModalOpen: boolean = false

    let subscriptionTimeout: number

    //used to load tabledata when subscribed,revoked or unsubscribed in channel details view and went back to list overview
    let subscriptionStatusChanged: boolean = false

    function openWriteMessageModal(): void {
        isWriteMesageModalOpen = true
    }
    function closeWriteMessageModal(): void {
        isWriteMesageModalOpen = false
    }

    const messageFeedButtons = [
        {
            label: 'Write a message',
            onClick: openWriteMessageModal,
            icon: 'chat-square-dots',
            color: 'dark',
        },
    ] as ActionButton[]

    async function handleBackClick(): Promise<void> {
        selectedChannel.set(undefined)
        if (subscriptionStatusChanged) {
            onSearch()
            subscriptionStatusChanged = false
        }
        goto('/streams-manager')
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
        subscriptionStatusChanged = true
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
        subscriptionStatusChanged = true
    }

    async function updateSubscriptions(): Promise<void> {
        const channelSubscriptions = await getSubscriptions($selectedChannel?.channelAddress)
        selectedChannelSubscriptions.set(channelSubscriptions)
        subscriptions = $selectedChannelSubscriptions
        loading.set(false)
    }

    function onSubscriptionAction() {
        get(subscriptionStatus) === SubscriptionState.NotSubscribed ? subscribe() : unsubscribe()
    }

    async function subscribe(): Promise<void> {
        if (!$selectedChannel) {
            return
        }
        loading.set(true)
        const response = await requestSubscription($selectedChannel?.channelAddress)
        if (response) {
            $selectedChannel.type === ChannelType.private
                ? subscriptionStatus.set(SubscriptionState.Requested)
                : subscriptionStatus.set(SubscriptionState.Authorized)
            subscriptionStatusValue = $subscriptionStatus
            subscriptionStatusChanged = true
            updateSubscriptions()
        }
        loading.set(false)
    }

    async function unsubscribe(): Promise<void> {
        loading.set(true)
        const response = await requestUnsubscription($selectedChannel?.channelAddress)
        if (response) {
            subscriptionStatus.set(SubscriptionState.NotSubscribed)
            subscriptionStatusValue = $subscriptionStatus
            subscriptionStatusChanged = true
            updateSubscriptions()
        }
        loading.set(false)
    }

    onMount(async () => {
        if (!get(selectedChannel)) {
            channel = await getChannelInfo($page.params.channelAddress)
            selectedChannel.set(channel)
        }
        if (!get(subscriptionStatus)) {
            subscriptionStatusValue = await getSubscriptionStatus($selectedChannel?.channelAddress)
            subscriptionStatus.set(subscriptionStatusValue)
        }
        if (!get(selectedChannelSubscriptions)) {
            subscriptions = await getSubscriptions($selectedChannel?.channelAddress)
            selectedChannelSubscriptions.set(subscriptions)
        }
    })
    onDestroy(() => {
        stopReadingChannel()
    })
</script>

<Container class="my-5">
    <Row>
        <Col sm="12" md={{ size: 10, offset: 1 }}>
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
                loading={loadingValue}
                subscriptionStatus={subscriptionStatusValue}
                {subscriptions}
                {channel}
                {messageFeedButtons}
            />
            <WriteMessageModal
                isOpen={isWriteMesageModalOpen}
                onModalClose={closeWriteMessageModal}
                address={$selectedChannel?.channelAddress}
            />
        </Col>
    </Row>
</Container>
