import { Router } from "express";
import { paramValid, respond } from "../utils";
import { getTranslations } from "../songData";

export function initTranslationsRoutes(router: Router) {
  router.get("/translations", (req, res) => {
    const format: string = req.query.format ? String(req.query.format) : "json";

    return respond(res, "clientError", "No song ID provided", format);
  });

  router.get("/translations/:songId", async (req, res) => {
    const { format: fmt } = req.query;
    const format: string = fmt ? String(fmt) : "json";

    try {
      const { songId } = req.params;

      if(!paramValid(songId) || isNaN(Number(songId)))
        return respond(res, "clientError", "Provided song ID is invalid", format);

      const translations = await getTranslations(Number(songId));

      if(translations === null || (Array.isArray(translations) && translations.length === 0))
        return respond(res, "clientError", "Couldn't find translations for this song", format, 0);

      if(translations === undefined)
        return respond(res, "clientError", "Couldn't find a song with the provided ID", format, undefined);

      return respond(res, "success", { translations }, format, translations.length);
    }
    catch(err) {
      return respond(res, "serverError", `Encountered an internal server error: ${err instanceof Error ? err.message : ""}`, format);
    }
  });
}
