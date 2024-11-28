import "dotenv/config";

export const baseUrl = `http://127.0.0.1:${process.env.HTTP_PORT}/v2`;

const authToken = process.env.AUTH_TOKENS?.split(",")[0];

export const defaultFetchOpts: Partial<RequestInit> = {
  method: "GET",
  headers: {
    ...(authToken ? { "Authentication": `Bearer ${authToken}` } : {}),
  },
};
