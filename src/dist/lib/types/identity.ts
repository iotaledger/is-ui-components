import type { User, UserType, VerifiableCredentialInternal } from 'iota-is-sdk';

export type RegistrationUser = {
    type: UserType;
    fields: {
        name: string;
        required: boolean;
    }[];
}

export interface ExtendedUser extends User {
    type?: UserType | string;
    vc?: VerifiableCredentialInternal[];
}
