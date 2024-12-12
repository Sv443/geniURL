import { default as _axios } from "axios";

export const axios = _axios.create({
  timeout: 1000 * 15,
});

export function baseAxiosOpts() {
  const authToken = process.env.GENIUS_ACCESS_TOKEN?.trim();
  return authToken && authToken.length > 0 ? {
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  } : {};
}
