import { resolve } from "node:path";
import type { IRateLimiterOptions } from "rate-limiter-flexible";
import packageJson from "../package.json" with { type: "json" };

/** The version from package.json, split into a tuple of major, minor, and patch number */
export const splitVersion = packageJson.version.split(".").map(v => Number(v)) as [major: number, minor: number, patch: number];

export const [verMajor, verMinor, verPatch] = splitVersion;

/** Options for the rate limiter */
export const rateLimitOptions: IRateLimiterOptions = {
  points: 20,
  duration: 30,
};

/** Set of all supported [ISO 639-1 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) */
export const langCodes = new Set<string>(["aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","io","is","it","iu","ja","jv","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"]);

/** Map of unicode variant characters and replacements used in normalizing strings served by the genius API */
export const charReplacements = new Map<string, string>([
  ["`´’︐︑ʻ", "'"],
  ["“”", "\""],
  ["，", ","],
  ["—─ ", "-"],
  ["     ", " "],
]);

/** Any requests to paths starting with one of these will not be subject to rate limiting */
export const rlIgnorePaths = [
  "/docs",
];

export const docsPath = resolve("./www/.vuepress/dist");
