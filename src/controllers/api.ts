"use strict";

import { Response, Request } from "express";
import logger from "../util/logger";
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
    const zip = await Zip.generate(req.body);

    if (!zip) {
      res.status(400);
      logger.error("zip not created");
    } else {
      res
        .status(200)
        .header({
          "Content-Type": "application/zip",
          "Content-Disposition": "attachment; filename=pwa_icons.zip",
        })
        .attachment("pwa-icons.zip")
        .pipe(zip);
      await zip.finalize();
      res.end();
    }
  } catch (error) {
    res.sendStatus(500);
    logger.error(error);
  }
};
