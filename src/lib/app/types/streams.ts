import type { Filter } from "./shared";

export enum SubscriptionState {
    Authorized = 'Authorized',
    Subscribed = 'Subscribed',
    NotSubscribed = 'NotSubscribed',
}

export type StreamsFilter = {
    limitFilter?: Filter
    authorFilter?: Filter
}
