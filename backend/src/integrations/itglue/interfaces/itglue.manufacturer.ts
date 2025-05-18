import { ITGlueBase } from "./itglue.base";

export interface ITGlueManufacturer extends ITGlueBase {
    "type": "manufacturer",
    "attributes": {
        "name": string,
        "created-at": string,
        "updated-at": string
    }
}
