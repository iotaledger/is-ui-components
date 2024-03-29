<script lang="ts">
    import { DEFAULT_TABLE_CONFIGURATION } from '$lib/app/constants/base'
    import type { ActionButton } from '$lib/app/types/layout'
    import type { TableConfiguration, TableData } from '$lib/app/types/table'
    import { Icon, SearchInput, Table } from '$lib/components'
    import { Button, Spinner } from 'sveltestrap'

    export let title = 'Identities'
    export let tableData: TableData
    export let loading: boolean = false
    export let actionButtons: ActionButton[] = []
    export let message: string
    export let showSearch: boolean = false
    export let onSearch = (..._: any[]): void => {}
    export let searchQuery: string = ''
    export let tableConfiguration: TableConfiguration = DEFAULT_TABLE_CONFIGURATION
</script>

<div class="identity-manager w-100 h-100 d-flex flex-column">
    <div class="mb-4 d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between">
        <div class="d-flex align-items-center">
            <h1>{title}</h1>
            {#if loading}
                <div class="ms-4">
                    <Spinner type="border" color="secondary" size="sm" />
                </div>
            {/if}
        </div>
        <div class="box d-flex flex-column align-items-center">
            {#if actionButtons}
                {#each actionButtons as { label, onClick, icon, color, loading, disabled }}
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
                        <span>{label}</span>
                        {#if loading}
                            <div class="ms-2 flex align-items-center"><Spinner size="sm" type="border" /></div>
                        {/if}
                    </Button>
                {/each}
            {/if}
        </div>
    </div>
    {#if showSearch}
        <div class="mb-4">
            <SearchInput placeholder="Search for an identity" bind:value={searchQuery} onSubmit={onSearch} />
        </div>
    {/if}

    {#if tableData?.rows?.length}
        <Table data={tableData} {loading} {...tableConfiguration} />
    {:else if message}
        <div class="text-center">
            {message}
        </div>
    {/if}
</div>
