<script lang="ts">
    import { Col, Container, Row } from 'sveltestrap'
    import { Box } from '$lib/components'

    import { showNotification } from '$lib/app/notification'
    import { NotificationType } from '$lib/app'
    import { Button, Input, Label } from 'sveltestrap'
    import { ChannelType } from '@iota/is-shared-modules/lib/models/schemas/channel-info'
    import { goto } from '$app/navigation'

    const MIN_LENGTH_INPUT = 12
    const MAX_LENGTH_INPUT = 30

    let channelType = ChannelType.private
    let channelAddress: string = ''
    let presharedKey: string = ''
    let formValidated = false

    const onSubmit = () => {
        if (!channelAddress || channelAddress.length < MIN_LENGTH_INPUT) {
            return
        }
        if (channelType === ChannelType.private && !presharedKey) {
            showNotification({
                type: NotificationType.Error,
                message: 'You need to define a preshared key for private channels!',
            })
            return
        }
        formValidated = true
        goto(`/history/${channelAddress}?type=${channelType}&preshared-key=${presharedKey}`)
    }
</script>

<Box>
    <Col sm="12">
        <form class:was-validated={formValidated} on:submit|preventDefault novalidate>
            <Label class="mt-3">Channel Type</Label>
            <Input required type="select" name="select" class="mb-4" bind:value={channelType}>
                <option value={ChannelType.private}>Private Channel</option>
                <option value={ChannelType.public}>Public Channel</option>
            </Input>
            <Label>Preshared Key</Label>
            <Input
                placeholder={'Channel address...'}
                required
                type="textarea"
                minlength={MIN_LENGTH_INPUT}
                bind:value={channelAddress}
            />
            <div class="invalid-feedback">This field is required and requires a valid channel address.</div>
            <Label class="mt-3">Preshared Key</Label>
            <Input
                placeholder={'Preshared key...'}
                type="textarea"
                minlength={MIN_LENGTH_INPUT}
                maxlength={MAX_LENGTH_INPUT}
                bind:value={presharedKey}
            />

            <Button size="lg" block class="mt-4" color="primary" on:click={onSubmit}>
                <div class="d-flex justify-content-center align-items-center">Read history</div>
            </Button>
        </form>
    </Col>
</Box>
