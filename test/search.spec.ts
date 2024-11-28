import { randomBytes } from "crypto";
import { baseUrl, defaultFetchOpts } from "./constants";
import { checkSongProps } from "./hooks";

describe("Search routes", () => {
  //#region /search/top

  it("Top search yields expected props", async () => {
    const res = await fetch(`${baseUrl}/search/top?q=Lil Nas X - LIGHT AGAIN!`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toEqual(1);

    checkSongProps(body);
  });

  //#region /search

  it("Regular search yields <=10 results", async () => {
    const res = await fetch(`${baseUrl}/search?q=Lil Nas X`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toBeLessThanOrEqual(10);

    checkSongProps(body?.top);

    expect(Array.isArray(body?.all)).toBe(true);

    body?.all?.forEach((hit: unknown) => checkSongProps(hit));

    expect(body?.all?.length).toEqual(body?.matches ?? -1);
  });

  //#region inv /search

  it("Invalid search yields error", async () => {
    const randText = randomBytes(32).toString("hex");
    const res = await fetch(`${baseUrl}/search?q=${randText}`, defaultFetchOpts);
    const body = await res.json();

    expect(res.status).toBe(400);

    expect(body?.error).toEqual(true);
    expect(body?.matches).toEqual(0);
    expect(body?.message).toBeDefined();
  });
});
