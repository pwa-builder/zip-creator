import * as fs from "fs";
import * as path from "path";
import { setTimeout } from "timers";
import archiver from "archiver";
import { Response, Request } from "express";
import logger from "../util/logger";
import hash from "../util/hash";
import Zip from "../util/zip";

const TEN_MINUTES = 600000;

function rootPath(): string {
  return process.cwd().endsWith("azure-express-zip-creator")
    ? process.cwd()
    : path.resolve(__dirname, "../../");
}

/**
 * GET /api
 * List of API examples.
 */
export const getApi = async (req: Request, res: Response) => {
  if (!req.query.id) {
    res.status(400).json({
      message: "requires query id",
    });
    return;
  }
  const filepath = path.resolve(rootPath(), "public", req.query.id + ".zip");

  fs.promises
    .access(filepath, fs.constants.R_OK)
    .then(() => {
      res.download(filepath, "pwa-icon.zip", (err) => {
        if (err) {
          res.status(400).json({
            message: "the file was not found",
          });
        } else {
          logger.info("successful retrieval of file.");
        }
      });

      fs.unlink(filepath, (err) => {
        logger.error(err);
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: "cannot send file",
      });
      logger.error(`file cannot be sent: ${err.message}`);
    });
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
      res.status(400).json({ message: "no request body found" });
      return;
    } else if (!Array.isArray(req.body)) {
      res
        .status(400)
        .json({ message: "no request body is not an array of objects" });
      return;
    }

    /*
      Create file and zip, set it up to stream files to,
    */
    const filename = hash();
    const fileLoc = path.resolve(rootPath(), "public", `${filename}.zip`);
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
      setTimeout(() => {
        fs.unlink(fileLoc, (err) => {
          if (err) {
            logger.error(
              `error while unlinking occurred: ${err && err.message}`
            );
          } else {
            logger.info("successful file handoff");
          }
        });
      }, TEN_MINUTES);
    });

    // When the stream finishes and a response has not been sent (i.e. no errors), send the document.
    zipStream.on("finish", () => {
      res.status(200).json({
        zipId: filename
      });
      // if (!res.writableFinished) {
      //   res.download(fileLoc, "pwa_icon.zip", (err) => {
      //     if (err) {
      //       res.status(400).json({ message: "file failed to send" });
      //       logger.error(`file failed to send: ${err.message}`);
      //     }
      //   });
      // }
    });

    /*
      Adding files to the zip.
    */
    const fileCreated = await Zip.generate(archive, req.body);

    if (!fileCreated) {
      res.status(400).json({ message: "zip was not created" });
      logger.error("zip not created"); //, res);
    }
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    logger.error("500 error path", res, error);
  }
};
