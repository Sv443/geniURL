import { baseUrl, defaultFetchOpts } from "./constants";

describe("Misc", () => {
  //#region health check

  it("Health check", async () => {
    const res = await fetch(`${baseUrl}/health`, {
      ...defaultFetchOpts,
      method: "HEAD",
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("api-info")).not.toBeNull();
  });
});
