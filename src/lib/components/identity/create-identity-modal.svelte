<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { createJsonDataUrl } from '$lib/app/utils'
    import { CreateIdentityForm } from '$lib/components'
    import type { IdentityJson } from '@iota/is-client'
    import { ModalBody, ModalFooter, ModalHeader } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let title = 'Create identity'
    export let isOpen: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES

    let registeredIdentity: IdentityJson

    function onCreateIdentitySuccess(identity: IdentityJson): void {
        registeredIdentity = identity
        onSuccess(identity)
    }
</script>

<Modal {isOpen} toggle={onModalClose}>
    <ModalHeader toggle={onModalClose} class="px-4 pt-3">{title}</ModalHeader>
    <ModalBody class="px-4 pb-4">
        <CreateIdentityForm onSuccess={onCreateIdentitySuccess} {identitiesTemplate} />
    </ModalBody>
    {#if registeredIdentity}
        <ModalFooter>
            <div class="d-flex flex-column align-items-center w-100">
                <a
                    class="mt-4 btn btn-primary btn-block w-100 btn-lg"
                    href={createJsonDataUrl(registeredIdentity)}
                    role="button"
                    download="identity.json"
                >
                    Save identity
                </a>
                <div class="mt-4">Identity created succesfully</div>
            </div>
        </ModalFooter>
    {/if}
</Modal>
