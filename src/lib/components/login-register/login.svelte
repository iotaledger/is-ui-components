<script lang="ts">
    import { authenticate } from '$lib/app/identity'
    import { Box, Icon } from '$lib/components'
    import type { IdentityJson } from 'boxfish-studio--iota-is-sdk'
    import { onMount } from 'svelte'
    import Dropzone from 'svelte-file-dropzone'
    import { Button, Spinner } from 'sveltestrap'

    export let switchToRegister
    export let onSuccess = (..._: any[]): void => {}

    let fileReader: FileReader
    let json: IdentityJson
    let file: File
    let loading: boolean = false

    onMount(() => {
        fileReader = new FileReader()
        fileReader.addEventListener('load', loadJson)
        return () => {
            fileReader.removeEventListener('load', loadJson)
        }
    })

    async function handleLogin(): Promise<void> {
        loading = true
        if (json?.doc?.id) {
            const success = await authenticate(json?.doc?.id, json?.key?.secret)
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
        json = JSON.parse(fileReader?.result?.toString())
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
        <Dropzone on:drop={handleFilesSelect}>
            <p>{file?.name ?? 'Upload a JSON file or drag and drop'}</p>
        </Dropzone>
    </div>
    <Button size="lg" block class="mt-4" color="primary" disabled={!file || loading} on:click={handleLogin}>
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