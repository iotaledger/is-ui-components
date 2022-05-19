<script lang="ts">
    import { readChannelHistory } from '$lib/app/streams'
    import { ChannelMessages } from '$lib/components'
    import type { ChannelData } from '@iota/is-client'
    import { ChannelType } from '@iota/is-shared-modules/lib/models/schemas/channel-info'
    import type { ChannelInfo as ChannelInfoType } from '@iota/is-shared-modules/lib/models/types/channel-info'

    import { showNotification } from '../../app/notification'
    import { NotificationType } from '$lib/app'
    import ChannelInfo from '$lib/components/streams/channel-info.svelte'

    export let channelAddress
    export let channelType: string
    export let presharedKey: string

    let isSpinnerVisible = true
    let channelData: ChannelData[] = []
    let channel: ChannelInfoType = {
        name: '-',
        authorId: '-',
        channelAddress,
        topics: [],
        created: '-',
        description: '-',
    }

    const readHistory = async () => {
        if (!channelAddress) {
            return
        }
        channel = {
            ...channel,
            channelAddress,
        }
        if (channelType) {
            if (channelType !== ChannelType.public && channelType !== ChannelType.private) {
                showNotification({
                    type: NotificationType.Error,
                    message: 'Channel Type must be public or private!',
                })
                isSpinnerVisible = false
                return
            }
        }

        channelData = await readChannelHistory(channelAddress, presharedKey, channelType as ChannelType)
        isSpinnerVisible = false
    }

    $: channelAddress, readHistory()
</script>

<div class="w-full">
    <div class="mb-4">
        <ChannelInfo {channel} />
    </div>
    <div class="mb-4">
        <ChannelMessages {channelData} {isSpinnerVisible} />
    </div>
</div>
