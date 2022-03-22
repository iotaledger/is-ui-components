<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import { createChannel } from '$lib/app/streams'
    import { Icon } from '$lib/components'
    import { Button, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader, Spinner } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'

    export let isOpen: boolean = false
    export let onModalClose = (..._: any[]): void => {}
    export let onSuccess = (..._: any[]): void => {}

    const MIN_LENGTH_INPUT = 3
    const MAX_LENGTH_INPUT = 30
    const MAX_LENGTH_TEXTAREA = 100

    let loading = false
    let topics: { type: string; source: string }[] = [
        {
            type: '',
            source: '',
        },
    ]
    let name: string = 'Channel name...'
    let description: string = 'Please, describe your channel here...'
    let unsubscribe
    let formValidated = false
    let formContainer: HTMLFormElement

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
                        handleCreateChannel()
                    }
                    formValidated = true
                },
                false
            )
        } else {
            if (unsubscribe) unsubscribe()
        }
    }

    function resetTopics(): void {
        topics = [
            {
                type: '',
                source: '',
            },
        ]
    }

    async function handleCreateChannel() {
        loading = true
        let channel = await createChannel(topics)
        if (channel) {
            resetTopics()
            onSuccess(channel.channelAddress)
            formValidated = false
        }
        loading = false
    }

    function handleAddTopic() {
        topics = [
            ...topics,
            {
                type: '',
                source: '',
            },
        ]
    }

    function handleRemoveTopic(i) {
        topics = [...topics.slice(0, i), ...topics.slice(i + 1)]
    }

    function resetFields(): void {
        name = 'Channel name'
        description = 'Please, describe your channel here...'
        topics = [
            {
                type: '',
                source: '',
            },
        ]
    }

    function onClose() {
        resetFields()
        formValidated = false
        onModalClose()
    }
</script>

<Modal {isOpen} toggle={onClose}>
    <ModalHeader toggle={onClose} class="px-4 pt-3">Create channel</ModalHeader>

    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalBody class="px-4 pb-4">
            <div class="my-4 p-4 bg-light ">
                <Label>Name</Label>
                <Input placeholder={name} required type="textarea" minlength={MIN_LENGTH_INPUT} maxlength={MAX_LENGTH_INPUT} />
                <div class="invalid-feedback">
                    This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than {MAX_LENGTH_INPUT}
                    characters.
                </div>

                <Label class="mt-3">Description</Label>
                <Input
                    placeholder={description}
                    required
                    type="textarea"
                    minlength={MIN_LENGTH_INPUT}
                    maxlength={MAX_LENGTH_TEXTAREA}
                />
                <div class="invalid-feedback">
                    This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than {MAX_LENGTH_TEXTAREA}
                    characters.
                </div>
            </div>
            {#each topics as topic, i}
                <div class="my-4 p-4 bg-light ">
                    <Label class="d-flex justify-content-between align-items-center">
                        Topic
                        {#if topics.length > 1}
                            <button type="button" class="border-0 bg-transparent p-0" on:click={() => handleRemoveTopic(i)}>
                                <Icon type="trash" boxColor={BoxColor.Transparent} boxed size={18} />
                            </button>
                        {/if}
                    </Label>

                    <FormGroup floating label="Type*">
                        <Input
                            placeholder="Type"
                            type="text"
                            bind:value={topic['type']}
                            required
                            minlength={MIN_LENGTH_INPUT}
                            maxlength={MAX_LENGTH_INPUT}
                        />
                        <div class="invalid-feedback">
                            This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than {MAX_LENGTH_INPUT}
                            characters.
                        </div>
                    </FormGroup>
                    <FormGroup floating label="Source*">
                        <Input
                            placeholder="Source"
                            type="text"
                            bind:value={topic['source']}
                            required
                            minlength={MIN_LENGTH_INPUT}
                            maxlength={MAX_LENGTH_INPUT}
                        />
                        <div class="invalid-feedback">
                            This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than {MAX_LENGTH_INPUT}
                            characters.
                        </div>
                    </FormGroup>
                </div>
            {/each}
            <div class="w-100 d-flex align-items-center justify-content-end">
                <Button type="button" size="sm" color="light" on:click={handleAddTopic} class="d-flex align-items-center">
                    <Icon type="plus" size={16} />
                    <span class="ms-1">Add new topic</span>
                </Button>
            </div>
        </ModalBody>
        <ModalFooter>
            <Button size="lg" block class="mt-4" color="primary" disabled={loading}>
                <div class="d-flex justify-content-center align-items-center">
                    {loading ? 'Creating channel...' : 'Create channel'}
                    {#if loading}
                        <div class="ms-2"><Spinner size="sm" type="border" color="light" /></div>
                    {/if}
                </div>
            </Button>
        </ModalFooter>
    </form>
</Modal>