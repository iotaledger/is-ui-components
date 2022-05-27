import type { Filter } from './shared'

export enum SubscriptionState {
    Authorized = 'Authorized',
    Subscribed = 'Subscribed',
    NotSubscribed = 'NotSubscribed',
}

export type StreamsFilter = {
    authorFilter?: Filter
}

export enum ChannelType {
    public = 'public',
    private = 'private',
}
