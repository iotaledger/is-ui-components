import type { Input } from '$lib/app/types/form'
import type { CredentialTypes, User, UserType, VerifiableCredentialInternal } from '@iota/is-client'

export enum FieldType {
    Date = 'date',
    Email = 'email',
    MultipleSelector = 'multipleSelector',
    Number = 'number',
    Selector = 'selector',
    StringArray = 'stringArray',
    Text = 'text',
    TextArea = 'textarea',
    Checkbox = 'checkbox',
}

export enum ProductEnum {
    'actuator' = 'actuator',
    'beacon' = 'beacon',
    'endgun' = 'endgun',
    'HVAC' = 'HVAC',
    'implement' = 'implement',
    'irrSection' = 'irrSection',
    'irrSystem' = 'irrSystem',
    'meter' = 'meter',
    'multimedia' = 'multimedia',
    'network' = 'network',
    'sensor' = 'sensor',
}

export enum DeviceControlledProperty {
    'airPollution' = 'airPollution',
    'atmosphericPressure' = 'atmosphericPressure',
    'cdom' = 'cdom',
    'conductance' = 'conductance',
    'conductivity' = 'conductivity',
    'depth' = 'depth',
    'eatingActivity' = 'eatingActivity',
    'electricityConsumption' = 'electricityConsumption',
    'energy' = 'energy',
    'fillingLevel' = 'fillingLevel',
    'freeChlorine' = 'freeChlorine',
    'gasComsumption' = 'gasComsumption',
    'heading' = 'heading',
    'humidity' = 'humidity',
    'light' = 'light',
    'location' = 'location',
    'milking' = 'milking',
    'motion' = 'motion',
    'movementActivity' = 'movementActivity',
    'noiseLevel' = 'noiseLevel',
    'occupancy' = 'occupancy',
    'orp' = 'orp',
    'pH' = 'pH',
    'power' = 'power',
    'precipitation' = 'precipitation',
    'pressure' = 'pressure',
    'refractiveIndex' = 'refractiveIndex',
    'salinity' = 'salinity',
    'smoke' = 'smoke',
    'soilMoisture' = 'soilMoisture',
    'solarRadiation' = 'solarRadiation',
    'speed' = 'speed',
    'tds' = 'tds',
    'temperature' = 'temperature',
    'tss' = 'tss',
    'turbidity' = 'turbidity',
    'waterConsumption' = 'waterConsumption',
    'waterPollution' = 'waterPollution',
    'weatherConditions' = 'weatherConditions',
    'weight' = 'weight',
    'windDirection' = 'windDirection',
    'windSpeed' = 'windSpeed',
}

export interface ExtendedUser extends User {
    type?: UserType | string
    numberOfCredentials?: number
    vc?: VerifiableCredentialInternal[]
}

export type IdentityTemplate = {
    type: UserType
    fields: {
        id: string
        name: string
        required?: boolean
        type: FieldType
        tooltip?: string
        defaultState?: boolean
        options?: {
            label: string
            value: string
        }[]
    }[]
}

export type VerifiableCredentialTemplate = {
    id: string
    name: string
    fields: Input[]
    credentialType: CredentialTypes
    userType: UserType
}

// TODO: Replace with shared-modules enum when when shared-modules are working
export enum UserRoles {
    Admin = 'Admin',
    Manager = 'Manager',
    User = 'User',
}

export type JwtUser = {
    id: string
    publicKey: string
    role: UserRoles
    username: string
}
