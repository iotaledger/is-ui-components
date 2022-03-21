<script lang="ts">
    import { authenticatedUserDID } from '$lib/app/base'
    import { BoxColor } from '$lib/app/constants/colors'
    import { isUserOwnerOfChannel } from '$lib/app/streams'
    import type { ExtendedChannelInfo } from '$lib/app/types/streams'
    import { Icon, Subscription } from '$lib/components'
    import type { Subscription as SubscriptionType } from 'boxfish-studio--iota-is-sdk'
    import { Accordion, AccordionItem, Badge } from 'sveltestrap'

    export let channel: ExtendedChannelInfo
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
                            {handleAcceptSubscription}
                            {handleRejectSubscription}
                            label="Subscriber Id"
                            displayActionButtons={false}
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
                            displayActionButtons={isUserOwner}
                        />
                    {/each}
                </AccordionItem>
            </Accordion>
        </div>
    {/if}
</div>
