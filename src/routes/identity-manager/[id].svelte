<script context="module" lang="ts">
    export const prerender = true
</script>

<script lang="ts">
    import { CreateCredentialModal, DEFAULT_VCS_TEMPLATES, IdentityDetails } from '$lib'
    import { authenticatedUserRole } from '$lib/app/base'
    import {
        getIdentitiy,
        getVerifiableCredentials,
        searchIdentityByDID,
        selectedIdentity,
        updateIdentityInSearchResults,
        loadingIdentity,
        getIdentityClaim,
    } from '$lib/app/identity'
    import { UserRoles, type VerifiableCredentialTemplate } from '$lib/app/types'
    import type { ActionButton } from '$lib/app/types'
    import { Col, Container, Row } from 'sveltestrap'
    import { Icon } from '$lib/components'
    import { get } from 'svelte/store'
    import { page } from '$app/stores'
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation'

    let credentialsTemplate: VerifiableCredentialTemplate[] = DEFAULT_VCS_TEMPLATES
    let isCreateCredentialModalOpen = false

    const detailViewButtons: ActionButton[] = [
        {
            label: 'Add credential',
            onClick: openCreateCredentialModal,
            icon: 'plus',
            color: 'dark',
            hidden: $authenticatedUserRole !== UserRoles.Admin,
        },
    ]

    // Add the newly created credential to the selected identity
    async function onCreateCredentialSuccess(): Promise<void> {
        loadingIdentity.set(true)
        let identity = await searchIdentityByDID($selectedIdentity?.id)
        identity = { ...identity, numberOfCredentials: identity?.numberOfCredentials ?? 0 }
        if (identity) {
            updateIdentityInSearchResults(identity)
        }
        const vc = await getVerifiableCredentials($selectedIdentity?.id)
        selectedIdentity.update((identity) => ({ ...identity, vc }))
        loadingIdentity.set(false)
    }

    function handleBackClick(): void {
        goto('/identity-manager')
    }

    function openCreateCredentialModal(): void {
        isCreateCredentialModalOpen = true
    }

    function closeCreateCredentialModal(): void {
        isCreateCredentialModalOpen = false
    }

    async function loadIdentityDetails(): Promise<void> {
        loadingIdentity.set(true)
        const vc = await getVerifiableCredentials($selectedIdentity?.id)
        const claim = (await getIdentityClaim($selectedIdentity?.id)) as {}
        selectedIdentity.update((identity) => ({
            ...identity,
            vc,
            claim: { ...claim, type: $selectedIdentity?.claim?.type },
        }))
        loadingIdentity.set(false)
    }

    onMount(async () => {
        if (!get(selectedIdentity)) {
            const id = await getIdentitiy($page.params.id)
            selectedIdentity.set(id)
        }
        if (get(selectedIdentity)) await loadIdentityDetails()
    })
</script>

<svelte:head>
    <title>Identity Details</title>
</svelte:head>

<Container class="my-5">
    <Row>
        <Col sm="12" md={{ size: 10, offset: 1 }}>
            <div class="mb-4 align-self-start">
                <button on:click={handleBackClick} class="btn d-flex align-items-center">
                    <Icon type="arrow-left" size={16} />
                    <span class="ms-2">Back</span>
                </button>
            </div>
            {#if $authenticatedUserRole && $selectedIdentity}
                <IdentityDetails
                    loading={$loadingIdentity}
                    actionButtons={detailViewButtons}
                    onRevokeSuccess={updateIdentityInSearchResults}
                    identity={$selectedIdentity}
                    userRole={$authenticatedUserRole}
                />
            {/if}

            <!-- TODO: add possility to not pass targetDid here -->
            <CreateCredentialModal
                isOpen={isCreateCredentialModalOpen}
                onModalClose={closeCreateCredentialModal}
                targetDid={$selectedIdentity?.id}
                onSuccess={onCreateCredentialSuccess}
                {credentialsTemplate}
            />
        </Col>
    </Row>
</Container>
