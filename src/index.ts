import "dotenv/config";

import * as server from "@src/server.js";
import { error } from "@src/error.js";

const { env, exit } = process;

async function init() {
  try {
    const missingEnvVars = [
      "HTTP_PORT",
      "GENIUS_ACCESS_TOKEN",
    ].reduce<string[]>((a, v) => ((typeof env[v] !== "string" || env[v]!.length < 1) ? a.concat(v) : a), []);

    if(missingEnvVars.length > 0)
      throw new Error(`Missing environment variable${missingEnvVars.length > 1 ? "s" : ""}:\n- ${missingEnvVars.join("\n- ")}`);

    await server.init();
  }
  catch(err) {
    error("Encountered fatal error while initializing:", err instanceof Error ? err : undefined, true);
    setImmediate(() => exit(1));
  }
}

init();
