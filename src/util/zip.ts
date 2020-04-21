import archiver from "archiver";
import axios from "axios";
import { IconMetaData, FileExtensions, FileMetaData } from "api";
import {
  isUri,
  isHttp,
  uriElements,
  generateFilename,
  encodingGuard,
} from "./zip-utils";

const supportedImageTypes = new Set([...Object.keys(FileExtensions)]);

/*
  Normalizes the data for easy consumption of the lower level.
    - If the uri is a http then makes a HEAD request to retrieve the content-type.
    - If the uri is a data url, then splits it into the parts and assigns them accordingly.
*/
async function parseMetaData({ src }: IconMetaData): Promise<FileMetaData> {
  let mimeType;
  let encodingString;
  let encoding;
  let data;

  if (isHttp(src)) {
    const response = await axios.head(src);
    mimeType = response.headers["content-type"];
    encoding = "binary";
    data = null;
  } else if (isUri(src)) {
    [mimeType, encodingString, data] = uriElements(src);
    encoding = encodingGuard(encodingString);
  }

  return { mimeType, encoding, data };
}

/*
  Http fetch from url, throws errors to a higher level for handling.
*/
async function fetchHttp(url: string): Promise<Buffer> {
  const response = await axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .catch((err) => {
      throw err;
    });

  // Success path
  return Buffer.from(response.data, "binary");
}

/*
  Handles the retrieval of the file either by GET or converting an encoded string to a buffer
*/
async function getData(
  { src }: IconMetaData,
  { encoding, data }: FileMetaData
): Promise<Buffer> {
  if (data && isUri(data)) {
    return Buffer.from(data, encoding);
  } else if (isHttp(src)) {
    return fetchHttp(src);
  }
}

/*
  Generates the zip file and passes back the archive reference to pipe to the attachment.
  Does not kill the archive reference here, needs to be done in the calling function.
*/
export async function generate(
  icons: IconMetaData[]
): Promise<archiver.Archiver> {
  const archive = archiver("zip", {
    zlib: { level: 9 }, // file compression level, probably needs tweaking
  });

  let index = 0;
  const length = icons.length;
  let count = 0;
  for (; index < length; index++) {
    try {
      const metadata = icons[index];
      const fileMetaData = await parseMetaData(metadata);
      if (!supportedImageTypes.has(fileMetaData.mimeType)) {
        console.log("skipped", fileMetaData, fileMetaData.mimeType);
        continue; // Skip if the mimeType is not supported
      }

      const name = generateFilename(metadata, fileMetaData);
      const file = await getData(metadata, fileMetaData);
      console.log(metadata, name, file, fileMetaData);

      archive.append(file, { name });
      count++;
    } catch (err) {
      // ignore errors form other services for now
      console.error(err);
      continue;
    }
  }

  if (count > 0) {
    return archive;
  }

  return null;
}

export default {
  generate,
};
