<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { RegisterSuccess } from '$lib/components'
    import type { IdentityJson, UserType } from '@iota/is-client'
    import CreateIdentityModal from '../identity/create-identity-modal.svelte'

    export let switchToLogin = (..._: any[]): void => {}
    export let onSuccess = (identity: IdentityJson): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES
    export let isCreateIdentityModalOpen: boolean = true

    let identity: IdentityJson
    let userType: UserType
    let username: string

    async function onIdentityCreatedSuccess(_identity: IdentityJson, _userType: UserType, _username: string): Promise<void> {
        isCreateIdentityModalOpen = false
        identity = _identity
        userType = _userType
        username = _username
        onSuccess(_identity)
    }

    function closeCreateIdentityModal(): void {
        isCreateIdentityModalOpen = false
        switchToLogin()
    }
</script>

<CreateIdentityModal
    onSuccess={onIdentityCreatedSuccess}
    {identitiesTemplate}
    onModalClose={closeCreateIdentityModal}
    bind:isOpen={isCreateIdentityModalOpen}
/>
{#if identity}
    <RegisterSuccess {identity} type={userType} {username} {switchToLogin} />
{/if}
