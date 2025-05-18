import { ITGlueBase } from "./itglue.base";

export interface ITGlueModel extends ITGlueBase {
    "type": "model",
    "attributes": {
        "name": string,
    }
}
