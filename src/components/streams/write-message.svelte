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

    let unsubscribe
    let formValidated = false
    let formContainer

    const maxLengthTextarea = 100
    const minLengthTextarea = 3

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
    function sanitizeFields() {
        payload = payload === '' ? undefined : payload
        publicPayload = publicPayload === '' ? undefined : publicPayload
        metadata = metadata === '' ? undefined : metadata
        type = type === '' ? undefined : type
    }
    async function handleWriteMessage() {
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
    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalHeader toggle={onModalClose} class="px-4 pt-3">Write your message</ModalHeader>
        <ModalBody>
            <div class="mb-4">
                <Label>Payload</Label>
                <Input
                    class="p-3 "
                    placeholder="Please write your message here..."
                    type="textarea"
                    name="text"
                    bind:value={payload}
                    minlength={minLengthTextarea}
                    maxlength={maxLengthTextarea}
                    required
                />
                <div class="invalid-feedback">
                    This field is required and it needs to be less than {maxLengthTextarea} characters.
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
                    minlength={minLengthTextarea}
                    maxlength={maxLengthTextarea}
                    required
                />
                <div class="invalid-feedback">
                    This field is required and it needs to be less than {maxLengthTextarea} characters.
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
