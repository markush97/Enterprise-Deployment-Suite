import { ITGlueBase } from '../interfaces/itglue.base.interface';

export class ITGlueRequest<T extends ITGlueBase> {
  data: T;
}
