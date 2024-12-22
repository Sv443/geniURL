import _axios, { type AxiosRequestConfig } from "axios";
import { axiosTimeout } from "@src/constants.js";
import { getEnvVar } from "@src/env.js";

export const axios = _axios.create({
  timeout: axiosTimeout,
});

export function baseAxiosOpts() {
  const authToken = getEnvVar("GENIUS_ACCESS_TOKEN");
  return authToken && authToken.length > 0 ? {
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  } satisfies AxiosRequestConfig : {};
}
