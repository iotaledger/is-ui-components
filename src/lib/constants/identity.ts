import type { RegistrationUser } from '$lib/types/identity';
import { UserType } from 'iota-is-sdk';

export const USERS: RegistrationUser[] = [
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
        id: 'demo_template_1',
        name: 'Demo Template 1',
        fields: [
            {
                id: "full_name",
                label: 'Full name',
                type: 'text',
                required: true
            },
            {
                id: "birth_date",
                label: 'Birth date',
                type: 'date',
                required: true
            }
        ],
        userType: UserType.Person,
    },
    {
        id: 'demo_template_2',
        name: 'Demo Template 2',
        fields: [
            {
                id: "country",
                label: 'Country',
                type: 'text',
                required: true
            },
            {
                id: "genre",
                label: 'Genre',
                type: 'text',
                required: false
            }
        ],
        userType: UserType.Person,
    }
];

export const MAXIMUM_SEARCH_RESULTS = 100;