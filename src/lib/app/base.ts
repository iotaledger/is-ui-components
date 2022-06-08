import { ChannelClient, IdentityClient } from '@iota/is-client'
import { derived, get } from 'svelte/store'
import { logout } from './identity'
import { showNotification } from './notification'
import { NotificationType } from './types'
import { persistent } from './utils'
import { ApiVersion } from '@iota/is-client'
import type { ClientConfig } from '@iota/is-client'

const config: ClientConfig = {
    apiKey: process.env.IOTA_IS_SDK_API_KEY as string,
    isGatewayUrl: process.env.IOTA_IS_SDK_GATEWAY_URL as string,
    apiVersion: ApiVersion.v01,
}

if (!config.apiKey || !config.isGatewayUrl) {
    throw Error('No integration service urls are configured. Please define a IOTA_IS_SDK_API_KEY and IOTA_IS_SDK_GATEWAY_URL.')
}

export const identityClient = new IdentityClient(config)
export const channelClient = new ChannelClient(config)

export const authenticationData = persistent<{ jwt: string; did: string }>('authentication-data', null)

export const authenticatedUserDID = derived(authenticationData, ($authData) => $authData?.did)

export const isAuthenticated = derived(authenticationData, ($authenticationData) => !!$authenticationData?.jwt)

authenticationData?.subscribe(($authenticationData) => {
    identityClient.jwtToken = $authenticationData?.jwt
    channelClient.jwtToken = $authenticationData?.jwt
})

export const isJwtExpired = (token: string): boolean => {
    try {
        const expiry = JSON.parse(window?.atob(token?.split('.')?.[1]))?.exp
        const now = new Date()

        return now.getTime() > expiry * 1000
    } catch (error) {
        showNotification({
            type: NotificationType.Error,
            message: 'Impossible to check JWT expiration.',
        })
        console.error('Failed to get JWT expiration status: ', error)
    }
}

let jwtExpirationCheckInterval: NodeJS.Timeout
export function startPollExpirationCheckJWT(): void {
    clearInterval(jwtExpirationCheckInterval)
    jwtExpirationCheckInterval = setInterval(() => {
        const jwt = get(authenticationData)?.jwt
        if (jwt) {
            const isJWTExpired = isJwtExpired(jwt)
            if (isJWTExpired) {
                logout()
                showNotification({
                    type: NotificationType.Error,
                    message: 'JWT expired. Please login again.',
                })
            }
        }
    }, 60000)
}

export function stopPollExpirationCheckJWT(): void {
    clearInterval(jwtExpirationCheckInterval)
}
