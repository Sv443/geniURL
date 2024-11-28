import { resolve } from "node:path";
import express, { Application, Router } from "express";
import { verMajor } from "@src/constants.js";
import { redirectToDocs } from "@src/utils.js";

import { initSearchRoutes } from "@routes/search.js";
import { initTranslationsRoutes } from "@routes/translations.js";
import { initAlbumRoutes } from "@routes/album.js";

const routeFuncs: ((router: Router) => unknown)[] = [
  initSearchRoutes,
  initTranslationsRoutes,
  initAlbumRoutes,
];

const router = Router();

export function initRouter(app: Application) {
  for(const initRoute of routeFuncs)
    initRoute(router);

  // host docs files
  router.use("/docs", express.static(resolve("./www/.vuepress/dist")));

  // redirect to docs page
  router.get("/", (_req, res) => redirectToDocs(res));

  // healthcheck
  router.get("/health", (_req, res) => res.status(200).send("Hello, World!"));

  // redirect to docs page
  app.get("/docs", (_req, res) => redirectToDocs(res));

  // mount router
  app.use(`/v${verMajor}`, router);
}
