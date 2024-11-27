import { baseUrl, defaultFetchOpts } from "./constants";
import { checkTranslationProps } from "./hooks";

describe("GET /translations/:id", () => {
  //#region /translations/:id

  it("Translation yields correct props", async () => {
    const res = await fetch(`${baseUrl}/translations/7105950`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toBeGreaterThan(0);

    expect(Array.isArray(body?.translations)).toBe(true);

    body?.translations?.forEach((tr: unknown) => checkTranslationProps(tr));
  });

  //#region inv /translations/:id

  it("Invalid album yields error", async () => {
    const res = await fetch(`${baseUrl}/translations/0`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(null);
    expect(body?.message).toBeDefined();
  });

  //#region inv /translations

  it("Translations path without ID yields error", async () => {
    const res = await fetch(`${baseUrl}/translations`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(null);
    expect(body?.message).toBeDefined();
  });
});
