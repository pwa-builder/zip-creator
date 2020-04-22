import * as fs from "fs";
import archiver from "archiver";
import * as path from "path";
import { Response, Request } from "express";
import logger from "../util/logger";
import hash from "../util/hash";
import Zip from "../util/zip";
/**
 * GET /api
 * List of API examples.
 */
export const getApi = (req: Request, res: Response) => {
  res.json({});
};

/**
 * POST /api
 * req {
 *  body: IconMetadata[]
 * }
 * res {
 *  status: statusCode
 *  body: zipFile.zip
 * }
 */
export const postApi = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      res.status(400).json({message:"no request body found"});
      return;
    } else if (!Array.isArray(req.body)) {
      res.status(400).json({message:"no request body is not an array of objects"});
      return;
    }

    /*
      Create file and zip, set it up to stream files to,
    */
    const rootPath = (process.cwd().endsWith("azure-express-zip-creator")) ? process.cwd(): path.resolve(__dirname, "../../");
    const fileLoc = path.resolve(rootPath, "public", `${hash()}.zip`);
    logger.info(fileLoc);
    const zipStream = fs.createWriteStream(fileLoc);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // file compression level, probably needs tweaking
    });
    archive.pipe(zipStream);

    /*
      Event Listeners
    */
    // delete the file when the server is finished responding.
    res.on("close", () => {
      fs.unlink(fileLoc, (err) => {
        if (err) {
          logger.error(`error while unlinking occurred: ${err && err.message}`);
        } else {
          logger.info("successful file handoff");
        }
      });
    });

    // When the stream finishes and a response has not been sent (i.e. no errors), send the document.
    zipStream.on("finish", () => {
      if (!res.writableFinished) {
        res.download(fileLoc, "pwa_icon.zip", (err) => {
          if (err) {
            res
              .status(400)
              .json({ message: "file failed to send"});
            logger.error(`file failed to send: ${err.message}`);
          }
        });
      }
    });

    /*
      Adding files to the zip.
    */
    const fileCreated = await Zip.generate(archive, req.body);

    if (!fileCreated) {
      res.status(400).json({message: "zip was not created"});
      logger.error("zip not created"); //, res);
    }
  } catch (error) {
    res.status(500).json({message: "internal server error"});
    logger.error("500 error path", res, error);
  }
};
