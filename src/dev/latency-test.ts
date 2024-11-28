// NOTE:
// requires the env vars HTTP_PORT and AUTH_TOKENS to be set

import "dotenv/config";
import _axios from "axios";
import percentile from "percentile";

const settings = {
  amount: 100,
  url: `http://127.0.0.1:${process.env.HTTP_PORT}/search/top?q=pink guy - dog festival directions`,
};


const axios = _axios.create({ timeout: 20_000 });

async function run() {
  console.log(`\n\n>>> Running latency test with ${settings.amount} requests...\n`);
  const startTs = Date.now();

  const times = [] as number[];
  for(let i = 0; i < settings.amount; i++) {
    const start = Date.now();
    await axios.get(settings.url, {
      headers: {
        "Cache-Control": "no-cache",
        Authorization: `Bearer ${process.env.AUTH_TOKENS!.split(",")[0]}`,
      },
    });
    times.push(Date.now() - start);

    i % 10 === 0 && i !== 0 && console.log(`Sent ${i} of ${settings.amount} requests`);
  }

  const avg = (times.reduce((a, c) => a + c, 0) / times.length).toFixed(0);
  const max = times.reduce((a, c) => Math.max(a, c), 0).toFixed(0);
  const perc80 = percentile(80, times);
  const perc90 = percentile(90, times);
  const perc95 = percentile(95, times);
  const perc99 = percentile(99, times);

  console.log(`\n>>> Latency test finished after ${((Date.now() - startTs) / 1000).toFixed(2)}s`);
  console.log();
  console.log(`avg:\t${avg}\tms`);
  console.log(`max:\t${max}\tms`);
  console.log();
  console.log(`80th%:\t${perc80}\tms`);
  console.log(`90th%:\t${perc90}\tms`);
  console.log(`95th%:\t${perc95}\tms`);
  console.log(`99th%:\t${perc99}\tms`);
  console.log();
}

run();
