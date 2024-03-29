<script lang="ts">
    import { BoxColor, CREDENTIAL_ICON, IOTA_ICON, selectedMessagePageIndex } from '$lib/app'

    import { DEFAULT_MESSAGES_PAGE_SIZE, NETWORK_EXPLORER } from '$lib/app/constants/streams'

    import type { ActionButton } from '$lib/app/types/layout'
    import { formatDateAndTime, isAnArrayOfObjects, isAnObject, isJson } from '$lib/app/utils'
    import { Icon, JSONViewer } from '$lib/components'
    import type { ChannelData } from '@iota/is-client'
    import { onDestroy, onMount } from 'svelte'
    import { Button, Spinner } from 'sveltestrap'
    import Paginator from '../paginator.svelte'

    export let channelData: ChannelData[] = []
    export let actionButtons: ActionButton[] = []
    export let loadMore = (..._: any[]): void => {}
    export let isSpinnerVisible: boolean = true

    // Pagination
    let startAt = 0
    let pageSize = DEFAULT_MESSAGES_PAGE_SIZE
    let endAt = pageSize
    let visibleChannelData: ChannelData[] = []
    let showLoadMoreButton = false

    $: channelData, updateVisibleResults()

    onMount(() => {
        updateVisibleResults()
    })

    function pageChanged(page: number): void {
        selectedMessagePageIndex.set(page)
        if (channelData.length / $selectedMessagePageIndex <= pageSize) {
            showLoadMoreButton = true
        } else {
            showLoadMoreButton = false
        }

        updateVisibleResults()
    }

    function updateVisibleResults(): void {
        if (channelData.length > 0) {
            //reduce the last page number to match the data length
            while (channelData.length < pageSize * $selectedMessagePageIndex - pageSize) {
                let currentPage = $selectedMessagePageIndex
                selectedMessagePageIndex.set(currentPage - 1)
            }
        }
        startAt = ($selectedMessagePageIndex - 1) * pageSize
        endAt = startAt + pageSize
        visibleChannelData = channelData.slice(startAt, endAt)
    }
</script>

<div class="w-full">
    <div class="d-flex justify-content-end mt-4">
        <div class="box d-flex flex-column align-items-center">
            {#if actionButtons}
                {#each actionButtons as { label, onClick, icon, color, loading, disabled }}
                    <Button
                        size="sm"
                        outline
                        color={color ?? 'dark'}
                        {disabled}
                        on:click={onClick}
                        class="d-flex align-items-center mt-3"
                    >
                        {#if icon}
                            <div class="me-1">
                                <Icon type={icon} size={16} />
                            </div>
                        {/if}
                        <span>{label}</span>
                        {#if loading}
                            <div class="ms-2"><Spinner size="sm" type="border" /></div>
                        {/if}
                    </Button>
                {/each}
            {/if}
        </div>
    </div>
    {#if isSpinnerVisible}
        <div class="p-4 d-flex align-items-center shadow rounded mt-4">
            <Spinner class="ms-2 me-4" type="grow" size="sm" color="secondary" />
            <div class="fw-bold">Waiting for channel data...</div>
        </div>
    {/if}
    {#each visibleChannelData as msg}
        <div class="p-4 bg-light my-4">
            <div class="d-lg-flex justify-content-between mb-lg-2">
                <div class="info-box mb-2 mb-lg-0 me-lg-4 small">
                    <div class="text-secondary">Timestamp</div>
                    <div class="text-break">{msg?.log?.created ? formatDateAndTime(msg?.log?.created) : '-'}</div>
                </div>
                <div class="info-box mb-2 mb-lg-0 me-lg-4 small">
                    <div class="text-secondary">Cached</div>
                    <div class="text-break">{msg?.imported ? formatDateAndTime(msg?.imported) : '-'}</div>
                </div>
                <div class="info-box mb-2 mb-lg-0 me-lg-4 small">
                    <div class="text-secondary">Type</div>
                    <div>{msg?.log?.type || '-'}</div>
                </div>
            </div>
            <div class="mb-2 d-flex justify-content-between">
                <div>
                    {#if msg?.source?.id}
                        <div class="mb-1">
                            <span class="text-secondary small">Identity: </span>
                            <a href={'/identity-manager/' + msg.source.id}>
                                <span class="text-break small">{msg.source.id}</span>
                            </a>
                        </div>
                    {/if}
                    {#if msg?.source?.publicKey}
                        <div>
                            <span class="text-secondary small">Signature Key: </span>
                            <span class="text-break small">{msg?.source?.publicKey}</span>
                        </div>
                    {/if}
                </div>
                <div class="mb-4 d-flex me-lg-4">
                    <a href={NETWORK_EXPLORER + msg?.messageId} target="_blank" rel="noopener noreferrer">
                        <Icon type={IOTA_ICON.icon} size={32} boxed={true} boxColor={BoxColor.Blue} />
                    </a>
                </div>
            </div>

            {#if msg?.log?.publicPayload}
                <div class="mb-4">
                    <div class="text-secondary small">Public data:</div>
                    {#if isJson(msg?.log?.publicPayload) || isAnArrayOfObjects(msg?.log?.publicPayload) || isAnObject(msg?.log?.publicPayload)}
                        <JSONViewer json={JSON.stringify(msg?.log?.publicPayload, null, '\t')} />
                    {:else}
                        <span>{msg?.log?.publicPayload}</span>
                    {/if}
                </div>
            {/if}

            {#if msg?.log?.payload}
                <div class="mb-4">
                    <div class="text-secondary small">Encrypted data:</div>
                    {#if isJson(msg?.log?.payload) || isAnArrayOfObjects(msg?.log?.payload) || isAnObject(msg?.log?.payload)}
                        <JSONViewer json={JSON.stringify(msg?.log?.payload, null, '\t')} />
                    {:else if msg?.log?.payload}
                        <span>{msg?.log?.payload}</span>
                    {/if}
                </div>
            {/if}

            {#if msg?.log?.metadata}
                <div class="mb-4">
                    <div class="text-secondary small">Metadata:</div>
                    {#if isJson(msg?.log?.metadata) || isAnArrayOfObjects(msg?.log?.metadata) || isAnObject(msg?.log?.metadata)}
                        <JSONViewer json={JSON.stringify(msg?.log?.metadata, null, ' \t')} />
                    {:else if msg?.log?.metadata}
                        <span>{msg?.log?.metadata}</span>
                    {/if}
                </div>
            {/if}
        </div>
    {/each}
    {#if showLoadMoreButton}
        <Button
            size="sm"
            outline
            block
            class="mb-4"
            on:click={async () => {
                await loadMore(channelData.length)
                showLoadMoreButton = false
            }}
            >load more...
        </Button>
    {/if}
    {#if channelData.length}
        <div class="d-flex justify-content-center align-items-center">
            <Paginator
                onPageChange={pageChanged}
                totalCount={channelData.length}
                {pageSize}
                currentPage={$selectedMessagePageIndex}
            />
        </div>
    {/if}
</div>
