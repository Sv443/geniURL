const compression = require("compression");
const express = require("express");
const { check: portUsed } = require("tcp-port-used");
const helmet = require("helmet");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const k = require("kleur");
const cors = require("cors");

const packageJson = require("../package.json");
const error = require("./error");
const { getLyrics } = require("./lyrics");

const { env } = process;

/** @typedef {import("svcorelib").JSONCompatible} JSONCompatible */
/** @typedef {import("express").Response} Response */

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
    const port = parseInt(env.HTTP_PORT);

    if(await portUsed(port))
        return error(`TCP port ${port} is already used`, undefined, true);

    // on error
    app.use((err, req, res, next) => {
        if(typeof err === "string" || err instanceof Error)
            return respond(res, "serverError", `General error in HTTP server: ${err.toString()}`);
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
                res.set("Retry-After", rlRejected?.msBeforeNext ? String(Math.round(rlRejected.msBeforeNext / 1000)) || 1 : 1);
                return respond(res, 429, { message: "You are being rate limited" });
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
        app.get("/", (req, res) => {
            res.redirect(packageJson.homepage);
        });

        app.get("/search", async (req, res) => {
            const { q } = req.query;

            if(typeof q !== "string" || q.length === 0)
                return respond(res, "clientError", "No query parameter (?q=...) provided or it is invalid");

            const lyricsInfo = await getLyrics(q);

            return respond(res, "success", lyricsInfo);
        });
    }
    catch(err)
    {
        error("Error while registering endpoints", err, true);
    }
}

/**
 * @param {Response} res
 * @param {"serverError"|"clientError"|"success"|number} type Set to number for custom status code
 * @param {JSONCompatible} data JSON object for "success", else an error message string
 */
function respond(res, type, data)
{
    let statusCode = 500;
    let error = true;

    let resData = {};

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

    resData = {
        error,
        ...resData,
        timestamp: Date.now(),
    };

    res.status(statusCode).send(resData);
}

module.exports = { init };
