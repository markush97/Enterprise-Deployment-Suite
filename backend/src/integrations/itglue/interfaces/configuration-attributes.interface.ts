import { ITGlueConfigurationType } from "./configuration-type.enum";
import { ITGlueOperatingSystem } from "./itglue.operatingsystems.enum";

export interface ITGlueConfigurationAttributes {
    "name": string;
    "manufacturer-id"?: number;
    "model-id"?: number;
    "notes"?: string;
    "serial-number"?: string;
    "asset-tag"?: string;
    "installed-by"?: string;
    "installed-on"?: string;
    "configuration-type-id": ITGlueConfigurationType;
    "operating-system-id"?: ITGlueOperatingSystem;
    "operating-system-notes"?: string;
};
