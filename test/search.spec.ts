import { randomBytes } from "crypto";
import { XMLParser } from "fast-xml-parser";
import { checkSongProps, sendReq } from "./hooks";
import { maxResultsAmt } from "./consts";

describe("Search routes", () => {
  //#region /search/top

  it("Top search yields expected props", async () => {
    const { res, status } = await sendReq("/search/top?q=Lil Nas X - LIGHT AGAIN!");
    const body = await res.json();

    expect(status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toEqual(1);

    checkSongProps(body);
  });

  //#region /search/top xml

  it("Top search with format=xml yields valid XML", async () => {
    const { res, status } = await sendReq("/search/top?format=xml&q=Lil Nas X - LIGHT AGAIN!");
    const body = await res.text();

    expect(status).toBe(200);

    const parsed = new XMLParser().parse(body);

    expect(typeof parsed?.data).toBe("object");

    expect(parsed?.data?.error).toEqual(false);
    expect(parsed?.data?.matches).toEqual(1);

    checkSongProps(parsed?.data);
  });

  //#region /search

  it(`Regular search yields <=${maxResultsAmt} results`, async () => {
    const { res, status } = await sendReq("/search?q=Lil Nas X");
    const body = await res.json();

    expect(status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toBeLessThanOrEqual(maxResultsAmt);

    checkSongProps(body?.top);

    expect(Array.isArray(body?.all)).toBe(true);

    body?.all?.forEach((hit: unknown) => checkSongProps(hit));

    expect(body?.all?.length).toEqual(body?.matches ?? -1);
  });

  //#region inv /search

  it("Invalid search yields no matches", async () => {
    const randText = randomBytes(32).toString("hex");
    const { res, status } = await sendReq(`/search?q=${randText}`);
    const body = await res.json();

    expect(status).toBe(200);

    expect(body?.error).toEqual(false);
    expect(body?.matches).toEqual(0);
    expect(body?.message).toBeUndefined();
  });
});
