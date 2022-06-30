<script context="module" lang="ts">
    export const prerender = true
</script>

<script lang="ts">
    import { ChannelDetails, Icon, WriteMessageModal } from '$lib/components'
    import { Col, Container, Row } from 'sveltestrap'
    import { onDestroy, onMount } from 'svelte'
    import {
        selectedChannel,
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
        stopReadingChannel,
        searchAllChannels,
    } from '$lib/app/streams'
    import { goto } from '$app/navigation'
    import { ChannelType, SubscriptionState } from '$lib/app/types/streams'
    import { get } from 'svelte/store'
    import { page } from '$app/stores'
    import type { ActionButton } from '$lib/app/types'
    import type { Subscription, ChannelInfo } from '@iota/is-client'

    let isLoading: boolean = $loading
    let subscriptionStatusValue: SubscriptionState = $subscriptionStatus
    let channel: ChannelInfo = $selectedChannel
    let subscriptions: Subscription[] = $selectedChannelSubscriptions

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
        /**if (subscriptionStatusChanged) {
            await onSearch()
            subscriptionStatusChanged = false
        }**/
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
        loading.set(true)
        await acceptSubscription(channel?.channelAddress, subscriptionId, true)
        await updateSubscriptions()
        subscriptionStatusChanged = true
        loading.set(false)
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
        loading.set(true)
        await rejectSubscription(channel?.channelAddress, subscriptionId, true)
        await updateSubscriptions()
        subscriptionStatusChanged = true
        loading.set(false)
    }

    async function updateSubscriptions(): Promise<void> {
        const channelSubscriptions = await getSubscriptions(channel?.channelAddress)
        selectedChannelSubscriptions.set(channelSubscriptions)
        subscriptions = $selectedChannelSubscriptions
    }

    function onSubscriptionAction() {
        get(subscriptionStatus) === SubscriptionState.NotSubscribed ? subscribe() : unsubscribe()
    }

    async function subscribe(): Promise<void> {
        if (!channel) {
            return
        }
        loading.set(true)
        const response = await requestSubscription(channel?.channelAddress)
        if (response) {
            channel.type === ChannelType.private
                ? subscriptionStatus.set(SubscriptionState.Requested)
                : subscriptionStatus.set(SubscriptionState.Authorized)
            subscriptionStatusValue = $subscriptionStatus
            subscriptionStatusChanged = true
            updateSubscriptions()
        }
        loading.set(false)
    }

    async function unsubscribe(): Promise<void> {
        stopReadingChannel()
        loading.set(true)
        const response = await requestUnsubscription(channel?.channelAddress)
        if (response) {
            subscriptionStatus.set(SubscriptionState.NotSubscribed)
            subscriptionStatusValue = $subscriptionStatus
            subscriptionStatusChanged = true
            updateSubscriptions()
        }
        loading.set(false)
    }

    onMount(async () => {
        let response: any
        if (!get(selectedChannel)) {
            response = await getChannelInfo($page.params.channelAddress)
            selectedChannel.set(response)
            channel = $selectedChannel
        }
        if (!get(subscriptionStatus)) {
            response = await getSubscriptionStatus($selectedChannel?.channelAddress)
            subscriptionStatus.set(response)
            subscriptionStatusValue = $subscriptionStatus
        }
        if (!get(selectedChannelSubscriptions)) {
            response = await getSubscriptions($selectedChannel?.channelAddress)
            selectedChannelSubscriptions.set(response)
            subscriptions = $selectedChannelSubscriptions
        }
    })
</script>

<svelte:head>
    <title>Channel Details</title>
</svelte:head>

<Container class="my-5">
    <Row>
        <Col sm="12" md={{ size: 10, offset: 1 }}>
            {#if channel && subscriptions}
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
                    loading={isLoading}
                    subscriptionStatus={subscriptionStatusValue}
                    {subscriptions}
                    {channel}
                    {messageFeedButtons}
                />
                <WriteMessageModal
                    isOpen={isWriteMesageModalOpen}
                    onModalClose={closeWriteMessageModal}
                    address={channel?.channelAddress}
                />
            {/if}
        </Col>
    </Row>
</Container>
