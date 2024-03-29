<script lang="ts">
    import { CREDENTIAL_ICON, USER_ICONS } from '$lib/app/constants/identity'
    import { getVerifiableCredentials, revokeVC, searchIdentitiesResults, updateIdentity } from '$lib/app/identity'
    import { UserRoles, type ExtendedUser } from '$lib/app/types/identity'
    import type { ActionButton } from '$lib/app/types/layout'
    import { createJsonDataUrl, formatDate } from '$lib/app/utils'
    import { Credential, Icon, JSONViewer } from '$lib/components'
    import type { VerifiableCredentialInternal } from '@iota/is-client'
    import { Accordion, AccordionItem, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Spinner } from 'sveltestrap'
    import { BoxColor } from '$lib/app'

    export let identity: ExtendedUser
    export let userRole: UserRoles
    export let loading: boolean = false
    export let onRevokeSuccess = (identity: ExtendedUser): void => {}
    export let actionButtons: ActionButton[] = []

    let revoking: boolean = false

    $: type = identity?.claim?.type

    async function handleRevoke(vc: VerifiableCredentialInternal): Promise<void> {
        revoking = true
        const success = await revokeVC({ signatureValue: vc.proof.signatureValue })
        if (success) {
            let credentials = await getVerifiableCredentials(identity?.id)
            identity = { ...identity, verifiableCredentials: credentials, numberOfCredentials: credentials?.length ?? 0 }
            onRevokeSuccess(identity)
        }
        revoking = false
    }

    async function handleRoleChange(userRole: UserRoles): Promise<void> {
        if (identity.role !== userRole) {
            loading = true
            // creating a deep copy to not alter the original identity
            const updateDid = JSON.parse(JSON.stringify(identity))
            updateDid.role = userRole
            await updateIdentity(updateDid)
            identity.role = userRole
            searchIdentitiesResults.update(() => {
                return $searchIdentitiesResults.map((did) => {
                    return did.id === identity.id ? identity : did
                })
            })
            loading = false
        }
    }
</script>

<div class="identity-details w-100">
    <div class="d-xl-flex flex-column bg-light rounded p-4">
        <div class="d-flex align-items-center mb-2">
            <Icon
                size={64}
                boxed
                boxColor={USER_ICONS[type]?.boxColor ?? BoxColor.Purple}
                type={USER_ICONS[type]?.icon ?? 'gear'}
            />
            <div class="ms-3 me-3">
                <div class="text-secondary fst-italic">{type}</div>
                <div class="fs-4 fw-bold">{identity?.username}</div>
                <div class="text-secondary fw-bolder mt-1 text-break">{identity?.id}</div>
            </div>
            <div class="pb-5 role-padding">
                {#if userRole === UserRoles.Admin}
                    <Dropdown>
                        <DropdownToggle caret={!loading}>
                            {#if loading}
                                <div class="ms-2 flex align-items-center dropdown-toggle-label">
                                    Updating role<Spinner size="sm" type="border" />
                                </div>
                            {/if}
                            <span class="dropdown-toggle-label">
                                {identity?.role}
                            </span>
                        </DropdownToggle>
                        <DropdownMenu>
                            {#each [UserRoles.Admin, UserRoles.Manager, UserRoles.User] as role}
                                <DropdownItem on:click={() => handleRoleChange(role)}>{role}</DropdownItem>
                            {/each}
                        </DropdownMenu>
                    </Dropdown>
                {/if}
            </div>
        </div>
        <div class="d-xl-flex align-items-center justify-content-between">
            <div class="ms-12 me-12">
                <div class="text-secondary text-break">
                    <span class="fw-bold">Date: </span><span class="text-break ">{formatDate(identity?.registrationDate)}</span>
                </div>
                <div class="text-secondary text-break">
                    <span class="fw-bold">Creator: </span>
                    {#if identity.creator}
                        <a href={'/identity-manager/' + identity?.creator}>
                            {identity?.creator}
                        </a>
                    {/if}
                    {#if !identity.creator}
                        <span class="text-break ">Unknown</span>
                    {/if}
                </div>
                <div class="text-secondary text-break">
                    <span class="fw-bold">Role: </span><span class="text-break ">{identity?.role || 'unknown'}</span>
                </div>
            </div>
            <div class="d-flex flex-column align-items-start">
                {#if actionButtons}
                    {#each actionButtons as { label, onClick, icon, color, loading, disabled, hidden }}
                        {#if !hidden}
                            <Button
                                size="sm"
                                outline
                                color={color ?? 'dark'}
                                on:click={onClick}
                                {disabled}
                                class="d-flex align-items-center mt-3"
                            >
                                {#if icon}
                                    <div class="me-1">
                                        <Icon type={icon} size={16} />
                                    </div>
                                {/if}
                                <span class="ms-1">{label}</span>
                                {#if loading}
                                    <div class="ms-2 flex align-items-center"><Spinner size="sm" type="border" /></div>
                                {/if}
                            </Button>
                        {/if}
                    {/each}
                {/if}
            </div>
        </div>
    </div>

    <div class="credentials">
        {#if identity?.claim}
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
        {/if}
        {#if identity?.verifiableCredentials}
            {#each identity?.verifiableCredentials as vc}
                <div class="credential mt-4">
                    {#key vc}
                        <Credential {userRole} {vc} {revoking} onRevoke={handleRevoke} />
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
    .role-padding {
        @media (min-width: 700px) {
            padding-left: 23.2%;
        }
    }
    .dropdown-toggle-label {
        @media (max-width: 400px) {
            display: none;
        }
    }
</style>
