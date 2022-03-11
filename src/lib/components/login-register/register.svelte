<script lang="ts">
    import { USERS } from '$lib/app/constants/identity'
    import { register } from '$lib/app/identity'
    import type { RegistrationUser } from '$lib/app/types/identity'
    import { Box, Icon, ToastContainer } from '$lib/components'
    import type { IdentityJson } from 'boxfish-studio--iota-is-sdk'
    import { UserType } from 'boxfish-studio--iota-is-sdk'
    import { Button, FormGroup, Input, Label, Spinner } from 'sveltestrap'
    import RegisterSuccess from './register-success.svelte'

    export let switchToLogin: () => void = () => {}

    let selectedUser: RegistrationUser
    let inputFields = {}
    let loading = false
    let registeredIdentity: IdentityJson
    let selectedUserType = UserType.Person
    let unsubscribe
    let formValidated = false
    let formContainer

    const minLengthInput = 3
    const maxLengthInput = 30

    $: selectedUser = USERS.find((user) => user.type === selectedUserType)
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

    function deleteEmptyAttributes(): void {
        for (const key in inputFields) {
            if (inputFields[key] === '') {
                delete inputFields[key]
            }
        }
    }

    async function handleRegister(): Promise<void> {
        loading = true
        deleteEmptyAttributes()
        let { username, ...claims } = inputFields
        registeredIdentity = await register(inputFields['username'], selectedUser.type, claims)
        formValidated = false

        loading = false
    }

    function resetInputFields(): void {
        inputFields = {}
    }
</script>

{#if !registeredIdentity}
    <Box>
        <div class="mb-4 d-flex flex-column align-items-center">
            <div class="mb-4">
                <Icon type="identity" size={48} />
            </div>
            <h1 class="mb-1">Register a new DID</h1>
            <div>
                or
                <span class="text-primary cursor-pointer" on:click={switchToLogin}>log in with DID</span>
            </div>
        </div>

        <div class="w-100">
            <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
                <FormGroup class="mb-4">
                    <Label class="mb-2">ID type</Label>
                    <Input
                        class="py-3 ps-3"
                        type="select"
                        name="select"
                        bind:value={selectedUserType}
                        on:change={resetInputFields}
                    >
                        {#each USERS as _user, i}
                            <option value={_user.type}>
                                {_user.type}
                            </option>
                        {/each}
                    </Input>
                </FormGroup>
                {#if selectedUser}
                    {#each selectedUser?.fields as { name, required }}
                        <FormGroup class="mb-4">
                            <Label class="text-capitalize mb-2">{name}</Label>
                            <Input
                                id={`input-${name}-${selectedUser.type}`}
                                class="py-3 ps-3"
                                placeholder={name}
                                bind:value={inputFields[name]}
                                {required}
                                maxlength={maxLengthInput}
                                minlength={minLengthInput}
                                on:keydown={() => (registeredIdentity = null)}
                            />
                            <div class="invalid-feedback">
                                This field is required and it needs to be more than {minLengthInput} characters and less than {maxLengthInput}
                                characters.
                            </div>
                        </FormGroup>
                    {/each}
                {/if}
                <Button size="lg" color="primary" block class="mt-4" disabled={loading} type="submit">
                    <div class="text-center d-flex flex-row align-items-center justify-content-center">
                        {#if loading}
                            <div class="me-1">Registering identity...</div>
                            <Spinner size="sm" type="border" color="light" />
                        {:else}
                            <div>Register a new DID</div>
                        {/if}
                    </div>
                </Button>
            </form>
        </div>
    </Box>
{:else}
    <RegisterSuccess identity={registeredIdentity} type={selectedUser.type} username={selectedUser.username} {switchToLogin} />
{/if}
