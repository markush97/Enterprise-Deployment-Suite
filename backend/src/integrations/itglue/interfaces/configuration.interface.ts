import { ITGlueConfigurationAttributes } from "./configuration-attributes.interface";
import { ITGlueConfigurationType } from "./configuration-type.enum";
import { ITGlueType } from "./itglue-type.enum";
import { ITGlueBase } from "./itglue.base.interface";

export interface ITGlueConfiguration extends ITGlueBase {
    type: ITGlueType.CONFIGURATION;
    attributes: ITGlueConfigurationAttributes
}
