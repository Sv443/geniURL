import { sendReq } from "./hooks";

describe("Miscellaneous", () => {
  //#region health check

  it("Health check", async () => {
    const { status, headers } = await sendReq("/health", {
      method: "HEAD",
    });

    expect(status).toBe(200);
    expect(headers.get("api-info")).not.toBeNull();
  });
});
