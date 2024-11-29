import { checkTranslationProps, sendReq } from "./hooks";

describe("Translation routes", () => {
  //#region /translations/:id

  it("Translation yields correct props", async () => {
    const { res, status } = await sendReq("/translations/7105950");
    const body = await res.json();

    expect(status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toBeGreaterThan(0);

    expect(Array.isArray(body?.translations)).toBe(true);

    body?.translations?.forEach((tr: unknown) => checkTranslationProps(tr));
  });

  //#region inv /translations/:id

  it("Invalid song ID yields error", async () => {
    const { res, status } = await sendReq("/translations/0");
    const body = await res.json();

    expect(status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(null);
    expect(body?.message).toBeDefined();
  });

  //#region inv /translations

  it("Translations path without ID yields error", async () => {
    const { res, status } = await sendReq("/translations");
    const body = await res.json();

    expect(status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(null);
    expect(body?.message).toBeDefined();
  });
});
