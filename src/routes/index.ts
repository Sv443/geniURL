import { Application, Router } from "express";
import packageJson from "../../package.json";

import { initSearchRoutes } from "./search";
import { initTranslationsRoutes } from "./translations";
import { initAlbumRoutes } from "./album";
import { initManualSearchRoutes } from "./manualSearch";

const routeFuncs: ((router: Router) => unknown)[] = [
  initSearchRoutes,
  initTranslationsRoutes,
  initAlbumRoutes,
  initManualSearchRoutes,
];

const router = Router();

export function initRouter(app: Application) {
  for(const initRoute of routeFuncs)
    initRoute(router);

  // redirect to GitHub page
  router.get("/", (_req, res) => res.redirect(packageJson.homepage));

  app.use("/", router);
}
