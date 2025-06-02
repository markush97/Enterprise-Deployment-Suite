export class FileOverviewDto {
  name: string;
  fileSize: number;
  fileType: string;
  children: FileOverviewDto[] | null;
}
