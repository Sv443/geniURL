const k = require("kleur");

/**
 * @param {string} msg Error message
 * @param {Error} [err] Error instance
 * @param {boolean} [fatal=false] Exits with code 1 if set to true
 */
function error(msg, err, fatal = false)
{
    console.error("\n");
    console.error(k.red(msg));
    console.error(err);

    fatal && process.exit(1);
}

module.exports = error;
