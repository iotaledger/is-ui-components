<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import { BoxColor } from '$lib/app/constants/colors'
    import { isUserOwnerOfChannel } from '$lib/app/streams'
    import { Icon, Subscription } from '$lib/components'
    import type { ChannelInfo, Subscription as SubscriptionType } from '@iota/is-client'
    import { Accordion, AccordionItem, Badge } from 'sveltestrap'

    export let channel: ChannelInfo
    export let subscriptions: SubscriptionType[] = undefined
    export let handleAcceptSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()
    export let handleRejectSubscription: (subscriptionId: string) => Promise<void> = () => Promise.resolve()

    $: isUserOwner = isUserOwnerOfChannel($authenticatedUserDID, channel)
    $: authorizedSubscriptions = subscriptions?.filter((subscription) => subscription.isAuthorized) ?? []
    $: pendingSubscriptions = subscriptions?.filter((subscription) => !subscription.isAuthorized) ?? []
</script>

<div class="w-full">
    {#if authorizedSubscriptions?.length}
        <div class="my-4">
            <Accordion>
                <AccordionItem>
                    <div slot="header" class="d-flex align-items-center">
                        <Icon
                            type="person-check
                        "
                            boxed
                            boxColor={BoxColor.Red}
                            size={48}
                        />
                        <div class="ms-4 d-flex">
                            <div class="fs-6 fw-bold me-2">Authorized Subscribers</div>
                            <Badge color="info">{authorizedSubscriptions.length}</Badge>
                        </div>
                    </div>
                    {#each authorizedSubscriptions as subscription}
                        <Subscription
                            {subscription}
                            {handleRejectSubscription}
                            label="Subscriber Id"
                            allowRejectAction={isUserOwner && subscription?.id !== $authenticatedUserDID}
                        />
                    {/each}
                </AccordionItem>
            </Accordion>
        </div>
    {/if}
    {#if pendingSubscriptions?.length}
        <div class="my-4">
            <Accordion>
                <AccordionItem>
                    <div slot="header" class="d-flex align-items-center">
                        <Icon type="exclamation-circle" boxed boxColor={BoxColor.Red} size={48} />
                        <div class="ms-4 d-flex">
                            <div class="fs-6 fw-bold me-2">Pending subscriptions</div>
                            <Badge color="danger">{pendingSubscriptions.length}</Badge>
                        </div>
                    </div>
                    {#each pendingSubscriptions as subscription}
                        <Subscription
                            {subscription}
                            {handleAcceptSubscription}
                            {handleRejectSubscription}
                            label="Requester Id"
                            allowAcceptAction={isUserOwner}
                            allowRejectAction={isUserOwner}
                        />
                    {/each}
                </AccordionItem>
            </Accordion>
        </div>
    {/if}
</div>
