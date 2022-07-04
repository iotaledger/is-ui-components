<script lang="ts">
    import { DEFAULT_TABLE_PAGE_SIZE } from '$lib/app/constants/base'
    import { DEFAULT_MESSAGES_PAGE_SIZE } from '$lib/app/constants/streams'

    import type { ActionButton } from '$lib/app/types/layout'
    import { isAnArrayOfObjects, isAnObject, isJson } from '$lib/app/utils'
    import { Icon, JSONViewer } from '$lib/components'
    import type { ChannelData } from '@iota/is-client'
    import { onMount } from 'svelte'
    import { Button, Spinner } from 'sveltestrap'
    import Paginator from '../paginator.svelte'

    export let channelData: ChannelData[] = []
    export let actionButtons: ActionButton[] = []
    export let loadMore = (..._: any[]): void => {}
    export let isSpinnerVisible: boolean = true
    let selectedPageIndex = 1

    // Pagination
    let startAt = 0
    let pageSize = DEFAULT_MESSAGES_PAGE_SIZE
    let endAt = pageSize
    let visibleChannelData: ChannelData[] = []
    let showLoadMoreButton = false

    $: channelData, updateVisibleResults()

    onMount(() => {
        updateVisibleResults()
        console.log('mount')
    })

    function pageChanged(page: number): void {
        selectedPageIndex = page
        if (channelData.length / selectedPageIndex <= pageSize) {
            showLoadMoreButton = true
        } else {
            showLoadMoreButton = false
        }

        updateVisibleResults()
    }

    function updateVisibleResults(): void {
        startAt = (selectedPageIndex - 1) * pageSize
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
            <div class="d-lg-flex justify-content-between mb-lg-4">
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Timestamp</div>
                    <div class="text-break">{msg?.log?.created || '-'}</div>
                </div>
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Cached</div>
                    <div class="text-break">{msg?.log?.created || '-'}</div>
                </div>
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Type</div>
                    <div>{msg?.log?.type || '-'}</div>
                </div>
            </div>
            <div class="mb-4">
                <div class="text-secondary">Message id</div>
                <div class="text-break">{msg?.messageId}</div>
            </div>
            <div class="mb-4">
                <div class="text-secondary">Link</div>
                <div class="text-break">{msg?.link}</div>
            </div>

            {#if msg?.log?.publicPayload}
                <div class="mb-4">
                    <div class="text-secondary">Public data</div>
                    {#if isJson(msg?.log?.publicPayload) || isAnArrayOfObjects(msg?.log?.publicPayload) || isAnObject(msg?.log?.publicPayload)}
                        <JSONViewer json={JSON.stringify(msg?.log?.publicPayload, null, '\t')} />
                    {:else}
                        <span>{msg?.log?.publicPayload}</span>
                    {/if}
                </div>
            {/if}

            {#if msg?.log?.payload}
                <div class="mb-4">
                    <div class="text-secondary">Encrypted data</div>
                    {#if isJson(msg?.log?.payload) || isAnArrayOfObjects(msg?.log?.payload) || isAnObject(msg?.log?.payload)}
                        <JSONViewer json={JSON.stringify(msg?.log?.payload, null, '\t')} />
                    {:else if msg?.log?.payload}
                        <span>{msg?.log?.payload}</span>
                    {/if}
                </div>
            {/if}

            {#if msg?.log?.metadata}
                <div class="mb-4">
                    <div class="text-secondary">Metadata</div>
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
            <Paginator onPageChange={pageChanged} totalCount={channelData.length} {pageSize} currentPage={selectedPageIndex} />
        </div>
    {/if}
</div>
