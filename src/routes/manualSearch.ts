import { Router } from "express";

export function initManualSearchRoutes(router: Router) {
  router.get("/manual-search", (_req, res) => {
    res.sendFile("index.html", {
      root: "public",
      dotfiles: "deny",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  });
}