import type { ChannelInfo } from '@iota/is-client';

export interface ExtendedChannelInfo extends ChannelInfo {
    // NOTE: description & name are not yet supported by the SDK
    description?: string;
    name?: string;
}

export enum SubscriptionState {
    Authorized = 'Authorized',
    Subscribed = 'Subscribed',
    NotSubscribed = 'NotSubscribed',
}