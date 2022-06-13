<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { CreateIdentityForm } from '$lib/components'
    import type { IdentityJson } from '@iota/is-client'
    import { ModalBody, ModalHeader } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let title = 'Create identity'
    export let isOpen: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES

    function onCreateIdentitySuccess(identity: IdentityJson): void {
        onSuccess(identity)
    }
</script>

<Modal {isOpen} toggle={onModalClose}>
    <ModalHeader toggle={onModalClose} class="px-4 pt-3">{title}</ModalHeader>
    <ModalBody class="px-4 pb-3" style="overflow-y: hidden">
        <CreateIdentityForm onSuccess={onCreateIdentitySuccess} {identitiesTemplate} />
    </ModalBody>
</Modal>
