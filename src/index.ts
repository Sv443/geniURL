import "dotenv/config";

import * as server from "./server";
import { error } from "./error";

const { env } = process;

async function init()
{
    try
    {
        const missingEnvVars = [
            "HTTP_PORT",
            "GENIUS_ACCESS_TOKEN",
        ].reduce<string[]>((a, v) => ((typeof env[v] !== "string" || env[v]!.length < 1) ? a.concat(v) : a), []);

        if(missingEnvVars.length > 0)
            throw new TypeError(`Missing environment variable(s):\n- ${missingEnvVars.join("\n- ")}`);

        await server.init();
    }
    catch(err)
    {
        error("Error while initializing", err instanceof Error ? err : undefined, true);
    }
}

init();
