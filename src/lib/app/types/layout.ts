import type { Color } from "sveltestrap/src/shared";

export enum Size {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ActionButton = {
    label: string,
    onClick: (..._: any[]) => void,
    icon?: string,
    color?: Color,
    disabled?: boolean,
    loading?: boolean,
}

