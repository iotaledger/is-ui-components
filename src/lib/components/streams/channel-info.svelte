<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import { BoxColor } from '$lib/app/constants/colors'
    import { isUserOwnerOfChannel } from '$lib/app/streams'
    import { SubscriptionState } from '$lib/app/types/streams'
    import { Icon } from '$lib/components'
    import type { ChannelInfo } from '@iota/is-client'
    import { Badge, Button, Spinner } from 'sveltestrap'

    export let channel: ChannelInfo = undefined
    export let subscriptionStatus: SubscriptionState = undefined
    export let loading: boolean = false
    export let onSubscriptionAction: (...__any: any[]) => void = () => {}

    $: isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)

    const BUTTON_MESSAGE = {
        [SubscriptionState.NotSubscribed]: 'Subscribe',
        [SubscriptionState.Requested]: 'Waiting for approval',
        [SubscriptionState.Authorized]: 'Unsubscribe',
    }
</script>

<div class="w-full">
    <div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4 flex-column flex-lg-row">
        <div class="d-flex align-items-center">
            <Icon type="broadcast" boxed boxColor={BoxColor.Blue} size={64} />
            <div class="ms-4">
                <div class="fs-4 fw-bold">
                    <span>{channel?.name ?? '-'}</span>
                </div>
                {#if isUserOwner}
                    <Badge pill color="info">owner</Badge>
                {:else if !isUserOwner && subscriptionStatus === SubscriptionState.Requested}
                    <Badge pill color="info">requested</Badge>
                {:else if !isUserOwner && subscriptionStatus === SubscriptionState.Subscribed}
                    <Badge pill color="success">subscribed</Badge>
                {/if}
                {#if channel?.type}
                    <Badge color="dark" class="me-1">{channel?.type}</Badge>
                {/if}
                {#if channel?.topics && channel.topics.length > 0}
                    {#each channel?.topics as { type, source }}
                        <Badge color="primary" class="me-1">{type}</Badge>
                        <Badge color="secondary" class="me-2">{source}</Badge>
                    {/each}
                {/if}
                <div class="text-secondary fw-bolder mt-1 text-break">{channel?.channelAddress || '-'}</div>
            </div>
        </div>
        {#if !isUserOwner && subscriptionStatus}
            <div class="d-flex align-items-center ms-lg-3">
                <Button
                    size="sm"
                    outline
                    color="dark"
                    on:click={onSubscriptionAction}
                    class="mt-3 mt-lg-0  d-flex align-items-center"
                    disabled={loading || subscriptionStatus === SubscriptionState.Subscribed || subscriptionStatus === SubscriptionState.Requested }
                >
                    {#if subscriptionStatus != SubscriptionState.Subscribed}
                        <div class="me-1">
                            <Icon type="plus" size={16} />
                        </div>
                    {/if}
                    <span>{BUTTON_MESSAGE[subscriptionStatus]}</span>
                    {#if loading}
                        <Spinner size="sm" color="dark" class="ms-2" />
                    {/if}
                </Button>
            </div>
        {/if}
    </div>
    <div class="bg-light rounded px-4 pt-3 pb-4">
        <div class="text-secondary">Description</div>
        <div>
            {channel?.description || '-'}
        </div>
    </div>
</div>
