import type { ChannelInfo } from 'boxfish-studio--iota-is-sdk';

export interface ExtendedChannelInfo extends ChannelInfo {
    isOwned?: boolean;
    isSubscribed?: boolean;
}

export enum SubscriptionState {
    Unsubscribed = 'Unsubscribed',
    Subscribed = 'Subscribed',
    Pending = 'Pending',
}

