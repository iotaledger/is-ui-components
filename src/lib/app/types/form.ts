import type { FieldType } from '$lib/app/types/identity'

export interface SubmitButton {
    onSubmit: (..._any) => void
    loading?: boolean
    visible: boolean
    label: string
    labelWhileLoading?: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Input = {
    tooltip?: string
    defaultState?: boolean
    disabled?: boolean
    id: string
    maxLength?: number
    minLength?: number
    name?: string
    options?: {
        label: string
        value: any
    }[]
    placeholder?: string
    required?: boolean
    type: FieldType
    onKeyDown?: (..._: any[]) => void
    onChange?: (..._: any[]) => void
}
