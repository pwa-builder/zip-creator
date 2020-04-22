import * as fs from "fs";
import archiver from "archiver";
import axios from "axios";
import {
  isUri,
  isHttp,
  uriElements,
  generateFilename,
  encodingGuard,
} from "./zip-utils";
import { IconMetaData, FileMetaData, supportedImageTypes } from "./zip-types";
import logger from "./logger";
/*
  Normalizes the data for easy consumption of the lower level.
    - If the uri is a http then makes a HEAD request to retrieve the content-type.
    - If the uri is a data url, then splits it into the parts and assigns them accordingly.
*/
async function parseMetaData({ src }: IconMetaData): Promise<FileMetaData> {
  let mimeType;
  let encodingString;
  let encoding: BufferEncoding;
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
  Http fetch from url, throws errors to a higher level for handling, and skips the image.
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
  if (isUri(src)) {
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
  fileStream: fs.WriteStream,
  zip: archiver.Archiver,
  icons: IconMetaData[]
): Promise<boolean> {
  let index = 0;
  const length = icons.length;
  let count = 0;
  for (; index < length; index++) {
    try {
      const metadata = icons[index];
      const fileMetaData = await parseMetaData(metadata);
      if (!supportedImageTypes.has(fileMetaData.mimeType)) {
        console.log("skipped");
        // console.log("skipped", fileMetaData, fileMetaData.mimeType);
        continue; // Skip if the mimeType is not supported
      }

      const name = generateFilename(metadata, fileMetaData);
      const file = await getData(metadata, fileMetaData);

      zip.append(file, { name });
      count++;
    } catch (err) {
      // ignore errors form other services for now
      console.error(err);
      continue;
    }
  }

  zip.finalize();

  if (count > 0) {
    return true;
  }

  return false;
}

export default {
  generate,
};
