import { reset } from './stores'
import type { Reset } from './types/stores'

export interface SettingsStore {
    isGatewayUrl: string
    isApiKey: string
}

export const settingsStore: Reset<SettingsStore> = reset({
    isApiKey: '',
    isGatewayUrl: '',
})
