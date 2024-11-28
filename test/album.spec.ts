import { baseUrl, defaultFetchOpts } from "./constants";
import { checkAlbumProps, checkArtistProps } from "./hooks";

describe("Album routes", () => {
  //#region /album/:id

  it("Album details yields correct props", async () => {
    const res = await fetch(`${baseUrl}/album/7105950`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toEqual(1);

    checkAlbumProps(body?.album);

    checkArtistProps(body?.album?.artist);
  });

  //#region inv /album/:id

  it("Invalid song ID yields error", async () => {
    const res = await fetch(`${baseUrl}/album/0`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(0);
    expect(body?.message).toBeDefined();
  });

  //#region inv /album

  it("Album path without ID yields error", async () => {
    const res = await fetch(`${baseUrl}/album`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(null);
    expect(body?.message).toBeDefined();
  });
});
