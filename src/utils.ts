import { Response } from "express";
import { Stringifiable, byteLength } from "svcorelib";
import { parse as jsonToXml } from "js2xmlparser";
import { ResponseType } from "./types";

/** Checks if the value of a passed URL parameter is a string with length > 0 */
export function paramValid(val: unknown): val is string {
  return typeof val === "string" && val.length > 0;
}

/**
 * Responds to an incoming request
 * @param type Type of response or status code
 * @param data The data to send in the response body
 * @param format json / xml
 */
export function respond(res: Response, type: ResponseType | number, data: Stringifiable | Record<string, unknown>, format = "json", matchesAmt?: number)
{
  let statusCode = 500;
  let error = true;
  let matches = null;

  let resData = {};

  if(typeof format !== "string" || !["json", "xml"].includes(format.toLowerCase()))
    format = "json";

  format = format.toLowerCase();

  switch(type)
  {
  case "success":
    error = false;
    matches = matchesAmt;
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
    if(typeof type === "number")
    {
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
  const contentLen = byteLength(typeof finalData === "string" ? finalData : JSON.stringify(finalData));

  res.setHeader("Content-Type", format === "xml" ? "application/xml" : "application/json");
  contentLen > -1 && res.setHeader("Content-Length", contentLen);
  res.status(statusCode).send(finalData);
}
