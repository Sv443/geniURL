import { createHash, type BinaryToTextEncoding } from "node:crypto";
import { Response } from "express";
import { parse as jsonToXml } from "js2xmlparser";
import type { Stringifiable } from "svcorelib";
import { docsMaxAge, mimeTypeMap, verMajor } from "@src/constants.js";
import type { ResponseFormat, ResponseType } from "@src/types.js";

/** Checks if the value of a passed URL parameter is a string with length > 0 */
export function paramValid(val: unknown): boolean {
  if(typeof val === "string")
    return val.length > 0;
  return typeof val !== "undefined";
}

/**
 * Responds to a request in a uniform way
 * @param res Express response object
 * @param typeOrStatusCode Type of response or status code
 * @param data The data to send in the response body
 * @param format Response format "json" or "xml"
 * @param matchesAmt Amount of matches / datasets returned in this response
 */
export function respond(res: Response, typeOrStatusCode: ResponseType | number, data: Stringifiable | Record<string, unknown>, format: ResponseFormat | string = "json", matchesAmt?: number) {
  let error = true,
    matches = null,
    statusCode = 500,
    resData = {};

  if(!(format in mimeTypeMap))
    format = "json";
  format = format.toLowerCase();

  switch(typeOrStatusCode) {
  case "success":
    error = false;
    matches = matchesAmt;
    statusCode = 200;
    resData = data;
    break;
  case "noResults":
    error = false;
    matches = matchesAmt ?? 0;
    statusCode = 200;
    resData = data;
    break;
  case "clientError":
    error = true;
    matches = matchesAmt ?? null;
    statusCode = 400;
    resData = { message: data };
    break;
  case "serverError":
    error = true;
    matches = matchesAmt ?? null;
    statusCode = 500;
    resData = { message: data };
    break;
  default:
    if(typeof typeOrStatusCode === "number") {
      error = false;
      matches = matchesAmt ?? 0;
      statusCode = typeOrStatusCode;
      resData = data;
    }
    break;
  }

  resData = {
    error,
    ...(matches === undefined ? {} : { matches }),
    ...resData,
  };

  const finalData = format === "xml" ? jsonToXml("data", resData) : resData;
  const contentLen = getByteLength(typeof finalData === "string" ? finalData : JSON.stringify(finalData));

  res.setHeader("Content-Type", `${mimeTypeMap[format as ResponseFormat] ?? "text/plain"}; charset=utf-8`);
  contentLen > -1 && res.setHeader("Content-Length", contentLen);
  res.status(statusCode).send(finalData);
}

/** Redirects to the documentation page at the given relative path (homepage by default) */
export function redirectToDocs(res: Response, path?: string) {
  res.setHeader("Cache-Control", `private, max-age=${docsMaxAge}, immutable`);
  res.redirect(`/v${verMajor}/docs/${path ? path.replace(/^\//, "") : ""}`);
}

/** Hashes a string. Uses SHA-512 encoded as "hex" by default */
export function hashStr(str: string | { toString: () => string }, algorithm = "sha512", encoding: BinaryToTextEncoding = "hex"): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const hash = createHash(algorithm);
      hash.update(String(str));
      resolve(hash.digest(encoding));
    }
    catch(e) {
      reject(e);
    }
  });
}

/** Returns the length of the given data - returns -1 if the data couldn't be stringified */
export function getByteLength(data: string | { toString: () => string } | Record<string, unknown>) {
  if(typeof data === "string" || "toString" in data)
    return Buffer.byteLength(String(data), "utf8");
  else if(typeof data === "object")
    return Buffer.byteLength(JSON.stringify(data), "utf8");
  else
    return -1;
}

/** Ensures the passed {@linkcode value} always stays between {@linkcode min} and {@linkcode max} */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}
