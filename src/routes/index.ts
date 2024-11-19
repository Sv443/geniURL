import { Application, Router } from "express";
import packageJson from "../../package.json";

import { initSearchRoutes } from "./search";
import { initTranslationsRoutes } from "./translations";
import { initAlbumRoutes } from "./album";

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

  app.use("/", router);
}
