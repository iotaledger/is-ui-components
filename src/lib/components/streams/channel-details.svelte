<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { authenticatedUserDID } from '$lib/app/base'
    import {
        isUserOwnerOfChannel,
        startReadingChannel,
        stopReadingChannel,
        readChannelMessages,
        selectedChannel,
        subscriptionStatus,
selectedChannelData,
    } from '$lib/app/streams'
    import type { ActionButton } from '$lib/app/types/layout'
    import { ChannelType, SubscriptionState } from '$lib/app/types/streams'
    import { ChannelInfo, ChannelMessages, ChannelSubscriptions } from '$lib/components'
    import type { ChannelData, ChannelInfo as ChannelInfoType, Subscription } from '@iota/is-client'
    import { DEFAULT_SDK_CLIENT_REQUEST_LIMIT } from '$lib/app/constants/base'

    export let channel: ChannelInfoType
    export let loading: boolean = false
    export let subscriptionStatusValue: SubscriptionState
    export let subscriptions: Subscription[] = undefined
    export let messageFeedButtons: ActionButton[] = []
    export let onSubscriptionAction: (channel: ChannelInfoType) => void
    export let handleAcceptSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()
    export let handleRejectSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()
    $: subscriptionStatusValue, manageChannelData()
    $: isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)

    onDestroy(() => {
        stopReadingChannel()
        selectedChannel.reset()
        subscriptionStatus.reset()
        selectedChannelData.reset()
    })

    async function manageChannelData(): Promise<void> {
        if (subscriptionStatusValue === SubscriptionState.Authorized && channel === $selectedChannel) {
            if (channel.type === ChannelType.public) {
                // only request data once for public channel since it will be requested directly from the tangle
                await readChannelMessages(channel.channelAddress, true, 0)
                return
            }

            stopReadingChannel()
            await startReadingChannel(channel?.channelAddress)
        } else {
            stopReadingChannel()
        }
    }

    async function loadMore(entries: number): Promise<void> {
        await readChannelMessages(channel.channelAddress, false, Math.ceil(entries / DEFAULT_SDK_CLIENT_REQUEST_LIMIT))
    }
</script>

<div class="w-full">
    <div class="mb-4">
        <ChannelInfo {channel} subscriptionStatus={subscriptionStatusValue} {onSubscriptionAction} {loading} />
    </div>
    <div class="mb-4">
        <ChannelSubscriptions {handleAcceptSubscription} {handleRejectSubscription} {channel} {subscriptions} />
    </div>
    {#if isUserOwner || (!isUserOwner && subscriptionStatusValue === SubscriptionState.Authorized)}
        <div class="mb-4">
            <ChannelMessages
                actionButtons={!isUserOwner && channel.type === ChannelType.public ? [] : messageFeedButtons}
                isSpinnerVisible={channel.type !== ChannelType.public}
                {loadMore}
                channelData={$selectedChannelData}
            />
        </div>
    {/if}
</div>
