import { ApiVersion, ClientConfig, IdentityClient, UserType } from 'iota-is-sdk';

export interface IUser {
    type: UserType;
    fields: {
        name: string;
        required: boolean;
    }[];
}

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

const config: ClientConfig = {
    apiKey: import.meta.env.VITE_API_KEY, // Deployed Integration Services API KEY
    baseUrl: import.meta.env.VITE_BASE_URL, // URL of the Integration Services API
    apiVersion: ApiVersion.v01
};

export const identityClient = new IdentityClient(config);

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
