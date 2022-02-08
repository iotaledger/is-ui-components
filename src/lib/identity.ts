import { persistent } from '$lib/utils';
import type { ClientConfig, IdentityJson } from 'iota-is-sdk';
import { ApiVersion, IdentityClient, UserType } from 'iota-is-sdk';
import { derived } from 'svelte/store';

const config: ClientConfig = {
    apiKey: import.meta.env.VITE_API_KEY as string, // Deployed Integration Services API KEY
    baseUrl: import.meta.env.VITE_BASE_URL as string, // URL of the Integration Services API
    apiVersion: ApiVersion.v01
};
export const identityClient = new IdentityClient(config);

export const jwt = persistent<string>('jwt', undefined);

export const authenticated = derived(jwt, $jwt => !!$jwt);

/**
 * Authenticates the user to the api for requests where authentication is needed
 * @param id of the user to authenticate
 * @param secretKey of the user to authenticate
 */
export async function authenticate(id: string, secret: string): Promise<boolean> {
    try {
        await identityClient.authenticate(id, secret);
        jwt.set(identityClient.jwtToken)
        return true
    }
    catch (e) {
        console.error('There was an error authenticating', e)
        return false
    }
}
/**
 * Logout the current user
 * @returns void
 */
export function logout(): void {
    identityClient.jwtToken = null;
    jwt.set(undefined);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export async function register(username?: string, claimType = UserType.Person, claim?: any): Promise<IdentityJson> {
    let registeredIdentity
    try {
        registeredIdentity = await identityClient.create(
            username,
            claimType,
            claim
        );
    }
    catch (e) {
        console.error('There was an error authenticating', e)
    }
    return registeredIdentity
}