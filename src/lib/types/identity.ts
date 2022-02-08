import type { UserType } from 'iota-is-sdk';

export interface IUser {
    type: UserType;
    fields: {
        name: string;
        required: boolean;
    }[];
}