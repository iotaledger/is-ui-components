import type { Writable } from 'svelte/store'

/** Reset interface for updating, subscribing and resetting. */
export interface Reset<T> extends Writable<T> {
    /**
     * Resets the value to initial value
     */
    reset(): void
}
