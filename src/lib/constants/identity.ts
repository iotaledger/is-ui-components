import type { IUser } from '$lib/types/identity';
import { UserType } from 'iota-is-sdk';

export const USERS: IUser[] = [
    {
        type: UserType.Person,
        fields: [
            {
                name: 'username',
                required: true
            },
            {
                name: 'country',
                required: false
            }
        ]
    },
    {
        type: UserType.Organization,
        fields: [
            {
                name: 'username',
                required: true
            }
        ]
    },
    {
        type: UserType.Service,
        fields: [
            {
                name: 'username',
                required: true
            },
            {
                name: 'class',
                required: false
            }
        ]
    },
    {
        type: UserType.Device,
        fields: [
            {
                name: 'username',
                required: true
            },
            {
                name: 'smartphone',
                required: false
            }
        ]
    },
    {
        type: UserType.Product,
        fields: [
            {
                name: 'username',
                required: true
            }
        ]
    },
    {
        type: UserType.Unknown,
        fields: [
            {
                name: 'username',
                required: true
            }
        ]
    }
];

export const VC_TEMPLATES = [
    {
        id: 'full_name',
        name: 'Full name',
        type: "text",
        userType: UserType.Person,
        required: true
    },
    {
        id: 'birth_date',
        name: 'Birth date',
        type: "date",
        userType: UserType.Person,
        required: true
    }
];
