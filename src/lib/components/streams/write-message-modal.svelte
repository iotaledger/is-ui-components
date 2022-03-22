<script lang="ts">
    import { FieldType } from '$lib/app'
    import { selectedChannelBusy, writeMessage } from '$lib/app/streams'
    import type { Input as InputType, SubmitButton } from '$lib/app/types/form'
    import { Form } from '$lib/components'
    import { onDestroy } from 'svelte'
    import { ModalBody, ModalHeader } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let address: string
    export let isOpen: boolean = false
    export let title: string = 'Write a message'
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}

    const MAX_LENGTH_TEXTAREA = 100
    const MIN_LENGTH_TEXTAREA = 3

    let timeout: NodeJS.Timeout
    let formLoading = false
    let formInputs: InputType[] = [
        {
            id: 'payload',
            name: 'Payload',
            placeholder: 'Payload',
            required: true,
            type: FieldType.TextArea,
            minLength: MIN_LENGTH_TEXTAREA,
            maxLength: MAX_LENGTH_TEXTAREA,
        },
        {
            id: 'publicPayload',
            name: 'Public payload',
            placeholder: 'Public payload',
            required: true,
            type: FieldType.TextArea,
            minLength: MIN_LENGTH_TEXTAREA,
            maxLength: MAX_LENGTH_TEXTAREA,
        },
        {
            id: 'metadata',
            name: 'Metadata',
            placeholder: 'Metadata',
            required: true,
            type: FieldType.TextArea,
            minLength: MIN_LENGTH_TEXTAREA,
            maxLength: MAX_LENGTH_TEXTAREA,
        },
        {
            id: 'type',
            name: 'Type',
            placeholder: 'Type',
            required: true,
            type: FieldType.TextArea,
            minLength: MIN_LENGTH_TEXTAREA,
            maxLength: MAX_LENGTH_TEXTAREA,
        },
    ]

    let onSubmitButton: SubmitButton = {
        onSubmit: (formFieldsValues) => {
            handleWriteMessage(formFieldsValues)
        },
        loading: false,
        label: 'Write message',
        labelWhileLoading: 'Writing message...',
    }

    async function handleWriteMessage(formFieldsValues): Promise<void> {
        formLoading = true

        // ---- Avoid locked channel error when sending messages ----
        while ($selectedChannelBusy) {
            timeout = setTimeout(() => handleWriteMessage(formFieldsValues), 100)
            return
        }
        // ----------------------------------------------------------

        const { payload, publicPayload, metadata, type } = formFieldsValues
        const message = await writeMessage(address, payload, publicPayload, metadata, type)
        if (message) {
            onSuccess()
            onModalClose()
        }
        formLoading = false
    }

    function onClose(): void {
        onModalClose()
    }

    function updateLoading(): void {
        onSubmitButton = {
            ...onSubmitButton,
            loading: formLoading,
        }
    }

    onDestroy(() => {
        if (timeout) {
            clearTimeout(timeout)
        }
    })

    $: formLoading, updateLoading()
</script>

<Modal {isOpen} toggle={onClose}>
    <ModalHeader toggle={onClose} class="px-4 pt-3">{title}</ModalHeader>
    <ModalBody class="px-4 pb-4">
        <Form enableValidation inputs={formInputs} {onSubmitButton} />
    </ModalBody>
</Modal>