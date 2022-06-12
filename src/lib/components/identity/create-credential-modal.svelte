<script lang="ts">
    import { DEFAULT_VCS_TEMPLATES } from '$lib/app/constants/identity'
    import { createVC } from '$lib/app/identity'
    import type { Input as InputType, SubmitButton } from '$lib/app/types/form'
    import type { VerifiableCredentialTemplate } from '$lib/app/types/identity'
    import { createJsonDataUrl } from '$lib/app/utils'
    import { Form } from '$lib/components'
    import type { VerifiableCredentialJson } from '@iota/is-client'
    import { ModalBody, ModalFooter, ModalHeader } from 'sveltestrap'
    // We have to import Input this way, otherwise it shouts SSR issues.
    import Input from 'sveltestrap/src/Input.svelte'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let isOpen: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}
    export let credentialsTemplate: VerifiableCredentialTemplate[] = DEFAULT_VCS_TEMPLATES
    // TODO: add possibility to not use this targetDid and enable the input
    export let targetDid: string = undefined

    let selectedTemplateId = credentialsTemplate?.[0].id ?? DEFAULT_VCS_TEMPLATES[0].id
    $: selectedTemplate = credentialsTemplate.find((template) => template.id === selectedTemplateId)
    let verifiableCredential: VerifiableCredentialJson = undefined
    let formLoading = false
    let formInputs: InputType[] = []
    let onSubmitButton: SubmitButton = {
        onSubmit: (formFieldsValues) => {
            handleCreateVC(formFieldsValues)
        },
        loading: false,
        label: 'Create credential',
        labelWhileLoading: 'Creating credential...',
    }

    async function handleCreateVC(formFieldsValues): Promise<void> {
        formLoading = true
        verifiableCredential = await createVC(
            undefined,
            targetDid,
            selectedTemplate?.credentialType,
            selectedTemplate?.userType,
            formFieldsValues
        )
        if (verifiableCredential) {
            onSuccess()
        }
        formLoading = false
    }

    function onClose(): void {
        onModalClose()
    }

    function onSelectedTemplateChange(): void {
        verifiableCredential = undefined
        formInputs = selectedTemplate?.fields
    }

    function updateLoading(): void {
        onSubmitButton = {
            ...onSubmitButton,
            loading: formLoading,
        }
    }

    $: selectedTemplateId, onSelectedTemplateChange()
    $: formLoading, updateLoading()
</script>

<Modal {isOpen} toggle={onClose}>
    <ModalHeader toggle={onClose} class="px-4 pt-3">Add a credential</ModalHeader>
    <ModalBody class="px-4 pb-4">
        <!-- Template selector -->
        <Input required type="select" name="select" class="mb-4" bind:value={selectedTemplateId}>
            {#each credentialsTemplate as template}
                <option value={template.id}>
                    {template.name}
                </option>
            {/each}
        </Input>

        <!-- Selected template fields form -->
        {#key selectedTemplate}
            <Form enableValidation inputs={formInputs} {onSubmitButton} />
        {/key}
    </ModalBody>

    {#if verifiableCredential}
        <ModalFooter>
            <div class="mt-4">
                <span>Verifiable credential created. </span>
                <a href={createJsonDataUrl(verifiableCredential)} download="vc.json">Download</a>
            </div>
        </ModalFooter>
    {/if}
</Modal>
