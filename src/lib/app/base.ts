import type { ClientConfig } from '@iota/is-client';
import { ApiVersion, ChannelClient, IdentityClient } from '@iota/is-client';
import { derived } from 'svelte/store';
import { persistent } from './utils';
import { NotificationType } from './types/notification';

const config: ClientConfig = {
	apiKey: import.meta.env.VITE_IOTA_IS_SDK_API_KEY as string,
	isGatewayUrl: import.meta.env.VITE_IOTA_IS_SDK_GATEWAY_URL as string,
	ssiBridgeUrl: import.meta.env.VITE_IOTA_IS_SDK_SSI_BRIDGE_URL as string,
	auditTrailUrl: import.meta.env.VITE_IOTA_IS_SDK_AUDIT_TRAIL_URL as string,
	apiVersion: ApiVersion.v01
};

export const identityClient = new IdentityClient(config);
export const channelClient = new ChannelClient(config);

export const authenticationData = persistent<{ jwt: string; did: string }>(
	'authentication-data',
	null
);

export const authenticatedUserDID = derived(authenticationData, $authData => $authData?.did);

export const isAuthenticated = derived(
	authenticationData,
	($authenticationData) => !!$authenticationData?.jwt
);

authenticationData?.subscribe(($authenticationData) => {
	identityClient.jwtToken = $authenticationData?.jwt;
	channelClient.jwtToken = $authenticationData?.jwt;
});


console.log(NotificationType.Error)