import { Readable } from "stream";

export interface IconMetaData {
  fieldname: string;
  /** Name of the file on the uploader's computer. */
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: Readable;
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination: string;
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename: string;
  /** `DiskStorage` only: Full path to the uploaded file. */
  path: string;
  /** `MemoryStorage` only: A Buffer containing the entire file. */
  buffer: Buffer;
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

export const FileExtensions = [
  { type: "image/jpeg", extension: "jpg" },
  { type: "image/bmp",  extension: "bmp" },
  { type: "image/gif", extension: "git" },
  { type: "image/png", extension: "png" },
  { type: "image/webp", extension: "webp" },
  { type: "image/x-icon", extension: "ico" },
  { type: "image/vnd.microsoft.icon", extension: "ico" }
];

export interface ManifestIcon  {
  src?: string;
  sizes?: string;
  type?: string;
}
export const supportedImageTypes = new Set([...Object.values(SupportedTypes)]);
