import { ITGlueType } from './itglue-type.enum';
import { ITGlueBase } from './itglue.base.interface';

export interface ITGlueManufacturer extends ITGlueBase {
  type: ITGlueType.MANUFACTURER;
  attributes: {
    name: string;
    'created-at': string;
    'updated-at': string;
  };
}
