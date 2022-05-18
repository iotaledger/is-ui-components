import type { Writable } from 'svelte/store'
import type { Color } from 'sveltestrap/src/shared'
import type { IdentityFilter, StreamsFilter } from '.'

export enum Size {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ActionButton = {
    label: string
    onClick: (..._: any[]) => void
    icon?: string
    color?: Color
    disabled?: boolean
    loading?: boolean
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type FilterCheckbox = {
    label: string
    onChange: (..._: any[]) => void
    name: string 
}
