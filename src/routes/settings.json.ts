import type { SettingsStore } from '../lib/app/settings'
// routes/settings.json.ts

export async function get(): Promise<{ body: SettingsStore }> {
    return {
        body: {
            isApiKey: process?.env?.IOTA_IS_SDK_API_KEY,
            isGatewayUrl: process?.env?.IOTA_IS_SDK_GATEWAY_URL,
        },
    }
}
