<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import { registerIdentity } from '$lib/app/identity'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { FieldType } from '$lib/app/types/identity'
    import { createJsonDataUrl } from '$lib/app/utils'
    import { Multiselect } from '$lib/components'
    import type { IdentityJson } from 'boxfish-studio--iota-is-sdk'
    import { UserType } from 'boxfish-studio--iota-is-sdk'
    import { Button, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader, Spinner } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let title = 'Create identity'
    export let isOpen: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (identity: IdentityJson): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES

    const MIN_LENGTH_INPUT = 3
    const MAX_LENGTH_INPUT = 30
    // Separator for the multiple string option (string array)
    const STRING_ARRAY_SEPARATOR = ','

    let selectedUser: IdentityTemplate
    let inputFields = {}
    let loading: boolean = false
    let registeredIdentity: IdentityJson
    let selectedUserType = identitiesTemplate?.[0]?.type ?? UserType.Person
    let unsubscribe
    let formValidated: boolean = false
    let formContainer: HTMLFormElement

    $: selectedUser = identitiesTemplate.find((user) => user.type === selectedUserType)
    $: formContainer, manageFormSubscription()

    function sanitizeInputFields(): void {
        for (const key in inputFields) {
            if (inputFields[key] === '') {
                delete inputFields[key]
            }
        }
    }

    function resetInputFields(): void {
        inputFields = {}
    }

    async function handleRegister(): Promise<void> {
        loading = true
        sanitizeInputFields()
        let { username, ...claims } = inputFields
        registeredIdentity = await registerIdentity(inputFields['username'], selectedUser?.type, claims)
        if (registeredIdentity) {
            onSuccess(registeredIdentity)
            resetInputFields()
            formValidated = false
        }
        loading = false
    }

    function manageFormSubscription() {
        if (formContainer) {
            unsubscribe = formContainer.addEventListener(
                'submit',
                function (event) {
                    if (!formContainer.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    } else {
                        handleRegister()
                    }
                    formValidated = true
                },
                false
            )
        } else {
            if (unsubscribe) unsubscribe()
        }
    }

    function handleInput(event: Event, fieldName: string): void {
        const target = event?.target as HTMLInputElement
        const value = target.value
        inputFields[fieldName] = value?.split(STRING_ARRAY_SEPARATOR)
    }

    function onClose(): void {
        resetInputFields()
        formValidated = false
        registeredIdentity = null
        onModalClose()
    }
</script>

<Modal {isOpen} toggle={onClose}>
    <ModalHeader toggle={onClose} class="px-4 pt-3">{title}</ModalHeader>
    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalBody class="px-4 pb-4">
            <FormGroup class="mb-4">
                <Label class="mb-2">ID type *</Label>
                <Input
                    class="py-3 ps-3"
                    type="select"
                    name="select"
                    bind:value={selectedUserType}
                    on:change={resetInputFields}
                    required
                >
                    {#each identitiesTemplate as _user}
                        <option value={_user.type}>
                            {_user.type}
                        </option>
                    {/each}
                </Input>
            </FormGroup>
            {#if selectedUser?.fields}
                {#each selectedUser?.fields as { id, name, required, type, options }}
                    <FormGroup class="mb-4">
                        <Label class="text-capitalize mb-2">{`${name} ${required ? '*' : ''}`}</Label>
                        {#if type === FieldType.String}
                            <Input
                                id={`input-${id}-${selectedUser?.type}`}
                                class="py-3 ps-3"
                                placeholder={`${name} ${required ? '*' : ''}`}
                                type="text"
                                bind:value={inputFields[id]}
                                {required}
                                maxlength={MAX_LENGTH_INPUT}
                                minlength={MIN_LENGTH_INPUT}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
                            />
                            <div class="invalid-feedback">
                                This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than {MAX_LENGTH_INPUT}
                                characters
                            </div>
                        {/if}
                        {#if type === FieldType.Email}
                            <Input
                                id={`input-${id}-${selectedUser?.type}`}
                                class="py-3 ps-3"
                                placeholder={`${name} ${required ? '*' : ''}`}
                                type="email"
                                bind:value={inputFields[id]}
                                {required}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
                            />
                            <div class="invalid-feedback">Please, provide a valid email.</div>
                        {/if}
                        {#if type === FieldType.Number}
                            <Input
                                id={`input-${id}-${selectedUser?.type}`}
                                class="py-3 ps-3"
                                placeholder={`${name} ${required ? '*' : ''}`}
                                type="number"
                                bind:value={inputFields[id]}
                                {required}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
                            />
                            <div class="invalid-feedback">Please, provide a valid number.</div>
                        {/if}
                        {#if type === FieldType.Date}
                            <Input
                                id={`input-${id}-${selectedUser?.type}`}
                                class="py-3 ps-3"
                                placeholder={`${name} ${required ? '*' : ''}`}
                                type="date"
                                bind:value={inputFields[id]}
                                {required}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
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
                                id={`input-${id}-${selectedUser?.type}`}
                                class="py-3 ps-3"
                                placeholder={`${name} ${required ? '*' : ''}`}
                                type="select"
                                bind:value={inputFields[id]}
                                {required}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
                            >
                                {#each options as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            </Input>
                        {/if}
                        {#if type === FieldType.StringArray}
                            <Input
                                id={`input-${id}-${selectedUser?.type}`}
                                class="py-3 ps-3"
                                placeholder={`${name} ${required ? '*' : ''}`}
                                {required}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
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
                {/each}
            {/if}
        </ModalBody>
        <ModalFooter>
            <Button size="lg" color="primary" block class="mt-4" disabled={loading} type="submit"
                ><div class="d-flex justify-content-center align-items-center">
                    {loading ? 'Creating...' : 'Create identity'}
                    {#if loading}
                        <div class="ms-2"><Spinner size="sm" type="border" color="light" /></div>
                    {/if}
                </div>
            </Button>

            {#if registeredIdentity}
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
            {/if}
        </ModalFooter>
    </form>
</Modal>
