import type { CreateChannelResponse } from 'iota-is-sdk'
import { AccessRights, ChannelData, RequestSubscriptionResponse, Subscription } from 'iota-is-sdk'
import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
import { authenticationData, channelClient } from './base'
import type { ExtendedChannelInfo } from './types/streams'
import { SubscriptionState } from './types/streams'
import { showNotification } from './notificacion';
import { NotificationType } from './types/notificacion'

export const selectedChannel: Writable<ExtendedChannelInfo> = writable(null)
export const searchResults: Writable<ExtendedChannelInfo[]> = writable([])
export const channelData: Writable<ChannelData[]> = writable([])
export const channelBusy = writable(false)

const userDid = get(authenticationData)?.did

let updateInterval
const intervalTimeout = 200
const resultsPerCall = 2
let index = 0

// TODO: Improve search algorithm, now it is searching only by author id or topic type
export async function searchChannels(
    query: string, options?: { maxResults?: number }
): Promise<void> {
    const _isAuthorId = (query: string): boolean => query.startsWith('did:iota:');
    const _isSource = !_isAuthorId(query);

    const maxResults = options?.maxResults;

    if (maxResults) {
        try {
            const channels = await channelClient.search({ limit: maxResults })
            searchResults.set(channels)
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error searching for channels'
            })
            console.error(Error, e);
        }
    }
    else {
        const newResults = await partialSearch(
            query,
            {
                searchByAuthorId: _isAuthorId(query),
                searchBySource: _isSource,
                limit: resultsPerCall,
                index,
            }
        );

        if (newResults?.length) {
            searchResults.update((results) => [...results, ...newResults])

            updateInterval = setTimeout(async () => {
                index++
                searchChannels(query)
            }, intervalTimeout)
        }
        else {
            index = 0
            stopSearch()
        }
    }
}

export async function partialSearch(query: string, options: { searchByAuthorId?: boolean, searchBySource?: boolean; limit: number, index?: number }): Promise<ExtendedUser[]> {
    let partialResults = []
    const { searchByAuthorId, searchBySource, limit, index } = options
    try {
        partialResults = await channelClient.search({
            authorId: searchByAuthorId ? query : undefined,
            topicSource: searchBySource ? query : undefined,
            limit: limit,
            index: index
        })
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error searching for user',
        })
        console.error(Error, e);
    }
    return partialResults
}

export function stopSearch(): void {
    if (updateInterval) {
        clearTimeout(updateInterval)
    }
}

let timeout = 1000
let updateTimer

export async function readChannel(channelAddress: string): Promise<void> {
    try {
        if (get(channelData)?.length) {
            const lastMessage = get(channelData)?.[0]
            const lastMessageDate = new Date(lastMessage.log.created)

            const startDate = new Date(lastMessageDate.setSeconds(lastMessageDate.getSeconds() + 1))

            try {
                channelBusy.set(true)
                const newMessages = await channelClient.read(channelAddress, {
                    startDate,
                    endDate: new Date(),
                })
                channelBusy.set(false)
                channelData.update((_chData) => [...newMessages, ..._chData])
                if (newMessages?.length) {
                    timeout = 800
                }
            } catch (e) {
                showNotification({
                    type: NotificationType.Error,
                    message: 'There was an error reading channel',
                })
                console.error(Error, e);
            }
        } else {
            channelBusy.set(true)
            const _channelData = await channelClient.read(channelAddress)
            channelData.set(_channelData)
            channelBusy.set(false)
            if (timeout < 1000) {
                timeout += 500
            }
        }

    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error reading channel',
        })
        console.log(Error, e);
    }

    if (updateTimer) {
        clearTimeout(updateTimer)
    }

    updateTimer = setTimeout(async () => readChannel(channelAddress), timeout)
}

export function stopData(): void {
    if (updateTimer) {
        clearTimeout(updateTimer)
        updateTimer = undefined
        channelData.set([])
    }
}

export async function requestSubscription(channelAddress: string): Promise<RequestSubscriptionResponse> {
    try {
        const resp = await channelClient.requestSubscription(channelAddress, { accessRights: AccessRights.ReadAndWrite })
        return resp
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error requesting subscription to channel',
        })
        console.error(Error, e);
    }
}

export async function requestUnsubscription(channelAddress: string): Promise<void> {
    try {
        const subscription = await channelClient.findSubscription(channelAddress, get(authenticationData)?.did)
        await channelClient.removeSubscription(channelAddress, subscription.id)
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error requesting unsubscription to channel',
        })
        console.error(Error, e);
    }
}

export async function acceptSubscription(channelAddress: string, id: string): Promise<void> {
    try {
        await channelClient.authorizeSubscription(channelAddress, {
            id,
        })
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting subscription state',
        })
        console.error(Error, e);
    }
}

export async function getPendingSubscriptions(channelAddress: string): Promise<Subscription[]> {
    try {
        const allSubscriptions = await channelClient.findAllSubscriptions(channelAddress)
        const pendingSubscriptions = allSubscriptions.filter((s) => !s.isAuthorized)
        return pendingSubscriptions
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting all subscriptions',
        })
        console.error(Error, e);
    }

}

export async function getSubscriptionStatus(channelAddress: string): Promise<SubscriptionState> {
    try {
        const allSubscriptions = await channelClient.findAllSubscriptions(channelAddress)
        const subscription = allSubscriptions.find((sub) => sub.id === get(authenticationData)?.did)
        if (subscription) {
            const isAuthorized = subscription.isAuthorized
            return isAuthorized ? SubscriptionState.Subscribed : SubscriptionState.Pending
        } else {
            return SubscriptionState.Unsubscribed
        }
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting subscription state',
        })
        console.error(Error, e);
    }

}

export async function writeMessage(
    address: string,
    payload: string,
    publicPayload: string,
    metadata?: string,
    type?: string
): Promise<void> {
    try {
        await channelClient.write(address, {
            payload,
            publicPayload,
            metadata,
            type,
        })
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error writing message in channel',
        })
        console.error(Error, e);
    }

}

export async function createChannel(topics: { type: string; source: string }[]): Promise<CreateChannelResponse> {
    let channel: CreateChannelResponse

    try {
        channel = await channelClient.create({
            topics,
        })
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error creating the channel',
        })
        console.error(Error, e);
    }
    return channel
}

export async function addChannelToSearchResults(channelAddress: string): Promise<void> {
    let channel: ExtendedChannelInfo = await channelClient.info(channelAddress)

    if (channel) {
        const authorId = channel.authorId

        channel = {
            ...channel,
            isOwner: authorId === userDid,
            isSubscriber: channel.subscriberIds.includes(userDid),
        }
        searchResults?.update((_searchResults) => {
            return [..._searchResults, channel]
        })
    }
}

