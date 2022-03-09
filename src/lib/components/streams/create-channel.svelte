<script lang="ts">
    import { Button, FormGroup, Input, Label, ModalBody, ModalHeader, ModalFooter, Spinner } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { Icon } from '$lib/components'
    import { createChannel } from '$lib/app/streams'
    import { BoxColor } from '$lib/app/constants/colors'

    export let isOpen: boolean = false
    export let onModalClose: () => void = () => {}
    export let onSuccess: (channelAddress: string) => void = () => {}

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
    let formContainer

    const minLengthInput = 3
    const maxLengthInput = 30
    const maxLengthTextarea = 100

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
</script>

<Modal {isOpen} toggle={onModalClose}>
    <ModalHeader toggle={onModalClose} class="px-4 pt-3">Create channel</ModalHeader>

    <form class:was-validated={formValidated} on:submit|preventDefault bind:this={formContainer} novalidate>
        <ModalBody class="px-4 pb-4">
            <div class="my-4 p-4 bg-light ">
                <Label>Name</Label>
                <Input placeholder={name} required type="textarea" minlength={minLengthInput} maxlength={maxLengthInput} />
                <div class="invalid-feedback">
                    This field is required and it needs to be more than {minLengthInput} characters and less than {maxLengthInput}
                    characters.
                </div>

                <Label class="mt-3">Description</Label>
                <Input
                    placeholder={description}
                    required
                    type="textarea"
                    minlength={minLengthInput}
                    maxlength={maxLengthTextarea}
                />
                <div class="invalid-feedback">
                    This field is required and it needs to be more than {minLengthInput} characters and less than {maxLengthTextarea}
                    characters.
                </div>
            </div>
            {#each topics as topic, i}
                <div class="my-4 p-4 bg-light ">
                    <Label class="d-flex justify-content-between align-items-center">
                        Topic
                        {#if topics.length > 1}
                            <button class="border-0 bg-transparent p-0" on:click={() => handleRemoveTopic(i)}>
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
                            minlength={minLengthInput}
                            maxlength={maxLengthInput}
                        />
                        <div class="invalid-feedback">
                            This field is required and it needs to be more than {minLengthInput} characters and less than {maxLengthInput}
                            characters.
                        </div>
                    </FormGroup>
                    <FormGroup floating label="Source*">
                        <Input
                            placeholder="Source"
                            type="text"
                            bind:value={topic['source']}
                            required
                            minlength={minLengthInput}
                            maxlength={maxLengthInput}
                        />
                        <div class="invalid-feedback">
                            This field is required and it needs to be more than {minLengthInput} characters and less than {maxLengthInput}
                            characters.
                        </div>
                    </FormGroup>
                </div>
            {/each}
            <div class="w-100 d-flex align-items-center justify-content-end">
                <Button size="sm" color="light" on:click={handleAddTopic} class="d-flex align-items-center">
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
