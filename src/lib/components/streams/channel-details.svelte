<script lang="ts">
    import { onMount } from 'svelte'
    import { authenticatedUserDID } from '$lib/app/base'
    import { isUserOwnerOfChannel, startReadingChannel, stopReadingChannel } from '$lib/app/streams'
    import type { ActionButton } from '$lib/app/types/layout'
    import { SubscriptionState } from '$lib/app/types/streams'
    import { ChannelInfo, ChannelMessages, ChannelSubscriptions } from '$lib/components'
    import type { ChannelData, ChannelInfo as ChannelInfoType, Subscription } from '@iota/is-client'

    export let channel: ChannelInfoType
    export let channelData: ChannelData[] = []
    export let subscriptionStatus: SubscriptionState
    export let subscriptions: Subscription[] = undefined
    export let loading: boolean = false
    export let messageFeedButtons: ActionButton[] = []
    export let onSubscriptionAction: (channel: ChannelInfoType) => void
    export let handleAcceptSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()
    export let handleRejectSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()

    $: isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)

    async function manageChannelData(): Promise<void> {
        const isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)
        if (isUserOwner || subscriptionStatus === SubscriptionState.Authorized) {
            await startReadingChannel(channel?.channelAddress)
        } else {
            await stopReadingChannel()
        }
    }

    onMount(async () => {
        await manageChannelData()
    })
</script>

<div class="w-full">
    <div class="mb-4">
        <ChannelInfo {channel} {subscriptionStatus} {loading} {onSubscriptionAction} />
    </div>
    <div class="mb-4">
        <ChannelSubscriptions {handleAcceptSubscription} {handleRejectSubscription} {channel} {subscriptions} />
    </div>
    {#if isUserOwner || (!isUserOwner && subscriptionStatus === SubscriptionState.Authorized)}
        <div class="mb-4">
            <ChannelMessages actionButtons={messageFeedButtons} {channelData} />
        </div>
    {/if}
</div>
