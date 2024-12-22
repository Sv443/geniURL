import express, { type Application, Router } from "express";
import { docsPath, verMajor } from "@src/constants.js";
import { redirectToDocs } from "@src/utils.js";
import { envVarEquals } from "@src/env.js";

import { initSearchRoutes } from "@routes/search.js";
import { initTranslationsRoutes } from "@routes/translations.js";
import { initAlbumRoutes } from "@routes/album.js";

const hostHomepage = !envVarEquals("HOST_HOMEPAGE", false, false);

const routeFuncs: ((router: Router) => unknown)[] = [
  initSearchRoutes,
  initTranslationsRoutes,
  initAlbumRoutes,
];

const router = Router();

export function initRouter(app: Application) {
  for(const initRoute of routeFuncs)
    initRoute(router);

  // mount API router at versioned path
  app.use(`/v${verMajor}`, router);

  // health check
  router.get("/health", (_req, res) => res.status(200).send("Hello, World!"));
  router.get("/ping", (_req, res) => res.status(200).send("Pong!"));

  if(hostHomepage) {
    // host docs files
    router.use("/docs", express.static(docsPath, {
      index: "index.html",
    }));

    // redirect to docs page
    router.get("/", (_req, res) => redirectToDocs(res));
    app.get("/docs", (_req, res) => redirectToDocs(res));
  }
}
