export class JobInstructionsDto {
    action: JobInstructionAction

}

export enum JobInstructionAction {
    WAIT_FOR_INSTRUCTIONS = 'WAIT_FOR_INSTRUCTIONS',
}