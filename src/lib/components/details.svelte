<script lang="ts">
    import { JSONViewer } from '$lib/components'
    import { identityClient } from '$lib/app/base'
    import { createJsonDataUrl } from '$lib/app/utils'
    import { onMount } from 'svelte'
    import { FormGroup, Input } from 'sveltestrap'

    export let id: string

    let identity

    onMount(async () => {
        identity = await identityClient.find(id)
    })
</script>

{#if identity}
    <div>
        <FormGroup floating label="Id">
            <Input type="text" value={identity?.id} readonly />
        </FormGroup>
        <FormGroup floating label="Registration date">
            <Input type="text" value={identity?.registrationDate} readonly />
        </FormGroup>
        <FormGroup floating label="Username">
            <Input type="text" value={identity?.username} readonly />
        </FormGroup>
        <FormGroup floating label="Type">
            <Input type="text" value={identity?.claim?.type} readonly />
        </FormGroup>
        {#if identity?.verifiableCredentials}
            <div>Verifiable credentials</div>
            {#each identity?.verifiableCredentials as vc}
                <div class="json-box text-break p-4 my-4">
                    <JSONViewer json={JSON.stringify(vc, null, '\t')} />
                    <div class="download">
                        <a href={createJsonDataUrl(identity)} download="identity.json">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-download"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
                                />
                                <path
                                    d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
{/if}

<style lang="scss">
    .json-box {
        background-color: #e9ecef;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        position: relative;

        .download {
            position: absolute;
            bottom: 8px;
            right: 8px;

            a {
                color: #212529;
            }
        }
    }
</style>
