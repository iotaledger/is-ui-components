<script  lang="ts">
    import { FieldType, type WriteMessageForm } from '$lib/app'
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
    export let channelType:string = ''
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}
    const MAX_LENGTH_TEXTAREA = 100
    const MIN_LENGTH_TEXTAREA = 3
    // console.log("TYPE",typeof type)
    let timeout: NodeJS.Timeout
    let formLoading = false
    let formInputPrivate: InputType[] = [
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
    let formInputPublic: InputType[] = [
        {
            id: 'publicPayload',
            name: 'Public payload',
            placeholder: 'Public payload',
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
        const { payload, publicPayload, metadata, type } = formFieldsValues
        const message = await writeMessage(address, payload, publicPayload, metadata, type, true)
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
        {#if channelType === 'private'}
        <Form enableValidation inputs={formInputPrivate} {onSubmitButton} />
        {:else }
        <Form enableValidation inputs={formInputPublic} {onSubmitButton} />
        {/if}

    </ModalBody>
</Modal>
