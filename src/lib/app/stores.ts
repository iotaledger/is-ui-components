import { writable, type Unsubscriber, type Writable } from 'svelte/store'
import { browser } from '$app/env'
import type { Reset } from './types/stores'
import type { ActionButton } from './types'
import type { ChannelData, ChannelInfo, Subscription } from '@iota/is-client'
/**
 * Writable store with reset to initial value functionality
 * @param initialValue - initial value
 * @returns writable store with reset functionality
 */
export function reset<T>(initialValue: T): Reset<T> {
    const { subscribe, set, update } = writable<T>(initialValue)

    return {
        subscribe,
        set,
        update,
        reset: () => set(initialValue),
    }
}

/**
 * Persist a writable Svelte store to local storage
 */
export const persistent = <T>(key: string, initialValue: T): Reset<T> => {
    if (browser) {
        let value: T
        const state = reset(initialValue)
        try {
            const json = localStorage.getItem(key)
            if (json) {
                value = JSON.parse(json)
            }
        } catch (err) {
            console.error(err)
        }

        state.set(value)

        state.subscribe(($value): void => {
            if ($value === undefined || $value === null) {
                localStorage.removeItem(key)
            } else {
                localStorage.setItem(key, JSON.stringify($value))
            }
        })

        return state
    }
}
