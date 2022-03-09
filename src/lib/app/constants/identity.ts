import { CredentialTypes, UserType } from 'boxfish-studio--iota-is-sdk'
import type { RegistrationUser } from '../types/identity'
import { DeviceControlledProperty, FieldType, ProductEnum } from '../types/identity'
import { BoxColor } from './colors'

export const USERS: RegistrationUser[] = [
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

export const VC_TEMPLATES = [
	{
		id: 'demoTemplateProfessor',
		name: '[Demo Template] Professor',
		fields: [
			{
				id: 'fullName',
				label: 'Full name',
				type: 'text',
				required: true,
			},
			{
				id: 'experience',
				label: 'Years of experience',
				type: 'number',
				required: true,
			},
			{
				id: 'dateOfBirth',
				label: 'Date of birth',
				type: 'date',
				required: false,
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
				label: 'Company name',
				type: 'text',
				required: true,
			},
			{
				id: 'employees',
				label: 'Total of employees',
				type: 'number',
				required: true,
			},
			{
				id: 'country',
				label: 'Country',
				type: 'text',
				required: false,
			},
			{
				id: 'city',
				label: 'City',
				type: 'text',
				required: false,
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

export const MAXIMUM_SEARCH_RESULTS = 100
