import type { ClientConfig, CredentialTypes, IdentityJson, RevokeVerificationBody, VerifiableCredentialInternal, VerifiableCredentialJson } from 'iota-is-sdk';
import { ApiVersion, IdentityClient, searchCriteria, User, UserType } from 'iota-is-sdk';
import type { Writable } from 'svelte/store';
import { derived, writable } from 'svelte/store';
import { MAXIMUM_SEARCH_RESULTS } from './constants/identity';
import type { ExtendedUser } from './types/identity';
import { persistent } from './utils';

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

export const searchResults: Writable<ExtendedUser[]> = writable([]);
export const selectedIdentity: Writable<ExtendedUser> = writable(null);

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

export async function searchIdentities(query: string): Promise<ExtendedUser[]> {

    const _isDID = (query: string): boolean => query.startsWith('did:iota:');
    const _isType = (query: string): boolean => Object.values(UserType).some(userType => userType.toLowerCase() === query.toLowerCase());

    let _searchResult: User[] = [];
    const searchResult: ExtendedUser[] = [];

    if (_isDID(query)) {
        try {
            const _identity = await identityClient.find(query);
            _searchResult.push(_identity);
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

    // TODO: remove when the endpoint is fixed to return the type
    for await (const identity of _searchResult) {
        try {
            const _userDetails = await identityClient.find(identity.id);
            searchResult.push({
                ...identity,
                type: _userDetails?.claim?.type,
                claim: _userDetails?.claim,
                verifiableCredentials: _userDetails?.verifiableCredentials ?? []
            })
        }
        catch (e) {
            console.error('There was an error searching for user', e)
        }
    }
    return searchResult
}

export async function createVC(
    initiatorVC: VerifiableCredentialInternal | undefined,
    targetDid: string,
    credentialType: CredentialTypes,
    claimType: UserType,
    claim?: any): Promise<VerifiableCredentialJson> {

    let credential
    try {
        credential = await identityClient.createCredential(
            initiatorVC,
            targetDid,
            credentialType,
            claimType,
            claim
        );
    }
    catch (e) {
        console.error('There was an error creating the credential', e)
    }
    return credential
}

export async function revokeVC(signatureValue: RevokeVerificationBody): Promise<void> {
    try {
        await identityClient.revokeCredential(signatureValue);
    }
    catch (e) {
        console.error('There was an error revoking the credential', e)
    }
}

export function updateSelectedIdentity(identity: ExtendedUser): void {
    selectedIdentity.set(identity);
    searchResults?.update(_searchResults => {
        const index = _searchResults.findIndex(user => user.id === identity.id);
        if (index !== -1) {
            _searchResults[index] = identity;
        }
        return _searchResults;
    })
}

export function updateIdentities(identity: ExtendedUser): void {
    searchResults?.update(_searchResults => {
        return [..._searchResults, identity];
    })
}
