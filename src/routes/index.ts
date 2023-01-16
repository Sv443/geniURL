import { Application, Router } from "express";
import packageJson from "../../package.json";

import { initSearchRoutes } from "./search";
import { initTranslationsRoutes } from "./translations";

const routeFuncs: ((router: Router) => unknown)[] = [
    initSearchRoutes,
    initTranslationsRoutes,
];

const router = Router();

export function initRouter(app: Application) {
    for(const initRoute of routeFuncs)
        initRoute(router);

    // redirect to GitHub page
    router.get("/", (_req, res) => res.redirect(packageJson.homepage));

    app.use("/", router);
}
