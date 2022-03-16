import { CredentialTypes, UserType } from 'boxfish-studio--iota-is-sdk'
import type { IdentityTemplate, VerifiableCredentialTemplate } from '../types/identity'
import { DeviceControlledProperty, FieldType, ProductEnum } from '../types/identity'
import type { TableConfiguration } from '../types/table'
import { BoxColor } from './colors'

export const WELCOME_IDENTITIES_NUMBER = 5
export const DEFAULT_IDENTITIES_TABLE_PAGE_SIZE = 5
export const DEFAULT_IDENTITY_SEARCH_TIMEOUT = 200
export const DEFAULT_IDENTITY_REQUEST_LIMIT = 2

export const DEFAULT_IDENTITIES_TEMPLATES: IdentityTemplate[] = [
	{
		type: UserType.Person,
		fields: [
			{
				id: 'username',
				name: 'username',
				required: true,
				type: FieldType.String,
			},
			{
				id: 'name',
				name: 'name',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'firstName',
				name: 'First name',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'lastName',
				name: 'Last name',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'description',
				name: 'Description',
				type: FieldType.String,
			},
			{
				id: 'image',
				name: 'Image',
				type: FieldType.String,
			},
			{
				id: 'address',
				name: 'Address',
				type: FieldType.String,
			},
			{
				id: 'jobTitle',
				name: 'Job title',
				type: FieldType.String,
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
				type: FieldType.String,
				required: true,
			},
			{
				id: 'name',
				name: 'Name',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'description',
				name: 'Description',
				type: FieldType.String,
			},
			{
				id: 'url',
				name: 'Url',
				type: FieldType.String,
			},
			{
				id: 'image',
				name: 'Image',
				type: FieldType.String,
			},
			{
				id: 'address',
				name: 'Address',
				type: FieldType.String,
			},
			{
				id: 'brand',
				name: 'Brand',
				type: FieldType.String,
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
				type: FieldType.String,
				required: true,
			},
			{
				id: 'name',
				name: 'Name',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'description',
				name: 'Description',
				type: FieldType.String,
			},
			{
				id: 'url',
				name: 'Url',
				type: FieldType.String,
			},
			{
				id: 'category',
				name: 'Category',
				type: FieldType.String,
			},
			{
				id: 'brand',
				name: 'Brand',
				type: FieldType.String,
			},
		],
	},
	{
		type: UserType.Device,
		fields: [
			{
				id: 'username',
				name: 'username',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'name',
				name: 'name',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'description',
				name: 'Description',
				type: FieldType.String,
			},
			{
				id: 'url',
				name: 'Url',
				type: FieldType.String,
			},
			{
				id: 'category',
				name: 'Category',
				type: FieldType.MultipleSelector,
				options: Object.keys(ProductEnum).map((key) => key),
			},
			{
				id: 'controlledProperty',
				name: 'Controlled property',
				type: FieldType.MultipleSelector,
				options: Object.keys(DeviceControlledProperty).map((key) => key),
			},
		],
	},
	{
		type: UserType.Product,
		fields: [
			{
				id: 'username',
				name: 'username',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'name',
				name: 'name',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'description',
				name: 'Description',
				type: FieldType.String,
			},
			{
				id: 'url',
				name: 'Url',
				type: FieldType.String,
			},
			{
				id: 'image',
				name: 'Image',
				type: FieldType.String,
			},
			{
				id: 'address',
				name: 'Address',
				type: FieldType.String,
			},
			{
				id: 'brand',
				name: 'Brand',
				type: FieldType.String,
			},
			{
				id: 'manufacturer',
				name: 'Manufacturer',
				type: FieldType.String,
			},
			{
				id: 'category',
				name: 'Category',
				type: FieldType.StringArray,
			},
			{
				id: 'productId',
				name: 'Product Id',
				type: FieldType.String,
			},
			{
				id: 'productionDate',
				name: 'Production date',
				type: FieldType.String,
			},
			{
				id: 'material',
				name: 'Material',
				type: FieldType.String,
			},
		],
	},
	{
		type: UserType.Unknown,
		fields: [
			{
				id: 'username',
				name: 'username',
				type: FieldType.String,
				required: true,
			},
			{
				id: 'name',
				name: 'name',
				type: FieldType.String,
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
				type: FieldType.String,
				required: true,
			}
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
				type: FieldType.String,
				required: true,
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

export const DEFAULT_TABLE_CONFIGURATION: TableConfiguration = {
	isPaginated: true,
	siblingsCount: 2,
	pageSize: DEFAULT_IDENTITIES_TABLE_PAGE_SIZE,
}
