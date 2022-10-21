import { ApiVersion, type ClientConfig } from '@iota/is-client'
import { ChannelClient, IdentityClient } from '@iota/is-client'
import { derived, get } from 'svelte/store'
import { logout } from './identity'
import { showNotification } from './notification'
import { NotificationType, UserRoles } from './types'
import type { JwtUser } from './types'
import { persistent } from './stores'

const config: ClientConfig = {
    apiKey: import.meta.env.VITE_IOTA_IS_SDK_API_KEY as string,
    isGatewayUrl: import.meta.env.VITE_IOTA_IS_SDK_GATEWAY_URL as string,
    auditTrailUrl: import.meta.env.VITE_IOTA_AUDIT_TRAIL_URL as string,
    ssiBridgeUrl: import.meta.env.VITE_IOTA_SSI_BRIDGE_URL as string,
    useGatewayUrl: (import.meta.env.VITE_IOTA_USE_GATEWAY_URL as string)?.toLowerCase() === 'true',
    apiVersionAuditTrail: ApiVersion.v0_1,
    apiVersionSsiBridge: ApiVersion.v0_2,
}

export const identityClient = new IdentityClient(config)
export const channelClient = new ChannelClient(config)

export const authenticationData = persistent<{ jwt: string; did: string }>('authentication-data', null)

export const authenticatedUserDID = derived(authenticationData, ($authData) => $authData?.did)

export const isAuthenticated = derived(authenticationData, ($authenticationData) => !!$authenticationData?.jwt)

export const authenticatedUserRole = derived(authenticationData, ($authenticationData) => getUserRole($authenticationData?.jwt))

authenticationData?.subscribe(($authenticationData) => {
    identityClient.jwtToken = $authenticationData?.jwt
    channelClient.jwtToken = $authenticationData?.jwt
})

function getUserRole(jwtToken: string): UserRoles {
    if (typeof window !== 'undefined' && window?.atob && jwtToken) {
        const payload: JwtUser = JSON.parse(window?.atob(jwtToken?.split('.')?.[1]))?.user
        return payload.role
    }
}

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
    // Check jwt expiration on pageload and every 60s
    checkExpiration()
    jwtExpirationCheckInterval = setInterval(checkExpiration, 60000)
}

function checkExpiration(): void {
    const jwt = get(authenticationData)?.jwt
    if (!jwt) return

    const isJWTExpired = isJwtExpired(jwt)
    if (isJWTExpired) {
        logout()
        showNotification({
            type: NotificationType.Error,
            message: 'JWT expired. Please login again.',
        })
    }
}

export function stopPollExpirationCheckJWT(): void {
    clearInterval(jwtExpirationCheckInterval)
}
