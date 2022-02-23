const k = require("kleur");

function error(msg, err, fatal = false)
{
    console.error("\n");
    console.error(k.red(msg));
    console.error(err);

    fatal && process.exit(1);
}

module.exports = error;
