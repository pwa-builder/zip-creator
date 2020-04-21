export interface IconMetaData {
  src: string;
  generated?: boolean;
  type?: string;
  sizes: string;
}

export interface FileMetaData {
  mimeType: SupportedTypes;
  encoding: BufferEncoding;
  data?: string;
}

export enum SupportedTypes {
  jpeg = "image/jpeg",
  bmp = "image/bmp",
  gif = "image/gif",
  png = "image/png",
  webp = "image/webp",
  ico = "image/x-icon",
  msico = "image/vnd.microsoft.icon",
}

export enum FileExtensions {
  "image/jpeg" = "jpeg",
  "image/bmp" = "bmp",
  "image/gif" = "git",
  "image/png" = "png",
  "image/webp" = "webp",
  "image/x-icon" = "ico",
  "image/vnd.microsoft.icon" = "ico",
}
