const compression = require("compression");
const express = require("express");
const { check: portUsed } = require("tcp-port-used");
const helmet = require("helmet");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const k = require("kleur");
const cors = require("cors");
const jsonToXml = require("js2xmlparser");

const packageJson = require("../package.json");
const error = require("./error");
const { getMeta } = require("./songMeta");

/** @typedef {import("svcorelib").JSONCompatible} JSONCompatible */
/** @typedef {import("express").Response} Response */
/** @typedef {import("./types").ResponseType} ResponseType */
/** @typedef {import("./types").ResponseFormat} ResponseFormat */

const app = express();

app.use(cors({ methods: "GET,HEAD,OPTIONS" }));
app.use(helmet());
app.use(express.json());
app.use(compression());

const rateLimiter = new RateLimiterMemory({
    points: 5,
    duration: 10,
});


async function init()
{
    const port = parseInt(process.env.HTTP_PORT);

    if(await portUsed(port))
        return error(`TCP port ${port} is already used`, undefined, true);

    // on error
    app.use((err, req, res, next) => {
        if(typeof err === "string" || err instanceof Error)
            return respond(res, "serverError", `General error in HTTP server: ${err.toString()}`, req?.query?.format);
        else
            return next();
    });

    const listener = app.listen(port, () => {
        app.disable("x-powered-by");

        // rate limiting
        app.use(async (req, res, next) => {
            try
            {
                await rateLimiter.consume(req.ip);
            }
            catch(rlRejected)
            {
                res.set("Retry-After", String(rlRejected?.msBeforeNext ? Math.round(rlRejected.msBeforeNext / 1000) : 1));
                return respond(res, 429, { message: "You are being rate limited" }, req?.query?.format);
            }

            return next();
        });

        registerEndpoints();

        console.log(k.green(`Ready on port ${port}`));
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

        const hasArg = (val) => typeof val === "string" && val.length > 0;

        app.get("/search", async (req, res) => {
            try
            {
                const { q, artist, song, format } = req.query;

                if(hasArg(q) || (hasArg(artist) && hasArg(song)))
                {
                    const meta = await getMeta({ q, artist, song });

                    if(!meta || meta.all.length < 1)
                        return respond(res, "clientError", "Found no results matching your search query", format, 0);

                    // js2xmlparser needs special treatment when using arrays to produce a decent XML structure
                    const response = format !== "xml" ? meta : { ...meta, all: { "result": meta.all } };

                    return respond(res, "success", response, format, meta.all.length);
                }
                else
                    return respond(res, "clientError", "No search params (?q or ?song and ?artist) provided or they are invalid", req?.query?.format);
            }
            catch(err)
            {
                return respond(res, "serverError", `Encountered an internal server error${err instanceof Error ? err.message : ""}`, "json");
            }
        });

        app.get("/search/top", async (req, res) => {
            try
            {
                const { q, artist, song, format } = req.query;

                if(hasArg(q) || (hasArg(artist) && hasArg(song)))
                {
                    const meta = await getMeta({ q, artist, song });

                    if(!meta || !meta.top)
                        return respond(res, "clientError", "Found no results matching your search query", format, 0);

                    return respond(res, "success", meta.top, format, 1);
                }
                else
                    return respond(res, "clientError", "No search params (?q or ?song and ?artist) provided or they are invalid", req?.query?.format);
            }
            catch(err)
            {
                return respond(res, "serverError", `Encountered an internal server error${err instanceof Error ? err.message : ""}`, "json");
            }
        });
    }
    catch(err)
    {
        error("Error while registering endpoints", err, true);
    }
}

/**
 * @param {Response} res
 * @param {ResponseType|number} type Specifies the type of response and thus a predefined status code - overload: set to number for custom status code
 * @param {JSONCompatible} data JSON object for "success", else an error message string
 * @param {ResponseFormat} [format]
 */
function respond(res, type, data, format, matchesAmt)
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
            matches = matchesAmt ?? 0;
            statusCode = 200;
            resData = { ...data };
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
                resData = { ...data };
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
    res.status(statusCode).send(finalData);
}

module.exports = { init };
