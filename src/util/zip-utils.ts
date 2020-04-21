import { IconMetaData, FileMetaData, FileExtensions } from "./zip-types";

export function isUri(src: string): boolean {
  return src.startsWith("data:");
}

export function isHttp(src: string): boolean {
  return src.startsWith("http");
}

// returns [mimeType: string, BufferEncoding: string, data: string]
export function uriElements(uri: string): string[] {
  const [, ...elements] = uri.match("data:(.*);(.*),(.*)");
  return elements;
}

export function generateFilename(
  { sizes }: IconMetaData,
  { mimeType }: FileMetaData
): string {
  return `icon-${sizes}.${FileExtensions[mimeType]}`;
}

export function encodingGuard(encodingString: string): BufferEncoding {
  switch (encodingString) {
    // binary
    case "latin1":
    case "binary":
      return "binary";
    // hex
    case "hex":
      return "hex";
    // ascii
    case "ascii":
    case "charset=US-ASCII":
      return "ascii";
    // utf-8
    case "utf8":
    case "utf-8":
    case "charset=utf-8":
      return "utf-8";
    // base64
    case "base64":
    default:
      // the standard states that the encoding is base64, if their encoding is any different, they'll receive a mangled file.
      return "base64";
  }
}
