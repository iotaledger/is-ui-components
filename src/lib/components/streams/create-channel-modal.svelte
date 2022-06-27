<script lang="ts">
    import { ChannelType } from '$lib/app'

    import { BoxColor } from '$lib/app/constants/colors'
    import { createChannel } from '$lib/app/streams'
    import { Icon } from '$lib/components'
    import { Button, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader, Spinner, Collapse, Styles } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import PresharedkeyModal from './presharedkey-modal.svelte'

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
    let channelType = ChannelType.private
    let hasPresharedKey
    let acceptTerms = false
    let name: string = ''
    let description: string = ''
    let unsubscribe: any
    let formValidated = false
    let formContainer: HTMLFormElement
    let presharedKey: string

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
        let channel = await createChannel(name, description, channelType, topics, hasPresharedKey)
        if (channel) {
            resetTopics()
            onSuccess(channel.channelAddress)
            formValidated = false
        }
        loading = false
        onClose()
        presharedKey = channel.presharedKey
    }

    async function handleToggle() {
        acceptTerms = !acceptTerms
        if (acceptTerms) {
            hasPresharedKey = true
        } else {
            hasPresharedKey = false
        }
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

    function handleRemoveTopic(i: number) {
        topics = [...topics.slice(0, i), ...topics.slice(i + 1)]
    }

    function resetFields(): void {
        name = ''
        description = ''
        channelType = ChannelType.private
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
                <Label class="mt-3">Channel Type</Label>
                <Input required type="select" name="select" class="mb-4" bind:value={channelType}>
                    <option value={ChannelType.private}>Private Channel</option>
                    <option value={ChannelType.public}>Public Channel</option>
                </Input>
                {#if channelType === ChannelType.private}
                    <Label class="mt-3">Private channel has preshared Key</Label>
                    <Input type="switch" bind:checked={acceptTerms} on:change={handleToggle} />
                {/if}

                <Label>Name</Label>
                <Input
                    placeholder={'Channel name...'}
                    required
                    type="textarea"
                    minlength={MIN_LENGTH_INPUT}
                    maxlength={MAX_LENGTH_INPUT}
                    bind:value={name}
                />
                <div class="invalid-feedback">
                    This field is required and it needs to be more than {MIN_LENGTH_INPUT} characters and less than {MAX_LENGTH_INPUT}
                    characters.
                </div>

                <Label class="mt-3">Description</Label>
                <Input
                    placeholder={'Please, describe your channel here...'}
                    type="textarea"
                    minlength={MIN_LENGTH_INPUT}
                    maxlength={MAX_LENGTH_TEXTAREA}
                    bind:value={description}
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
{#if presharedKey}
    <PresharedkeyModal {presharedKey} />
{/if}
