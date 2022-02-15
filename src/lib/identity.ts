import { MAXIMUM_SEARCH_RESULTS } from '$lib/constants/identity';
import { persistent } from '$lib/utils';
import type { ClientConfig, IdentityJson, VerifiableCredentialInternal } from 'iota-is-sdk';
import { ApiVersion, IdentityClient, searchCriteria, User, UserType } from 'iota-is-sdk';
import { derived } from 'svelte/store';

const config: ClientConfig = {
    apiKey: import.meta.env.VITE_API_KEY as string, // Deployed Integration Services API KEY
    baseUrl: import.meta.env.VITE_BASE_URL as string, // URL of the Integration Services API
    apiVersion: ApiVersion.v01
};
export const identityClient = new IdentityClient(config);

export const jwt = persistent<string>('jwt', null);

export const authenticated = derived(jwt, $jwt => !!$jwt);

jwt?.subscribe($jwt => {
    identityClient.jwtToken = $jwt;
})

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

export async function searchIdentities(query: string): Promise<(User & { type?: UserType | string; vc?: VerifiableCredentialInternal[] })[]> {

    const _isDID = (query: string): boolean => query.startsWith('did:iota:');
    const _isType = (query: string): boolean => Object.values(UserType).some(userType => userType.toLowerCase() === query.toLowerCase());

    let _searchResult: User[] = [];
    const searchResult: (User & { type?: UserType | string; vc?: VerifiableCredentialInternal[] })[] = [];

    if (_isDID(query)) {
        try {
            _searchResult = [await identityClient.find(query)];
        }
        catch (e) {
            console.error('There was an error searching for user', e)
        }
    } else if (_isType(query)) {
        try {
            _searchResult = await identityClient.search({
                username: undefined,
                type: query,
                limit: MAXIMUM_SEARCH_RESULTS
            } as searchCriteria)
        }
        catch (e) {
            console.error('There was an error searching for user', e)
        }
    } else {
        try {
            _searchResult = await identityClient.search({
                username: query,
                type: undefined,
                limit: MAXIMUM_SEARCH_RESULTS
            } as searchCriteria)
        }
        catch (e) {
            console.error('There was an error searching for user', e)
        }
    }

    for await (const identity of _searchResult) {
        try {
            const _userDetails = await identityClient.find(identity.id);
            searchResult.push({
                ...identity,
                type: _userDetails?.claim?.type,
                vc: _userDetails?.verifiableCredentials
            })
        }
        catch (e) {
            console.error('There was an error searching for user', e)
        }
    }
    return searchResult
}
