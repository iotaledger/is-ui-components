<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { readChannelHistory } from '$lib/app/streams'
    import { ChannelMessages } from '$lib/components'
    import type { ChannelData } from '@iota/is-client'
    import { ChannelType } from '@iota/is-shared-modules/lib/models/schemas/channel-info'
    import type { ChannelInfo as ChannelInfoType } from '@iota/is-shared-modules/lib/models/types/channel-info'

    import { showNotification } from '../../app/notification'
    import { NotificationType } from '$lib/app'
    import ChannelInfo from '$lib/components/streams/channel-info.svelte'

    const channel: ChannelInfoType = {
        name: '-',
        authorId: '-',
        channelAddress:
            '88feb27647d9a4428745550bd1a7e36e37c0f93eab6b1c861b399246b1c88a080000000000000000:570884bbbf0bde27d1c47d9d',
        topics: [],
        created: '-',
        description: '-',
    }
    let channelAddress: string =
        '88feb27647d9a4428745550bd1a7e36e37c0f93eab6b1c861b399246b1c88a080000000000000000:570884bbbf0bde27d1c47d9d'
    let channelData: ChannelData[] = []

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search)
        const channelType = urlParams.get('type')
        const presharedKey = urlParams.get('preshared-key')

        console.log('channelType)', channelType)
        console.log('presharedKey)', presharedKey)
        if (channelType) {
            if (channelType !== ChannelType.public && channelType !== ChannelType.private) {
                showNotification({
                    type: NotificationType.Error,
                    message: 'Channel Type must be public or private!',
                })
                return
            }
        }

        channelData = await readChannelHistory(channelAddress, presharedKey, channelType as ChannelType)
    })
    onDestroy(() => {})
</script>

<div class="w-full">
    <div class="mb-4">
        <ChannelInfo {channel} loading={false} />
    </div>
    <div class="mb-4">
        <ChannelMessages {channelData} />
    </div>
</div>
