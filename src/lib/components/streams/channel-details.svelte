<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import {
        acceptSubscription,
        channelData,
        getPendingSubscriptions,
        getSubscriptionStatus,
        readChannel,
        requestSubscription,
        requestUnsubscription,
        stopData,
    } from '$lib/app/streams'
    import { SubscriptionState } from '$lib/app/types/streams'
    import { isJson } from '$lib/app/utils'
    import { Icon, JSONViewer, WriteMessage } from '$lib/components'
    import { onDestroy, onMount } from 'svelte'
    import { Accordion, AccordionItem, Badge, Button, Spinner } from 'sveltestrap'

    export let address: string
    export let name: string
    export let isOwner = false
    export let topics
    export let description: string

    let loading = false
    let subscriptionState: SubscriptionState
    let pendingSubscriptions = []
    let isOpen: boolean = false

    onMount(async () => {
        subscriptionState = await getSubscriptionStatus(address)
        if (isOwner) {
            updatePendingSubscriptions()
        }
    })

    onDestroy(() => {
        stopData()
    })

    async function handleSubscription() {
        subscriptionState === SubscriptionState.Unsubscribed ? subscribe() : unsubscribe()
    }

    async function subscribe() {
        loading = true
        await requestSubscription(address)
        subscriptionState = SubscriptionState.Pending
        loading = false
    }

    async function unsubscribe() {
        loading = true
        await requestUnsubscription(address)
        subscriptionState = SubscriptionState.Unsubscribed
        loading = false
    }

    async function handleAcceptSubscription(id) {
        loading = true
        await acceptSubscription(address, id)
        updatePendingSubscriptions()
        loading = false
    }

    async function updatePendingSubscriptions() {
        pendingSubscriptions = await getPendingSubscriptions(address)
    }

    $: subscriptionState, updateMessages()

    async function updateMessages() {
        if (isOwner || subscriptionState === SubscriptionState.Subscribed) {
            await readChannel(address)
        }
    }

    function onModalClose() {
        isOpen = !isOpen
    }

    const BUTTON_MESSAGE = {
        [SubscriptionState.Subscribed]: 'Unsubscribe',
        [SubscriptionState.Pending]: 'Waiting for approval',
        [SubscriptionState.Unsubscribed]: 'Subscribe',
    }

    // TODO: improve this. It is used to change the icon color when button is hovered.
    let addIconColor = '#333333'
    let messageIconColor = '#333333'

    const switchIconColor = (icon: 'add' | 'message') => {
        if (icon === 'add') {
            addIconColor = addIconColor === '#333333' ? 'white' : '#333333'
        }
        if (icon === 'message') {
            messageIconColor = messageIconColor === '#333333' ? 'white' : '#333333'
        }
    }

    // ---------------------------------------------------------------------------------------------
</script>

<div class="w-100">
    <div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4 flex-column flex-lg-row">
        <div class="d-flex align-items-center">
            <Icon type="broadcast" boxed boxColor={BoxColor.Blue} size={64} />
            <div class="ms-4">
                <div class="fs-4 fw-bold">
                    <span>{name}</span>
                </div>
                {#if isOwner}
                    <Badge pill color="info">owner</Badge>
                {:else if !isOwner && subscriptionState === SubscriptionState.Subscribed}
                    <Badge pill color="primary">subscriber</Badge>
                {/if}
                {#each topics as { type, source }}
                    <Badge color="primary" class="me-1">{type}</Badge>
                    <Badge color="secondary" class="me-2">{source}</Badge>
                {/each}
                <div class="text-secondary fw-bolder mt-1 text-break">{address}</div>
            </div>
        </div>
        {#if subscriptionState && !isOwner}
            <div class="d-flex align-items-center ms-lg-3">
                <div on:mouseenter={() => switchIconColor('add')} on:mouseleave={() => switchIconColor('add')}>
                    <Button
                        size="sm"
                        outline
                        color="dark"
                        on:click={handleSubscription}
                        class="mt-3 mt-lg-0  d-flex align-items-center"
                        disabled={loading || subscriptionState === SubscriptionState.Pending}
                    >
                        {#if subscriptionState != SubscriptionState.Pending}
                            <Icon type="plus" color={addIconColor} size={16} />
                        {/if}
                        <span class="ml-1">{BUTTON_MESSAGE[subscriptionState]}</span>
                        {#if loading}
                            <Spinner size="sm" color="dark" class="ms-2" />
                        {/if}
                    </Button>
                </div>
            </div>
        {/if}
    </div>
    <div class="bg-light rounded px-4 pt-3 pb-4">
        <div class="text-secondary">Description</div>
        <div>{description}</div>
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
                    {#each pendingSubscriptions as { id }}
                        <div class="d-flex justify-content-between align-items-center my-3">
                            <div>
                                <div class="text-secondary mb-1">Requester Id</div>
                                <span class="text-break">{id}</span>
                            </div>
                            <Button
                                class="ms-2"
                                size="sm"
                                outline
                                color="dark"
                                disabled={loading}
                                on:click={() => handleAcceptSubscription(id)}
                            >
                                <div class="d-flex justify-content-center align-items-center">
                                    {loading ? 'Accepting...' : 'Accept'}
                                    {#if loading}
                                        <div class="ms-2">
                                            <Spinner size="sm" type="border" color="success" />
                                        </div>
                                    {/if}
                                </div>
                            </Button>
                        </div>
                    {/each}
                </AccordionItem>
            </Accordion>
        </div>
    {/if}
    {#if isOwner || (!isOwner && subscriptionState === SubscriptionState.Subscribed)}
        <div class="d-flex justify-content-end mt-4">
            <div on:mouseenter={() => switchIconColor('message')} on:mouseleave={() => switchIconColor('message')}>
                <Button size="sm" outline color="dark" class="d-flex align-items-center mt-3 mt-md-0" on:click={onModalClose}>
                    <span class="me-2">Write a message</span>
                    <Icon type="chat-square-dots" color={messageIconColor} size={16} />
                </Button>
            </div>
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
                    <div class="text-break">{msg.imported}</div>
                </div>
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Type</div>
                    <div>{msg.log.type}</div>
                </div>
            </div>
            <div class="mb-4">
                <div class="text-secondary">Message id</div>
                <div class="text-break">{msg.messageId}</div>
            </div>
            <div class="mb-4">
                <div class="text-secondary">Link</div>
                <div class="text-break">{msg.link}</div>
            </div>

            <div class="mb-4">
                <div class="text-secondary">Public data</div>
                {#if isJson(msg.log.publicPayload)}
                    <JSONViewer json={msg.log.publicPayload} />
                {:else}
                    <span>{msg.log.publicPayload}</span>
                {/if}
            </div>
            <div class="mb-4">
                <div class="text-secondary">Encrypted data</div>
                {#if isJson(msg.log.payload)}
                    <JSONViewer json={msg.log.payload} />
                {:else}
                    <span>{msg.log.payload}</span>
                {/if}
            </div>
            <div class="mb-4">
                <div class="text-secondary">Metadata</div>
                {#if isJson(msg.log.metadata)}
                    <JSONViewer json={msg.log.metadata} />
                {:else}
                    <span>{msg.log.metadata}</span>
                {/if}
            </div>
        </div>
    {/each}
</div>
<WriteMessage {isOpen} {onModalClose} {address} />

<style lang="scss">
    .info-box {
        flex: 1 1 0;
    }
</style>
