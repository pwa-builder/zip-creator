import express, { Response, Request } from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import flash from "express-flash";
import { SESSION_SECRET } from "./util/secrets";

// Controllers (route handlers)
import * as apiController from "./controllers/api";

// Create Express server
const app = express();

// Express configuration
app.set("port", 8080);
// app.set("port", process.env.PORT || 6000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
  })
);
// security need to add back in
// app.use(flash());
// app.use(lusca.xframe("SAMEORIGIN"));
// app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  next();
});
app.use((req: Request, res: Response, next) => {
  // After successful login, redirect back to the intended page
  if (!req.path.match(/^\/auth/) && !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});

/**
 * API examples routes.
 */
// app.get("/api", apiController.getApi);
app.post("/api", apiController.postApi);

export default app;
