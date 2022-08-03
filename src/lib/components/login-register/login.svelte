<script lang="ts">
    import { NotificationType, showNotification } from '$lib/app'

    import { authenticate } from '$lib/app/identity'
    import { Box, Icon } from '$lib/components'
    import type { IdentityKeys } from '@iota/is-shared-modules'
    import { onMount } from 'svelte'
    import Dropzone from 'svelte-file-dropzone'
    import { Button, Spinner } from 'sveltestrap'

    export let switchToRegister = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}

    let fileReader: FileReader
    let json: IdentityKeys
    let file: File
    let loading: boolean = false
    let invalidJsonFile: boolean = false

    onMount(() => {
        fileReader = new FileReader()
        fileReader.addEventListener('load', loadJson)
        return () => {
            fileReader.removeEventListener('load', loadJson)
        }
    })

    async function handleLogin(): Promise<void> {
        loading = true
        if (invalidJsonFile || !json?.id || !json?.keys?.sign?.private) {
            showNotification({
                type: NotificationType.Error,
                message: 'Wrong identity json content. You might use an old identity trying to login.',
            })
        } else {
            const success = await authenticate(json?.id, json?.keys?.sign?.private)
            if (success) {
                onSuccess()
            }
        }
        loading = false
    }

    function handleFilesSelect(event: CustomEvent): void {
        // Only shows the last file uploaded
        file = event?.detail?.acceptedFiles[0]
        fileReader.readAsText(file)
    }

    function loadJson(): void {
        try {
            json = JSON.parse(fileReader?.result?.toString())
            invalidJsonFile = false
        } catch {
            invalidJsonFile = true
        }
    }
</script>

<Box>
    <div class="mb-4 d-flex flex-column align-items-center">
        <div class="mb-4">
            <Icon type="identity" size={48} />
        </div>
        <h1 class="mb-1">Log in with your DID</h1>
        {#if switchToRegister}
            <div>
                or
                <span class="text-primary cursor-pointer" on:click={switchToRegister}>register a new DID</span>
            </div>
        {/if}
    </div>
    <div class="w-100">
        <Dropzone on:drop={handleFilesSelect} accept="application/json">
            <p>{file?.name ?? 'Upload a JSON file or drag and drop'}</p>
        </Dropzone>
    </div>
    {#if invalidJsonFile}
        <div class="d-flex justify-content-between w-100 mt-4">
            <div>{file?.name}</div>
            <div class="text-danger ms-4">Invalid JSON file</div>
        </div>
    {/if}
    <Button size="lg" block class="mt-4" color="primary" disabled={!file || loading || invalidJsonFile} on:click={handleLogin}>
        <div class="text-center d-flex flex-row align-items-center justify-content-center">
            {#if loading}
                <div class="me-1">Processing...</div>
                <Spinner size="sm" type="border" color="light" />
            {:else}
                <div>Log in</div>
            {/if}
        </div>
    </Button>
</Box>
