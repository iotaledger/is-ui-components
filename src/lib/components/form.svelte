<script lang="ts">
    import { FieldType } from '$lib/app'
    import type { Input as InputType, SubmitButton } from '$lib/app/types/form'
    import { Multiselect } from '$lib/components'
    import { Button, FormGroup, Label, Spinner } from 'sveltestrap'
    import Input from 'sveltestrap/src/Input.svelte'

    export let enableValidation: boolean = false
    export let inputs: InputType[]
    export let onSubmitButton: SubmitButton

    let inputFields = {}
    let unsubscribe
    let formValidated: boolean = false
    let formContainer: HTMLFormElement

    // In case of an input that allows multiple values in a same text input area, we need a separator to split the values.
    const STRING_ARRAY_SEPARATOR: string = ','

    async function onSubmit(): Promise<void> {
        sanitizeInputFields()
        onSubmitButton?.onSubmit(inputFields)
    }

    function sanitizeInputFields(): void {
        for (const key in inputFields) {
            if (inputFields[key] === '') {
                delete inputFields[key]
            }
        }
    }

    function manageFormSubscription() {
        if (formContainer) {
            unsubscribe = formContainer.addEventListener(
                'submit',
                function (event) {
                    if (enableValidation && !formContainer.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    } else {
                        onSubmit()
                    }
                    formValidated = true
                },
                false
            )
        } else {
            if (unsubscribe) unsubscribe()
        }
    }

    function onStringArrayInput(event: Event, fieldName: string): void {
        const target = event?.target as HTMLInputElement
        const value = target.value
        inputFields[fieldName] = value?.split(STRING_ARRAY_SEPARATOR)
    }

    function getHTMLInputType(type: FieldType): string {
        if (type === FieldType.StringArray) {
            return 'text'
        } else if (type === FieldType.Selector) {
            return 'select'
        }
        return type
    }

    $: formContainer, manageFormSubscription()
</script>

<form class:was-validated={enableValidation && formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
    <div class="overflow-content">
        {#each inputs as input}
            <FormGroup class="mb-4">
                <Label class="mb-2">{input?.name}</Label>
                {#if input?.type === FieldType.MultipleSelector}
                    <Multiselect bind:value={inputFields[input?.id]}>
                        {#each input?.options as { label, value }}
                            <option {value}>{label}</option>
                        {/each}
                    </Multiselect>
                {:else}
                    <Input
                        id={`input-${input?.id}`}
                        class="py-3 ps-3"
                        placeholder={`${input?.name} ${input?.required ? '*' : ''}`}
                        type={getHTMLInputType(input?.type)}
                        bind:value={inputFields[input?.id]}
                        required={input?.required}
                        minlength={input?.minLength}
                        maxlength={input?.maxLength}
                        on:keydown={input?.onKeyDown}
                        on:input={(event) => {
                            if (input?.type === FieldType.StringArray) {
                                onStringArrayInput(event, input?.id)
                            }
                        }}
                    >
                        {#if input?.type === FieldType.Selector}
                            {#each input?.options as { value, label }}
                                <option {value}>{label}</option>
                            {/each}
                        {/if}
                    </Input>
                    <div class="invalid-feedback">
                        {#if !inputFields[input?.id]?.length}
                            This field is required
                        {:else if input?.maxLength && inputFields[input?.id]?.length > input?.maxLength}
                            This field must be at most {input?.maxLength} characters long
                        {:else if input?.minLength && inputFields[input?.id]?.length < input?.minLength}
                            This field must be at least {input?.minLength} characters long
                        {:else}
                            This field is invalid
                        {/if}
                    </div>
                    {#if input?.type === FieldType.StringArray && inputFields[input?.id]?.length > 0}
                        <Label class="fst-italic text-secondary">
                            Multiple values ​​can be chosen when separated by <span class="fst-italic fw-bold"
                                >"{STRING_ARRAY_SEPARATOR}"</span
                            >
                        </Label>
                    {/if}
                {/if}
            </FormGroup>
        {/each}
    </div>
    <Button size="lg" color="primary" block class="mt-4" disabled={onSubmitButton?.loading} type="submit"
        ><div class="d-flex justify-content-center align-items-center">
            {onSubmitButton?.loading ? onSubmitButton?.labelWhileLoading : onSubmitButton?.label}
            {#if onSubmitButton?.loading}
                <div class="ms-2"><Spinner size="sm" type="border" color="light" /></div>
            {/if}
        </div>
    </Button>
</form>

<style lang="scss">
    .overflow-content{
        max-height: 35vh;
        overflow-y: scroll;
    }
</style>