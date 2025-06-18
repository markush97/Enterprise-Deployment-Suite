export class JobInstructionsDto {
  action: JobInstructionAction;
  context?: {
    deviceName?: string;
    organisationName?: string;
    organisationShortName?: string;
    organisationId?: string;
    startedBy?: string;
    startedById?: string;
  }
}

export enum JobInstructionAction {
  WAIT_FOR_INSTRUCTIONS = 'WAIT_FOR_INSTRUCTIONS',
  START_INSTALLATION = 'START_INSTALLATION',
}
