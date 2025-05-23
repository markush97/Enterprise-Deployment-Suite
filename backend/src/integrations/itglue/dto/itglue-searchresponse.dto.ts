import { ITGlueBase } from '../interfaces/itglue.base.interface';

export class ITGlueResponseList<T extends ITGlueBase> {
  data: T[];
  meta: ITGlueSearchMetaDto;
}

export class ITGlueResponse<T extends ITGlueBase> {
  data: T;
}

export class ITGlueSearchMetaDto {
  'current-page': number;
  'total-pages': number;
  'total-count': number;
  filters: {};
}
