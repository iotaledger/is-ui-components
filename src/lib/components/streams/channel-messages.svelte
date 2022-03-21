<script lang="ts">
    import type { ActionButton } from '$lib/app/types/layout'
    import { isJson } from '$lib/app/utils'
    import { Icon, JSONViewer } from '$lib/components'
    import type { ChannelData } from 'boxfish-studio--iota-is-sdk'
    import { Button, Spinner } from 'sveltestrap'

    export let channelData: ChannelData[] = []
    export let actionButtons: ActionButton[] = []
</script>

<div class="w-full">
    {#each channelData as msg}
        <div class="p-4 bg-light my-4">
            <div class="d-lg-flex justify-content-between mb-lg-4">
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Timestamp</div>
                    <div class="text-break">{msg?.imported}</div>
                </div>
                <div class="info-box mb-4 mb-lg-0 me-lg-4">
                    <div class="text-secondary">Type</div>
                    <div>{msg?.log?.type}</div>
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

            <div class="mb-4">
                <div class="text-secondary">Public data</div>
                {#if isJson(msg?.log?.publicPayload)}
                    <JSONViewer json={msg?.log?.publicPayload} />
                {:else}
                    <span>{msg?.log?.publicPayload}</span>
                {/if}
            </div>
            <div class="mb-4">
                <div class="text-secondary">Encrypted data</div>
                {#if isJson(msg?.log?.payload)}
                    <JSONViewer json={msg?.log?.payload} />
                {:else}
                    <span>{msg?.log?.payload}</span>
                {/if}
            </div>
            <div class="mb-4">
                <div class="text-secondary">Metadata</div>
                {#if isJson(msg?.log?.metadata)}
                    <JSONViewer json={msg?.log?.metadata} />
                {:else}
                    <span>{msg?.log?.metadata}</span>
                {/if}
            </div>
        </div>
    {/each}
    <div class="d-flex justify-content-end mt-4">
        <div class="box d-flex flex-column align-items-center">
            {#if actionButtons}
                {#each actionButtons as { label, onClick, icon, color }}
                    <Button size="sm" outline color={color ?? 'dark'} on:click={onClick} class="d-flex align-items-center mt-3">
                        {#if icon}
                            <div class="me-1">
                                <Icon type={icon} size={16} />
                            </div>
                        {/if}
                        <span>{label}</span>
                    </Button>
                {/each}
            {/if}
        </div>
    </div>
    <div class="p-4 d-flex align-items-center shadow rounded mt-4">
        <Spinner class="ms-2 me-4" type="grow" size="sm" color="secondary" />
        <div class="fw-bold">Waiting for channel data...</div>
    </div>
</div>
