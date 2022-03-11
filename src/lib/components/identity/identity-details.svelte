<script lang="ts">
    import type { VerifiableCredentialInternal } from 'boxfish-studio--iota-is-sdk'
    import { onMount } from 'svelte'
    import { Accordion, AccordionItem, Button, Spinner } from 'sveltestrap'
    import { CreateCredential, Credential, Icon, JSONViewer } from '$lib/components'
    import { CREDENTIAL_ICON, USER_ICONS } from '$lib/app/constants/identity'
    import { getVerifiableCredentials, revokeVC, searchIdentities, updateSelectedIdentity } from '$lib/app/identity'
    import type { ExtendedUser } from '$lib/app/types/identity'
    import { createJsonDataUrl } from '$lib/app/utils'

    export let identity: ExtendedUser

    const { username, id, claim } = identity
    const type = identity?.claim?.type

    enum State {
        Details = 'details',
        AddCredential = 'addCredential',
    }

    let verifiableCredentials: VerifiableCredentialInternal[] = []
    let loading = false
    let state: State = State.Details
    let revoking: boolean = false

    onMount(async () => {
        // Get all credentials
        loading = true
        verifiableCredentials = await getVerifiableCredentials(id)
        loading = false
    })

    const switchToDetails = () => (state = State.Details)
    const switchToAddCredential = () => (state = State.AddCredential)

    const handleRevoke = async (vc) => {
        revoking = true
        const success = await revokeVC({ signatureValue: vc.proof.signatureValue })
        if (success) {
            await updateCredentials()
        }
        revoking = false
    }

    const updateCredentials = async () => {
        loading = true
        const identities = await searchIdentities(id)
        let foundIdentity = identities?.[0]
        const numberOfCredentials = foundIdentity?.verifiableCredentials?.length
        foundIdentity = { ...foundIdentity, numberOfCredentials }
        if (foundIdentity) {
            updateSelectedIdentity(foundIdentity)
        }
        verifiableCredentials = await getVerifiableCredentials(id)
        loading = false
    }

    // TODO: improve this. It is used to change the icon color when button is hovered.
    let iconColor = '#333333'
    const switchIconColor = () => {
        iconColor = iconColor === '#333333' ? 'white' : '#333333'
    }
    // ---------------------------------------------------------------------------------------------
</script>

<div class="identity-details w-100">
    <div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4">
        <div class="d-flex align-items-center">
            <Icon size={64} boxed boxColor={USER_ICONS[type].boxColor} type={USER_ICONS[type].icon} />
            <div class="ms-4">
                <div class="text-secondary fst-italic">{type}</div>
                <div class="fs-4 fw-bold">{username}</div>
                <div class="text-secondary fw-bolder mt-1 text-break">{id}</div>
            </div>
        </div>
        <div class="d-flex align-items-center ">
            <div on:mouseenter={switchIconColor} on:mouseleave={switchIconColor}>
                <Button size="sm" outline color="dark" on:click={switchToAddCredential} class="mt-3 d-flex align-items-center">
                    <Icon type="plus" color={iconColor} size={16} />
                    <span class="ms-1">Add credential</span>
                </Button>
            </div>
        </div>
    </div>

    <div class="credentials">
        <Accordion class="mt-4">
            <AccordionItem>
                <div slot="header" class="d-flex align-items-center">
                    <Icon type="collection" boxed boxColor={CREDENTIAL_ICON.boxColor} size={48} />
                    <div class="ms-4">
                        <div class="fs-6 fw-bold">Claim</div>
                        <div class="label fw-bold text-secondary mt-1">
                            {type}
                        </div>
                    </div>
                </div>
                <div class="my-2 my-lg-4">
                    <div class="d-flex flex-column">
                        <a
                            class="btn btn-sm btn-outline-info text-decoration-none ms-auto d-flex align-items-center"
                            href={createJsonDataUrl(claim)}
                            download={`claim-identity-${id}.json`}
                        >
                            <Icon type="download" size={16} />
                            <span class="ms-2">Download</span>
                        </a>
                    </div>
                    <div>
                        <div class="label fw-bold">JSON content</div>
                        <div class="mt-1 p-4 bg-light rounded">
                            <JSONViewer json={JSON.stringify(claim, null, '\t')} />
                        </div>
                    </div>
                </div>
            </AccordionItem>
        </Accordion>
        {#each verifiableCredentials as vc}
            <div class="credential mt-4">
                {#key vc}
                    <Credential {vc} {revoking} onRevoke={handleRevoke} />
                {/key}
            </div>
        {/each}
        {#if loading}
            <div class="d-flex justify-content-center my-4">
                <Spinner type="border" color="secondary" size="lg" />
            </div>
        {/if}
    </div>

    <CreateCredential
        isOpen={state === State.AddCredential}
        onModalClose={switchToDetails}
        targetDid={id}
        onSuccess={updateCredentials}
    />
</div>

<style lang="scss">
    .label {
        font-size: 12px;
    }
</style>
