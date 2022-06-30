<script lang="ts">
    import type { Subscription } from '@iota/is-client'
    import { Button, Spinner, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap'
    // We have to import Modal this way, otherwise it shouts SSR issues.
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { loading } from '$lib/app/streams'

    export let allowAcceptAction: boolean = false
    export let allowRejectAction: boolean = false
    export let subscription: Subscription = undefined
    export let label: string = 'Subscriber Id'
    export let handleAcceptSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()
    export let handleRejectSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()

    let isOpen = false
    const onModalClose = () => {
        isOpen = false
    }

    let isAccepting: boolean = false
    let isRejecting: boolean = false

    async function handleAccept(): Promise<void> {
        isAccepting = true
        await handleAcceptSubscription(subscription.id)
        isAccepting = false
    }
    async function handleReject(): Promise<void> {
        isRejecting = true
        await handleRejectSubscription(subscription.id)
        isRejecting = false
    }
</script>

{#if subscription}
    <div class="d-flex justify-content-between align-items-center my-3">
        <div>
            <div class="text-secondary mb-1">{label}</div>
            <span class="text-break">{subscription?.id}</span>
        </div>
        {#if allowAcceptAction || allowRejectAction}
            <div class="d-flex flex-column flex-lg-row ">
                {#if allowAcceptAction}
                    <Button
                        class="ms-2"
                        size="sm"
                        outline
                        color="dark"
                        disabled={isAccepting || isRejecting}
                        on:click={handleAccept}
                    >
                        <div class="d-flex justify-content-center align-items-center">
                            {isAccepting || $loading ? 'Accepting...' : 'Accept'}
                            {#if isAccepting || ($loading && !isRejecting)}
                                <div class="ms-2">
                                    <Spinner size="sm" type="border" color="success" />
                                </div>
                            {/if}
                        </div>
                    </Button>
                {/if}
                {#if allowRejectAction}
                    <Button
                        class="ms-2 mt-2 mt-lg-0"
                        size="sm"
                        outline
                        color="danger"
                        disabled={isAccepting || isRejecting }
                        on:click={() => (isOpen = true)}
                    >
                        <div class="d-flex justify-content-center align-items-center">
                            {isRejecting || $loading ? 'Revoking...' : 'Revoke'}
                            {#if isRejecting || ($loading && !isAccepting)}
                                <div class="ms-2">
                                    <Spinner size="sm" type="border" color="danger" />
                                </div>
                            {/if}
                        </div>
                    </Button>
                    <Modal {isOpen} toggle={onModalClose}>
                        <div class="p-3 d-flex flex-column">
                            <ModalHeader toggle={onModalClose}>Are you sure?</ModalHeader>
                            <ModalBody>
                                <div class="text-break">
                                    Subscription of ID <span class="fw-light">{subscription?.id}</span> is going to be rejected.
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    on:click={() => {
                                        handleReject()
                                        onModalClose()
                                    }}
                                >
                                    Yes, revoke
                                </Button>
                                <Button color="secondary" disabled={isAccepting || isRejecting} on:click={onModalClose}
                                    >Cancel</Button
                                >
                            </ModalFooter>
                        </div>
                    </Modal>
                {/if}
            </div>
        {/if}
    </div>
{/if}
