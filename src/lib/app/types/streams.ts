export enum SubscriptionState {
    Authorized = 'Authorized',
    Subscribed = 'Subscribed',
    Requested = 'Requested',
    NotSubscribed = 'NotSubscribed',
}

export enum ChannelType {
    public = 'public',
    private = 'private',
}

export type WriteMessageForm = {
    metadata?: string
    payload?: string
    publicPayload?: string
    type?: string
}

export type SearchOptions = {
    authorId?: string
    subscriberId?: string
    requestedSubscriptionId?: string
    topicSource?: string
    limit?: number
    index?: number
    ascending?: boolean
}