<script lang="ts">
    import { VC_TEMPLATES } from '$lib/app/constants/identity'
    import { identityClient } from '$lib/app/base'
    import { createJsonDataUrl } from '$lib/app/utils'
    import { CredentialTypes, VerifiableCredentialJson } from 'boxfish-studio--iota-is-sdk'
    import { Button, FormGroup, Input, Spinner } from 'sveltestrap'

    let targetDidId: string
    let verifiableCredential: VerifiableCredentialJson
    let inputFields = {}
    let loading = false
    let selectedTemplate = VC_TEMPLATES[0]
    let selectedCredential = CredentialTypes.BasicIdentityCredential

    $: isValid = (): boolean => {
        if (inputFields && Object.keys(inputFields).length === 0 && Object.getPrototypeOf(inputFields) === Object.prototype) {
            return false
        } else {
            for (const key in inputFields) {
                const isRequired = VC_TEMPLATES.find((field) => field.required)
                if (!targetDidId || (inputFields[key] === '' && isRequired)) {
                    return false
                }
            }
            return true
        }
    }

    const resetInputFields = () => (inputFields = {})

    const deleteEmptyAttributes = () => {
        for (const key in inputFields) {
            if (inputFields[key] === '') {
                delete inputFields[key]
            }
        }
    }
</script>

<div class="vc-box">
    <FormGroup>
        <FormGroup floating label={`Target DID id*`}>
            <Input type="text" placeholder="Target DID" bind:value={targetDidId} />
        </FormGroup>
        <Input type="select" name="select" class="mb-4" bind:value={selectedCredential}>
            {#each Object.values(CredentialTypes) as _credential}
                <option
                    value={_credential}
                    on:click={() => {
                        selectedCredential = _credential
                    }}
                >
                    {_credential}
                </option>
            {/each}
        </Input>
    </FormGroup>

    <Input type="select" name="select" bind:value={selectedTemplate} class="mb-4" on:change={resetInputFields}>
        {#each VC_TEMPLATES as template}
            <option value={template}>
                {template.name}
            </option>
        {/each}
    </Input>
    {#if selectedTemplate}
        <Input
            type={selectedTemplate.type}
            placeholder={`${selectedTemplate.name}${selectedTemplate.required ? '*' : ''}`}
            bind:value={inputFields[selectedTemplate.id]}
        />
    {/if}

    <Button
        color="primary"
        disabled={!isValid() || loading}
        class="mt-4"
        on:click={async () => {
            deleteEmptyAttributes()
            loading = true
            verifiableCredential = await identityClient.createCredential(
                undefined,
                targetDidId,
                selectedCredential,
                selectedTemplate.userType,
                inputFields
            )
            loading = false
            resetInputFields()
        }}
    >
        <div class="d-flex justify-content-between">
            {loading ? 'Creating VC...' : 'Create'}
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
