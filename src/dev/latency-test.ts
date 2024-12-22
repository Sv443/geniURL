// REQUIREMENTS:
// - requires the env vars HTTP_PORT and AUTH_TOKENS (at least 1 token to bypass rate limiting) to be set
// - requires geniURL to run in a different process (or using the command pnpm run latency-test)
// 
// NOTES:
// - requests are sent sequentially on purpose to avoid rate limiting on genius.com's side
// - change settings in the `settings` object
// - view previous latency test reports in the `reports` directory (

import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import _axios from "axios";
import percentile from "percentile";
import k from "kleur";
import { type Stringifiable } from "svcorelib";
import "dotenv/config";
import queries from "./latency-test-queries.json" with { type: "json" };
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const settings = {
  /** Amount of requests to send in total. */
  amount: 250,
  /** Base URL to send requests to. `{{QUERY}}` will be replaced with a random query from the `latency-test-queries.json` file. */
  url: `http://127.0.0.1:${process.env.HTTP_PORT ?? 8074}/v2/search/top?q={{QUERY}}`,
  /** Whether to log all requests to the console (true) or just in increments of `infoLogFrequency` (false). */
  logAllRequests: true,
  /** Amount of requests to send before logging an info message. */
  infoLogFrequency: 10,
  /** Maximum timeout for each request in milliseconds. */
  maxTimeout: 20_000,
} as const;

const reportsDirPath = join(dirname(fileURLToPath(import.meta.url)), "latency-test-reports");

const axios = _axios.create({ timeout: settings.maxTimeout ?? 20_000 });

type LatencyTestReport = {
  /** Local date and time string when the latency test was started. */
  localStartDateTime: string;
  /** Local date and time string when the latency test finished. */
  localFinishDateTime: string;
  /** Total time the latency test took in seconds. */
  totalTime: number;
  /** Total time the latency test took in a human-readable format. */
  duration: string;
  /** 7-char Git SHA of the latest commit. */
  gitSha: string;
  /** Settings used for the latency test. */
  settings: typeof settings;
  /** Calculated times in milliseconds. */
  times: Record<string, number>;
};

async function run() {
  console.log(k.green(`\n>>> Starting latency test with ${settings.amount} sequential requests${settings.amount >= 50 ? k.yellow(" - this could take a while!") : ""}\n`));
  const testStartTs = Date.now();

  const times = [] as number[];
  let successRequests = 0;
  for(let i = 0; i < settings.amount; i++) {
    !settings.logAllRequests && i === 0 && console.log(`> Sent 0 of ${settings.amount} requests`);
    const reqStartTs = Date.now();
    try {
      const url = encodeURI(settings.url.replace("{{QUERY}}", queries[Math.floor(Math.random() * queries.length)]));
      settings.logAllRequests && console.log(`  ${String(i + 1).padStart(digitCount(settings.amount))}.`, url);
      await axios.get(url, {
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${process.env.AUTH_TOKENS!.split(",")[0]}`,
        },
      });
      successRequests++;
    }
    catch(e) {
      console.error(k.red("\n>> Failed to send request:"), e);
      console.error();
    }
    finally {
      times.push(Date.now() - reqStartTs);

      const elapsedStr = `${((Date.now() - testStartTs) / 1000).toFixed(0)}s elapsed`,
        perc = mapRange(i + 1, 0, settings.amount, 0, 100).toFixed(0),
        percStr = `[${k.green((perc + "%").padStart(4, " "))}]`,
        remainingSec = getRemainingTimeStr(testStartTs, i + 1, settings.amount);

      const logProgress = () => console.log(k.bold(`${percStr} • ${i + 1} / ${settings.amount} requests sent • ${elapsedStr} • about ${remainingSec} remaining`));

      if(
        (settings.logAllRequests && i % settings.infoLogFrequency === settings.infoLogFrequency - 1 && i > 0 && i !== settings.amount - 1)
        || (i % settings.infoLogFrequency === settings.infoLogFrequency - 1 && i > 0 && i !== settings.amount - 1)
      )
        logProgress();
    }
  }

  const min = times.reduce((a, c) => Math.min(a, c), Infinity).toFixed(0);
  const avg = (times.reduce((a, c) => a + c, 0) / times.length).toFixed(0);
  const max = times.reduce((a, c) => Math.max(a, c), 0).toFixed(0);

  const getPerc = (perc: number, times: number[]) => {
    const res = percentile(perc, times);
    if(Array.isArray(res)) return res[0];
    return res;
  };

  const reportTimes = {} as Partial<LatencyTestReport["times"]>;

  const getlogVal = (label?: string, value?: Stringifiable, kleurFunc?: (str: string) => void) => {
    let valStr = kleurFunc?.(label ?? "") ?? label ?? "";
    if(label && value) {
      const msVal = `${String(value).padStart(6, " ")} ms`;
      valStr += ` ║ ${kleurFunc?.(msVal) ?? msVal}`;
      reportTimes[(label.trim() as keyof LatencyTestReport["times"])] = Number(value);
    }
    return valStr;
  }

  const testFinishTs = Date.now();
  const totalTime = Number(((testFinishTs - testStartTs) / 1000).toFixed(2));

  const durStr = secondsToPrettyString(totalTime);

  console.log();
  console.log("╔══════════════════════════╗");
  console.log(`║ ${getlogVal(k.green("Latency test results"))}     ║`);
  console.log("╠══════════════╦═══════════╣");
  console.log(`║     ${k.bold("duration")} ║ ${k.bold(durStr.padStart(9, " "))} ║`);
  console.log(`║ req. success ║ ${String(successRequests).padStart(4, " ")} req. ║`);
  console.log(`║  ${k.dim("req. target")} ║ ${k.dim(String(settings.amount).padStart(4, " "))} req. ║`);
  console.log("╠══════════════╬═══════════╣");
  console.log(`║ ${getlogVal("min. latency", min, k.gray)} ║`);
  console.log(`║ ${getlogVal("max. latency", max)} ║`);
  console.log(`║ ${getlogVal("avg. latency", avg, k.bold)} ║`);
  console.log("║              ║           ║");
  console.log(`║ ${getlogVal("   5th perc.", getPerc(5, times), k.gray)} ║`);
  console.log(`║ ${getlogVal("  10th perc.", getPerc(10, times), k.gray)} ║`);
  console.log(`║ ${getlogVal("  25th perc.", getPerc(25, times), k.gray)} ║`);
  console.log(`║ ${getlogVal("  50th perc.", getPerc(50, times), k.gray)} ║`);
  console.log(`║ ${getlogVal("  80th perc.", getPerc(80, times), k.gray)} ║`);
  console.log(`║ ${getlogVal("  90th perc.", getPerc(90, times))} ║`);
  console.log(`║ ${getlogVal("  95th perc.", getPerc(95, times))} ║`);
  console.log(`║ ${getlogVal("  97th perc.", getPerc(97, times), k.bold)} ║`);
  console.log(`║ ${getlogVal("  98th perc.", getPerc(98, times))} ║`);
  console.log(`║ ${getlogVal("  99th perc.", getPerc(99, times))} ║`);
  console.log("╚══════════════╩═══════════╝");

  const getFormattedDate = (timestamp: number) => Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale, {
    dateStyle: "short",
    timeStyle: "long",
  }).format(new Date(timestamp));

  const localStartDateTime = getFormattedDate(testStartTs);
  const localFinishDateTime = getFormattedDate(testFinishTs);

  const gitSha = getGitSha().slice(0, 7);

  const reportData = {
    localStartDateTime,
    localFinishDateTime,
    totalTime,
    duration: durStr,
    gitSha,
    settings,
    times: reportTimes as LatencyTestReport["times"],
  } as const satisfies LatencyTestReport;

  const reportPath = join(reportsDirPath, `report_${new Date(testFinishTs).toISOString().replace(/[:/.]/g, "-").replace(/T/g, "_").replace(/-\d+Z/, "")}.json`);

  try {
    try {
      const { isDirectory } = await stat(reportsDirPath);
      if(!isDirectory())
        throw new Error();
    }
    catch {
      await mkdir(reportsDirPath);
    }

    await writeFile(reportPath, JSON.stringify(reportData, null, 2));
    console.log(k.gray(`\n> Wrote report to ${reportPath}\n`));
  }
  catch(e) {
    console.error(k.red(`Failed to write latency test report to file at '${reportPath}':`), e);
  }

  return setImmediate(() => process.exit(0));
}

/** Returns the amount of digits in a number. */
function digitCount(num: number): number {
  if(num === 0) return 1;
  return Math.floor(Math.log10(Math.abs(num)) + 1);
}

/**
 * Transforms the value parameter from the numerical range `range1min` to `range1max` to the numerical range `range2min` to `range2max`  
 * For example, you can map the value 2 in the range of 0-5 to the range of 0-10 and you'd get a 4 as a result.
 */
function mapRange(value: number, range1min: number, range1max: number, range2min: number, range2max: number): number;
/**
 * Transforms the value parameter from the numerical range `0` to `range1max` to the numerical range `0` to `range2max`
 * For example, you can map the value 2 in the range of 0-5 to the range of 0-10 and you'd get a 4 as a result.
 */
function mapRange(value: number, range1max: number, range2max: number): number;
function mapRange(value: number, range1min: number, range1max: number, range2min?: number, range2max?: number): number {
  // overload
  if(typeof range2min === "undefined" || range2max === undefined) {
    range2max = range1max;
    range2min = 0;
    range1max = range1min;
    range1min = 0;
  }

  if(Number(range1min) === 0.0 && Number(range2min) === 0.0)
    return value * (range2max / range1max);

  return (value - range1min) * ((range2max - range2min) / (range1max - range1min)) + range2min;
}

/** Returns the current git SHA or "unknown" if it fails. */
function getGitSha() {
  try {
    return String(execSync("git rev-parse HEAD")).trim();
  }
  catch {
    return "unknown";
  }
}
/** Returns the estimated remaining time in minutes (if at least 1 min) and seconds, given the start timestamp, current amount of completed requests and the total amount of requests. */
function getRemainingTimeStr(startTs: number, current: number, total: number) {
  const avg = (Date.now() - startTs) / current,
    remainingSecs = avg * (total - current) / 1000;
  return secondsToPrettyString(remainingSecs);
}

/** Turns the given amount of seconds into a string, e.g. `2m 39s` */
function secondsToPrettyString(seconds: number) {
  const secStr = Number(seconds.toFixed(0)),
    minStr = Math.floor(secStr / 60);
  return `${minStr > 0 ? `${minStr}m ` : ""}${secStr % 60}s`;
}

run();
