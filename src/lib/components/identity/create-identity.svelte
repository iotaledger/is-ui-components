<script lang="ts">
    import { USERS } from '$lib/app/constants/identity'
    import { register } from '$lib/app/identity'
    import type { IUser } from '$lib/app/types/identity'
    import { FieldType } from '$lib/app/types/identity'
    import { createJsonDataUrl } from '$lib/app/utils'
    import type { IdentityJson } from 'boxfish-studio--iota-is-sdk'
    import { UserType } from 'boxfish-studio--iota-is-sdk'
    import { Button, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader, Spinner } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import Multiselect from '../multiselect.svelte'

    export let isOpen: boolean = false
    export let onModalClose: () => void = () => {}
    export let onSuccess: (id: string) => void = () => {}

    let selectedUser: IUser
    let inputFields = {}
    let loading = false
    let registeredIdentity: IdentityJson
    let selectedUserType = UserType.Person
    let unsubscribe
    let formValidated = false
    let formContainer

    const minLengthInput = 3
    const maxLengthInput = 30
    // Separator for the multiple string option (string array)
    const STRING_ARRAY_SEPARATOR = ','

    $: selectedUser = USERS.find((user) => user.type === selectedUserType)
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
        registeredIdentity = await register(inputFields['username'], selectedUser.type, claims)
        if (registeredIdentity) {
            onSuccess(registeredIdentity?.doc?.id)
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

    function handleInput(e: Event, fieldName: string): void {
        const target = e.target as HTMLInputElement
        const value = target.value
        inputFields[fieldName] = value.split(STRING_ARRAY_SEPARATOR)
    }

    function onClose() {
        resetInputFields()
        formValidated = false
        onModalClose()
    }
</script>

<Modal {isOpen} toggle={onClose}>
    <ModalHeader toggle={onClose} class="px-4 pt-3">Create identity</ModalHeader>
    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalBody class="px-4 pb-4">
            <FormGroup class="mb-4">
                <Label class="mb-2">ID type</Label>
                <Input class="py-3 ps-3" type="select" name="select" bind:value={selectedUserType} on:change={resetInputFields}>
                    {#each USERS as _user}
                        <option value={_user.type}>
                            {_user.type}
                        </option>
                    {/each}
                </Input>
            </FormGroup>
            {#if selectedUser}
                {#each selectedUser?.fields as { id, name, required, type, options }}
                    <FormGroup class="mb-4">
                        <Label class="text-capitalize mb-2">{name}</Label>
                        {#if type === FieldType.String}
                            <Input
                                id={`input-${id}-${selectedUser.type}`}
                                class="py-3 ps-3"
                                placeholder={name}
                                type="text"
                                bind:value={inputFields[id]}
                                {required}
                                maxlength={maxLengthInput}
                                minlength={minLengthInput}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
                            />
                            <div class="invalid-feedback">
                                This field is required and it needs to be more than {minLengthInput} characters and less than {maxLengthInput}
                                characters
                            </div>
                        {/if}
                        {#if type === FieldType.Email}
                            <Input
                                id={`input-${id}-${selectedUser.type}`}
                                class="py-3 ps-3"
                                placeholder={name}
                                type="email"
                                bind:value={inputFields[id]}
                                {required}
                                on:keydown={() => {
                                    registeredIdentity = null
                                }}
                            />
                            <div class="invalid-feedback">Please, provide a valid email.</div>
                        {/if}
                        {#if type === FieldType.Date}
                            <Input
                                id={`input-${id}-${selectedUser.type}`}
                                class="py-3 ps-3"
                                placeholder={name}
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
                        {#if type === FieldType.StringArray}
                            <Input
                                id={`input-${id}-${selectedUser.type}`}
                                class="py-3 ps-3"
                                placeholder={name}
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
            {/if}</ModalBody
        >
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
