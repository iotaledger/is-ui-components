import { CredentialTypes, UserType } from '@iota/is-client'
import type { IdentityTemplate, VerifiableCredentialTemplate } from '../types/identity'
import { DeviceControlledProperty, FieldType, ProductEnum } from '../types/identity'
import { BoxColor } from './colors'

export const DEFAULT_IDENTITIES_TEMPLATES: IdentityTemplate[] = [
    {
        type: UserType.Person,
        fields: [
            {
                id: 'username',
                name: 'username',
                required: true,
                type: FieldType.Text,
            },
            {
                id: 'firstName',
                name: 'First name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'lastName',
                name: 'Last name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'image',
                name: 'Image',
                type: FieldType.Text,
            },
            {
                id: 'address',
                name: 'Address',
                type: FieldType.Text,
            },
            {
                id: 'jobTitle',
                name: 'Job title',
                type: FieldType.Text,
            },
            {
                id: 'email',
                name: 'Email',
                type: FieldType.Email,
            },
            {
                id: 'bithdate',
                name: 'Birth date',
                type: FieldType.Date,
            },
        ],
    },
    {
        type: UserType.Organization,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'Name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'image',
                name: 'Image',
                type: FieldType.Text,
            },
            {
                id: 'address',
                name: 'Address',
                type: FieldType.Text,
            },
            {
                id: 'brand',
                name: 'Brand',
                type: FieldType.Text,
            },
            {
                id: 'email',
                name: 'Email',
                type: FieldType.Email,
            },
        ],
    },
    {
        type: UserType.Service,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'Name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'category',
                name: 'Category',
                type: FieldType.Text,
            },
            {
                id: 'brand',
                name: 'Brand',
                type: FieldType.Text,
            },
        ],
    },
    {
        type: UserType.Device,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'category',
                name: 'Category',
                type: FieldType.MultipleSelector,
                options: Object.keys(ProductEnum).map((key) => ({ label: key, value: key })),
            },
            {
                id: 'controlledProperty',
                name: 'Controlled property',
                type: FieldType.MultipleSelector,
                options: Object.keys(DeviceControlledProperty).map((key) => ({ label: key, value: key })),
            },
        ],
    },
    {
        type: UserType.Product,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'image',
                name: 'Image',
                type: FieldType.Text,
            },
            {
                id: 'address',
                name: 'Address',
                type: FieldType.Text,
            },
            {
                id: 'brand',
                name: 'Brand',
                type: FieldType.Text,
            },
            {
                id: 'manufacturer',
                name: 'Manufacturer',
                type: FieldType.Text,
            },
            {
                id: 'category',
                name: 'Category',
                type: FieldType.StringArray,
            },
            {
                id: 'productId',
                name: 'Product Id',
                type: FieldType.Text,
            },
            {
                id: 'productionDate',
                name: 'Production date',
                type: FieldType.Text,
            },
            {
                id: 'material',
                name: 'Material',
                type: FieldType.Text,
            },
        ],
    },
    {
        type: UserType.Unknown,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'name',
                type: FieldType.Text,
                required: true,
            },
        ],
    },
]

export const DEFAULT_VCS_TEMPLATES: VerifiableCredentialTemplate[] = [
    {
        id: 'demoTemplateFullName',
        name: '[Demo Template] Full Name',
        fields: [
            {
                id: 'fullName',
                name: 'Full name',
                type: FieldType.Text,
                required: true,
                minLength: 3,
                maxLength: 100,
            },
        ],
        credentialType: CredentialTypes.VerifiedIdentityCredential,
        userType: UserType.Person,
    },
    {
        id: 'demoTemplateSmallCompany',
        name: '[Demo Template] Small company',
        fields: [
            {
                id: 'companyName',
                name: 'Company name',
                type: FieldType.Text,
                required: true,
                minLength: 3,
                maxLength: 100,
            },
            {
                id: 'employees',
                name: 'Total of employees',
                type: FieldType.Number,
                required: true,
            },
        ],
        credentialType: CredentialTypes.BasicIdentityCredential,
        userType: UserType.Organization,
    },
]

export const USER_ICONS = {
    [UserType.Person]: {
        icon: 'person',
        boxColor: BoxColor.Blue,
    },
    [UserType.Organization]: {
        icon: 'building',
        boxColor: BoxColor.Yellow,
    },
    [UserType.Device]: {
        icon: 'tablet',
        boxColor: BoxColor.Red,
    },
    [UserType.Service]: {
        icon: 'cpu',
        boxColor: BoxColor.Green,
    },
    [UserType.Unknown]: {
        icon: 'bug',
        boxColor: BoxColor.Orange,
    },
    [UserType.Product]: {
        icon: 'box',
        boxColor: BoxColor.Teal,
    },
}

export const CREDENTIAL_ICON = {
    icon: 'credential',
    boxColor: BoxColor.Purple,
}

export const DEFAULT_CREATOR_FILTER_STATE = true;
