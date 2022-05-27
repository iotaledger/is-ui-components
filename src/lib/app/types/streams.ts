export enum SubscriptionState {
    Authorized = 'Authorized',
    Subscribed = 'Subscribed',
    NotSubscribed = 'NotSubscribed',
}

export type StreamsFilter = {
    authorFilterState: boolean
}

export enum ChannelType {
    public = 'public',
    private = 'private',
}
