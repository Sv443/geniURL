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
  /** Local date and time string when the latency test finished. */
  localDateTime: string;
  /** Settings used for the latency test. */
  settings: typeof settings;
  /** Total time the latency test took in seconds. */
  totalTime: number;
  /** Calculated times in milliseconds. */
  times: Record<
    "min" | "avg" | "max" | "5th%" | "10th%" | "25th%" | "80th%" | "90th%" | "95th%" | "97th%" | "98th%" | "99th%",
    number
  >;
};

async function run() {
  console.log(k.green(`\n>>> Starting latency test on ${settings.amount} sequential requests${settings.amount >= 50 ? k.yellow(" - this could take a while!") : ""}\n`));
  const testStartTs = Date.now();

  const times = [] as number[];
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
    }
    catch(e) {
      console.error(k.red("\n>> Failed to send request:"), e);
      console.error();
    }
    finally {
      times.push(Date.now() - reqStartTs);

      const elapsedStr = `${((Date.now() - testStartTs) / 1000).toFixed(1)}s elapsed`;

      if(settings.logAllRequests && i % settings.infoLogFrequency === settings.infoLogFrequency - 1 && i > 0 && i !== settings.amount - 1) {
        const spc = `${" ".repeat(digitCount(settings.amount))}  `,
          perc = mapRange(i + 1, 0, settings.amount, 0, 100).toFixed(0);
        console.log(`${spc}> ${elapsedStr}, sent ${i + 1} of ${settings.amount} requests (${perc}%)`);
      }
      else if(i % settings.infoLogFrequency === settings.infoLogFrequency - 1 && i > 0 && i !== settings.amount - 1)
        console.log(`> Sent ${i + 1} of ${settings.amount} requests (${elapsedStr})`);
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

  const logVal = (label: string, value: Stringifiable, kleurFunc?: (str: string) => void) => {
    const valStr = `${label}:\t${String(value).padStart(4, " ")} ms`;
    reportTimes[label as keyof LatencyTestReport["times"]] = Number(value);
    console.log(kleurFunc ? kleurFunc(valStr) : valStr);
  }

  const testFinishTs = Date.now();
  const totalTime = Number(((testFinishTs - testStartTs) / 1000).toFixed(2));

  console.log(`\n>>> Latency test finished sending all ${settings.amount} requests after ${totalTime}s - Results:`);
  console.log();
  logVal("5th%", getPerc(5, times), k.gray);
  logVal("10th%", getPerc(10, times), k.gray);
  logVal("25th%", getPerc(25, times), k.gray);
  logVal("80th%", getPerc(80, times), k.gray);
  logVal("90th%", getPerc(90, times));
  logVal("95th%", getPerc(95, times));
  logVal("97th%", getPerc(97, times), k.bold);
  logVal("98th%", getPerc(98, times));
  logVal("99th%", getPerc(99, times));
  console.log();
  logVal("min", min);
  logVal("avg", avg, k.bold);
  logVal("max", max);
  console.log();

  const localDateTime = Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale, {
    dateStyle: "short",
    timeStyle: "long",
  }).format(new Date(testFinishTs));

  const reportData: LatencyTestReport = {
    localDateTime,
    settings,
    totalTime,
    times: reportTimes as LatencyTestReport["times"],
  };

  const reportPath = join(reportsDirPath, `report_${new Date(testFinishTs).toISOString().replace(/[:/.]/g, "-").replace(/T/g, "_").replace(/-.+Z/, "")}.json`);

  try {
    try {
      await stat(reportsDirPath);
    }
    catch {
      await mkdir(reportsDirPath);
    }

    await writeFile(reportPath, JSON.stringify(reportData, null, 2));
    console.log(k.gray(`Wrote report to file at '${reportPath}'\n`));
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

run();
