<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { CreateIdentityForm } from '$lib/components'
    import type { IdentityJson } from '@iota/is-client'
    import { ModalBody, ModalFooter, ModalHeader } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { Icon } from '$lib/components'
    import { createJsonDataUrl } from '$lib/app/utils'

    export let title = 'Create identity'
    export let isOpen: boolean = false
    export let isCreated: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES
    export let identity: IdentityJson = undefined

    function onCreateIdentitySuccess(createdIdentity: IdentityJson): void {
        onSuccess(createdIdentity)
        identity = createdIdentity
        isCreated = true
    }
</script>

<Modal {isOpen} toggle={onModalClose}>
    <ModalHeader toggle={onModalClose} class="px-4 pt-3">{title}</ModalHeader>
    <ModalBody class="px-4 pb-3" style="overflow-y: hidden">
        <CreateIdentityForm onSuccess={onCreateIdentitySuccess} {identitiesTemplate} />
        {#if isCreated}
            <a
                class="d-flex align-items-center justify-content-center mt-4 btn btn-primary btn-block w-100 btn-lg"
                href={createJsonDataUrl(identity)}
                role="button"
                download="identity.json"
                on:click={onModalClose}
            >
                <Icon type="download" />
                <span class="ms-2">Save identity</span>
            </a>
        {/if}
    </ModalBody>
</Modal>
