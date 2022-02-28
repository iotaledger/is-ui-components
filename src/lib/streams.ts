import type { CreateChannelResponse } from 'iota-is-sdk';
import { AccessRights, ChannelData, ChannelInfo, RequestSubscriptionResponse, Subscription } from 'iota-is-sdk';
import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';
import { authenticationData, channelClient } from './base';
import { MAXIMUM_SEARCH_RESULTS } from './constants/streams';
import type { ExtendedChannelInfo } from './types/streams';
import { SubscriptionState } from './types/streams';

export const selectedChannel: Writable<ExtendedChannelInfo> = writable(null);
export const searchResults: Writable<ExtendedChannelInfo[]> = writable([]);
export const channelData: Writable<ChannelData[]> = writable([]);
export const channelBusy = writable(false);

const userDid = get(authenticationData)?.did

// TODO: Improve search algorithm, now it is searching only by author id or topic type
export async function searchChannels(
    query: string,
    onlyOwnedSubscribedChannels = false
): Promise<ExtendedChannelInfo[]> {
    const _isAuthorId = (query: string): boolean => query.startsWith('did:iota:');

    let _searchResult: ChannelInfo[] = [];
    let searchResult: ExtendedChannelInfo[] = [];

    if (_isAuthorId(query)) {
        try {
            _searchResult = await channelClient.search({
                authorId: query,
                limit: MAXIMUM_SEARCH_RESULTS
            });
        } catch (e) {
            console.error('There was an error searching for channel', e);
        }
    } else {
        try {
            _searchResult = await channelClient.search({
                topicSource: query?.length ? query : undefined,
                limit: MAXIMUM_SEARCH_RESULTS
            });
        } catch (e) {
            console.error('There was an error searching for channel', e);
        }
    }

    const userDid = get(authenticationData)?.did;

    // Add to channel if the user logged is owner/subscriber of a channel
    for (const channel of _searchResult) {
        const authorId = channel.authorId;
        searchResult.push({
            ...channel,
            isOwner: authorId === userDid,
            isSubscriber: channel.subscriberIds.includes(userDid)
        });
    }
    if (onlyOwnedSubscribedChannels) {
        searchResult = searchResult.filter((channel) => channel.isOwner || channel.isSubscriber);
    }

    return searchResult;
}

let timeout = 1000;
let updateTimer;

export async function readChannel(channelAddress: string, force = false): Promise<void> {
    if (force) {
        try {
            channelBusy.set(true);
            const _channelData = await channelClient.read(channelAddress);
            channelData.set(_channelData);
            channelBusy.set(false);
        } catch (e) {
            console.error('There was an error reading channel', e);
        }
    } else {
        if (get(channelData)?.length) {
            const lastMessage = get(channelData)?.[0];
            const lastMessageDate = new Date(lastMessage.log.created);

            const startDate = new Date(lastMessageDate.setSeconds(lastMessageDate.getSeconds() + 1));

            try {
                channelBusy.set(true);
                const newMessages = await channelClient.read(channelAddress, {
                    startDate,
                    endDate: new Date()
                });
                channelBusy.set(false);
                channelData.update((_chData) => [...newMessages, ..._chData]);
                if (newMessages?.length) {
                    timeout = 100;
                }
            } catch (e) {
                console.error('There was an error reading channel', e);
            }
        } else if (timeout < 10000) {
            timeout += 1000;
        }
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
    }
    updateTimer = setTimeout(async () => readChannel(channelAddress), timeout);
}

export function stopData(): void {
    if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = undefined;
        channelData.set([]);
    }
}

export async function requestSubscription(channelAddress: string): Promise<RequestSubscriptionResponse> {
    try {
        const resp = await channelClient.requestSubscription(channelAddress, { accessRights: AccessRights.ReadAndWrite });
        return resp;
    }
    catch (e) {
        console.error('There was an error requesting subscription to channel', e)
    }
}


export async function requestUnsubscription(channelAddress: string): Promise<void> {
    try {
        const subscription = await channelClient.findSubscription(channelAddress, get(authenticationData)?.did);
        await channelClient.removeSubscription(channelAddress, subscription.id);
    }
    catch (e) {
        console.error('There was an error requesting unsubscription to channel', e)
    }
}

export async function acceptSubscription(channelAddress: string, id: string): Promise<void> {
    try {
        await channelClient.authorizeSubscription(channelAddress, {
            id
        })
    }
    catch (e) {
        console.error('There was an error getting subscription state', e)
    }
}

export async function getPendingSubscriptions(channelAddress: string): Promise<Subscription[]> {
    try {
        const allSubscriptions = await channelClient.findAllSubscriptions(channelAddress);
        const pendingSubscriptions = allSubscriptions.filter((s) => !s.isAuthorized);
        return pendingSubscriptions;
    }
    catch (e) {
        console.error('There was an error getting all subscriptions', e)
    }
}

export async function getSubscriptionStatus(channelAddress: string): Promise<SubscriptionState> {
    try {
        const allSubscriptions = await channelClient.findAllSubscriptions(channelAddress);
        const subscription = allSubscriptions.find((sub) => sub.id === get(authenticationData)?.did);
        if (subscription) {
            const isAuthorized = subscription.isAuthorized;
            return isAuthorized ? SubscriptionState.Subscribed : SubscriptionState.Pending
        } else {
            return SubscriptionState.Unsubscribed
        }
    }
    catch (e) {
        console.error('There was an error getting subscription state', e)
    }
}

export async function writeMessage(address: string, log: string): Promise<void> {
    try {
        await channelClient.write(address, {
            payload: {
                log
            }
        });
    } catch (e) {
        console.error('There was an error writing message in channel', e);
    }
}

export async function createChannel(topics: { type: string, source: string }[]): Promise<CreateChannelResponse> {
    let channel: CreateChannelResponse;

    try {
        channel = await channelClient.create({
            topics
        });
    }
    catch (e) {
        console.error('There was an error searching for channel', e)
    }
    return channel
}

export async function addChannelToSearchResults(channelAddress: string): Promise<void> {
    let channel: ExtendedChannelInfo = await channelClient.info(channelAddress);

    if (channel) {
        const authorId = channel.authorId;

        channel = {
            ...channel, isOwner: authorId === userDid,
            isSubscriber: channel.subscriberIds.includes(userDid)
        }
        searchResults?.update(_searchResults => {
            return [..._searchResults, channel];
        })
    }
}
