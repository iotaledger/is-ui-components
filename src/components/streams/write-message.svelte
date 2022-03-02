<script lang="ts">
    import { onDestroy } from 'svelte'
    import { Button, Label, ModalBody, ModalFooter, ModalHeader, Spinner } from 'sveltestrap'
    import Input from 'sveltestrap/src/Input.svelte'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { channelBusy, writeMessage } from './../../lib/streams'

    export let isOpen: boolean = false
    export let onModalClose: () => void = () => {}
    export let address: string

    let payload = ''
    let publicPayload = ''
    let metadata = ''
    let type = ''

    let loading = false
    let timeout: NodeJS.Timeout

    async function handleWriteMessage() {
        loading = true

        // ---- Avoid locked channel error when sending messages ----
        while ($channelBusy) {
            timeout = setTimeout(handleWriteMessage, 100)
            return
        }
        // ----------------------------------------------------------

        await writeMessage(address, payload, publicPayload, metadata, type)
        loading = false
        onModalClose()
        resetMessage()
    }

    onDestroy(() => {
        if (timeout) {
            clearTimeout(timeout)
        }
    })

    function resetMessage(): void {
        payload = ''
        publicPayload = ''
        metadata = ''
        type = ''
    }
</script>

<Modal {isOpen} toggle={onModalClose}>
    <ModalHeader toggle={onModalClose} class="px-4 pt-3">Write your message</ModalHeader>
    <ModalBody>
        <Label>Payload</Label>
        <Input
            class="p-3 mb-4"
            placeholder="Please write your message here..."
            type="textarea"
            name="text"
            bind:value={payload}
        />
        <Label>Public payload</Label>

        <Input
            class="p-3 mb-4"
            placeholder="Please write your message here..."
            type="textarea"
            name="text"
            bind:value={publicPayload}
        />
        <Label>Metadata</Label>
        <Input
            class="p-3 mb-4"
            placeholder="Please write your message here..."
            type="textarea"
            name="text"
            bind:value={metadata}
        />
        <Label>Type</Label>
        <Input class="p-3 mb-4" placeholder="Please write your message here..." type="textarea" name="text" bind:value={type} />
    </ModalBody>
    <ModalFooter>
        <Button disabled={loading || payload === ''} class="d-flex" color="primary" on:click={handleWriteMessage}>
            {loading ? 'Writing a message...' : 'Write a message'}
            {#if loading}
                <div class="ms-2">
                    <Spinner size="sm" type="border" color="light" />
                </div>
            {/if}
        </Button>
    </ModalFooter>
</Modal>
