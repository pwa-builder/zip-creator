import archiver from "archiver";
import axios from "axios";
import {
  isUri,
  isHttp,
  uriElements,
  generateFilename,
  encodingGuard,
} from "./zip-utils";
import { IconMetaData, FileMetaData, supportedImageTypes, ManifestIcon} from "./zip-types";
import logger from "./logger";
import { request } from "http";
import { Readable } from "stream";

/*
  Normalizes the data for easy consumption of the lower level.
    - If the uri is a http then makes a HEAD request to retrieve the content-type.
    - If the uri is a data url, then splits it into the parts and assigns them accordingly.
*/
export async function parseMetaData({ path }: IconMetaData): Promise<FileMetaData> {
  let mimeType;
  let encodingString;
  let encoding: BufferEncoding;
  let data;

  if (isHttp(path)) {
    const response = await axios.head(path);
    mimeType = response.headers["content-type"];
    encoding = "binary";
    data = null;
  } else if (isUri(path)) {
    [mimeType, encodingString, data] = uriElements(path);
    encoding = encodingGuard(encodingString);
  }

  return { mimeType, encoding, data };
}

/*
  Http fetch from url, throws errors to a higher level for handling, and skips the image.
*/
export async function fetchHttp(url: string): Promise<Buffer> {
  const response = await axios
    .get(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.57 PWABuilderHttpAgent" }
    })
    .catch((err) => {
      throw err;
    });

    if(response.status !== 200) {
      throw new Error(`status code: ${response.status}`);
    };

  // Success path
  return Buffer.from(response.data, "binary");
}

/*
  Handles the retrieval of the file either by GET or converting an encoded string to a buffer
*/
export async function getData(
  { path }: IconMetaData,
  { encoding, data }: FileMetaData
): Promise<Buffer> {
  if (isUri(path)) {
    logger.info("parsing uri");
    return Buffer.from(data, encoding);
  } else if (isHttp(path)) {
    logger.info(`fetching: ${path}`);
    return fetchHttp(path);
  }
}


/*
  Generates the zip file and passes back the archive reference to pipe to the attachment.
  Does not kill the archive reference here, needs to be done in the calling function.
*/
export async function generate(
  zip: archiver.Archiver,
  encodedIconsBinary: Express.Multer.File[],
  icons: ManifestIcon[],
): Promise<boolean> {
  let count = 0;
  const encodedIcons = icons.filter(icon => icon.src.includes("data:image"));
  const urlBasedIcons = icons.filter(icon => !icon.src.includes("data:image"));

  try {
    if(icons.length > 0) {
      for (let index = 0; index < urlBasedIcons.length; index++) {
        const image = icons[index];
        
          /*
           if the user does not have a image.type set for each icon
           we can create their types for them from the file extension
           they have on the image.src.
          */
          if(!image.type){
            const splitSrc = image.src.split("/");
            const imageName = splitSrc[splitSrc.length - 1];
            const splitName = imageName.split(".");
            let extension = splitName[splitName.length - 1];
            if(extension === "jpg"){
              extension = "jpeg";
            }
            const constructedType = "image/" + extension;
            image.type = constructedType;
          }
          if (!supportedImageTypes.has(image.type as any)) {
            console.log("skipped");
            // Skip if the mimeType is not supported
            continue;
          }
          
          const buffer = await fetchHttp(image.src);

          const name = generateFilename(image.sizes, image.type);
          zip.append(buffer, {name});
        
          count++;
      };
    };
    for (let index = 0; index < encodedIconsBinary.length; index++) {
        const file = encodedIconsBinary[index];
        const icon = encodedIcons[index];
        if (!supportedImageTypes.has(icon.type as any)) {
          console.log("skipped");
          continue; // Skip if the mimeType is not supported
        }
        
        const name = generateFilename(icon.sizes, icon.type);
        zip.file(file.path, {name}); 
        count++;
    }
 } catch (err) {
  // ignore errors form other services for now
  console.error(err);
}
  await zip.finalize();

  if (count > 0) {
    return true;
  }

  return false;
}

export default {
  generate,
};