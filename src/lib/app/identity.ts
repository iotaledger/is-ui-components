import type { CredentialTypes, IdentityJson, RevokeVerificationBody, VerifiableCredentialInternal, VerifiableCredentialJson } from 'boxfish-studio--iota-is-sdk';
import { UserType } from 'boxfish-studio--iota-is-sdk';
import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';
import { authenticationData, channelClient, identityClient } from './base';
import type { ExtendedUser } from './types/identity';
import { showNotification } from './notification';
import { NotificationType } from './types/notification'

export const searchIdentitiesResults: Writable<ExtendedUser[]> = writable([]);
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
const SEARCH_TIMEOUT = 200
const DEFAULT_LIMIT = 500

export async function searchIdentities(query: string, options?: { limit?: number }): Promise<void> {
    const _search = async (query: string, options?: { limit?: number }): Promise<void> => {
        const _isDID = (query: string): boolean => query.startsWith('did:iota:');
        const _isType = (query: string): boolean => Object.values(UserType).some(userType => userType.toLowerCase() === query.toLowerCase());

        if (_isDID(query)) {
            const identity = await searchIdentityByDID(query)
            if (identity) {

                searchIdentitiesResults.set([identity])
            }
        }

        else {
            const newResults = await searchIdentitiesSingleRequest(
                query,
                {
                    searchByType: _isType(query),
                    searchByUsername: !_isType(query),
                    limit: options?.limit ?? DEFAULT_LIMIT,
                    index,
                }
            );
            if (newResults?.length) {
                searchIdentitiesResults.update((results) => [...results, ...newResults])
            }
            // if the search is not finished, start a new search
            if ((options?.limit && (get(searchIdentitiesResults)?.length < options?.limit)) || (!options?.limit && (newResults?.length === DEFAULT_LIMIT))) {
                updateInterval = setTimeout(async () => {
                    index++
                    _search(query)
                }, SEARCH_TIMEOUT)
            }
            else {
                index = 0
                stopIdentitiesSearch()
            }
        }
    }

    stopIdentitiesSearch();

    isLoadingIdentities.set(true)
    searchIdentitiesResults.set([])
    await _search(query, options)
    isLoadingIdentities.set(false)
}

export async function searchIdentityByDID(did: string): Promise<ExtendedUser> {
    try {
        const identity: ExtendedUser = await identityClient.find(did);

        // SDK library does not return the NUMBER OF CREDENTIALS in the response, so we add it here
        if (identity?.verifiableCredentials) {
            identity.numberOfCredentials = identity.verifiableCredentials?.length ?? 0
        }
        // -----------------------------------------------------------------------------------------

        return identity
    } catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'There was an error searching for user',
        })
        console.error(Error, e);
    }
}
export async function searchIdentitiesSingleRequest(query: string, options: { searchByType?: boolean, searchByUsername?: boolean, limit: number, index: number }): Promise<ExtendedUser[]> {
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

export function stopIdentitiesSearch(): void {
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
    searchIdentitiesResults?.update((_searchIdentitiesResults) => {
        const index = _searchIdentitiesResults.findIndex((user) => user.id === identity.id)
        if (index !== -1) {
            _searchIdentitiesResults[index] = identity
        }
        return _searchIdentitiesResults
    })
}

export async function addIdentityToSearchResults(id: string): Promise<void> {
    const resuls = await searchIdentities(id)
    const identity = resuls?.[0]
    if (identity) {
        searchIdentitiesResults?.update((_searchIdentitiesResults) => {
            return [..._searchIdentitiesResults, identity]
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

