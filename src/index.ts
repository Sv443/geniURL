import dotenv from "dotenv";

dotenv.config();

import * as server from "./server";
import { error } from "./error";


async function init()
{
    let stage = "initializing server";

    try
    {
        server.init();

        stage = "(done)";
    }
    catch(err)
    {
        error(`Error while ${stage}`, err instanceof Error ? err : undefined, true);
    }
}

init();
