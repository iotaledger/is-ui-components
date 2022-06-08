import type {
    CredentialTypes,
    IdentityJson,
    RevokeVerificationBody,
    VerifiableCredentialInternal,
    VerifiableCredentialJson,
} from '@iota/is-client'
import { UserType } from '@iota/is-client'
import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
import { authenticationData, channelClient, identityClient, isAuthenticated } from './base'
import { DEFAULT_SDK_CLIENT_REQUEST_LIMIT } from './constants/base'
import { DEFAULT_CREATOR_FILTER_STATE } from './constants/identity'
import { showNotification } from './notification'
import type { ExtendedUser } from './types/identity'
import { NotificationType } from './types/notification'

export const selectedIdentityPageIndex: Writable<number> = writable(1)
export const identitySearchQuery: Writable<string> = writable('')
export const creatorFilterState: Writable<boolean> = writable(DEFAULT_CREATOR_FILTER_STATE)
export const previousAuthenticatedIdentityUserDID: Writable<string> = writable(undefined)
export const searchIdentitiesResults: Writable<ExtendedUser[]> = writable([])
export const selectedIdentity: Writable<ExtendedUser> = writable(null)
// used for the async search that makes N background queries to get the full list of identities
export const isAsyncLoadingIdentities: Writable<boolean> = writable(false)

let haltSearchAll = false
// used to keep track of the last search query
let searchAllHash: string

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
        console.error(Error, e)
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
export async function registerIdentity(username?: string, claimType = UserType.Person, claim?: any): Promise<IdentityJson> {
    let registeredIdentity
    try {
        registeredIdentity = await identityClient.create(username, claimType, claim)
    } catch (e) {
        if (e?.message?.includes(409)) {
            showNotification({
                type: NotificationType.Error,
                message: 'The user already exists.',
            })
        } else {
            showNotification({
                type: NotificationType.Error,
                message: 'The register failed',
            })
        }
        console.error(Error, e)
    }
    return registeredIdentity
}

// Note: this is an async function that returns nothing, but fills the searchIdentitiesResults store.
// This is because the searchAllIdentities function is called in the background, and the results are
// stored in the searchIdentitiesResults store.
let index = 0
export async function searchAllIdentities(query: string, options?: { limit?: number; creator?: string }): Promise<void> {
    const _search = async (
        _searchAllHash: string,
        query: string,
        options?: { limit?: number; creator?: string }
    ): Promise<void> => {
        const _isDID = (query: string): boolean => query.startsWith('did:iota:')
        const _isType = (query: string): boolean =>
            Object.values(UserType).some((userType) => userType.toLowerCase() === query.toLowerCase())

        if (_isDID(query)) {
            const identity = await searchIdentityByDID(query)
            if (identity) {
                searchIdentitiesResults.set([identity])
            }
        } else {
            const newResults = await searchIdentitiesSingleRequest(query, {
                searchByType: _isType(query),
                searchByUsername: !_isType(query),
                creator: options?.creator,
                limit: options?.limit ?? DEFAULT_SDK_CLIENT_REQUEST_LIMIT,
                index,
            })
            // filter out old requests
            if (_searchAllHash === searchAllHash) {
                if (newResults?.length) {
                    searchIdentitiesResults.update((results) => [...results, ...newResults])
                }
                // if the search is not finished, start a new search
                if (
                    !haltSearchAll &&
                    ((options?.limit && get(searchIdentitiesResults)?.length < options?.limit) ||
                        (!options?.limit && newResults?.length === DEFAULT_SDK_CLIENT_REQUEST_LIMIT))
                ) {
                    index++
                    await _search(_searchAllHash, query)
                } else {
                    stopIdentitiesSearch()
                }
            }
        }
    }
    stopIdentitiesSearch()
    searchAllHash = `${query}-${Math.floor(Math.random() * query.length)}`
    haltSearchAll = false
    isAsyncLoadingIdentities.set(true)
    searchIdentitiesResults.set([])
    await _search(searchAllHash, query, options)
}

export async function searchIdentityByDID(did: string): Promise<ExtendedUser> {
    if (get(isAuthenticated)) {
        try {
            const identity: ExtendedUser = await identityClient.find(did)

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
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}
export async function searchIdentitiesSingleRequest(
    query: string,
    options: { searchByType?: boolean; searchByUsername?: boolean; creator?: string; limit: number; index: number }
): Promise<ExtendedUser[]> {
    let partialResults = []
    if (get(isAuthenticated)) {
        const { searchByType, searchByUsername, creator, limit, index } = options
        try {
            partialResults = await identityClient.search({
                username: searchByUsername ? query : undefined,
                type: searchByType ? query : undefined,
                limit: limit,
                creator,
                index: index,
                asc: false,
            })
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error searching for user',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return partialResults
}

export function stopIdentitiesSearch(): void {
    index = 0
    haltSearchAll = true
    isAsyncLoadingIdentities.set(false)
}

export async function createVC(
    initiatorVC: VerifiableCredentialInternal | undefined,
    targetDid: string,
    credentialType: CredentialTypes,
    claimType: UserType,
    claim?: unknown
): Promise<VerifiableCredentialJson> {
    let credential
    if (get(isAuthenticated)) {
        try {
            credential = await identityClient.createCredential(initiatorVC, targetDid, credentialType, claimType, claim)
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error creating the credential',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return credential
}

export async function revokeVC(signatureValue: RevokeVerificationBody): Promise<boolean> {
    let success
    if (get(isAuthenticated)) {
        try {
            await identityClient.revokeCredential(signatureValue)
            success = true
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error revoking the credential',
            })
            console.error(Error, e)
            success = false
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return success
}

export function updateIdentityInSearchResults(identity: ExtendedUser): void {
    searchIdentitiesResults?.update((_searchIdentitiesResults) => {
        const index = _searchIdentitiesResults.findIndex((user) => user.id === identity.id)
        if (index !== -1) {
            _searchIdentitiesResults[index] = identity
        }
        return _searchIdentitiesResults
    })
}

export async function addIdentityToSortedSearchResults(id: string): Promise<void> {
    if (get(isAuthenticated)) {
        const identity = await searchIdentityByDID(id)
        if (identity) {
            searchIdentitiesResults?.update((_searchIdentitiesResults) => {
                return [..._searchIdentitiesResults, identity].sort(
                    (a, b) => new Date(a?.registrationDate)?.getTime() - new Date(b?.registrationDate)?.getTime()
                )
            })
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
}

export async function verifyVC(json: VerifiableCredentialInternal): Promise<boolean> {
    let _isVerified
    if (get(isAuthenticated)) {
        try {
            const { isVerified } = await identityClient.checkCredential(json as VerifiableCredentialInternal)
            _isVerified = isVerified
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error verifying the credential',
            })
            console.error(Error, e)
            _isVerified = false
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return _isVerified
}

export async function getVerifiableCredentials(identityId: string): Promise<VerifiableCredentialInternal[]> {
    let credentials = []
    if (get(isAuthenticated)) {
        try {
            const identityDetails = await identityClient.find(identityId)
            credentials = identityDetails?.verifiableCredentials ?? []
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error fetching identity verifiable credentials',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return credentials
}

export async function getIdentityClaim(identityId: string): Promise<unknown> {
    let claim = {}
    if (get(isAuthenticated)) {
        try {
            const identityDetails = await identityClient.find(identityId)
            claim = identityDetails?.claim ?? {}
        } catch (e) {
            showNotification({
                type: NotificationType.Error,
                message: 'There was an error fetching identity claims',
            })
            console.error(Error, e)
        }
    } else {
        showNotification({
            type: NotificationType.Error,
            message: 'Cant perform action, user not authenticated',
        })
    }
    return claim
}
