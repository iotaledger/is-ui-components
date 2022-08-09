<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { CreateIdentityForm } from '$lib/components'
    import type { IdentityJson, UserType } from '@iota/is-client'
    import { ModalBody, ModalHeader } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { Icon } from '$lib/components'
    import { createJsonDataUrl } from '$lib/app/utils'

    export let title = 'Create Identity'
    export let isOpen: boolean = false
    export let isCreated: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (identity: IdentityJson, username: string, userType?: UserType): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES
    export let identity: IdentityJson = undefined

    function onCreateIdentitySuccess(createdIdentity: IdentityJson, username: string, userType?: UserType): void {
        onSuccess(createdIdentity, username, userType)
        identity = createdIdentity
        isCreated = true
    }
</script>

<Modal bind:isOpen toggle={onModalClose}>
    <ModalHeader toggle={onModalClose} class="px-4 pt-3">{title}</ModalHeader>
    <ModalBody class="px-4 pb-3" style="overflow-y: hidden">
        <CreateIdentityForm onSuccess={onCreateIdentitySuccess} {identitiesTemplate} {onModalClose} />
    </ModalBody>
</Modal>
