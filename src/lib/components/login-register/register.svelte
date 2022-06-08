<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { Box, Icon, RegisterSuccess } from '$lib/components'
    import type { IdentityJson, UserType } from '@iota/is-client'
    import CreateIdentityForm from '../identity/create-identity-form.svelte'

    export let switchToLogin = (..._: any[]): void => {}
    export let onSuccess = (identity: IdentityJson): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES

    let identity: IdentityJson
    let userType: UserType
    let username: string

    async function onIdentityCreatedSuccess(_identity: IdentityJson, _userType: UserType, _username: string): Promise<void> {
        identity = _identity
        userType = _userType
        username = _username
        onSuccess(_identity)
    }
</script>

{#if !identity}
    <Box>
        <div class="mb-4 d-flex flex-column align-items-center">
            <div class="mb-4">
                <Icon type="identity" size={48} />
            </div>
            <h1 class="mb-1">Register a new DID</h1>
            <div>
                or
                <span class="text-primary cursor-pointer" on:click={switchToLogin}>log in with DID</span>
            </div>
        </div>

        <div class="w-100">
            <CreateIdentityForm onSuccess={onIdentityCreatedSuccess} {identitiesTemplate} />
        </div>
    </Box>
{:else}
    <RegisterSuccess {identity} type={userType} {username} {switchToLogin} />
{/if}
