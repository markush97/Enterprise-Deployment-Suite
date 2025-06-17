export class JobInstructionsDto {
  action: JobInstructionAction;
  context?: {
    deviceName?: string;
    organisationName?: string;
    organisationShortName?: string;
    createdBy?: string;
  }
}

export enum JobInstructionAction {
  WAIT_FOR_INSTRUCTIONS = 'WAIT_FOR_INSTRUCTIONS',
  START_INSTALLATION = 'START_INSTALLATION',
}
