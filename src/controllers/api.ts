import * as  http from "http";
import * as fs from "fs";
import archiver from "archiver";
import * as path from "path";
import { Response, Request } from "express";
import { PostBodyShape } from "./api-types";
import logger from "../util/logger";
import hash from "../util/hash";
import Zip from "../util/zip";
import multer from "multer";
import os from "os";
import { ManifestIcon } from "../util/zip-types";


const allowedOrigins = new Set([
  "pwabuilder.com",
  "www.pwabuilder.com",
  "localhost",
  "azure-express-zip-creator.azurewebsites.net"
]);
function defaultHeaders(req: http.ClientRequestArgs & Request, res: Response) {
  res.set({
    "Access-Control-Allow-Methods": ["OPTIONS", "GET", "POST"],
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": allowedOrigins.has(req.hostname) ? req.headers.origin : "",
  });
}

/**
 * OPTIONS /api
 */
export const optionsApi = (req: Request, res: Response) => {
  defaultHeaders(req, res);
  res.sendStatus(200);
};

/**
 * GET /api
 * List of API examples.
 */
export const getApi = (req: Request, res: Response) => {
  defaultHeaders(req, res);
  res.status(200).json({});
};

/**
 * POST /api
 * req {
 *  body:  Express.Multer.File[][]
 * }
 * res {
 *  status: statusCode
 *  body: zipFile.zip
 * }
 */
export const postApi = async (req: Request, res: Response & PostBodyShape) => {
  const icons = JSON.parse(req.body.icons) as ManifestIcon[];
  
  try {
    defaultHeaders(req, res);
    if (!req.body && !req.files) {
      res.status(400).json({ message: "no request body found" });
      return;
    };  
    
    /*
      Create file and zip, set it up to stream files to,
    */
    const rootPath = process.cwd().endsWith("azure-express-zip-creator")
      ? process.cwd()
      : path.resolve(__dirname, "../../");
    const fileLoc = path.resolve(rootPath, os.tmpdir(), `${hash()}.zip`);
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
            res.status(400).json({ message: "file failed to send" });
            logger.error(`file failed to send: ${err.message}`);
          }
        });
      }
    });

    /*
      Adding files to the zip.
    */
   
    const fileCreated = await Zip.generate(archive, req.files as any, icons);

    if (!fileCreated) {
      res.status(400).json({ message: "zip was not created" });
      logger.error("zip not created"); //, res);
    }
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    logger.error("500 error path", res, error);
  }
};


