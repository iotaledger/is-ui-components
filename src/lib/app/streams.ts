import type {
    AuthorizeSubscriptionResponse,
    ChannelData,
    CreateChannelResponse,
    RequestSubscriptionResponse,
    Subscription,
} from '@iota/is-client'
import { AccessRights, ChannelType, type ChannelInfo } from '@iota/is-client'
import { get } from 'svelte/store'
import { authenticatedUserDID, authenticationData, channelClient, isAuthenticated } from './base'
import { DEFAULT_SDK_CLIENT_REQUEST_LIMIT, WELCOME_LIST_RESULTS_NUMBER } from './constants/base'
import {
    DEFAULT_AUTHOR_FILTER_STATE,
    DEFAULT_REQUESTED_SUBSCRIPTION_STATE,
    DEFAULT_SUBSCRIBED_FILTER_STATE,
    FEED_INTERVAL_MS,
} from './constants/streams'
import { showNotification } from './notification'
import { NotificationType } from './types/notification'
import { SubscriptionState, type SearchOptions } from './types/streams'
import type { Reset } from './types/stores'
import { persistKeyValueData, reset } from './stores'

export const selectedChannelPageIndex: Reset<number> = reset(1)
export const selectedMessagePageIndex: Reset<number> = reset(1)
export const channelSearchQuery: Reset<string> = reset('')
export const authorFilterState: Reset<boolean> = reset(DEFAULT_AUTHOR_FILTER_STATE)
export const subscribedFilterState: Reset<boolean> = reset(DEFAULT_SUBSCRIBED_FILTER_STATE)
export const requestedSubscriptionFilterState: Reset<boolean> = reset(DEFAULT_REQUESTED_SUBSCRIPTION_STATE)
export const selectedChannel: Reset<ChannelInfo> = reset(null)
export const searchChannelsResults: Reset<ChannelInfo[]> = reset([])
export const selectedChannelData: Reset<ChannelData[]> = reset([])
export const selectedChannelBusy: Reset<boolean> = reset(false)
export const selectedChannelSubscriptions: Reset<Subscription[]> = reset(null)
// used for the async search that makes N background queries to get the full list of channels
export const isAsyncLoadingChannels: Reset<boolean> = reset(false)
// used to determine the subscription status of the authenticated user on the current channel
export const subscriptionStatus: Reset<SubscriptionState> = reset(undefined)
export const loadingChannel: Reset<boolean> = reset(false)
export const asymSharedKeysStorage: Reset<Map<string, string>> = persistKeyValueData('asymSharedKeys', new Map<string, string>())
let asymSharedKeyStore: Map<string, string>
asymSharedKeysStorage?.subscribe(($asks) => (asymSharedKeyStore = $asks))

let haltSearchAll = false
// used to keep track of the last search query
let searchAllHash: string

let channelFeedInterval

/**
 * Resets the state in stores to their default values
 */
export function resetStreamsState(): void {
    selectedChannelPageIndex.reset()
    channelSearchQuery.reset()
    authorFilterState.reset()
    selectedChannel.reset()
    searchChannelsResults.reset()
    selectedChannelData.reset()
    selectedChannelBusy.reset()
    selectedChannelSubscriptions.reset()
    isAsyncLoadingChannels.reset()
    loadingChannel.reset()
    asymSharedKeysStorage.reset()
    asymSharedKeyStore?.clear()
}

// Note: this is an async function that returns nothing, but fills the searchChannelsResults store.
// This is because the searchAllChannels function is called in the background, and the results are
// stored in the searchChannelsResults store.
let index = 0
export async function searchAllChannels(query: string, options?: SearchOptions): Promise<void> {
    const _search = async (_searchAllHash: string, query: string, options?: SearchOptions): Promise<void> => {
        const _isAuthorId = (query: string): boolean => query.startsWith('did:iota:')
        const newResults: ChannelInfo[] = await searchChannelsSingleRequest(query, _isAuthorId(query), {
            authorId: options?.authorId,
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
    searchByAuthorId: boolean,
    options: SearchOptions
): Promise<ChannelInfo[]> {
    let partialResults = []
    if (get(isAuthenticated)) {
        const { authorId, limit, index } = options
        const authorIdQuery = searchByAuthorId ? query : undefined
        try {
            partialResults = await channelClient.search({
                authorId: authorId ? authorId : authorIdQuery, // If set, authorId overrides searchByAuthorId
                subscriberId: authorId ? authorId : authorIdQuery,
                requestedSubscriptionId: authorId ? authorId : authorIdQuery,
                topicSource: !authorIdQuery && query ? query : undefined,
                topicType: !authorIdQuery ? query : undefined,
                name: !authorIdQuery && query ? query : undefined,
                limit: limit,
                index: index,
                ascending: false,
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

export async function getChannelInfo(channelAddress: string): Promise<ChannelInfo> {
    try {
        const channelInfo = await channelClient.info(channelAddress)
        if (!channelInfo) throw new Error()
        return channelInfo
    } catch (e: any) {
        showNotification({
            type: NotificationType.Error,
            message: `Did not find any information for channel: ${channelAddress}`,
        })
    }
}

/**
 * Reads messages of a channel
 * @param channelAddress
 * @param fetchNewMessage true for new message polling, false for pagenation
 * @param index page index
 * @param limit limit on how many messages to load
 * @returns
 */
export async function readChannelMessages(
    channelAddress: string,
    fetchNewMessage: boolean,
    index: number,
    limit?: number,
    asymSharedKey?: string
): Promise<void> {
    if (get(isAuthenticated)) {
        if (get(selectedChannelBusy)) {
            console.log('channel is busy..')
            return
        }
        try {
            const lastMessage = get(selectedChannelData)?.[0] ?? null
            const lastMessageDate = lastMessage ? new Date(lastMessage.log.created) : null
            const startDate = lastMessageDate ? new Date(lastMessageDate.setSeconds(lastMessageDate.getSeconds() + 1)) : null

            selectedChannelBusy.set(true)
            const newMessages = await channelClient.read(
                channelAddress,
                {
                    index,
                    asc: false,
                    limit: limit ?? DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
                    startDate: fetchNewMessage ? startDate : null,
                    endDate: get(selectedChannelData)?.length && fetchNewMessage ? new Date() : null,
                },
                asymSharedKey
            )
            // Append new messages infront and old messages (loaded in case of pagenation) in the back of the array to keep it sorted
            if (fetchNewMessage) {
                selectedChannelData.update((_chData) => [...newMessages, ..._chData])
            } else {
                selectedChannelData.update((_chData) => [..._chData, ...newMessages])
            }
        } catch (e: any) {
            if (e?.message?.includes('Request failed with status code 423')) {
                showNotification({
                    type: NotificationType.Error,
                    message: 'Resource is blocked by other operation.',
                })
            } else {
                showNotification({
                    type: NotificationType.Error,
                    message: 'There was an error reading channel',
                })
            }

            console.error(Error, e)
        } finally {
            selectedChannelBusy.set(false)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function readChannelHistory(channelAddress: string, presharedKey: string, type: ChannelType) {
    try {
        return await channelClient.readHistory(channelAddress, presharedKey, type)
    } catch (e: any) {
        if (e?.message?.includes('Request failed with status code 423')) {
            showNotification({
                type: NotificationType.Error,
                message: 'Resource is blocked by other operation.',
            })
        } else {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error reading the history',
            })
        }

        console.error(Error, e)
    }
}

export async function startReadingChannel(channelAddress: string, asymSharedKey?: string): Promise<void> {
    stopReadingChannel()
    if (!get(selectedChannelBusy)) {
        await readChannelMessages(channelAddress, true, 0, undefined, asymSharedKey)
    }
    channelFeedInterval = setInterval(async () => {
        await readChannelMessages(channelAddress, true, 0, undefined, asymSharedKey)
    }, FEED_INTERVAL_MS)
}

export function stopReadingChannel(resetChannelData = true): void {
    clearInterval(channelFeedInterval)
    channelFeedInterval = null
    resetChannelData ?? selectedChannelData.set([])
}

export async function requestSubscription(channelAddress: string, asymSharedKey?: string): Promise<RequestSubscriptionResponse> {
    if (get(isAuthenticated)) {
        try {
            const response: RequestSubscriptionResponse = await channelClient.requestSubscription(
                channelAddress,
                {
                    accessRights: AccessRights.ReadAndWrite,
                },
                asymSharedKey
            )
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

export async function requestUnsubscription(channelAddress: string, asymSharedKey?: string): Promise<boolean> {
    if (get(isAuthenticated)) {
        try {
            const subscription = await channelClient.findSubscription(channelAddress, get(authenticationData)?.did)
            await channelClient.revokeSubscription(channelAddress, { id: subscription.id }, asymSharedKey)
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
    channelType: ChannelType,
    id: string,
    triggerReadChannel = false
): Promise<AuthorizeSubscriptionResponse> {
    const asymSharedKey = asymSharedKeyStore
        ? asymSharedKeyStore.get(`${get(authenticatedUserDID)}-${channelAddress}`)
        : undefined

    if (channelType === ChannelType.privatePlus && !asymSharedKey) {
        showNotification({
            type: NotificationType.Error,
            message: 'Could not accept the subscription. Please unlock the channel.',
        })
        return
    }

    let authorizedResponse: AuthorizeSubscriptionResponse
    stopReadingChannel()
    try {
        const response: AuthorizeSubscriptionResponse = await channelClient.authorizeSubscription(
            channelAddress,
            {
                id,
            },
            asymSharedKey
        )
        authorizedResponse = response
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting subscription state',
        })
        console.error(Error, e)
    }
    if (triggerReadChannel) {
        startReadingChannel(channelAddress, asymSharedKey)
    }
    return authorizedResponse
}

export async function rejectSubscription(
    channelAddress: string,
    channelType: ChannelType,
    id: string,
    triggerReadChannel = false
): Promise<boolean> {
    let isRejected = false
    if (!get(isAuthenticated)) {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
        return isRejected
    }
    const asymSharedKey = asymSharedKeyStore
        ? asymSharedKeyStore.get(`${get(authenticatedUserDID)}-${channelAddress}`)
        : undefined

    if (channelType === ChannelType.privatePlus && !asymSharedKey) {
        showNotification({
            type: NotificationType.Error,
            message: 'Could not revoke the subscription. Please unlock the channel.',
        })
        return isRejected
    }

    stopReadingChannel()
    try {
        await channelClient.revokeSubscription(
            channelAddress,
            {
                id,
            },
            asymSharedKey
        )
        isRejected = true
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error getting subscription state',
        })
        console.error(Error, e)
    }
    if (triggerReadChannel) {
        startReadingChannel(channelAddress, asymSharedKey)
    }
    return isRejected
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
                : SubscriptionState.Requested
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
    triggerReadChannel = false,
    asymSharedKey?: string
): Promise<ChannelData> {
    if (get(isAuthenticated)) {
        let channelDataResponse: ChannelData
        stopReadingChannel(false)
        selectedChannelBusy.set(true)

        try {
            const response: ChannelData = await channelClient.write(
                address,
                {
                    payload,
                    publicPayload,
                    metadata,
                    type,
                },
                asymSharedKey
            )
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
            startReadingChannel(address, asymSharedKey)
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
    type: ChannelType,
    topics: { type: string; source: string }[],
    hasPresharedKey: boolean,
    hidden: boolean
): Promise<CreateChannelResponse> {
    if (get(isAuthenticated)) {
        try {
            const channel: CreateChannelResponse = await channelClient.create({
                name,
                description,
                topics,
                type,
                hasPresharedKey,
                hidden,
            })
            return channel
        } catch (e) {
            if (e?.message?.includes('409')) {
                showNotification({
                    type: NotificationType.Error,
                    message: 'The channel already exists.',
                })
            } else {
                showNotification({
                    type: NotificationType.Error,
                    message: 'There was an error creating the channel',
                })
            }
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
                    return [channel, ..._searchChannelsResults]
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

export function hasUserRequestedSubscriptionToChannel(userDID: string, channel: ChannelInfo): boolean {
    return channel?.requestedSubscriptionIds?.includes(userDID) && channel?.authorId !== userDID
}

export async function onChannelSearch(): Promise<void> {
    selectedChannelPageIndex.set(1) // reset index
    searchChannelsResults.reset()
    await searchAllChannels(get(channelSearchQuery), getChannelSearchOptions())
}

export function getChannelSearchOptions(firstLoad = false): SearchOptions {
    const authorId = get(authorFilterState) ? get(authenticatedUserDID) : undefined
    const limit = firstLoad ? WELCOME_LIST_RESULTS_NUMBER : DEFAULT_SDK_CLIENT_REQUEST_LIMIT
    return { limit, authorId }
}
