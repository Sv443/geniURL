import compression from "compression";
import express, { NextFunction, Request, Response } from "express";
import { check as portUsed } from "tcp-port-used";
import helmet from "helmet";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import k from "kleur";
import cors from "cors";
import jsonToXml from "js2xmlparser";

import packageJson from "../package.json";
import { error } from "./error";
import { getMeta } from "./songData";
import type { ResponseType } from "./types";
import type { Stringifiable } from "svcorelib";

const app = express();

app.use(cors({ methods: "GET,HEAD,OPTIONS", origin: "*" }));
app.use(helmet());
app.use(express.json());
app.use(compression());

const rateLimiter = new RateLimiterMemory({
    points: 5,
    duration: 10,
});

const authTokens = getAuthTokens();

export async function init()
{
    const port = parseInt(String(process.env.HTTP_PORT ?? "").trim());
    const hostRaw = String(process.env.HTTP_HOST ?? "").trim();
    const host = hostRaw.length < 1 ? "0.0.0.0" : hostRaw;

    if(await portUsed(port))
        return error(`TCP port ${port} is already used or invalid`, undefined, true);

    // on error
    app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
        if(typeof err === "string" || err instanceof Error)
            return respond(res, "serverError", `General error in HTTP server: ${err.toString()}`, req?.query?.format ? String(req.query.format) : undefined);
        else
            return next();
    });

    const listener = app.listen(port, host, () => {
        app.disable("x-powered-by");

        // rate limiting
        app.use(async (req, res, next) => {
            const fmt = req?.query?.format ? String(req.query.format) : undefined;
            const { authorization } = req.headers;
            const authHeader = authorization?.startsWith("Bearer ") ? authorization.substring(7) : authorization;

            res.setHeader("API-Info", `geniURL v${packageJson.version} (${packageJson.homepage})`);

            if(authHeader && authTokens.has(authHeader))
                return next();

            rateLimiter.consume(req.ip)
                .catch((err) => {
                    if(err instanceof RateLimiterRes) {
                        res.set("Retry-After", String(Math.ceil(err.msBeforeNext / 1000)));
                        return respond(res, 429, { message: "You are being rate limited" }, fmt);
                    }
                    else
                        return respond(res, 500, { message: "Internal error in rate limiting middleware. Please try again later." }, fmt);
                })
                .finally(next);
        });

        registerEndpoints();

        console.log(k.green(`Listening on ${host}:${port}`));
    });

    listener.on("error", (err) => error("General server error", err, true));
}

function registerEndpoints()
{
    try
    {
        app.get("/", (_req, res) => {
            res.redirect(packageJson.homepage);
        });

        const hasArg = (val: unknown) => typeof val === "string" && val.length > 0;

        app.get("/search", async (req, res) => {
            try
            {
                const { q, artist, song, format: fmt, threshold: thr } = req.query;

                const format: string = fmt ? String(fmt) : "json";
                const threshold = isNaN(Number(thr)) ? undefined : Number(thr);

                if(hasArg(q) || (hasArg(artist) && hasArg(song)))
                {
                    const meta = await getMeta({
                        ...(q ? {
                            q: String(q),
                        } : {
                            artist: String(artist),
                            song: String(song),
                        }),
                        threshold,
                    });

                    if(!meta || meta.all.length < 1)
                        return respond(res, "clientError", "Found no results matching your search query", format, 0);

                    // js2xmlparser needs special treatment when using arrays to produce a decent XML structure
                    const response = format !== "xml" ? meta : { ...meta, all: { "result": meta.all } };

                    return respond(res, "success", response, format, meta.all.length);
                }
                else
                    return respond(res, "clientError", "No search params (?q or ?song and ?artist) provided or they are invalid", req?.query?.format ? String(req.query.format) : undefined);
            }
            catch(err)
            {
                return respond(res, "serverError", `Encountered an internal server error: ${err instanceof Error ? err.message : ""}`, "json");
            }
        });

        app.get("/search/top", async (req, res) => {
            try
            {
                const { q, artist, song, format: fmt, threshold: thr } = req.query;

                const format: string = fmt ? String(fmt) : "json";
                const threshold = isNaN(Number(thr)) ? undefined : Number(thr);

                if(hasArg(q) || (hasArg(artist) && hasArg(song)))
                {
                    const meta = await getMeta({
                        ...(q ? {
                            q: String(q),
                        } : {
                            artist: String(artist),
                            song: String(song),
                        }),
                        threshold,
                    });

                    if(!meta || !meta.top)
                        return respond(res, "clientError", "Found no results matching your search query", format, 0);

                    return respond(res, "success", meta.top, format, 1);
                }
                else
                    return respond(res, "clientError", "No search params (?q or ?song and ?artist) provided or they are invalid", req?.query?.format ? String(req.query.format) : undefined);
            }
            catch(err)
            {
                return respond(res, "serverError", `Encountered an internal server error${err instanceof Error ? err.message : ""}`, "json");
            }
        });
    }
    catch(err)
    {
        error("Error while registering endpoints", err instanceof Error ? err : undefined, true);
    }
}

/**
 * Responds to an incoming request
 * @param type Type of response or status code
 * @param data The data to send in the response body
 * @param format json / xml
 */
function respond(res: Response, type: ResponseType | number, data: Stringifiable | Record<string, unknown>, format = "json", matchesAmt = 0)
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
        matches,
        ...resData,
        timestamp: Date.now(),
    };

    const finalData = format === "xml" ? jsonToXml.parse("data", resData) : resData;

    res.setHeader("Content-Type", mimeType);
    res.status(statusCode)
        .send(finalData);
}

function getAuthTokens() {
    const envVal = process.env["AUTH_TOKENS"];
    let tokens: string[] = [];

    if(!envVal || envVal.length === 0)
        tokens = [];
    else
        tokens = envVal.split(/,/g);

    return new Set<string>(tokens);
}
