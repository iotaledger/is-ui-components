import type { ClientConfig } from 'boxfish-studio--iota-is-sdk';
import { ApiVersion, ChannelClient, IdentityClient } from 'boxfish-studio--iota-is-sdk';
import { derived } from 'svelte/store';
import { persistent } from './utils';

const config: ClientConfig = {
	apiKey: import.meta.env.VITE_API_KEY as string, // Deployed Integration Services API KEY
	baseUrl: import.meta.env.VITE_BASE_URL as string, // URL of the Integration Services API
	apiVersion: ApiVersion.v01
};

export const identityClient = new IdentityClient(config);
export const channelClient = new ChannelClient(config);

export const authenticationData = persistent<{ jwt: string; did: string }>(
	'authentication-data',
	null
);

export const isAuthenticated = derived(
	authenticationData,
	($authenticationData) => !!$authenticationData?.jwt
);

authenticationData?.subscribe(($authenticationData) => {
	identityClient.jwtToken = $authenticationData?.jwt;
	channelClient.jwtToken = $authenticationData?.jwt;
});
