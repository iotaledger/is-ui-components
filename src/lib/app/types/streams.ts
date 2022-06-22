export enum SubscriptionState {
    Authorized = 'Authorized',
    Subscribed = 'Subscribed',
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
    limit?: number
    authorId?: string
    subscribedId?: string 
    requestedSubscriptionId?: string 
}