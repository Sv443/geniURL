import { resolve } from "node:path";
import express, { Application, Router } from "express";
import { verMajor } from "../constants.js";

import { initSearchRoutes } from "./search.js";
import { initTranslationsRoutes } from "./translations.js";
import { initAlbumRoutes } from "./album.js";

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
  router.use("/docs", express.static(resolve("./www/docs/.vuepress/dist")));

  // mount router
  app.use(`/v${verMajor}`, router);

  // redirect to docs page
  app.get("/docs", (_req, res) => res.redirect(`/v${verMajor}/docs/`));
}
