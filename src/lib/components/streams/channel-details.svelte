<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import { isUserOwnerOfChannel } from '$lib/app/streams'
    import type { ActionButton } from '$lib/app/types/layout'
    import type { ExtendedChannelInfo } from '$lib/app/types/streams'
    import { SubscriptionState } from '$lib/app/types/streams'
    import { ChannelInfo, ChannelMessages, ChannelSubscriptions } from '$lib/components'
    import type { ChannelData, Subscription } from '@iota/is-client'

    export let channel: ExtendedChannelInfo
    export let channelData: ChannelData[] = []
    export let subscriptionStatus: SubscriptionState
    export let subscriptions: Subscription[] = undefined
    export let loading: boolean = false
    export let messageFeedButtons: ActionButton[] = []
    export let onSubscriptionAction: (channel: ExtendedChannelInfo) => void
    export let handleAcceptSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()
    export let handleRejectSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()

    $: isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)
</script>

<div class="w-full">
    <div class="mb-4">
        <ChannelInfo {channel} {subscriptionStatus} {loading} {onSubscriptionAction} />
    </div>
    <div class="mb-4">
        <ChannelSubscriptions
            {handleAcceptSubscription}
            {handleRejectSubscription}
            {channel}
            {subscriptions}
            {loading}
            {onSubscriptionAction}
        />
    </div>
    {#if isUserOwner || (!isUserOwner && subscriptionStatus === SubscriptionState.Authorized)}
        <div class="mb-4">
            <ChannelMessages actionButtons={messageFeedButtons} {channel} {channelData} />
        </div>
    {/if}
</div>
