<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import {
        acceptSubscription,
        channelBusy,
        channelData,
        getPendingSubscriptions,
        getSubscriptionStatus,
        readChannel,
        rejectSubscription,
        requestSubscription,
        requestUnsubscription,
        stopReadingChannel,
    } from '$lib/app/streams'
    import type { ExtendedChannelInfo } from '$lib/app/types/streams'
    import { SubscriptionState } from '$lib/app/types/streams'
    import { isJson } from '$lib/app/utils'
    import { Icon, JSONViewer, WriteMessageModal } from '$lib/components'
    import type { Subscription } from 'boxfish-studio--iota-is-sdk/lib'
    import { onDestroy, onMount } from 'svelte'
    import { Accordion, AccordionItem, Badge, Button, Spinner } from 'sveltestrap'

    export let channel: ExtendedChannelInfo

    const BUTTON_MESSAGE = {
        [SubscriptionState.Subscribed]: 'Unsubscribe',
        [SubscriptionState.Pending]: 'Waiting for approval',
        [SubscriptionState.Unsubscribed]: 'Subscribe',
    }

    let loading = false
    let subscriptionState: SubscriptionState
    let pendingSubscriptions: (Subscription & { acceptLoading?: boolean; rejectLoading?: boolean })[] = []
    let isOpen: boolean = false
    let timeout: number

    $: subscriptionState, updateMessages()

    onMount(async () => {
        subscriptionState = await getSubscriptionStatus(channel?.channelAddress)
        if (channel?.isOwned) {
            await updatePendingSubscriptions()
        }
    })

    onDestroy(() => {
        if (timeout) {
            clearTimeout(timeout)
        }
        stopReadingChannel()
    })

    async function handleSubscription(): Promise<void> {
        subscriptionState === SubscriptionState.Unsubscribed ? subscribe() : unsubscribe()
    }

    async function subscribe(): Promise<void> {
        loading = true
        await requestSubscription(channel?.channelAddress)
        subscriptionState = SubscriptionState.Pending
        loading = false
    }

    async function unsubscribe(): Promise<void> {
        loading = true
        await requestUnsubscription(channel?.channelAddress)
        subscriptionState = SubscriptionState.Unsubscribed
        loading = false
    }

    async function handleAcceptSubscription(subscriptionId: string): Promise<void> {
        setIsAccepting(subscriptionId, true)

        // ---- Avoid locked channel error when accepting subscriptions ----
        while ($channelBusy) {
            if (timeout) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(handleAcceptSubscription, 100)
            return
        }
        // ----------------------------------------------------------

        await acceptSubscription(channel?.channelAddress, subscriptionId)
        await updatePendingSubscriptions()
        setIsAccepting(subscriptionId, false)
    }

    function setIsAccepting(subscriptionId, isAccepting): void {
        pendingSubscriptions = pendingSubscriptions.map((subscription) => {
            if (subscription.id === subscriptionId) {
                subscription.acceptLoading = isAccepting
            }
            return subscription
        })
    }

    function setIsRejecting(subscriptionId, isRejecting): void {
        pendingSubscriptions = pendingSubscriptions.map((subscription) => {
            if (subscription.id === subscriptionId) {
                subscription.rejectLoading = isRejecting
            }
            return subscription
        })
    }

    async function handleRejectSubscription(subscriptionId: string): Promise<void> {
        setIsRejecting(subscriptionId, true)

        // ---- Avoid locked channel error when rejecting subscriptions ----
        while ($channelBusy) {
            timeout = setTimeout(handleRejectSubscription, 100)
            return
        }
        // ----------------------------------------------------------

        await rejectSubscription(channel?.channelAddress, subscriptionId)
        await updatePendingSubscriptions()
        setIsRejecting(subscriptionId, false)
    }

    async function updatePendingSubscriptions(): Promise<void> {
        pendingSubscriptions = await getPendingSubscriptions(channel?.channelAddress)
    }

    async function updateMessages(): Promise<void> {
        if (channel?.isOwned || subscriptionState === SubscriptionState.Subscribed) {
            await readChannel(channel?.channelAddress)
        }
    }

    function onModalClose(): void {
        isOpen = !isOpen
    }
</script>

<div class="w-100">
    <div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4 flex-column flex-lg-row">
        <div class="d-flex align-items-center">
            <Icon type="broadcast" boxed boxColor={BoxColor.Blue} size={64} />
            <div class="ms-4">
                <div class="fs-4 fw-bold">
                    <span>{channel?.name ?? 'Lorem Ipsum'}</span>
                </div>
                {#if channel?.isOwned}
                    <Badge pill color="info">owner</Badge>
                {:else if !channel?.isOwned && subscriptionState === SubscriptionState.Subscribed}
                    <Badge pill color="success">subscriber</Badge>
                {/if}
                {#each channel?.topics as { type, source }}
                    <Badge color="primary" class="me-1">{type}</Badge>
                    <Badge color="secondary" class="me-2">{source}</Badge>
                {/each}
                <div class="text-secondary fw-bolder mt-1 text-break">{channel?.channelAddress}</div>
            </div>
        </div>
        {#if subscriptionState && !channel?.isOwned}
            <div class="d-flex align-items-center ms-lg-3">
                <Button
                    size="sm"
                    outline
                    color="dark"
                    on:click={handleSubscription}
                    class="mt-3 mt-lg-0  d-flex align-items-center"
                    disabled={loading || subscriptionState === SubscriptionState.Pending}
                >
                    {#if subscriptionState != SubscriptionState.Pending}
                        <Icon type="plus" size={16} />
                    {/if}
                    <span class="ml-1">{BUTTON_MESSAGE[subscriptionState]}</span>
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
            {channel?.description ??
                `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium massa in odio
            pellentesque dapibus. Nunc a augue nunc. Morbi fermentum pellentesque quam, nec vulputate
            neque viverra ornare. Etiam efficitur purus vel finibus consequat. Nunc tincidunt pretium mi,
            vel ornare leo vestibulum a. Pellentesque habitant morbi tristique senectus et netus et
            malesuada fames ac turpis egestas.`}
        </div>
    </div>
    {#if pendingSubscriptions?.length}
        <div class="my-4">
            <Accordion>
                <AccordionItem>
                    <div slot="header" class="d-flex align-items-center">
                        <Icon type="exclamation-circle" boxed boxColor={BoxColor.Red} size={48} />
                        <div class="ms-4 d-flex">
                            <div class="fs-6 fw-bold me-2">Pending subscriptions</div>
                            <Badge color="danger">{pendingSubscriptions.length}</Badge>
                        </div>
                    </div>
                    {#each pendingSubscriptions as subscription}
                        <div class="d-flex justify-content-between align-items-center my-3">
                            <div>
                                <div class="text-secondary mb-1">Requester Id</div>
                                <span class="text-break">{subscription?.id}</span>
                            </div>
                            <div class="d-flex flex-column flex-lg-row ">
                                <Button
                                    class="ms-2"
                                    size="sm"
                                    outline
                                    color="dark"
                                    disabled={subscription?.acceptLoading}
                                    on:click={() => handleAcceptSubscription(subscription?.id)}
                                >
                                    <div class="d-flex justify-content-center align-items-center">
                                        {subscription?.acceptLoading ? 'Accepting...' : 'Accept'}
                                        {#if subscription?.acceptLoading}
                                            <div class="ms-2">
                                                <Spinner size="sm" type="border" color="success" />
                                            </div>
                                        {/if}
                                    </div>
                                </Button>
                                <Button
                                    class="ms-2 mt-2 mt-lg-0"
                                    size="sm"
                                    outline
                                    color="danger"
                                    disabled={subscription?.rejectLoading}
                                    on:click={() => handleRejectSubscription(subscription?.id)}
                                >
                                    <div class="d-flex justify-content-center align-items-center">
                                        {subscription?.rejectLoading ? 'Revoking...' : 'Revoke'}
                                        {#if subscription?.rejectLoading}
                                            <div class="ms-2">
                                                <Spinner size="sm" type="border" color="success" />
                                            </div>
                                        {/if}
                                    </div>
                                </Button>
                            </div>
                        </div>
                    {/each}
                </AccordionItem>
            </Accordion>
        </div>
    {/if}
    {#if channel?.subscriberIds?.length && channel?.isOwned}
        <div class="my-4">
            <Accordion>
                <AccordionItem>
                    <div slot="header" class="d-flex align-items-center">
                        <Icon
                            type="person-check
                        "
                            boxed
                            boxColor={BoxColor.Red}
                            size={48}
                        />
                        <div class="ms-4 d-flex">
                            <div class="fs-6 fw-bold me-2">Subscribers</div>
                            <Badge color="info">{channel?.subscriberIds.length}</Badge>
                        </div>
                    </div>
                    {#each channel?.subscriberIds as subscriber}
                        <div class="d-flex justify-content-between align-items-center my-3">
                            <div>
                                <div class="text-secondary mb-1">Subscriber Id</div>
                                <span class="text-break">{subscriber}</span>
                            </div>
                        </div>
                    {/each}
                </AccordionItem>
            </Accordion>
        </div>
    {/if}
    {#if channel?.isOwned || (!channel?.isOwned && subscriptionState === SubscriptionState.Subscribed)}
        <div class="d-flex justify-content-end mt-4">
            <Button size="sm" outline color="dark" class="d-flex align-items-center mt-3 mt-md-0" on:click={onModalClose}>
                <span class="me-2">Write a message</span>
                <Icon type="chat-square-dots" size={16} />
            </Button>
        </div>
        <div class="p-4 d-flex align-items-center shadow rounded mt-4">
            <Spinner class="ms-2 me-4" type="grow" size="sm" color="secondary" />
            <div class="fw-bold">Waiting for channel data...</div>
        </div>
    {/if}
    {#each $channelData as msg}
        <div class="p-4 bg-light my-4">
            <div class="d-lg-flex justify-content-between mb-lg-4">
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Timestamp</div>
                    <div class="text-break">{msg?.imported}</div>
                </div>
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Type</div>
                    <div>{msg?.log?.type}</div>
                </div>
            </div>
            <div class="mb-4">
                <div class="text-secondary">Message id</div>
                <div class="text-break">{msg?.messageId}</div>
            </div>
            <div class="mb-4">
                <div class="text-secondary">Link</div>
                <div class="text-break">{msg?.link}</div>
            </div>

            <div class="mb-4">
                <div class="text-secondary">Public data</div>
                {#if isJson(msg?.log?.publicPayload)}
                    <JSONViewer json={msg?.log?.publicPayload} />
                {:else}
                    <span>{msg?.log?.publicPayload}</span>
                {/if}
            </div>
            <div class="mb-4">
                <div class="text-secondary">Encrypted data</div>
                {#if isJson(msg?.log?.payload)}
                    <JSONViewer json={msg?.log?.payload} />
                {:else}
                    <span>{msg?.log?.payload}</span>
                {/if}
            </div>
            <div class="mb-4">
                <div class="text-secondary">Metadata</div>
                {#if isJson(msg?.log?.metadata)}
                    <JSONViewer json={msg?.log?.metadata} />
                {:else}
                    <span>{msg?.log?.metadata}</span>
                {/if}
            </div>
        </div>
    {/each}
</div>
<WriteMessageModal {isOpen} {onModalClose} address={channel?.channelAddress} />

<style lang="scss">
    .info-box {
        flex: 1 1 0;
    }
</style>
