import type { ChannelInfo } from 'iota-is-sdk';

export interface ExtendedChannelInfo extends ChannelInfo {
    isOwner?: boolean;
    isSubscriber?: boolean;
}
