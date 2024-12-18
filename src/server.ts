import compression from "compression";
import express, { NextFunction, Request, Response } from "express";
import { check as portUsed } from "tcp-port-used";
import helmet from "helmet";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import k from "kleur";
import cors from "cors";
import { getClientIp } from "request-ip";

import { error } from "@src/error.js";
import { hashStr, respond } from "@src/utils.js";
import { envVarEquals, getEnvVar } from "@src/env.js";
import { rateLimitOptions, rlIgnorePaths } from "@src/constants.js";
import { initRouter } from "@routes/index.js";
import packageJson from "@root/package.json" with { type: "json" };

const app = express();

app.use(cors({
  methods: "GET,HEAD,OPTIONS",
  origin: "*",
}));

app.use(helmet({ 
  dnsPrefetchControl: true,
}));

app.use(compression({
  threshold: 256
}));

app.use(express.json());

if(envVarEquals("TRUST_PROXY", true))
  app.enable("trust proxy");

app.disable("x-powered-by");

const rateLimiter = new RateLimiterMemory(rateLimitOptions);

const toks = getEnvVar("AUTH_TOKENS", "stringArray");
const authTokens = new Set<string>(Array.isArray(toks) ? toks : []);

export async function init() {
  const port = getEnvVar("HTTP_PORT", "number"),
    host = getEnvVar("HTTP_HOST").length < 1 ? "0.0.0.0" : getEnvVar("HTTP_HOST");

  if(await portUsed(port))
    return error(`TCP port ${port} is already used or invalid`, undefined, true);

  // on error
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if(typeof err === "string" || err instanceof Error)
      return respond(res, "serverError", `General error in HTTP server: ${err.toString()}`, req?.query?.format ? String(req.query.format) : undefined);
    else
      return next();
  });

  // preflight requests
  app.options("*", cors());

  // rate limiting
  app.use(async (req, res, next) => {
    const fmt = req?.query?.format ? String(req.query.format) : undefined;
    try {
      const { authorization } = req.headers;
      const authHeader = authorization?.trim().replace(/^Bearer\s+/i, "");

      res.setHeader("API-Info", `geniURL v${packageJson.version} (${packageJson.homepage})`);
      res.setHeader("API-Version", packageJson.version);

      if(authHeader && authTokens.has(authHeader))
        return next();

      const ipHash = await hashStr(getClientIp(req) ?? "IP_RESOLUTION_ERROR");

      if(rlIgnorePaths.every((path) => !req.path.match(new RegExp(`^(/?v\\d+)?${path}`)))) {
        rateLimiter.consume(ipHash)
          .then((rateLimiterRes: RateLimiterRes) => {
            setRateLimitHeaders(res, rateLimiterRes);
            return next();
          })
          .catch((err) => {
            if(err instanceof RateLimiterRes) {
              setRateLimitHeaders(res, err);
              return respond(res, 429, {
                error: true,
                matches: null,
                message: "You are being rate limited. Refer to the Retry-After header for when to try again."
              }, fmt);
            }
            else
              return respond(res, 500, {
                error: true,
                matches: null,
                message: `Encountered an internal error${err instanceof Error ? `: ${err.message}` : ""}. Please try again a little later.`,
              }, fmt);
          });
      }
      else
        return next();
    }
    catch(e) {
      return respond(res, "serverError", {
        error: true,
        matches: null,
        message: `Encountered an internal error while applying rate limiting and checking for authorization${e instanceof Error ? `: ${e.message}` : ""}`
      }, fmt);
    }
  });

  const listener = app.listen(port, host, () => {
    registerRoutes();

    console.log(k.green(`geniURL is listening on ${host}:${port}\n`));
  });

  listener.on("error", (err) => error("General server error", err, true));
}

function registerRoutes() {
  try {
    initRouter(app);
  }
  catch(err) {
    error("Error while initializing router", err instanceof Error ? err : undefined, true);
  }
}

/** Sets all rate-limiting related headers on a response given a RateLimiterRes object */
function setRateLimitHeaders(res: Response, rateLimiterRes: RateLimiterRes) {
  if(rateLimiterRes.remainingPoints === 0)
    res.setHeader("Retry-After", Math.ceil(rateLimiterRes.msBeforeNext / 1000));
  res.setHeader("X-RateLimit-Limit", rateLimiter.points);
  res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
  res.setHeader("X-RateLimit-Reset", new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
}
