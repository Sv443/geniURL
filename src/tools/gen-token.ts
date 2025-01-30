import { randomBytes } from "node:crypto";

const { argv } = process;

const processedIndexes = new Set<number>();

const amtArgIdx = argv.findIndex(a => !isNaN(Number(a)));
amtArgIdx >= 0 && processedIndexes.add(amtArgIdx);
const amtArg = amtArgIdx >= 0 ? Number(argv[amtArgIdx]) : NaN;
const amount = !isNaN(amtArg) ? amtArg : 1;

const lenArg = Number(argv.find((a, i) => !processedIndexes.has(i) && !isNaN(Number(a))));
const length = !isNaN(lenArg) ? lenArg : 48;

for(let i = 0; i < amount; i++) {
  const token = randomBytes(length).toString("base64");

  console.log(`${amount > 1 ? `${i + 1}: ` : ""}${token}`);
}

console.log();
