const k = require("kleur");

/**
 * @param {string} msg
 * @param {Error} [err]
 * @param {boolean} [fatal=false] 
 */
function error(msg, err, fatal = false)
{
    console.error("\n");
    console.error(k.red(msg));
    console.error(err);

    fatal && process.exit(1);
}

module.exports = error;
