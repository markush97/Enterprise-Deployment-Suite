import { ITGlueConfigurationType } from './configuration-type.enum';
import { ITGlueType } from './itglue-type.enum';
import { ITGlueBase } from './itglue.base.interface';

export interface ITGlueModel extends ITGlueBase {
  type: ITGlueType.MODEL;
  attributes: {
    name: string;
  };
}
