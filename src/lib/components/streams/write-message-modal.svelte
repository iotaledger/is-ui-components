<script lang="ts">
    import { authenticatedUserDID, FieldType, type WriteMessageForm } from '$lib/app'
    import { selectedChannelBusy, writeMessage, asymSharedKeysStorage } from '$lib/app/streams'
    import type { Input as InputType, SubmitButton } from '$lib/app/types/form'
    import { Form } from '$lib/components'
    import { ChannelType } from '@iota/is-client'
    import { onDestroy, onMount } from 'svelte'
    import { ModalBody, ModalHeader } from 'sveltestrap'

    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    export let address: string
    export let isOpen: boolean = false
    export let title: string = 'Write a message'
    export let channelType: string = ''
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}
    const MAX_LENGTH_TEXTAREA = 100
    const MIN_LENGTH_TEXTAREA = 3
    let timeout: NodeJS.Timeout
    let formLoading = false
    let message
    let formInputs: InputType[] = [
        {
            id: 'payload',
            name: 'Payload',
            placeholder: 'Payload',
            required: false,
            type: FieldType.TextArea,
            minLength: MIN_LENGTH_TEXTAREA,
            maxLength: MAX_LENGTH_TEXTAREA,
        },
        {
            id: 'metadata',
            name: 'Metadata',
            placeholder: 'Metadata',
            required: false,
            type: FieldType.TextArea,
            minLength: MIN_LENGTH_TEXTAREA,
            maxLength: MAX_LENGTH_TEXTAREA,
        },
        {
            id: 'type',
            name: 'Type',
            placeholder: 'Type',
            required: false,
            type: FieldType.TextArea,
            minLength: MIN_LENGTH_TEXTAREA,
            maxLength: MAX_LENGTH_TEXTAREA,
        },
    ]

    let onSubmitButton: SubmitButton = {
        onSubmit: (formFieldsValues: WriteMessageForm) => {
            handleWriteMessage(formFieldsValues)
        },
        loading: false,
        visible: true,
        label: 'Write message',
        labelWhileLoading: 'Writing message...',
    }

    async function handleWriteMessage(formFieldsValues: WriteMessageForm): Promise<void> {
        formLoading = true
        // ---- Avoid locked channel error when sending messages ----
        while ($selectedChannelBusy) {
            timeout = setTimeout(() => handleWriteMessage(formFieldsValues), 100)
            return
        }
        // ----------------------------------------------------------

        const { payload, metadata, type } = formFieldsValues

        if (channelType === ChannelType.private) {
            message = await writeMessage(address, payload, undefined, metadata, type, true)
        }
        if (channelType === ChannelType.privatePlus) {
            const asymSharedKey = $asymSharedKeysStorage.get(`${authenticatedUserDID}-${address}`)
            message = await writeMessage(address, payload, undefined, metadata, type, true, asymSharedKey)
        } else {
            message = await writeMessage(address, undefined, payload, metadata, type, true)
        }
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
