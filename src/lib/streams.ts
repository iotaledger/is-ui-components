import type { ChannelInfo, CreateChannelResponse } from 'iota-is-sdk';
import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';
import { channelClient, authenticationData } from './base';
import type { ExtendedChannelInfo } from './types/streams';

export const searchResults: Writable<ExtendedChannelInfo[]> = writable([]);

const MAXIMUM_SEARCH_RESULTS = 100

const userDid = get(authenticationData)?.did

// TODO: Improve search algorithm, now it is searching only by author id or topic type
export async function searchChannels(query: string, onlyOwnedSubscribedChannels = false): Promise<ExtendedChannelInfo[]> {
    const _isAuthorId = (query: string): boolean => query.startsWith('did:iota:');

    let _searchResult: ChannelInfo[] = [];
    let searchResult: ExtendedChannelInfo[] = [];

    if (_isAuthorId(query)) {
        try {
            _searchResult = await channelClient.search({
                authorId: query,
                limit: MAXIMUM_SEARCH_RESULTS
            });
        }
        catch (e) {
            console.error('There was an error searching for channel', e)
        }
    }
    else {
        try {
            _searchResult = await channelClient.search({
                topicType: query?.length ? query : undefined,
                limit: MAXIMUM_SEARCH_RESULTS
            });
        }
        catch (e) {
            console.error('There was an error searching for channel', e)
        }
    }

    // Add to channel if the user logged is owner/subscriber of a channel
    for (const channel of _searchResult) {
        const authorId = channel.authorId;
        searchResult.push({
            ...channel,
            isOwner: authorId === userDid,
            isSubscriber: channel.subscriberIds.includes(userDid)
        })
    }

    if (onlyOwnedSubscribedChannels) {
        searchResult = searchResult.filter((channel) => channel.isOwner || channel.isSubscriber)
    }

    return searchResult
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
