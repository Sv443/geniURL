import type { Router } from "express";
import { paramValid, respond } from "@src/utils.js";
import { getMeta } from "@src/songData.js";

export function initSearchRoutes(router: Router) {
  //#region /search
  router.get("/search", async (req, res) => {
    try {
      const { q, artist, song, format: fmt, limit: lmt } = req.query;

      const format: string = fmt ? String(fmt) : "json";
      const limit = !paramValid(lmt) || isNaN(Number(lmt)) ? undefined : Number(lmt);

      if(paramValid(q) || (paramValid(artist) && paramValid(song))) {
        const meta = await getMeta({
          limit,
          ...(q ? {
            q: String(q),
          } : {
            artist: String(artist),
            song: String(song),
          }),
        });

        if(!meta || meta.all.length < 1) // TODO: verify
          return respond(res, "noResults",  format !== "xml" ? { top: null, all: [] } : { top: null, all: { "result": [] } }, format);

        // js2xmlparser needs special treatment when using arrays to produce a decent XML structure
        const response = format !== "xml" ? meta : { ...meta, all: { "result": meta.all } };

        return respond(res, "success", response, format, meta.all.length);
      }
      else
        return respond(res, "clientError", "No search params (?q or ?song and ?artist) provided or they are invalid", req?.query?.format ? String(req.query.format) : undefined);
    }
    catch(err) {
      return respond(res, "serverError", `Encountered an internal server error: ${err instanceof Error ? err.message : ""}`, "json");
    }
  });

  //#region /search/top
  router.get("/search/top", async (req, res) => {
    try {
      const { q, artist, song, format: fmt } = req.query;

      const format: string = fmt ? String(fmt) : "json";

      if(paramValid(q) || (paramValid(artist) && paramValid(song))) {
        const meta = await getMeta({
          limit: 1,
          ...(q ? {
            q: String(q),
          } : {
            artist: String(artist),
            song: String(song),
          }),
        });

        if(!meta || !meta.top) // TODO: verify
          return respond(res, "noResults", {}, format);

        return respond(res, "success", meta.top, format, 1);
      }
      else
        return respond(res, "clientError", "No search params (?q or ?song and ?artist) provided or they are invalid", req?.query?.format ? String(req.query.format) : undefined);
    }
    catch(err) {
      return respond(res, "serverError", `Encountered an internal server error${err instanceof Error ? err.message : ""}`, "json");
    }
  });
}
