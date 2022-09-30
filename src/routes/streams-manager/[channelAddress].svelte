<script context="module" lang="ts">
    export const prerender = true
</script>

<script lang="ts">
    import { Box, ChannelDetails, Icon, WriteMessageModal } from '$lib/components'
    import { Col, Container, Modal, ModalBody, ModalHeader, Row } from 'sveltestrap'
    import { onMount } from 'svelte'
    import {
        selectedChannel,
        selectedChannelSubscriptions,
        subscriptionStatus,
        loadingChannel,
        acceptSubscription,
        rejectSubscription,
        getSubscriptions,
        selectedChannelBusy,
        requestSubscription,
        requestUnsubscription,
        getSubscriptionStatus,
        getChannelInfo,
        stopReadingChannel,
        searchChannelsResults,
    } from '$lib/app/streams'
    import { goto } from '$app/navigation'
    import { ChannelType, SubscriptionState } from '$lib/app/types/streams'
    import { get } from 'svelte/store'
    import { page } from '$app/stores'
    import type { ActionButton } from '$lib/app/types'
    import { getAsymSharedKey } from '$lib'
    import type { IdentityKeys } from '@iota/is-client'
    import { NotificationType, showNotification, asymSharedKeysStorage, authenticatedUserDID } from '$lib/app'
    import Dropzone from 'svelte-file-dropzone'

    let currentSubscriptionStatus: SubscriptionState
    $: $subscriptionStatus, updateChannelList()
    let isWriteMesageModalOpen: boolean = false
    let subscriptionTimeout: number
    let fileReader: FileReader
    let identity: IdentityKeys
    let file: File
    let invalidJsonFile: boolean = false
    let asymSharedKey: string = undefined
    let isPrivatePlusModalOpen = false
    const messageFeedButtons = [
        {
            label: 'Write a message',
            onClick: openWriteMessageModal,
            icon: 'chat-square-dots',
            color: 'dark',
        },
    ] as ActionButton[]

    onMount(async () => {
        if (!get(selectedChannel)) {
            const channel = await getChannelInfo($page.params.channelAddress)
            selectedChannel.set(channel)
        }
        const status = await getSubscriptionStatus($selectedChannel?.channelAddress)
        currentSubscriptionStatus = status
        subscriptionStatus.set(status)

        const subscriptions = await getSubscriptions($selectedChannel?.channelAddress)
        selectedChannelSubscriptions.set(subscriptions)

        asymSharedKey = $asymSharedKeysStorage.get(`${$authenticatedUserDID}-${$selectedChannel.channelAddress}`)
        fileReader = new FileReader()
        fileReader.addEventListener('load', loadJson)
        return () => {
            fileReader.removeEventListener('load', loadJson)
        }
    })

    function handleFilesSelect(event: CustomEvent): void {
        file = event?.detail?.acceptedFiles[0]
        fileReader.readAsText(file)
    }

    async function loadJson(): Promise<void> {
        try {
            identity = JSON.parse(fileReader?.result?.toString())
            isPrivatePlusModalOpen = false
            if (!identity?.id || !identity?.keys?.encrypt?.private) {
                showNotification({
                    type: NotificationType.Error,
                    message: 'Wrong identity json content. You might use an old identity trying to unlock.',
                })
            } else {
                asymSharedKey = getAsymSharedKey(identity.keys.encrypt.private, $selectedChannel.peerPublicKey)
                asymSharedKeysStorage.set(
                    $asymSharedKeysStorage.set(`${$authenticatedUserDID}-${$selectedChannel.channelAddress}`, asymSharedKey)
                )
                subscribe()
            }
        } catch {
            invalidJsonFile = true
        }
    }

    async function handleBackClick(): Promise<void> {
        goto('/streams-manager')
    }

    async function updateChannelList(): Promise<void> {
        if (get(subscriptionStatus) !== currentSubscriptionStatus) {
            const channelInfo = await getChannelInfo(get(selectedChannel)?.channelAddress)
            if (channelInfo) {
                const searchResults = get(searchChannelsResults)
                const index = searchResults.indexOf($selectedChannel)
                searchResults.splice(index, 1, channelInfo)
                searchChannelsResults.set(searchResults)
            }
        }
    }

    async function handleAcceptSubscription(subscriptionId: string): Promise<void> {
        loadingChannel.set(true)
        // ---- Avoid locked channel error when accepting subscriptions ----
        while ($selectedChannelBusy) {
            if (subscriptionTimeout) {
                clearTimeout(subscriptionTimeout)
            }
            subscriptionTimeout = setTimeout(handleAcceptSubscription, 100)
            return
        }
        // ----------------------------------------------------------
        await acceptSubscription($selectedChannel?.channelAddress, subscriptionId, true, asymSharedKey)
        await updateSubscriptions()
        loadingChannel.set(false)
    }

    async function handleRejectSubscription(subscriptionId: string): Promise<void> {
        loadingChannel.set(true)
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
        loadingChannel.set(false)
    }

    async function updateSubscriptions(): Promise<void> {
        const channelSubscriptions = await getSubscriptions($selectedChannel?.channelAddress)
        selectedChannelSubscriptions.set(channelSubscriptions)
    }

    function onSubscriptionAction() {
        get(subscriptionStatus) === SubscriptionState.NotSubscribed ? subscribe() : unsubscribe()
    }

    async function subscribe(): Promise<void> {
        if (!get(selectedChannel)) {
            return
        }
        if ($selectedChannel.type === ChannelType.privatePlus && !asymSharedKey) {
            isPrivatePlusModalOpen = true
        } else {
            loadingChannel.set(true)
            const response = await requestSubscription($selectedChannel?.channelAddress, asymSharedKey)
            if (response) {
                $selectedChannel.type === ChannelType.private || $selectedChannel.type === ChannelType.privatePlus
                    ? subscriptionStatus.set(SubscriptionState.Requested)
                    : subscriptionStatus.set(SubscriptionState.Authorized)
                await updateSubscriptions()
            }
            loadingChannel.set(false)
        }
    }

    async function unsubscribe(): Promise<void> {
        stopReadingChannel()
        loadingChannel.set(true)
        const response = await requestUnsubscription($selectedChannel?.channelAddress)
        if (response) {
            subscriptionStatus.set(SubscriptionState.NotSubscribed)
            await updateSubscriptions()
        }
        loadingChannel.set(false)
    }

    function openWriteMessageModal(): void {
        isWriteMesageModalOpen = true
    }
    function closeWriteMessageModal(): void {
        isWriteMesageModalOpen = false
    }
    function togglePrivatePlusModal(): void {
        isPrivatePlusModalOpen = !isPrivatePlusModalOpen
    }
</script>

<svelte:head>
    <title>Channel Details</title>
</svelte:head>

<Container class="my-5">
    <Row>
        <Col sm="12" md={{ size: 10, offset: 1 }}>
            {#if $subscriptionStatus && $selectedChannel && $selectedChannelSubscriptions}
                <div class="mb-4 align-self-start">
                    <button on:click={handleBackClick} class="btn d-flex align-items-center">
                        <Icon type="arrow-left" size={16} />
                        <span class="ms-2">Back to Channels</span>
                    </button>
                </div>
                <ChannelDetails
                    {handleRejectSubscription}
                    {handleAcceptSubscription}
                    {onSubscriptionAction}
                    loading={$loadingChannel}
                    subscriptionStatusValue={$subscriptionStatus}
                    subscriptions={$selectedChannelSubscriptions}
                    channel={$selectedChannel}
                    {messageFeedButtons}
                />
                <WriteMessageModal
                    isOpen={isWriteMesageModalOpen}
                    onModalClose={closeWriteMessageModal}
                    address={$selectedChannel?.channelAddress}
                    channelType={$selectedChannel?.type}
                />
            {/if}
        </Col>
    </Row>
</Container>
<Modal isOpen={isPrivatePlusModalOpen} toggle={togglePrivatePlusModal}>
    <ModalHeader toggle={togglePrivatePlusModal} class="px-4 pt-3">Subscribe for privatePlus channel</ModalHeader>
    <ModalBody class="px-1 pb-1">
        <Box>
            <div class="d-flex flex-column align-items-center justify-content-center">
                <div class="icon">
                    <Icon type="lock" size={140} />
                </div>
                <h5 class="mb-4">Request subscription for privatePlus channel</h5>
            </div>
            <div class="w-100 m-2">
                <Dropzone on:drop={handleFilesSelect} accept="application/json"
                    ><p>Upload JSON files or drag and drop</p></Dropzone
                >
            </div>
            {#if invalidJsonFile}
                <div class="d-flex justify-content-between w-100 mt-4">
                    <div>{file?.name}</div>
                    <div class="text-danger ms-4">Invalid JSON file</div>
                </div>
            {/if}
        </Box>
    </ModalBody>
</Modal>

<style>
    .icon {
        height: 70px;
        padding-left: 10%;
    }
</style>
