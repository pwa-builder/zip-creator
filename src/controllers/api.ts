import { tmpdir } from "os";
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
      res.status(400).send("no request body found");
      return;
    }

    const fileLoc = path.resolve(__dirname /*tmpdir()*/, `${hash()}.zip`);
    logger.info(fileLoc);
    const zipStream = fs.createWriteStream(fileLoc);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // file compression level, probably needs tweaking
    });
    archive.pipe(zipStream);
    zipStream.on("finish", () => {
      res.download(fileLoc, "pwa_icon.zip", (err) => {
        if (err) {
          res.status(400);
          logger.error("file failed to send: " + err.message);
        }
        // fs.unlink(fileLoc, (err) => {
        //   logger.error(err);
        // });
      });
    });

    const fileCreated = await Zip.generate(zipStream, archive, req.body);

    if (!fileCreated) {
      res.status(400).send("zip was not created");
      logger.error("zip not created"); //, res);
    }
  } catch (error) {
    res.status(500).send("internal server error");
    logger.error("500 error path", res, error);
  }
};
