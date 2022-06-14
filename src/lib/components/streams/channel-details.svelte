<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { authenticatedUserDID } from '$lib/app/base'
    import { isUserOwnerOfChannel, startReadingChannel, stopReadingChannel, readChannelMessages } from '$lib/app/streams'
    import type { ActionButton } from '$lib/app/types/layout'
    import { ChannelType, SubscriptionState } from '$lib/app/types/streams'
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
    $: subscriptionStatus, manageChannelData()
    $: isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)

    async function manageChannelData(): Promise<void> {
        if (subscriptionStatus === SubscriptionState.Authorized) {
            if (channel.type === ChannelType.public) {
                // only request data once for public channel since it will be requested directly from the tangle
                await readChannelMessages(channel.channelAddress)
                return
            }

            stopReadingChannel()
            await startReadingChannel(channel?.channelAddress)
        } else {
            stopReadingChannel()
        }
    }

    onMount(async () => {
        await manageChannelData()
    })
    onDestroy(() => {
        stopReadingChannel()
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
            <ChannelMessages
                actionButtons={!isUserOwner && channel.type === ChannelType.public ? [] : messageFeedButtons}
                isSpinnerVisible={channel.type !== ChannelType.public}
                {channelData}
            />
        </div>
    {/if}
</div>
