export interface LocalFileDto {
  filename: string;
  path: string;
  mimetype: string;
  originalFilename?: string;
  isFolder?: boolean;
}
