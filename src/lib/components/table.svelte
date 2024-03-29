<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import type { TableData } from '$lib/app/types/table'
    import { Icon, Paginator } from '$lib/components'
    import { onMount } from 'svelte'
    import { Badge, ListGroup, ListGroupItem, Spinner } from 'sveltestrap'
    import { DEFAULT_TABLE_PAGE_SIZE } from '$lib/app/constants/base'

    export let data: TableData = {
        headings: [],
        rows: [{ onClick: (..._: any[]): void => {}, content: [] }],
    }
    export let loadMore = (..._: any[]): void => {}
    export let onPageChange = (..._: any[]): void => {}
    export let loading = false
    export let pageSize: number = 10
    export let siblingsCount: number = 2
    export let isPaginated = false
    export let selectedPageIndex: number = 1

    // Pagination
    let startAt = 0
    let endAt = pageSize
    let visibleResults
    let showLoadMoreButton = false

    $: data?.rows, updateVisibleResults()

    onMount(() => {
        updateVisibleResults()
    })

    function pageChanged(page: number): void {
        selectedPageIndex = page
        if (data.rows.length / selectedPageIndex <= DEFAULT_TABLE_PAGE_SIZE) {
            showLoadMoreButton = true
        } else {
            showLoadMoreButton = false
        }

        onPageChange(page)
        updateVisibleResults()
    }

    function updateVisibleResults(): void {
        if (isPaginated) {
            startAt = (selectedPageIndex - 1) * pageSize
            endAt = startAt + pageSize
            visibleResults = data?.rows?.slice(startAt, endAt)
        } else {
            visibleResults = data?.rows
        }
    }
</script>

<div class="position-relative">
    <ListGroup flush class="pb-4">
        <ListGroupItem>
            <div class="d-flex justify-content-between align-items-center">
                {#each data.headings as heading}
                    <div class="item">{heading}</div>
                {/each}
            </div>
        </ListGroupItem>
        {#each visibleResults as { onClick, content }}
            <ListGroupItem tag="button" action class="border-bottom" on:click={onClick}>
                <div class="d-flex justify-content-between align-items-center">
                    {#each content as item}
                        <div class="item d-flex align-items-center">
                            {#if item?.icon}
                                <Icon type={item?.icon} boxed boxColor={item?.boxColor ?? BoxColor.Blue} size={24} />
                            {/if}
                            {#if Array.isArray(item?.value)}
                                <div class="item d-flex flex-column align-items-start truncate">
                                    {#each item.value as value}
                                        <div class:ms-3={item.icon}>
                                            {value}
                                        </div>
                                    {/each}
                                </div>
                            {:else if item?.value !== undefined}
                                <span class:ms-3={item.icon} class="text-truncate">{item?.value}</span>
                            {/if}
                            {#if item?.pills?.length}
                                {#each item.pills as { color, text }}
                                    <Badge {color}>{text}</Badge>
                                {/each}
                            {/if}
                        </div>
                    {/each}
                </div>
            </ListGroupItem>
        {/each}
        {#if showLoadMoreButton}
            <ListGroupItem
                tag="button"
                action
                class="border-bottom"
                on:click={async () => {
                    await loadMore(data.rows.length)
                    showLoadMoreButton = false
                }}
            >
                <div class="d-flex justify-content-between align-items-center">
                    <div class="item d-flex align-items-center">
                        <span class="text-truncate load-more">load more...</span>
                    </div>
                </div>
            </ListGroupItem>
        {/if}
    </ListGroup>
    {#if loading}
        <div class="spinner">
            <Spinner type="border" color="secondary" size="sm" />
        </div>
    {/if}
    {#if isPaginated}
        {#if data?.rows?.length}
            <div class="d-flex justify-content-center align-items-center">
                <Paginator
                    onPageChange={pageChanged}
                    totalCount={data.rows.length}
                    {pageSize}
                    currentPage={selectedPageIndex}
                    {siblingsCount}
                />
            </div>
        {/if}
    {/if}
</div>

<style lang="scss">
    .load-more {
        text-align: center;
        width: 100%;
    }
    .item {
        flex: 1 1 0;
        white-space: nowrap;
        overflow: hidden !important;
        text-overflow: ellipsis;
        margin-right: 20px;
        &:last-child {
            margin-right: 0px;
        }
    }

    .truncate {
        text-overflow: ellipsis;
        overflow: hidden !important;
        white-space: nowrap;
        width: 50px;
        @media (min-width: 990px) {
            width: 80px;
        }
        @media (min-width: 1200px) {
            width: 120px;
        }
    }
    .spinner {
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>
