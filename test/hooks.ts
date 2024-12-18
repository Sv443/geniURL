import { baseUrl, defaultFetchOpts } from "./consts";

//#region validate objects

/** Checks if the given object has the specified properties */
export function checkObjProps(val: unknown, props: string[]) {
  expect(typeof val).toBe("object");
  for(const prop of props)
    expect(val).toHaveProperty(prop);
}

/** Checks if the given song object has the required properties */
export function checkSongProps(songObj: unknown) {
  return checkObjProps(songObj, [
    "url", 
    "path", 
    "lyricsState", 
    "id", 
    "meta.title", 
    "meta.fullTitle", 
    "meta.artists",
  ]);
}

/** Checks if the given album object has the required properties */
export function checkAlbumProps(albumObj: unknown) {
  return checkObjProps(albumObj, [
    "name",
    "fullTitle",
    "url",
    "coverArt",
    "id",
    "artist",
  ]);
}

/** Checks if the given artist object has the required properties */
export function checkArtistProps(artistObj: unknown) {
  return checkObjProps(artistObj, [
    "name",
    "url",
    "image",
    "headerImage",
  ]);
}

/** Checks if the given translation object has the required properties */
export function checkTranslationProps(translationObj: unknown) {
  return checkObjProps(translationObj, [
    "language",
    "id",
    "path",
    "title",
    "url",
  ]);
}

//#region send requests

/** Sends a request to the specified URL with the given options. Authentication and method "GET" are set by default. */
export async function sendReq(path: string, opts?: RequestInit): Promise<{
  res: Response;
  status: number;
  headers: Headers;
}> {
  const res = await fetch(`${baseUrl}/${path.startsWith("/") ? path.substring(1) : path}`, { ...defaultFetchOpts, ...opts });
  
  return { res, status: res.status, headers: res.headers };
}
