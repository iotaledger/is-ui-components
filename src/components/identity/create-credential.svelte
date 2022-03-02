<script lang="ts">
    import type { VerifiableCredentialJson } from 'iota-is-sdk'
    import { Button, FormGroup, Input, Label, ModalBody, ModalHeader, Spinner } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { VC_TEMPLATES } from './../../lib/constants/identity'
    import { createVC } from './../../lib/identity'
    import { createJsonDataUrl } from './../../lib/utils'

    export let isOpen: boolean = false
    export let onModalClose: () => void = () => {}
    export let onSuccess: () => void = () => {}
    export let targetDid: string = undefined

    let verifiableCredential: VerifiableCredentialJson
    let inputFields = {}
    let loading = false
    let selectedTemplate = VC_TEMPLATES[0]
    let isValid = false

    $: inputFields, validate()

    function validate(): void {
        isValid = true
        if (inputFields && Object.keys(inputFields).length === 0 && Object.getPrototypeOf(inputFields) === Object.prototype) {
            isValid = false
        } else {
            selectedTemplate?.fields?.forEach((field) => {
                if (field.required && (inputFields[field.id] === '' || !inputFields[field.id])) {
                    isValid = false
                }
            })
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
        }
        resetFields()
        loading = false
    }
</script>

<Modal {isOpen} toggle={onModalClose}>
    <ModalHeader toggle={onModalClose} class="px-4 pt-3">Add a credential</ModalHeader>
    <ModalBody class="px-4 pb-4">
        <div>
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
                        <FormGroup floating label={`${label}${required ? '*' : ''}`}>
                            <Input
                                {type}
                                placeholder={`${label}${required ? '*' : ''}`}
                                bind:value={inputFields[id]}
                                on:keydown={resetCredential}
                            />
                        </FormGroup>
                    </div>
                {/each}
            {/if}

            <Button size="lg" block class="mt-4" color="primary" disabled={!isValid || loading} on:click={handleCreateVC}>
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
        </div>
    </ModalBody>
</Modal>

<style lang="scss">
    :global(.modal-header) {
        border-bottom: 0 !important;
    }
</style>
