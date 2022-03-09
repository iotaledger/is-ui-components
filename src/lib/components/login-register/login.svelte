<script lang="ts">
    import type { IdentityJson } from 'boxfish-studio--iota-is-sdk'
    import { onMount } from 'svelte'
    import Dropzone from 'svelte-file-dropzone'
    import { Button, Spinner } from 'sveltestrap'
    import { Icon, ToastContainer } from '$lib/components'
    import { authenticate } from '$lib/app/identity'
    import Box from './box.svelte'

    export let switchToRegister: () => void = () => {}
    export let onSuccess: () => void = () => {}

    let fileReader: FileReader
    let json: IdentityJson
    let file: File
    let loading = false

    onMount(() => {
        fileReader = new FileReader()
        fileReader.addEventListener('load', loadJson)
        return () => {
            fileReader.removeEventListener('load', loadJson)
        }
    })

    const handleLogin = async () => {
        loading = true
        if (json.doc?.id) {
            const success = await authenticate(json.doc.id, json.key?.secret)
            if (success) {
                onSuccess()
            }
        }
        loading = false
    }

    const handleFilesSelect = (e) => {
        // Only shows the last file uploaded
        file = e.detail.acceptedFiles[0]
        fileReader.readAsText(file)
    }

    const loadJson = () => (json = JSON.parse(fileReader.result.toString()))
</script>

<Box>
    <div class="mb-4 d-flex flex-column align-items-center">
        <div class="mb-4">
            <Icon type="identity" size={48} />
        </div>
        <h1 class="mb-1">Log in with your DID</h1>
        <div>
            or
            <span class="text-primary cursor-pointer" on:click={switchToRegister}>register a new DID</span>
        </div>
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
<ToastContainer />
