import { createHash, type BinaryToTextEncoding } from "node:crypto";
import { Response } from "express";
import { parse as jsonToXml } from "js2xmlparser";
import type { Stringifiable } from "svcorelib";
import { verMajor } from "@src/constants.js";
import type { ResponseType } from "@src/types.js";

/** Checks if the value of a passed URL parameter is a string with length > 0 */
export function paramValid(val: unknown): boolean {
  if(typeof val === "string")
    return val.length > 0;
  return typeof val !== "undefined";
}

/**
 * Responds to a request in a uniform way
 * @param res Express response object
 * @param type Type of response or status code
 * @param data The data to send in the response body
 * @param format Response format "json" or "xml"
 * @param matchesAmt Amount of matches / datasets returned in this response
 */
export function respond(res: Response, type: ResponseType | number, data: Stringifiable | Record<string, unknown>, format = "json", matchesAmt?: number) {
  let statusCode = 500;
  let error = true;
  let matches = null;

  let resData = {};

  format = format?.toLowerCase();

  if(typeof format !== "string" || !["json", "xml"].includes(format))
    format = "json";

  switch(type) {
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
    if(typeof type === "number") {
      error = false;
      matches = matchesAmt ?? 0;
      statusCode = type;
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

  res.setHeader("Content-Type", format === "xml" ? "application/xml" : "application/json");
  contentLen > -1 && res.setHeader("Content-Length", contentLen);
  res.status(statusCode).send(finalData);
}

/** Redirects to the documentation page at the given relative path (homepage by default) */
export function redirectToDocs(res: Response, path?: string) {
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
