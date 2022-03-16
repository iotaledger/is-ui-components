import type { ChannelData, CreateChannelResponse, RequestSubscriptionResponse, Subscription } from 'boxfish-studio--iota-is-sdk'
import { AccessRights } from 'boxfish-studio--iota-is-sdk'
import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
import { authenticationData, channelClient, isAuthenticated } from './base'
import { showNotification } from './notification'
import { NotificationType } from './types/notification'
import type { ExtendedChannelInfo } from './types/streams'
import { SubscriptionState } from './types/streams'

export const selectedChannel: Writable<ExtendedChannelInfo> = writable(null)
export const searchChannelsResults: Writable<ExtendedChannelInfo[]> = writable([])
export const channelData: Writable<ChannelData[]> = writable([])
export const channelBusy = writable(false)
// used for the async search that makes N background queries to get the full list of channels
export const isAsyncLoadingChannels: Writable<boolean> = writable(false);

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
                return { ...channel, isOwned: channel.authorId === get(authenticationData).did, isSubscribed: isUserSubscribedToChannel(get(authenticationData)?.did, channel) }
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
    isAsyncLoadingChannels.set(true)
    searchChannelsResults.set([]);
    if (get(isAuthenticated)) {
        await _search(query, options)
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    isAsyncLoadingChannels.set(false)
}

export async function searchChannelsSingleRequest(query: string, options: { searchByAuthorId?: boolean, searchBySource?: boolean; limit: number, index?: number }): Promise<ExtendedChannelInfo[]> {
    let partialResults = []
    if (get(isAuthenticated)) {
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
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return partialResults
}

export function stopChannelsSearch(): void {
    if (updateInterval) {
        clearTimeout(updateInterval)
    }
    isAsyncLoadingChannels.set(false)
}

let timeout = 2000
let updateTimer

export async function readChannel(channelAddress: string): Promise<void> {
    if (get(isAuthenticated)) {
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
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }

    if (updateTimer) {
        clearTimeout(updateTimer)
    }

    updateTimer = setTimeout(async () => readChannel(channelAddress), timeout)
}

export function stopReadingChannel(): void {
    if (updateTimer) {
        clearTimeout(updateTimer)
        updateTimer = undefined
    }
    channelData.set([])
}

export async function requestSubscription(channelAddress: string): Promise<RequestSubscriptionResponse> {
    let response
    if (get(isAuthenticated)) {
        try {
            response = await channelClient.requestSubscription(channelAddress, { accessRights: AccessRights.ReadAndWrite })
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error requesting subscription to channel',
            })
            console.error(Error, e);
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return response
}

export async function requestUnsubscription(channelAddress: string): Promise<void> {
    if (get(isAuthenticated)) {
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
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
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
    if (get(isAuthenticated)) {
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
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function getPendingSubscriptions(channelAddress: string): Promise<Subscription[]> {
    let pendingSubscriptions = []
    try {
        const allSubscriptions = await channelClient.findAllSubscriptions(channelAddress)
        pendingSubscriptions = allSubscriptions?.filter((s) => !s.isAuthorized) ?? []
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting all subscriptions',
        })
        console.error(Error, e);
    }
    return pendingSubscriptions
}

export async function getSubscriptionStatus(channelAddress: string): Promise<SubscriptionState> {
    if (get(isAuthenticated)) {
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
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function writeMessage(
    address: string,
    payload: string,
    publicPayload: string,
    metadata?: string,
    type?: string
): Promise<void> {
    if (get(isAuthenticated)) {
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
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function createChannel(topics: { type: string; source: string }[]): Promise<CreateChannelResponse> {
    let channel: CreateChannelResponse
    if (get(isAuthenticated)) {
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
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return channel
}

export async function addChannelToSearchResults(channelAddress: string): Promise<void> {
    if (get(isAuthenticated)) {
        let channel: ExtendedChannelInfo = await channelClient.info(channelAddress)

        if (channel) {
            const authorId = channel.authorId
            const userDid = get(authenticationData)?.did

            channel = {
                ...channel,
                isOwned: authorId === userDid,
                isSubscribed: isUserSubscribedToChannel(get(authenticationData)?.did, channel),
            }
            searchChannelsResults?.update((_searchChannelsResults) => {
                return [..._searchChannelsResults, channel]
            })
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export function isUserSubscribedToChannel(userDID: string, channel: ExtendedChannelInfo): boolean {
    return channel.subscriberIds?.includes(userDID) && channel.authorId !== userDID;
}
