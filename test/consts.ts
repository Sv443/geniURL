import "dotenv/config";

export const baseUrl = `http://127.0.0.1:${process.env.HTTP_PORT}/v2`;

/** Max results that can be returned by geniURL - should be consistent with `maxResultsAmt` in `src/constants.ts` */
export const maxResultsAmt = 10;

/** Auth token for local testing */
const authToken = process.env.AUTH_TOKENS?.split(",")[0];

export const defaultFetchOpts = {
  method: "GET",
  headers: {
    ...(authToken
      ? { "Authentication": `Bearer ${authToken}` }
      : {}
    ),
  },
} as const satisfies RequestInit;
