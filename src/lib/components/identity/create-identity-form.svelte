<script lang="ts">
    import { DEFAULT_IDENTITIES_TEMPLATES } from '$lib/app/constants/identity'
    import { registerIdentity } from '$lib/app/identity'
    import type { Input as InputType, SubmitButton } from '$lib/app/types/form'
    import type { IdentityTemplate } from '$lib/app/types/identity'
    import { Form } from '$lib/components'
    import type { IdentityJson, UserType } from '@iota/is-client'
    import { Input, Label } from 'sveltestrap'

    export let onSuccess = (identity: IdentityJson, username: string, userType?: UserType): void => {}
    export let identitiesTemplate: IdentityTemplate[] = DEFAULT_IDENTITIES_TEMPLATES

    let registeredIdentity: IdentityJson
    let selectedTemplate: IdentityTemplate = identitiesTemplate?.[0]

    let formLoading = false
    let formInputs: InputType[] = []
    let onSubmitButton: SubmitButton = {
        onSubmit: (formFieldsValues) => {
            handleRegister(formFieldsValues)
        },
        visible: true,
        loading: false,
        label: 'Create identity',
        labelWhileLoading: 'Creating identity...',
    }

    async function handleRegister(formFieldsValues): Promise<void> {
        formLoading = true
        const { username, hidden, ...claim } = formFieldsValues
        registeredIdentity = await registerIdentity(hidden, username, selectedTemplate?.type, claim)
        if (registeredIdentity) {
            onSuccess(registeredIdentity, selectedTemplate?.type, username)
            onSubmitButton = {
                ...onSubmitButton,
                visible: false,
            }
        }
        formLoading = false
    }

    function onSelectedTemplateChange(): void {
        registeredIdentity = undefined
        formInputs = selectedTemplate?.fields
    }

    function updateLoading(): void {
        onSubmitButton = {
            ...onSubmitButton,
            loading: formLoading,
        }
    }

    $: selectedTemplate, onSelectedTemplateChange()
    $: formLoading, updateLoading()
</script>

<!-- Template selector -->
<Label class="mb-2">Identity template</Label>
<Input required type="select" name="select" class="mb-1" bind:value={selectedTemplate}>
    {#each identitiesTemplate as _user}
        <option value={_user}>
            {_user.type}
        </option>
    {/each}
</Input>

<!-- Selected template fields form -->
{#key selectedTemplate}
    <Form enableValidation inputs={formInputs} {onSubmitButton} />
{/key}
