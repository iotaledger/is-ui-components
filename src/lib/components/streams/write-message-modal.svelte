<script lang="ts">
    import { channelBusy, writeMessage } from '$lib/app/streams'
    import { onDestroy } from 'svelte'
    import { Button, Label, ModalBody, ModalFooter, ModalHeader, Spinner } from 'sveltestrap'
    import Input from 'sveltestrap/src/Input.svelte'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let isOpen: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let address: string

    const MAX_LENGTH_TEXTAREA = 100
    const MIN_LENGTH_TEXTAREA = 3

    let payload = ''
    let publicPayload = ''
    let metadata = ''
    let type = ''
    let loading: boolean = false
    let timeout: NodeJS.Timeout
    let unsubscribe
    let formValidated: boolean = false
    let formContainer: HTMLFormElement

    $: formContainer, manageFormSubscription()

    onDestroy(() => {
        if (timeout) {
            clearTimeout(timeout)
        }
    })

    function manageFormSubscription(): void {
        if (formContainer) {
            unsubscribe = formContainer.addEventListener(
                'submit',
                function (event) {
                    if (!formContainer.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    } else {
                        handleWriteMessage()
                    }
                    formValidated = true
                },
                false
            )
        } else {
            if (unsubscribe) unsubscribe()
        }
    }
    function sanitizeFields(): void {
        payload = payload === '' ? undefined : payload
        publicPayload = publicPayload === '' ? undefined : publicPayload
        metadata = metadata === '' ? undefined : metadata
        type = type === '' ? undefined : type
    }

    async function handleWriteMessage(): Promise<void> {
        loading = true

        // ---- Avoid locked channel error when sending messages ----
        while ($channelBusy) {
            timeout = setTimeout(handleWriteMessage, 100)
            return
        }
        // ----------------------------------------------------------

        sanitizeFields()
        await writeMessage(address, payload, publicPayload, metadata, type)

        loading = false
        onModalClose()
        resetMessage()
        formValidated = false
    }

    function resetMessage(): void {
        payload = ''
        publicPayload = ''
        metadata = ''
        type = ''
    }

    function onClose(): void {
        resetMessage()
        formValidated = false
        onModalClose()
    }
</script>

<Modal {isOpen} toggle={onClose}>
    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalHeader toggle={onClose} class="px-4 pt-3">Write your message</ModalHeader>
        <ModalBody>
            <div class="mb-4">
                <Label>Payload</Label>
                <Input
                    class="p-3 "
                    placeholder="Please write your message here..."
                    type="textarea"
                    name="text"
                    bind:value={payload}
                    minlength={MIN_LENGTH_TEXTAREA}
                    maxlength={MAX_LENGTH_TEXTAREA}
                    required
                />
                <div class="invalid-feedback">
                    This field is required and it needs to be less than {MAX_LENGTH_TEXTAREA} characters.
                </div>
            </div>
            <div class="mb-4">
                <Label>Public payload</Label>

                <Input
                    class="p-3"
                    placeholder="Please write your message here..."
                    type="textarea"
                    name="text"
                    bind:value={publicPayload}
                    minlength={MIN_LENGTH_TEXTAREA}
                    maxlength={MAX_LENGTH_TEXTAREA}
                    required
                />
                <div class="invalid-feedback">
                    This field is required and it needs to be less than {MAX_LENGTH_TEXTAREA} characters.
                </div>
            </div>
            <div class="mb-4">
                <Label>Metadata</Label>
                <Input
                    class="p-3"
                    placeholder="Please write your message here..."
                    type="textarea"
                    name="text"
                    bind:value={metadata}
                />
            </div>
            <div class="mb-4">
                <Label>Type</Label>
                <Input
                    class="p-3"
                    placeholder="Please write your message here..."
                    type="textarea"
                    name="text"
                    bind:value={type}
                />
            </div>
        </ModalBody>
        <ModalFooter>
            <Button disabled={loading} class="d-flex" color="primary">
                {loading ? 'Writing a message...' : 'Write a message'}
                {#if loading}
                    <div class="ms-2">
                        <Spinner size="sm" type="border" color="light" />
                    </div>
                {/if}
            </Button>
        </ModalFooter>
    </form>
</Modal>
