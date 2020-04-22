import { tmpdir } from "os";
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
      res.status(400)
        .send("no request body found");
      return;
    }

    const fileLoc = path.resolve(tmpdir(), `${hash()}.zip`);
    logger.info(fileLoc);
    const fileCreated = await Zip.generate(fileLoc, req.body);

    if (!fileCreated) {
      res.status(400).send("zip was not created");
      logger.error("zip not created");//, res);
    } else {
      // res.on("finish", () => {
      //   if (fileCreated) {
      //     fs.unlink(fileLoc, (err) => {
      //       logger.error(err);
      //     });
      //   }
      // });

      res
        .status(200)
        .download(fileLoc, "pwa_icon.zip");

      logger.info("zip created successfully");
    }
  } catch (error) {
    res.status(500)
      .send("internal server error");
    logger.error("500 error path", res, error);
  }
};
