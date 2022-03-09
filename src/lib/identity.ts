import type { CredentialTypes, IdentityJson, RevokeVerificationBody, VerifiableCredentialInternal, VerifiableCredentialJson } from 'iota-is-sdk';
import { searchCriteria, User, UserType } from 'iota-is-sdk';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { authenticationData, channelClient, identityClient } from './base';
import type { ExtendedUser } from './types/identity';
import { showNotification } from './notificacion';
import { NotificationType } from './types/notificacion'

export const searchResults: Writable<ExtendedUser[]> = writable([]);
export const selectedIdentity: Writable<ExtendedUser> = writable(null);
export const isLoadingIdentities: Writable<boolean> = writable(false);

/**
 * Authenticates the user to the api for requests where authentication is needed
 * @param id of the user to authenticate
 * @param secretKey of the user to authenticate
 */
export async function authenticate(id: string, secret: string): Promise<boolean> {
    try {
        await identityClient.authenticate(id, secret)
        await channelClient.authenticate(id, secret)
        authenticationData.set({ did: id, jwt: identityClient.jwtToken })
        return true
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'The authentication failed',
        })
        console.error(Error, e);
    }
}
/**
 * Logout the current user
 * @returns void
 */
export function logout(): void {
    authenticationData.set(undefined)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export async function register(username?: string, claimType = UserType.Person, claim?: any): Promise<IdentityJson> {
    let registeredIdentity
    try {
        registeredIdentity = await identityClient.create(username, claimType, claim)
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'The register failed',
        })
        console.error(Error, e);
    }
    return registeredIdentity
}

let updateInterval
let index = 0
const timeout = 200
const resultsPerCall = 5

export async function searchIdentities(query: string, options?: { maxResults?: number }): Promise<ExtendedUser[]> {
    const maxResults = options?.maxResults;
    const _isDID = (query: string): boolean => query.startsWith('did:iota:');
    const _isType = (query: string): boolean => Object.values(UserType).some(userType => userType.toLowerCase() === query.toLowerCase());

    let searchResult: User[] = [];

    if (maxResults) {
        try {
            searchResult = await identityClient.search({
                username: query,
                type: undefined,
                limit: maxResults,
            } as searchCriteria)
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error searching for user',
            })
            console.error(Error, e);
        }
    } else if (_isDID(query)) {
        try {
            const _identity = await identityClient.find(query);
            searchResult.push(_identity);
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error searching for user',
            })
            console.error(Error, e);
        }
    } else if (_isType(query)) {
        isLoadingIdentities.set(true)
        const newResults = await partialSearch(
            query,
            {
                searchByType: true,
                limit: resultsPerCall,
                index,
            }
        );

        if (newResults?.length) {
            searchResults.update((results) => [...results, ...newResults])

            updateInterval = setTimeout(async () => {
                searchIdentities(query)
                index++
            }, timeout)
        }
        else {
            index = 0
            stopSearch()
        }

    }
    else {
        isLoadingIdentities.set(true)
        const newResults = await partialSearch(
            query,
            {
                searchByUsername: true,
                limit: resultsPerCall,
                index,
            }
        );

        if (newResults?.length) {
            searchResults.update((results) => [...results, ...newResults])

            updateInterval = setTimeout(async () => {
                searchIdentities(query)
                index++
            }, timeout)
        }
        else {
            index = 0
            isLoadingIdentities.set(false)
            stopSearch()
        }
    }
    return searchResult
}

export async function partialSearch(query: string, options: { searchByType?: boolean, searchByUsername?: boolean, limit: number, index: number }): Promise<ExtendedUser[]> {
    let partialResults = []
    const { searchByType, searchByUsername, limit, index } = options
    try {
        partialResults = await identityClient.search({
            username: searchByUsername ? query : undefined,
            type: searchByType ? query : undefined,
            limit: limit,
            index: index
        })
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error searching for user',
        })
        console.error(Error, e);
    }
    return partialResults
}

export function stopSearch(): void {
    if (updateInterval) {
        clearTimeout(updateInterval)
    }
}

export async function createVC(
    initiatorVC: VerifiableCredentialInternal | undefined,
    targetDid: string,
    credentialType: CredentialTypes,
    claimType: UserType,
    claim?: any
): Promise<VerifiableCredentialJson> {
    let credential
    try {
        credential = await identityClient.createCredential(initiatorVC, targetDid, credentialType, claimType, claim)
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error creating the credential',
        })
        console.error(Error, e);
    }

    return credential
}

export async function revokeVC(signatureValue: RevokeVerificationBody): Promise<boolean> {
    try {
        await identityClient.revokeCredential(signatureValue)
        return true
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error revoking the credential',
        })
        console.error(Error, e);
        return false
    }
}

export function updateSelectedIdentity(identity: ExtendedUser): void {
    selectedIdentity.set(identity)
    searchResults?.update((_searchResults) => {
        const index = _searchResults.findIndex((user) => user.id === identity.id)
        if (index !== -1) {
            _searchResults[index] = identity
        }
        return _searchResults
    })
}

export async function addIdentityToSearchResults(id: string): Promise<void> {
    const resuls = await searchIdentities(id)
    const identity = resuls?.[0]
    if (identity) {
        searchResults?.update((_searchResults) => {
            return [..._searchResults, identity]
        })
    }
}

export async function verifyVC(json: VerifiableCredentialInternal): Promise<boolean> {
    try {
        const { isVerified } = await identityClient.checkCredential(json as VerifiableCredentialInternal)
        return isVerified
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error verifying the credential',
        })
        console.error(Error, e);
        return false
    }
}

export async function getVerifiableCredentials(identityId: string): Promise<VerifiableCredentialInternal[]> {
    const identityDetails = await identityClient.find(identityId)
    return identityDetails?.verifiableCredentials ?? []
}

