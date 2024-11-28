import { resolve } from "node:path";
import express, { Application, Router } from "express";
import packageJson from "../../package.json";

import { initSearchRoutes } from "./search.js";
import { initTranslationsRoutes } from "./translations.js";
import { initAlbumRoutes } from "./album.js";
import { fileURLToPath } from "node:url";

const routeFuncs: ((router: Router) => unknown)[] = [
  initSearchRoutes,
  initTranslationsRoutes,
  initAlbumRoutes,
];

const router = Router();

export function initRouter(app: Application) {
  for(const initRoute of routeFuncs)
    initRoute(router);

  // redirect to GitHub page
  router.get("/", (_req, res) => res.redirect(packageJson.homepage));

  // redirect to docs page
  router.get("/docs", (_req, res) => res.redirect("/docs/"));

  // host docs files
  router.use("/docs", express.static(resolve(fileURLToPath(import.meta.url), "../../www/docs/.vuepress/dist")));
  app.use("/", router);
}
