import { checkAlbumProps, checkArtistProps, sendReq } from "./hooks";

describe("Album routes", () => {
  //#region /album/:id

  it("Album details yields correct props", async () => {
    const { status, res } = await sendReq("/album/7105950");
    const body = await res.json();

    expect(status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toEqual(1);

    checkAlbumProps(body?.album);

    checkArtistProps(body?.album?.artist);
  });

  //#region inv /album/:id

  it("Invalid song ID yields error", async () => {
    const { res, status } = await sendReq("/album/0");
    const body = await res.json();

    expect(status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(0);
    expect(body?.message).toBeDefined();
  });

  //#region inv /album

  it("Album path without ID yields error", async () => {
    const { res, status } = await sendReq("/album");
    const body = await res.json();

    expect(status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(null);
    expect(body?.message).toBeDefined();
  });
});
