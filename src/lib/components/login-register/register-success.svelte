<script lang="ts">
    import { createJsonDataUrl } from '$lib/app/utils'
    import { Box, Icon } from '$lib/components'
    import type { IdentityJson, UserType } from 'boxfish-studio--iota-is-sdk'

    export let identity: IdentityJson
    export let type: UserType
    export let username: string
    export let switchToLogin: () => void = () => {}

    const jsonDataUrl = createJsonDataUrl(identity)
</script>

<Box>
    <div class="mb-4 d-flex flex-column align-items-center">
        <h1 class="mb-1">New identity created</h1>
        <div>
            <span class="text-primary cursor-pointer" on:click={switchToLogin}>Log in with DID</span>
        </div>
    </div>
    <div class="bg-light rounded w-100 d-flex flex-column justify-content-center align-items-center p-4">
        <div class="mb-3">
            <Icon type="identity" size={48} />
        </div>
        <span class="border-bottom text-break px-2 px-md-5 pb-4 text-center mb-4">{identity?.doc?.id}</span>
        <div class="d-flex justify-content-between align-items-center w-100 mb-1">
            <p>Type</p>
            <p>{type}</p>
        </div>
        <div class="d-flex justify-content-between align-items-center w-100">
            <p>Username</p>
            <p>{username}</p>
        </div>
    </div>
    <a
        class="d-flex align-items-center justify-content-center mt-4 btn btn-primary btn-block w-100 btn-lg"
        href={jsonDataUrl}
        role="button"
        download="identity.json"
    >
        <Icon type="download" />
        <span class="ms-2">Save identity</span>
    </a>
</Box>
