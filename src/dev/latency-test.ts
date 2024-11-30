// NOTE:
// - requires the env vars HTTP_PORT and AUTH_TOKENS (at least 1 token to bypass rate limiting) to be set
// - requires geniURL to run in a different process (or using the command pnpm run latency-test)
//
// - requests are sent sequentially on purpose to avoid rate limiting on genius.com's side

import "dotenv/config";
import _axios from "axios";
import percentile from "percentile";
import k from "kleur";
import type { Stringifiable } from "svcorelib";
import queries from "./latency-test-queries.json" with { type: "json" };

const settings = {
  /** Amount of requests to send in total. */
  amount: 10,
  /** Base URL to send requests to. `{{QUERY}}` will be replaced with a random query from the `latency-test-queries.json` file. */
  url: `http://127.0.0.1:${process.env.HTTP_PORT ?? 8074}/v2/search/top?q={{QUERY}}`,
  /** Whether to log all requests to the console. */
  logRequests: true,
};


const axios = _axios.create({ timeout: 20_000 });

async function run() {
  console.log(`\n\n>>> Running latency test with ${settings.amount} requests...\n`);
  const startTs = Date.now();

  const times = [] as number[];
  for(let i = 0; i < settings.amount; i++) {
    i === 0 && console.log(`> Sent 0 of ${settings.amount} requests`);
    const start = Date.now();
    try {
      const url = settings.url.replace("{{QUERY}}", queries[Math.floor(Math.random() * queries.length)]);
      settings.logRequests && console.log("    *", url);
      await axios.get(url, {
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${process.env.AUTH_TOKENS!.split(",")[0]}`,
        },
      });
    }
    catch(e) {
      console.error("Failed to send request:", e);
    }
    finally {
      times.push(Date.now() - start);

      i % 10 === 0 && i !== 0 && console.log(`> Sent ${i} of ${settings.amount} requests`);
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

  const logVal = (label: string, value: Stringifiable, kleurFunc?: (str: string) => void) => {
    const valStr = `${label}:\t${String(value).padStart(4, " ")} ms`;
    console.log(kleurFunc ? kleurFunc(valStr) : valStr);
  }

  console.log(`\n>>> Latency test finished sending all ${settings.amount} requests after ${((Date.now() - startTs) / 1000).toFixed(2)}s - Results:`);
  console.log();
  logVal("5th%", getPerc(5, times), k.gray);
  logVal("10th%", getPerc(10, times), k.gray);
  logVal("25th%", getPerc(25, times), k.gray);
  logVal("80th%", getPerc(80, times));
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
}

run();
