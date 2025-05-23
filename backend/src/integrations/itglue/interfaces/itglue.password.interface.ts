import { ITGlueType } from './itglue-type.enum';
import { ITGlueBase } from './itglue.base.interface';

export interface ITGluePassword extends ITGlueBase {
  type: ITGlueType.PASSWORDS;
  attributes: {
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    'organization-id'?: number;
    'resource-id'?: number;
    'resource-type'?: string;
    'password-type-id'?: number;
  };
}
