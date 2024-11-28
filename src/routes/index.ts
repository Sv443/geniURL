import { resolve } from "node:path";
import express, { Application, Router } from "express";
import { verMajor } from "@src/constants.js";
import { redirectToDocs } from "@src/utils.js";

import { initSearchRoutes } from "@routes/search.js";
import { initTranslationsRoutes } from "@routes/translations.js";
import { initAlbumRoutes } from "@routes/album.js";

const hostHomepage = process.env.HOST_HOMEPAGE?.toLowerCase() !== "false";

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

  if(hostHomepage) {
    // host docs files
    router.use("/docs", express.static(resolve("./www/.vuepress/dist")));

    // redirect to docs page
    router.get("/", (_req, res) => redirectToDocs(res));
    app.get("/docs", (_req, res) => redirectToDocs(res));
  }
}
