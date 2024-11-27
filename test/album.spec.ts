import { baseUrl, defaultFetchOpts } from "./constants";
import { checkAlbumProps, checkArtistProps } from "./hooks";

describe("GET /album/:id", () => {
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

  it("Invalid album yields error", async () => {
    const res = await fetch(`${baseUrl}/album/0`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(0);
    expect(body?.message).toBeDefined();
  });
});
