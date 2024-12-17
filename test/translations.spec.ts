import { checkTranslationProps, sendReq } from "./hooks";

describe("Translation routes", () => {
  //#region inv /tr

  it("Translations path without ID yields error", async () => {
    const { res, status } = await sendReq("/translations");
    const body = await res.json();

    expect(status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(null);
    expect(body?.message).toBeDefined();
  });

  //#region /tr/:id

  it("Translation yields correct props", async () => {
    const { res, status } = await sendReq("/translations/7105950");
    const body = await res.json();

    expect(status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toBeGreaterThan(0);

    expect(Array.isArray(body?.translations)).toBe(true);

    body?.translations?.forEach((tr: unknown) => checkTranslationProps(tr));
  });

  //#region inv /tr/:id

  it("Invalid song ID yields no matches", async () => {
    const { res, status } = await sendReq("/translations/0");
    const body = await res.json();

    expect(status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toEqual(0);
    expect(body?.message).toBeUndefined();
  });
});
