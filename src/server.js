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
    points: 8,
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

        app.get("/search", async (req, res) => {
            const { q, format } = req.query;

            if(typeof q !== "string" || q.length === 0)
                return respond(res, "clientError", "No query parameter (?q=...) provided or it is invalid", req?.query?.format);

            const meta = await getMeta(q);

            if(!meta)
                return respond(res, "clientError", "Found no results matching your search query", format);

            // js2xmlparser needs special treatment when using arrays to produce a decent XML structure
            const response = format !== "xml" ? meta : { ...meta, all: { "result": meta.all } };

            return respond(res, "success", response, format);
        });

        app.get("/search/top", async (req, res) => {
            const { q, format } = req.query;

            if(typeof q !== "string" || q.length === 0)
                return respond(res, "clientError", "No query parameter (?q=...) provided or it is invalid", req?.query?.format);

            const meta = await getMeta(q);

            if(!meta)
                return respond(res, "clientError", "Found no results matching your search query", format);

            return respond(res, "success", meta.top, format);
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
function respond(res, type, data, format)
{
    let statusCode = 500;
    let error = true;

    let resData = {};

    if(typeof format !== "string" || !["json", "xml"].includes(format.toLowerCase()))
        format = "json";

    format = format.toLowerCase();

    switch(type)
    {
        case "success":
            error = false;
            statusCode = 200;
            resData = { ...data };
            break;
        case "clientError":
            error = true;
            statusCode = 400;
            resData = { message: data };
            break;
        case "serverError":
            error = true;
            statusCode = 500;
            resData = { message: data };
            break;
        default:
            if(typeof type === "number")
            {
                error = false;
                statusCode = type;
                resData = { ...data };
            }
            break;
    }

    const mimeType = format !== "xml" ? "application/json" : "application/xml";

    resData = {
        error,
        ...resData,
        timestamp: Date.now(),
    };

    const finalData = format === "xml" ? jsonToXml.parse("data", resData) : resData;

    res.setHeader("Content-Type", mimeType);
    res.status(statusCode).send(finalData);
}

module.exports = { init };
