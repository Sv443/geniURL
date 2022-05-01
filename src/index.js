const dotenv = require("dotenv");

dotenv.config();

const server = require("./server");
const error = require("./error");


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
        error(`Error while ${stage}`, err, true);
    }
}

init();
