<script lang="ts">
    import { DEFAULT_VCS_TEMPLATES } from '$lib/app/constants/identity'
    import { createVC } from '$lib/app/identity'
    import type { VerifiableCredentialTemplate } from '$lib/app/types/identity'
    import { FieldType } from '$lib/app/types/identity'
    import { createJsonDataUrl } from '$lib/app/utils'
    import { Multiselect } from '$lib/components'
    import type { VerifiableCredentialJson } from 'boxfish-studio--iota-is-sdk'
    import { Button, FormGroup, Label, ModalBody, ModalFooter, ModalHeader, Spinner } from 'sveltestrap'
    import Input from 'sveltestrap/src/Input.svelte'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let isOpen: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}
    export let credentialsTemplate: VerifiableCredentialTemplate[] = DEFAULT_VCS_TEMPLATES
    // TODO: add possibility to not use this targetDid and enable the input
    export let targetDid: string = undefined

    const MIN_LENGTH_INPUT = 3
    const MAX_LENGTH_INPUT = 30
    // Separator for the multiple string option (string array)
    const STRING_ARRAY_SEPARATOR = ','

    let verifiableCredential: VerifiableCredentialJson
    let inputFields = {}
    let loading = false
    let selectedTemplate = credentialsTemplate?.[0] ?? DEFAULT_VCS_TEMPLATES[0]
    let unsubscribe
    let formValidated = false
    let formContainer: HTMLFormElement

    $: formContainer, manageFormSubscription()

    function manageFormSubscription(): void {
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
        selectedTemplate?.fields?.forEach((field) => {
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
    function sanitizeInputFields(): void {
        for (const key in inputFields) {
            if (inputFields[key] === '') {
                delete inputFields[key]
            }
        }
    }

    async function handleCreateVC(): Promise<void> {
        loading = true
        sanitizeInputFields()
        verifiableCredential = await createVC(
            undefined,
            targetDid,
            selectedTemplate?.credentialType,
            selectedTemplate?.userType,
            inputFields
        )
        if (verifiableCredential) {
            onSuccess()
            formValidated = false
        }
        resetFields()
        loading = false
    }

    function handleInput(event: Event, fieldName: string): void {
        const target = event?.target as HTMLInputElement
        const value = target.value
        inputFields[fieldName] = value?.split(STRING_ARRAY_SEPARATOR)
    }

    function onClose(): void {
        resetFields()
        formValidated = false
        resetCredential()
        onModalClose()
    }
</script>

<Modal {isOpen} toggle={onClose}>
    <ModalHeader toggle={onClose} class="px-4 pt-3">Add a credential</ModalHeader>
    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalBody class="px-4 pb-4">
            <Label>Template *</Label>
            <Input required type="select" name="select" class="mb-4" bind:value={selectedTemplate} on:change={handleInputChange}>
                {#each credentialsTemplate as template}
                    <option value={template}>
                        {template.name}
                    </option>
                {/each}
            </Input>
            {#if selectedTemplate?.fields}
                <FormGroup>
                    <Label>Credential type</Label>
                    <Input type="text" bind:value={selectedTemplate.credentialType} disabled />
                </FormGroup>
                {#each selectedTemplate?.fields as { id, name, required, type, options }}
                    <div class="mb-4">
                        <FormGroup class="mb-4">
                            <Label class="text-capitalize mb-2">{`${name} ${required ? '*' : ''}`}</Label>
                            {#if type === FieldType.String}
                                <Input
                                    id={`input-${id}-${selectedTemplate?.id}`}
                                    class="py-3 ps-3"
                                    placeholder={`${name} ${required ? '*' : ''}`}
                                    type="text"
                                    bind:value={inputFields[id]}
                                    {required}
                                    maxlength={MAX_LENGTH_INPUT}
                                    minlength={MIN_LENGTH_INPUT}
                                    on:keydown={resetCredential}
                                />
                                <div class="invalid-feedback">
                                    This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than
                                    {MAX_LENGTH_INPUT}
                                    characters
                                </div>
                            {/if}
                            {#if type === FieldType.Email}
                                <Input
                                    id={`input-${id}-${selectedTemplate?.id}`}
                                    class="py-3 ps-3"
                                    placeholder={`${name} ${required ? '*' : ''}`}
                                    type="email"
                                    bind:value={inputFields[id]}
                                    {required}
                                    on:keydown={resetCredential}
                                />
                                <div class="invalid-feedback">Please, provide a valid email.</div>
                            {/if}
                            {#if type === FieldType.Number}
                                <Input
                                    id={`input-${id}-${selectedTemplate?.id}`}
                                    class="py-3 ps-3"
                                    placeholder={`${name} ${required ? '*' : ''}`}
                                    type="number"
                                    bind:value={inputFields[id]}
                                    {required}
                                    on:keydown={resetCredential}
                                />
                                <div class="invalid-feedback">Please, provide a valid number.</div>
                            {/if}
                            {#if type === FieldType.Date}
                                <Input
                                    id={`input-${id}-${selectedTemplate?.id}`}
                                    class="py-3 ps-3"
                                    placeholder={`${name} ${required ? '*' : ''}`}
                                    type="date"
                                    bind:value={inputFields[id]}
                                    {required}
                                    on:keydown={resetCredential}
                                />
                            {/if}
                            {#if type === FieldType.MultipleSelector}
                                <Multiselect bind:value={inputFields[id]}>
                                    {#each options as option}
                                        <option value={option}>{option}</option>
                                    {/each}
                                </Multiselect>
                            {/if}
                            {#if type === FieldType.Selector}
                                <Input
                                    id={`input-${id}-${selectedTemplate?.id}`}
                                    class="py-3 ps-3"
                                    placeholder={`${name} ${required ? '*' : ''}`}
                                    type="select"
                                    bind:value={inputFields[id]}
                                    {required}
                                    on:keydown={resetCredential}
                                >
                                    {#each options as option}
                                        <option value={option}>{option}</option>
                                    {/each}
                                </Input>
                            {/if}
                            {#if type === FieldType.StringArray}
                                <Input
                                    id={`input-${id}-${selectedTemplate?.id}`}
                                    class="py-3 ps-3"
                                    placeholder={`${name} ${required ? '*' : ''}`}
                                    {required}
                                    on:keydown={resetCredential}
                                    on:input={(e) => {
                                        handleInput(e, id)
                                    }}
                                />
                                <Label class="fst-italic text-secondary">
                                    Multiple values ​​can be chosen when separated by <span class="fst-italic fw-bold"
                                        >"{STRING_ARRAY_SEPARATOR}"</span
                                    ></Label
                                >
                            {/if}
                        </FormGroup>
                    </div>
                {/each}
            {/if}
        </ModalBody>
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
