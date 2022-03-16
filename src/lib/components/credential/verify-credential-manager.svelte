<script lang="ts">
    import { BoxColor } from '$lib/app/constants/colors'
    import { CREDENTIAL_ICON } from '$lib/app/constants/identity'
    import { verifyVC } from '$lib/app/identity'
    import { Box, Icon, JSONViewer } from '$lib/components'
    import type { VerifiableCredentialInternal } from 'boxfish-studio--iota-is-sdk'
    import Dropzone from 'svelte-file-dropzone'
    import { Accordion, AccordionItem, Badge, Spinner } from 'sveltestrap'
    import type { Color } from 'sveltestrap/src/shared'

    export let maxFiles: number = 10

    let errorMessage: string
    let loading: boolean = false
    let files: {
        fileName?: string
        content?: VerifiableCredentialInternal
        loading?: boolean
        verified?: boolean
        validFile?: boolean
    }[] = []

    const MESSAGES = {
        verified: {
            color: 'success' as Color,
            message: 'Verified',
        },
        notVerified: {
            color: 'danger' as Color,
            message: 'Not verified',
        },
        invalid: {
            color: 'warning' as Color,
            message: 'Invalid file',
        },
    }

    function readFileAsText(file: Blob): Promise<string | ArrayBuffer> {
        return new Promise(function (resolve, reject) {
            let fr = new FileReader()

            fr.onload = function () {
                resolve(fr.result)
            }

            fr.onerror = function () {
                reject(fr)
            }

            fr.readAsText(file)
        })
    }

    function handleFilesSelect(event: CustomEvent): void {
        errorMessage = null
        files = []
        loading = true

        let uploadesFiles = event.detail.acceptedFiles

        // Abort if there were no files selected
        if (!uploadesFiles.length) return

        if (uploadesFiles.length > maxFiles) {
            loading = false
            files = []
            errorMessage = `You can only upload a maximum of ${maxFiles} files`
        } else {
            let readers = []

            // Store promises in array
            for (let i = 0; i < uploadesFiles.length; i++) {
                files.push({
                    fileName: uploadesFiles[i].name,
                    loading: true,
                })
                readers.push(readFileAsText(uploadesFiles[i]))
            }

            Promise.all(readers).then(async (values) => {
                for await (const [index, fileContent] of values.entries()) {
                    let vcJson: VerifiableCredentialInternal
                    try {
                        vcJson = JSON.parse(fileContent.toString())
                        const validVC = await verifyVC(vcJson)
                        files[index] = {
                            ...files[index],
                            content: vcJson,
                            loading: false,
                            verified: validVC,
                            validFile: true,
                        }
                    } catch (e) {
                        files[index] = {
                            ...files[index],
                            loading: false,
                            validFile: false,
                        }
                    }
                }
                loading = false
            })
        }
    }
</script>

<Box>
    <div class="d-flex flex-column align-items-center justify-content-center">
        <Icon type={CREDENTIAL_ICON.icon} size={48} />
        <h1 class="mt-3 mb-4">Verify a credential</h1>
    </div>
    <div class="w-100 mb-2">
        <Dropzone on:drop={handleFilesSelect}><p>Upload JSON files or drag and drop</p></Dropzone>
        {#if errorMessage}
            <p class="text-danger">{errorMessage}</p>
        {/if}
        {#if loading}
            <p class="mt-2">Uploading...</p>
        {/if}
    </div>

    {#each files as { fileName, content, loading, verified, validFile }}
        {#if loading}
            <div class="mt-3">
                <Spinner size="sm" type="border" color="primary" />
            </div>
        {:else if validFile}
            <Accordion class="w-100 mt-3">
                <AccordionItem>
                    <div slot="header" class="d-flex align-items-center">
                        <Icon type={CREDENTIAL_ICON.icon} boxed boxColor={CREDENTIAL_ICON.boxColor} size={48} />
                        <div class="ms-3 me-3 text-break d-flex align-items-center">
                            <span class="me-2"> {fileName}</span>
                            <Badge color={MESSAGES[verified ? 'verified' : 'notVerified'].color}
                                >{MESSAGES[verified ? 'verified' : 'notVerified'].message}</Badge
                            >
                        </div>
                    </div>
                    <div class="my-4">
                        {#if content}
                            <div class="mt-4 mb-3">
                                <span>JSON content</span>
                            </div>
                            <div class="mt-1 p-4 bg-light rounded">
                                <JSONViewer json={JSON.stringify(content, null, '\t')} />
                            </div>
                        {/if}
                    </div>
                </AccordionItem>
            </Accordion>
        {:else}
            <div class="w-100 border rounded mt-3 py-2 px-3 d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <Icon type="exclamation-circle" boxed size={48} boxColor={BoxColor.Transparent} />
                    <span class="text-break ms-1">{fileName}</span>
                </div>
                <div class="d-flex align-items-center ms-2">
                    <Badge color={MESSAGES.invalid.color}>{MESSAGES.invalid.message}</Badge>
                </div>
            </div>
        {/if}
    {/each}
</Box>
