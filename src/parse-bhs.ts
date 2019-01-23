#!/usr/bin/env node

import { Parser } from "csv-parse";
import es from "event-stream";

console.log("Hello, Sun.");

function handler(
  data: string[],
  callback: (error: any, data: string | null) => void
): void {
  try {
    console.error(data[1]);
    const line = `${JSON.stringify(data)}\n`;
    callback(null, line);
  } catch (e) {
    callback(e, null);
  }
}

process.stdin.setEncoding("utf8");

const p = new Parser({ delimiter: "," });

process.stdin
  .pipe(p)
  .pipe(es.map(handler))
  .pipe(process.stdout);
