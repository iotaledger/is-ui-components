import { writable, type Unsubscriber, type Writable } from 'svelte/store'
import { browser } from '$app/env'
/**
 * Writable store with reset to initial value functionality
 * @param value - initial value
 * @returns writable store with reset functionality
 */
export function reset<Type>(value: Type): {
    subscribe: (...params: Parameters<typeof subscribe>) => Unsubscriber
    set: (...params: Parameters<typeof set>) => void
    update: (...params: Parameters<typeof update>) => void
    reset: () => void
} {
    const { subscribe, set, update } = writable<Type>(value)

    return {
        subscribe,
        set,
        update,
        reset: () => set(value),
    }
}

/**
 * Persist a writable Svelte store to local storage
 */
export const persistent = <T>(key: string, initialValue: T): Writable<T> => {
    if (browser) {
        let value = initialValue

        try {
            const json = localStorage.getItem(key)
            if (json) {
                value = JSON.parse(json)
            }
        } catch (err) {
            console.error(err)
        }

        const state = writable(value)

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
