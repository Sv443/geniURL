import { Response } from "express";
import { Stringifiable } from "svcorelib";
import jsonToXml from "js2xmlparser";
import { ResponseType } from "./types";

/** Checks if the value of a passed URL parameter is valid */
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
        resData = typeof data === "string" ? data : { ...data };
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
            resData = typeof data === "string" ? data : { ...data };
        }
        break;
    }

    const mimeType = format !== "xml" ? "application/json" : "application/xml";

    resData = {
        error,
        ...(matches === undefined ? {} : { matches }),
        ...resData,
        timestamp: Date.now(),
    };

    const finalData = format === "xml" ? jsonToXml.parse("data", resData) : resData;

    res.setHeader("Content-Type", mimeType);
    res.status(statusCode)
        .send(finalData);
}
