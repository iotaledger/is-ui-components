import type { ChannelData, ChannelInfo, CreateChannelResponse } from 'iota-is-sdk';
import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';
import { authenticationData, channelClient } from './base';
import { MAXIMUM_SEARCH_RESULTS } from './constants/streams';
import type { ExtendedChannelInfo } from './types/streams';

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
