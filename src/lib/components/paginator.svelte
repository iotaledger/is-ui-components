<script lang="ts">
    import { Icon } from '$lib/components'

    export let currentPage: number = 0
    export let pageSize: number = 10
    export let totalCount: number = 0
    export let siblingsCount: number = 1
    export let onPageChange: (page: number) => void

    const DOTS: string = '...'

    let paginationRange: (number | string)[] = []
    let lastPage: number = 0

    function updatePaginationRange(): (string | number)[] {
        const totalPageCount: number = Math.ceil(totalCount / pageSize)
        // Pages count is determined as siblingsCount + firstPage + lastPage + currentPage + 2*DOTS
        const totalPageNumbers: number = siblingsCount + 5

        /**
         * If the number of pages is less than the page numbers we want to show in our
         * paginationComponent, we return the range [1..totalPageCount].
         */
        if (totalPageNumbers >= totalPageCount) {
            return range(1, totalPageCount)
        }
        const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1)
        const rightSiblingIndex = Math.min(currentPage + siblingsCount, currentPage + siblingsCount, totalPageCount)
        /*
         *  Do not show dots if there is only one position left
         *  after/before the left/right page count.
         */
        const shouldShowLeftDots = leftSiblingIndex > 2
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2

        const firstPageIndex = 1
        const lastPageIndex = totalPageCount

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + 2 * siblingsCount
            const leftRange = range(1, leftItemCount)

            return [...leftRange, DOTS, totalPageCount]
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + 2 * siblingsCount
            const rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount)

            return [firstPageIndex, DOTS, ...rightRange]
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = range(leftSiblingIndex, rightSiblingIndex)
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
        }

        return []
    }
    function range(start: number, end: number): number[] {
        const length = end - start + 1
        return Array.from({ length }, (_, idx) => idx + start)
    }

    /**
     * Navigate to next page.
     */
    function onNext(): void {
        onPageChange(currentPage + 1)
    }

    /**
     * Navigate to previous page.
     */
    function onPrevious(): void {
        onPageChange(currentPage - 1)
    }

    function updateRange() {
        paginationRange = updatePaginationRange()
        lastPage = paginationRange[paginationRange.length - 1] as number
    }

    $: totalCount, updateRange()
</script>

<ul
    class="pagination d-flex align-items-center list-unstyled list-inline mb-0"
    class:hidden={currentPage === 0 || paginationRange.length < 2}
>
    <li class="arrow cursor-pointer" class:disabled={currentPage === 1} on:click={onPrevious}>
        <Icon type="arrow-left-circle" size={24} />
    </li>
    {#each paginationRange as pageNumber}
        {#if pageNumber === DOTS}
            <li class="pagination-item dots d-flex align-items-center justify-content-center cursor-pointer">&#8230;</li>
        {:else}
            <li
                class="pagination-item d-flex align-items-center justify-content-center cursor-pointer"
                class:selected={pageNumber === currentPage}
                on:click={() => onPageChange(pageNumber)}
            >
                {pageNumber}
            </li>
        {/if}
    {/each}
    <li class="arrow cursor-pointer" class:disabled={currentPage === lastPage} on:click={onNext}>
        <Icon type="arrow-right-circle" size={24} />
    </li>
</ul>

<style lang="scss">
    .pagination {
        &.hidden {
            display: none;
        }
        .pagination-item {
            height: 32px;
            min-width: 32px;
            margin: auto 4px;
            opacity: 0.5;
            &.selected {
                opacity: 1;
            }
        }
        .arrow {
            &.disabled {
                pointer-events: none;
                opacity: 0.5;
            }
        }
    }
</style>
