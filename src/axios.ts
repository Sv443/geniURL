import { default as _axios } from "axios";
import { axiosTimeout } from "./constants.js";

export const axios = _axios.create({
  timeout: axiosTimeout,
});

export function baseAxiosOpts() {
  const authToken = process.env.GENIUS_ACCESS_TOKEN?.trim();
  return authToken && authToken.length > 0 ? {
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  } : {};
}
