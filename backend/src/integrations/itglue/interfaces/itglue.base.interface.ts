import { ITGlueConfigurationType } from './configuration-type.enum';
import { ITGlueType } from './itglue-type.enum';

export interface ITGlueBase {
  id?: number;
  type: ITGlueType;
  attributes: object;
}
