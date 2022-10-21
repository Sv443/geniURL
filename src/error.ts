const k = require("kleur");

/**
 * Handles an error
 * @param msg Short error message
 * @param err Error instance that caused the error
 * @param fatal Exits with code 1 if set to true
 */
export function error(msg: string, err?: Error, fatal = false)
{
    console.error("\n");
    console.error(k.red(msg));
    err && console.error(err);

    fatal && process.exit(1);
}
