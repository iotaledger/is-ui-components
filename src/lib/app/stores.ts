import { writable } from 'svelte/store'
import { browser } from '$app/env'
import type { Reset } from './types/stores'
import { ASYM_SHARED_KEYS } from './constants'

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

        state.subscribe(($value: any): void => {
            if ($value === undefined || $value === null) {
                localStorage.removeItem(key)
            } else if (key === ASYM_SHARED_KEYS) {
                const currentValues = new Map(JSON.parse(localStorage.getItem(key)))
                const passedValue = new Map($value)
                localStorage.setItem(key, JSON.stringify([...new Map([...currentValues, ...passedValue])]))
            } else {
                localStorage.setItem(key, JSON.stringify($value))
            }
        })

        return state
    }
}

/**
 * Persist asym-shared-keys to local storage
 */
export const persistAsymSharedKeys = (key: string, initialValue: Map<string, string>): Reset<Map<string, string>> => {
    if (browser) {
        let value: Map<string, string>
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


        state.subscribe(($value: Map<string, string>): void => {
            if ($value === undefined || $value === null) {
                localStorage.removeItem(key)
            } else {
                let currentMap = new Map<string, string>(JSON.parse(localStorage.getItem(key)))
                currentMap = new Map<string, string>([...currentMap, ...$value])
                localStorage.setItem(key, JSON.stringify([...currentMap]))
                console.log(localStorage.getItem(key))
            }
        })
        return state
    }
}
