import type { ClientConfig } from '@iota/is-client';
import { ApiVersion, ChannelClient, IdentityClient } from '@iota/is-client';
import type { JwtPayload } from "jwt-decode";
import jwt_decode from "jwt-decode";
import { derived } from 'svelte/store';
import { logout } from './identity';
import { showNotification } from './notification';
import { NotificationType } from './types';
import { persistent } from './utils';


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
	($authenticationData) => (!!$authenticationData?.jwt && !isJwtExpired($authenticationData.jwt))
);

authenticationData?.subscribe(($authenticationData) => {
	identityClient.jwtToken = $authenticationData?.jwt;
	channelClient.jwtToken = $authenticationData?.jwt;
});

export const isJwtExpired = (token: string): boolean => {
	try {
		const expiry = jwt_decode<JwtPayload>(token)?.exp;
		const now = new Date();

		const isJwtExpired = now.getTime() > (expiry * 1000)

		//Logout if JWT is expired
		if (isJwtExpired) {
			logout()
			showNotification({
				type: NotificationType.Error,
				message: 'JWT expired. Please login again.',
			})
		}
		return isJwtExpired;
	}
	catch (error) {
		showNotification({
			type: NotificationType.Error,
			message: 'Impossible to check JWT expiration.',
		})
		console.error("Failed to get JWT expiration status: ", error)
	}
}