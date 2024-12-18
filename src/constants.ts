import { resolve } from "node:path";
import type { IRateLimiterOptions } from "rate-limiter-flexible";
import type { axios } from "@src/axios.js";
import type { ResponseFormat } from "@src/types.js";
import packageJson from "@root/package.json" with { type: "json" };

// for @linkcode in tsdoc comments
void [{} as typeof axios];

//#region rate limiting

/** Options for the rate limiter */
export const rateLimitOptions: IRateLimiterOptions = {
  points: 20,
  duration: 30,
};

/** Any requests to paths starting with one of these will not be subject to rate limiting */
export const rlIgnorePaths = [
  "/docs",
];

//#region docs

/** Path to the VuePress build output folder - this is what gets served as the docs by the API if the `HOST_WEBSITE` env var is set to `true` */
export const docsPath = resolve("./www/.vuepress/dist");

/** Max age of the docs in milliseconds */
export const docsMaxAge = 1000 * 60 * 60 * 24 * 2; // 2 days

//#region misc

/** Max amount of results that geniURL can serve */
export const maxResultsAmt = 10;

/** Timeout for all requests sent using the common {@linkcode axios} instance in milliseconds */
export const axiosTimeout = 1000 * 15;

//#region other

/** The version from package.json, split into a tuple of major, minor, and patch number */
export const splitVersion = packageJson.version.split(".").map(v => Number(v)) as [major: number, minor: number, patch: number];

/** Major, minor, and patch version numbers */
export const [verMajor, verMinor, verPatch] = splitVersion;

/** Map of response formats and their corresponding MIME types */
export const mimeTypeMap = {
  json: "application/json",
  xml: "application/xml",
} as const satisfies Record<ResponseFormat, string>;

/** Map of unicode variant characters and replacements used in normalizing strings served by the genius API */
export const charReplacements = new Map<string, string>([
  ["`´’︐︑ʻ", "'"],
  ["“”", "\""],
  ["，", ","],
  ["—─ ", "-"],
  ["     ", " "],
]);
