<script lang="ts">
    import { onDestroy } from 'svelte'
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
    import type { ChannelInfo as ChannelInfoType, Subscription } from '@iota/is-client'
    import { DEFAULT_SDK_CLIENT_REQUEST_LIMIT } from '$lib/app/constants/base'
    import { Box, Icon } from '$lib/components'
    import type { IdentityKeys } from '@iota/is-client'
    import { onMount } from 'svelte'
    import Dropzone from 'svelte-file-dropzone'
    import { NotificationType, showNotification, asymSharedKeysStorage } from '$lib/app'
    import { getAsymSharedKey } from '$lib/app/utils'

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

    let fileReader: FileReader
    let identity: IdentityKeys
    let file: File
    let invalidJsonFile: boolean = false
    let asymSharedKey: string = undefined

    onMount(() => {
        asymSharedKey = $asymSharedKeysStorage.get(`${$authenticatedUserDID}-${channel.channelAddress}`)
        if (asymSharedKey) {
            manageChannelData()
        } else {
            fileReader = new FileReader()
            fileReader.addEventListener('load', loadJson)
            return () => {
                fileReader.removeEventListener('load', loadJson)
            }
        }
    })

    function handleFilesSelect(event: CustomEvent): void {
        file = event?.detail?.acceptedFiles[0]
        fileReader.readAsText(file)
    }

    async function loadJson(): Promise<void> {
        try {
            identity = JSON.parse(fileReader?.result?.toString())
            if (!identity?.id || !identity?.keys?.encrypt?.private) {
                showNotification({
                    type: NotificationType.Error,
                    message: 'Wrong identity json content. You might use an old identity trying to unlock.',
                })
            } else {
                asymSharedKey = getAsymSharedKey(identity.keys.encrypt.private, channel.peerPublicKey)
                asymSharedKeysStorage.set(
                    $asymSharedKeysStorage.set(`${$authenticatedUserDID}-${channel.channelAddress}`, asymSharedKey)
                )
                manageChannelData()
            }
        } catch {
            invalidJsonFile = true
        }
    }

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
            if (channel.type !== ChannelType.privatePlus) {
                stopReadingChannel()
                await startReadingChannel(channel?.channelAddress)
                return
            }
            if (asymSharedKey) {
                stopReadingChannel()
                await startReadingChannel(channel?.channelAddress, asymSharedKey)
            }
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
    {#if (isUserOwner || (!isUserOwner && subscriptionStatusValue === SubscriptionState.Authorized)) && (channel.type !== ChannelType.privatePlus || asymSharedKey)}
        <div class="mb-4">
            <ChannelMessages
                actionButtons={!isUserOwner && channel.type === ChannelType.public ? [] : messageFeedButtons}
                isSpinnerVisible={channel.type !== ChannelType.public}
                {loadMore}
                channelData={$selectedChannelData}
            />
        </div>
    {/if}
    {#if channel.type === ChannelType.privatePlus && !asymSharedKey && subscriptionStatusValue === SubscriptionState.Authorized}
        <Box>
            <div class="d-flex flex-column align-items-center justify-content-center">
                <div class="icon ">
                    <Icon type="lock" size={140} />
                </div>
                <h1 class="mt-3 mb-4">Unlock Channel Data</h1>
            </div>
            <div class="w-100 mb-2">
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
    {/if}
</div>

<style>
    .icon {
        height: 70px;
        width: 70px;
    }
</style>
