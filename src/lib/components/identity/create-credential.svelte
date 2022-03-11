<script lang="ts">
    import type { VerifiableCredentialJson } from 'boxfish-studio--iota-is-sdk'
    import { Button, FormGroup, Label, ModalBody, ModalHeader, Spinner, ModalFooter } from 'sveltestrap'
    import Input from 'sveltestrap/src/Input.svelte'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { VC_TEMPLATES } from '$lib/app/constants/identity'
    import { createVC } from '$lib/app/identity'
    import { createJsonDataUrl } from '$lib/app/utils'

    export let isOpen: boolean = false
    export let onModalClose: () => void = () => {}
    export let onSuccess: () => void = () => {}
    export let targetDid: string = undefined

    const MIN_LENGTH_INPUT = 3
    const MAX_LENGTH_INPUT = 30

    let verifiableCredential: VerifiableCredentialJson
    let inputFields = {}
    let loading = false
    let selectedTemplate = VC_TEMPLATES[0]
    let unsubscribe
    let formValidated = false
    let formContainer

    $: formContainer, manageFormSubscription()

    function manageFormSubscription() {
        if (formContainer) {
            unsubscribe = formContainer.addEventListener(
                'submit',
                function (event) {
                    if (!formContainer.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    } else {
                        handleCreateVC()
                    }
                    formValidated = true
                },
                false
            )
        } else {
            if (unsubscribe) unsubscribe()
        }
    }

    function resetFields(): void {
        selectedTemplate.fields.forEach((field) => {
            inputFields[field.id] = ''
        })
    }

    function resetCredential(): void {
        verifiableCredential = undefined
    }

    function handleInputChange(): void {
        resetFields()
        resetCredential()
    }

    // Remove empty fields
    const sanitizeInputFields = () => {
        for (const key in inputFields) {
            if (inputFields[key] === '') {
                delete inputFields[key]
            }
        }
    }

    const handleCreateVC = async () => {
        loading = true
        sanitizeInputFields()
        verifiableCredential = await createVC(
            undefined,
            targetDid,
            selectedTemplate.credentialType,
            selectedTemplate.userType,
            inputFields
        )
        if (verifiableCredential) {
            onSuccess()
            formValidated = false
        }
        resetFields()
        loading = false
    }

    function onClose() {
        resetFields()
        formValidated = false
        onModalClose()
    }
</script>

<Modal {isOpen} toggle={onClose}>
    <ModalHeader toggle={onClose} class="px-4 pt-3">Add a credential</ModalHeader>
    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalBody class="px-4 pb-4">
            <Label>Template</Label>
            <Input type="select" name="select" class="mb-4" bind:value={selectedTemplate} on:change={handleInputChange}>
                {#each VC_TEMPLATES as template}
                    <option value={template}>
                        {template.name}
                    </option>
                {/each}
            </Input>
            {#if selectedTemplate}
                <FormGroup>
                    <Label>Credential type</Label>
                    <Input type="text" bind:value={selectedTemplate.credentialType} disabled />
                </FormGroup>
                {#each selectedTemplate.fields as { id, label, type, required }}
                    <div class="mb-4">
                        <FormGroup floating {label}>
                            <Input
                                {type}
                                placeholder={label}
                                bind:value={inputFields[id]}
                                on:keydown={resetCredential}
                                {required}
                                maxlength={MAX_LENGTH_INPUT}
                                minlength={MIN_LENGTH_INPUT}
                            />
                            <div class="invalid-feedback">
                                This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than {MAX_LENGTH_INPUT}
                                characters.
                            </div>
                        </FormGroup>
                    </div>
                {/each}
            {/if}</ModalBody
        >
        <ModalFooter>
            <Button size="lg" block class="mt-4" color="primary" disabled={loading}>
                <div class="d-flex justify-content-center align-items-center">
                    {loading ? 'Creating VC...' : 'Add a new credential'}
                    {#if loading}
                        <div class="ms-2"><Spinner size="sm" type="border" color="light" /></div>
                    {/if}
                </div>
            </Button>
            {#if verifiableCredential}
                <div class="mt-4">
                    <span>Verifiable credential created. </span>
                    <a href={createJsonDataUrl(verifiableCredential)} download="vc.json">Download</a>
                </div>
            {/if}
        </ModalFooter>
    </form>
</Modal>

<style lang="scss">
    :global(.modal-header) {
        border-bottom: 0 !important;
    }
</style>
