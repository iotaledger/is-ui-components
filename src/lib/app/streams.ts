import type {
    AuthorizeSubscriptionResponse,
    ChannelData,
    CreateChannelResponse,
    RequestSubscriptionResponse,
    Subscription,
} from '@iota/is-client'
import { AccessRights, ChannelInfo } from '@iota/is-client'
import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
import { authenticationData, channelClient, isAuthenticated } from './base'
import { DEFAULT_SDK_CLIENT_REQUEST_LIMIT } from './constants/base'
import { FEED_INTERVAL_MS } from './constants/streams'
import { showNotification } from './notification'
import { NotificationType } from './types/notification'
import { SubscriptionState } from './types/streams'

export let selectedPageIndex: Writable<number> = writable(1)
export const selectedChannel: Writable<ChannelInfo> = writable(null)
export const searchChannelsResults: Writable<ChannelInfo[]> = writable([])
export const selectedChannelData: Writable<ChannelData[]> = writable([])
export const selectedChannelBusy = writable(false)
export const selectedChannelSubscriptions: Writable<Subscription[]> = writable(null)
// used for the async search that makes N background queries to get the full list of channels
export const isAsyncLoadingChannels: Writable<boolean> = writable(false)

let haltSearchAll = false
// used to keep track of the last search query
let searchAllHash: string

let channelFeedInterval

// Note: this is an async function that returns nothing, but fills the searchChannelsResults store.
// This is because the searchAllChannels function is called in the background, and the results are
// stored in the searchChannelsResults store.
// TODO: Improve search algorithm, now it is searching only by author id or topic type
let index = 0
export async function searchAllChannels(query: string, options?: { limit?: number }): Promise<void> {
    const _search = async (_searchAllHash: string, query: string, options?: { limit?: number }): Promise<void> => {
        const _isAuthorId = (query: string): boolean => query.startsWith('did:iota:')
        const newResults: ChannelInfo[] = await searchChannelsSingleRequest(query, {
            searchByAuthorId: _isAuthorId(query),
            searchBySource: !_isAuthorId(query),
            limit: options?.limit ?? DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
            index,
        })
        // filter out old requests
        if (_searchAllHash === searchAllHash) {
            if (newResults?.length) {
                searchChannelsResults.update((results) => [...results, ...newResults])
            }
            // if the search is not finished, start a new search
            if (
                !haltSearchAll &&
                ((options?.limit && get(searchChannelsResults)?.length < options?.limit) ||
                    (!options?.limit && newResults?.length === DEFAULT_SDK_CLIENT_REQUEST_LIMIT))
            ) {
                index++
                await _search(_searchAllHash, query)
            } else {
                stopChannelsSearch()
            }
        }
    }
    stopChannelsSearch()
    // used to keep track of the last
    searchAllHash = `${query}-${Math.floor(Math.random() * query.length)}`
    haltSearchAll = false
    isAsyncLoadingChannels.set(true)
    searchChannelsResults.set([])
    await _search(searchAllHash, query, options)
}

export async function searchChannelsSingleRequest(
    query: string,
    options: { searchByAuthorId?: boolean; searchBySource?: boolean; limit: number; index?: number }
): Promise<ChannelInfo[]> {
    let partialResults = []
    if (get(isAuthenticated)) {
        const { searchByAuthorId, searchBySource, limit, index } = options
        try {
            partialResults = await channelClient.search({
                authorId: searchByAuthorId ? query : undefined,
                topicSource: searchBySource ? query : undefined,
                limit: limit,
                index: index,
                // TODO asc: false,
            })
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error searching for channel',
            })
            console.error(Error, e)
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
    index = 0
    haltSearchAll = true
    isAsyncLoadingChannels.set(false)
}

export async function readChannelMessages(channelAddress: string): Promise<void> {
    if (get(isAuthenticated)) {
        if (get(selectedChannelBusy)) {
            console.log('channel busy...')
            return
        }
        try {
            const lastMessage = get(selectedChannelData)?.[0] ?? null
            const lastMessageDate = lastMessage ? new Date(lastMessage.log.created) : null
            const startDate = lastMessageDate ? new Date(lastMessageDate.setSeconds(lastMessageDate.getSeconds() + 1)) : null

            selectedChannelBusy.set(true)
            const newMessages = await channelClient.read(channelAddress, {
                startDate,
                endDate: get(selectedChannelData)?.length ? new Date() : null,
            })
            selectedChannelBusy.set(false)
            selectedChannelData.update((_chData) => [...newMessages, ..._chData])
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error reading channel',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function startReadingChannel(channelAddress: string): Promise<void> {
    console.log('start reading from:', channelAddress)
    stopReadingChannel()
    if (!get(selectedChannelBusy)) {
        await readChannelMessages(channelAddress)
    }
    channelFeedInterval = setInterval(async () => {
        await readChannelMessages(channelAddress)
    }, FEED_INTERVAL_MS)
}

export function stopReadingChannel(): void {
    console.log('clearing interval..', channelFeedInterval)
    clearInterval(channelFeedInterval)
    channelFeedInterval = null
    selectedChannelData.set([])
}

export async function requestSubscription(channelAddress: string): Promise<RequestSubscriptionResponse> {
    if (get(isAuthenticated)) {
        try {
            const response: RequestSubscriptionResponse = await channelClient.requestSubscription(channelAddress, {
                accessRights: AccessRights.ReadAndWrite,
            })
            return response
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error requesting subscription to channel',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function requestUnsubscription(channelAddress: string): Promise<boolean> {
    if (get(isAuthenticated)) {
        try {
            const subscription = await channelClient.findSubscription(channelAddress, get(authenticationData)?.did)
            await channelClient.removeSubscription(channelAddress, subscription.id)
            return true
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error requesting unsubscription to channel',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function acceptSubscription(
    channelAddress: string,
    id: string,
    triggerReadChannel = false
): Promise<AuthorizeSubscriptionResponse> {
    let authorizedResponse: AuthorizeSubscriptionResponse
    stopReadingChannel()
    try {
        const response: AuthorizeSubscriptionResponse = await channelClient.authorizeSubscription(channelAddress, {
            id,
        })
        authorizedResponse = response
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting subscription state',
        })
        console.error(Error, e)
    }
    if (triggerReadChannel) {
        startReadingChannel(channelAddress)
    }
    return authorizedResponse
}

export async function rejectSubscription(channelAddress: string, id: string, triggerReadChannel = false): Promise<boolean> {
    let isRejected = false
    if (get(isAuthenticated)) {
        stopReadingChannel()
        try {
            await channelClient.revokeSubscription(channelAddress, {
                id,
            })
            isRejected = true
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error getting subscription state',
            })
            console.error(Error, e)
        }
        if (triggerReadChannel) {
            startReadingChannel(channelAddress)
        }
        return isRejected
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function getSubscriptions(channelAddress: string): Promise<Subscription[]> {
    let subscriptions: Subscription[] = []
    try {
        subscriptions = await channelClient.findAllSubscriptions(channelAddress)
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting all subscriptions',
        })
        console.error(Error, e)
    }
    return subscriptions
}

export async function getSubscriptionStatus(channelAddress: string): Promise<SubscriptionState> {
    if (get(isAuthenticated)) {
        try {
            const allSubscriptions = await channelClient.findAllSubscriptions(channelAddress)
            const ownSuscription = allSubscriptions.find((subscription) => subscription.id === get(authenticationData)?.did)
            return !ownSuscription
                ? SubscriptionState.NotSubscribed
                : ownSuscription.isAuthorized
                ? SubscriptionState.Authorized
                : SubscriptionState.Subscribed
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error getting subscription state',
            })
            console.error(Error, e)
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
    payload?: string,
    publicPayload?: string,
    metadata?: string,
    type?: string,
    triggerReadChannel = false
): Promise<ChannelData> {
    if (get(isAuthenticated)) {
        let channelDataResponse: ChannelData
        stopReadingChannel()
        selectedChannelBusy.set(true)

        try {
            const response: ChannelData = await channelClient.write(address, {
                payload,
                publicPayload,
                metadata,
                type,
            })
            channelDataResponse = response
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error writing message in channel',
            })
            console.error(Error, e)
        } finally {
            selectedChannelBusy.set(false)
        }
        if (triggerReadChannel) {
            startReadingChannel(address)
        }
        return channelDataResponse
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function createChannel(
    name: string,
    description: string,
    topics: { type: string; source: string }[]
): Promise<CreateChannelResponse> {
    if (get(isAuthenticated)) {
        try {
            const channel: CreateChannelResponse = await channelClient.create({
                name,
                description,
                topics,
            })
            return channel
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error creating the channel',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function addChannelToSearchResults(channelAddress: string): Promise<void> {
    if (get(isAuthenticated)) {
        try {
            const channel: ChannelInfo = await channelClient.info(channelAddress)
            if (channel) {
                searchChannelsResults?.update((_searchChannelsResults) => {
                    return [..._searchChannelsResults, channel]
                })
            }
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error fetching channel information',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export function isUserOwnerOfChannel(userDID: string, channel: ChannelInfo): boolean {
    return channel?.authorId === userDID
}

export function isUserSubscribedToChannel(userDID: string, channel: ChannelInfo): boolean {
    return channel?.subscriberIds?.includes(userDID) && channel?.authorId !== userDID
}
