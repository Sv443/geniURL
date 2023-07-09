import { Router } from "express";
import { paramValid, respond } from "../utils";
import { getTranslations } from "../songData";
import { langCodes } from "../constants";

export function initTranslationsRoutes(router: Router) {
  router.get("/translations", (req, res) => {
    const format: string = req.query.format ? String(req.query.format) : "json";

    return respond(res, "clientError", "No song ID provided", format);
  });

  router.get("/translations/:songId", async (req, res) => {
    try {
      const { songId } = req.params;
      const { format: fmt, preferLang: prLang } = req.query;

      const format: string = fmt ? String(fmt) : "json";
      const preferLang = paramValid(prLang) && langCodes.has(prLang.toLowerCase()) ? prLang.toLowerCase() : undefined;

      if(!paramValid(songId) || isNaN(Number(songId)))
        return respond(res, "clientError", "Provided song ID is invalid", format);

      const translations = await getTranslations(Number(songId), { preferLang });

      if(!translations || translations.length === 0)
        return respond(res, "clientError", "Couldn't find translations for this song", format, 0);

      return respond(res, "success", { translations }, format, translations.length);
    }
    catch(err) {
      return respond(res, "serverError", `Encountered an internal server error: ${err instanceof Error ? err.message : ""}`, "json");
    }
  });
}
