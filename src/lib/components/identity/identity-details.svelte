<script lang="ts">
    import { CREDENTIAL_ICON, USER_ICONS } from '$lib/app/constants/identity'
    import { getVerifiableCredentials, revokeVC } from '$lib/app/identity'
    import type { ExtendedUser } from '$lib/app/types/identity'
    import type { ActionButton } from '$lib/app/types/layout'
    import { createJsonDataUrl } from '$lib/app/utils'
    import { Credential, Icon, JSONViewer } from '$lib/components'
    import type { VerifiableCredentialBody } from 'boxfish-studio--iota-is-sdk'
    import { Accordion, AccordionItem, Button, Spinner } from 'sveltestrap'

    export let identity: ExtendedUser
    export let loading: boolean = false
    export let onRevokeSuccess = (identity: ExtendedUser): void => {}
    export let actionButtons: ActionButton[] = []

    let revoking: boolean = false

    $: type = identity?.claim?.type

    async function handleRevoke(vc: VerifiableCredentialBody): Promise<void> {
        revoking = true
        const success = await revokeVC({ signatureValue: vc.proof.signatureValue })
        if (success) {
            let credentials = await getVerifiableCredentials(identity?.id)
            identity = { ...identity, vc: credentials, numberOfCredentials: credentials?.length ?? 0 }
            onRevokeSuccess(identity)
        }
        revoking = false
    }
</script>

<div class="identity-details w-100">
    <div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4">
        <div class="d-flex align-items-center">
            <Icon size={64} boxed boxColor={USER_ICONS[type]?.boxColor} type={USER_ICONS[type]?.icon} />
            <div class="ms-4 me-4">
                <div class="text-secondary fst-italic">{type}</div>
                <div class="fs-4 fw-bold">{identity?.username}</div>
                <div class="text-secondary fw-bolder mt-1 text-break">{identity?.id}</div>
            </div>
        </div>
        <div class="d-flex flex-column align-items-start">
            {#if actionButtons}
                {#each actionButtons as { label, onClick, icon, color }}
                    <Button size="sm" outline color={color ?? 'dark'} on:click={onClick} class="d-flex align-items-center mt-3">
                        {#if icon}
                            <div class="me-1">
                                <Icon type={icon} size={16} />
                            </div>
                        {/if}
                        <span class="ms-1">{label}</span>
                    </Button>
                {/each}
            {/if}
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
                            href={createJsonDataUrl(identity?.claim)}
                            download={`claim-identity-${identity?.id}.json`}
                        >
                            <Icon type="download" size={16} />
                            <span class="ms-2">Download</span>
                        </a>
                    </div>
                    <div>
                        <div class="label fw-bold">JSON content</div>
                        <div class="mt-1 p-4 bg-light rounded">
                            <JSONViewer json={JSON.stringify(identity?.claim, null, '\t')} />
                        </div>
                    </div>
                </div>
            </AccordionItem>
        </Accordion>
        {#if identity?.vc}
            {#each identity?.vc as vc}
                <div class="credential mt-4">
                    {#key vc}
                        <Credential {vc} {revoking} onRevoke={handleRevoke} />
                    {/key}
                </div>
            {/each}
        {/if}
        {#if loading}
            <div class="d-flex justify-content-center my-4">
                <Spinner type="border" color="secondary" size="lg" />
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .label {
        font-size: 12px;
    }
</style>
