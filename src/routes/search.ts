import { Router } from "express";
import { paramValid, respond } from "../utils";
import { getMeta } from "../songData";
import { langCodes } from "../constants";

export function initSearchRoutes(router: Router) {
  router.get("/search", async (req, res) => {
    try {
      const { q, artist, song, format: fmt, threshold: thr, preferLang: prLang } = req.query;

      const format: string = fmt ? String(fmt) : "json";
      const threshold = isNaN(Number(thr)) ? undefined : Number(thr);
      const preferLang = paramValid(prLang) && langCodes.has(prLang.toLowerCase()) ? prLang.toLowerCase() : undefined;

      if(paramValid(q) || (paramValid(artist) && paramValid(song))) {
        const meta = await getMeta({
          ...(q ? {
            q: String(q),
          } : {
            artist: String(artist),
            song: String(song),
          }),
          threshold,
          preferLang,
        });

        if(!meta || meta.all.length < 1)
          return respond(res, "clientError", "Found no results matching your search query", format, 0);

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

  router.get("/search/top", async (req, res) => {
    try {
      const { q, artist, song, format: fmt, threshold: thr, preferLang: prLang } = req.query;

      const format: string = fmt ? String(fmt) : "json";
      const threshold = isNaN(Number(thr)) ? undefined : Number(thr);
      const preferLang = paramValid(prLang) && langCodes.has(prLang.toLowerCase()) ? prLang.toLowerCase() : undefined;

      if(paramValid(q) || (paramValid(artist) && paramValid(song))) {
        const meta = await getMeta({
          ...(q ? {
            q: String(q),
          } : {
            artist: String(artist),
            song: String(song),
          }),
          threshold,
          preferLang,
        });

        if(!meta || !meta.top)
          return respond(res, "clientError", "Found no results matching your search query", format, 0);

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
