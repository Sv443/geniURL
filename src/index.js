const dotenv = require("dotenv");

const server = require("./server");
const error = require("./error");


async function init()
{
    let stage = "reading env file";

    try
    {
        dotenv.config();

        stage = "initializing server";

        server.init();

        stage = "(done)";
    }
    catch(err)
    {
        error(`Error while ${stage}`, err);
    }
}

init();
