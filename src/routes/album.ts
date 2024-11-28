import { Router } from "express";
import { paramValid, respond } from "../utils.js";
import { getAlbum } from "../songData.js";

export function initAlbumRoutes(router: Router) {
  //#region /album
  router.get("/album", (req, res) => {
    const format: string = req.query.format ? String(req.query.format) : "json";

    return respond(res, "clientError", "No song ID provided", format);
  });

  //#region /album/:songId
  router.get("/album/:songId", async (req, res) => {
    try {
      const { songId } = req.params;
      const { format: fmt } = req.query;

      const format: string = fmt ? String(fmt) : "json";

      if(!paramValid(songId) || isNaN(Number(songId)))
        return respond(res, "clientError", "Provided song ID is invalid", format);

      const album = await getAlbum(Number(songId));

      if(!album)
        return respond(res, "clientError", "Couldn't find any associated album for this song", format, 0);

      return respond(res, "success", { album }, format, 1);
    }
    catch(err) {
      return respond(res, "serverError", `Encountered an internal server error: ${err instanceof Error ? err.message : ""}`, "json");
    }
  });
}
