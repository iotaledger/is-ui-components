import type { ChannelData, CreateChannelResponse, RequestSubscriptionResponse, Subscription } from 'boxfish-studio--iota-is-sdk'
import { AccessRights } from 'boxfish-studio--iota-is-sdk'
import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
import { authenticationData, channelClient } from './base'
import type { ExtendedChannelInfo } from './types/streams'
import { SubscriptionState } from './types/streams'
import { showNotification } from './notification';
import { NotificationType } from './types/notification'

export const selectedChannel: Writable<ExtendedChannelInfo> = writable(null)
export const searchChannelsResults: Writable<ExtendedChannelInfo[]> = writable([])
export const channelData: Writable<ChannelData[]> = writable([])
export const channelBusy = writable(false)
export const isLoadingChannels: Writable<boolean> = writable(false);


let updateInterval
const SEARCH_TIMEOUT = 200
const DEFAULT_LIMIT = 500
let index = 0

// TODO: Improve search algorithm, now it is searching only by author id or topic type
export async function searchChannels(
    query: string, options?: { limit?: number }
): Promise<void> {
    const _search = async (query: string, options?: { limit?: number }): Promise<void> => {
        const _isAuthorId = (query: string): boolean => query.startsWith('did:iota:');
        const _isSource = !_isAuthorId(query);
        let newResults: ExtendedChannelInfo[] = await searchChannelsSingleRequest(
            query,
            {
                searchByAuthorId: _isAuthorId(query),
                searchBySource: _isSource,
                limit: options?.limit ?? DEFAULT_LIMIT,
                index,
            }
        );
        if (newResults?.length) {
            // Add isOwned and isSubscribed to the results
            newResults = newResults.map((channel) => {
                return { ...channel, isOwned: channel.authorId === get(authenticationData).did, isSubscribed: isAChannelSubscribed(channel) }
            })
            searchChannelsResults.update((results) => [...results, ...newResults])
        }
        // if the search is not finished, start a new search
        if ((options?.limit && (get(searchChannelsResults)?.length < options?.limit)) || (!options?.limit && (newResults?.length === DEFAULT_LIMIT))) {
            updateInterval = setTimeout(async () => {
                index++
                _search(query)
            }, SEARCH_TIMEOUT)
        }
        else {
            index = 0
            stopChannelsSearch()
        }
    }
    stopChannelsSearch()
    isLoadingChannels.set(true)
    searchChannelsResults.set([]);
    await _search(query, options)
    isLoadingChannels.set(false)
}

export async function searchChannelsSingleRequest(query: string, options: { searchByAuthorId?: boolean, searchBySource?: boolean; limit: number, index?: number }): Promise<ExtendedUser[]> {
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

export function stopChannelsSearch(): void {
    if (updateInterval) {
        clearTimeout(updateInterval)
    }
}

let timeout = 2000
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
                    timeout = 1000
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

export async function rejectSubscription(channelAddress: string, id: string): Promise<void> {
    try {
        await channelClient.revokeSubscription(channelAddress, {
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
        const userDid = get(authenticationData)?.did

        channel = {
            ...channel,
            isOwned: authorId === userDid,
            isSubscribed: isAChannelSubscribed(channel),
        }
        searchChannelsResults?.update((_searchChannelsResults) => {
            return [..._searchChannelsResults, channel]
        })
    }
}

export function isAChannelSubscribed(channel: ExtendedChannelInfo): boolean {
    const userDid = get(authenticationData)?.did
    return channel.subscriberIds?.includes(userDid) && channel.authorId !== userDid;
}