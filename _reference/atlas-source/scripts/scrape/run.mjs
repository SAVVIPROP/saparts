#!/usr/bin/env node
// Usage:
//   node scripts/scrape/run.mjs discover [opSlug ...]   # writes out/urls/<slug>.txt
//   node scripts/scrape/run.mjs parse    [opSlug ...]   # writes out/parsed/<slug>.jsonl + logs/failed-<slug>.txt
//   node scripts/scrape/run.mjs retry    [opSlug ...]   # retry from logs/failed-<slug>.txt
import { promises as fs } from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { OPERATORS } from "./operators.mjs";
import { discoverOperatorUrls } from "./discover.mjs";
import { parsePropertyUrl } from "./parse.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const OUT = path.join(ROOT, "out");
const LOGS = path.join(ROOT, "logs");
await fs.mkdir(path.join(OUT, "urls"), { recursive: true });
await fs.mkdir(path.join(OUT, "parsed"), { recursive: true });
await fs.mkdir(LOGS, { recursive: true });

function pickOps(args) {
  if (!args.length) return OPERATORS;
  return OPERATORS.filter((o) => args.includes(o.slug));
}

async function appendLine(file, line) {
  await fs.appendFile(file, line + "\n");
}

async function cmdDiscover(ops) {
  for (const op of ops) {
    const start = Date.now();
    process.stdout.write(`[discover ${op.slug}] …\n`);
    try {
      const urls = await discoverOperatorUrls(op);
      await fs.writeFile(path.join(OUT, "urls", `${op.slug}.txt`), urls.join("\n") + "\n");
      console.log(`[discover ${op.slug}] ${urls.length} urls in ${Math.round((Date.now()-start)/1000)}s`);
    } catch (e) {
      console.log(`[discover ${op.slug}] FAIL: ${e.message}`);
      await appendLine(path.join(LOGS, "discover-failures.txt"), `${op.slug}\t${e.message}`);
    }
  }
}

async function cmdParse(ops, { urlsFile } = {}) {
  const CONCURRENCY = 6;
  const TIMEOUT_MS = 25_000;
  const limiter = pLimit(CONCURRENCY);
  for (const op of ops) {
    const urlsPath = urlsFile ?? path.join(OUT, "urls", `${op.slug}.txt`);
    let list = [];
    try {
      list = (await fs.readFile(urlsPath, "utf8")).split("\n").map((s) => s.trim()).filter(Boolean);
    } catch {
      console.log(`[parse ${op.slug}] no urls file, skipping`);
      continue;
    }
    const outFile = path.join(OUT, "parsed", `${op.slug}.jsonl`);
    const failFile = path.join(LOGS, `failed-${op.slug}.txt`);
    let ok = 0, fail = 0;
    const started = Date.now();
    process.stdout.write(`[parse ${op.slug}] ${list.length} urls → concurrency ${CONCURRENCY}\n`);

    const jobs = list.map((u) => limiter(async () => {
      try {
        const rec = await Promise.race([
          parsePropertyUrl(u, op),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS)),
        ]);
        if (rec) {
          await fs.appendFile(outFile, JSON.stringify(rec) + "\n");
          ok++;
        } else {
          await appendLine(failFile, `${u}\tno-lodging-schema`);
          fail++;
        }
      } catch (e) {
        await appendLine(failFile, `${u}\t${e.message ?? String(e)}`);
        fail++;
      }
    }));
    await Promise.all(jobs);
    console.log(`[parse ${op.slug}] ok=${ok} fail=${fail} in ${Math.round((Date.now()-started)/1000)}s`);
  }
}

async function cmdRetry(ops) {
  for (const op of ops) {
    const failFile = path.join(LOGS, `failed-${op.slug}.txt`);
    let lines = [];
    try { lines = (await fs.readFile(failFile, "utf8")).split("\n").filter(Boolean); } catch { continue; }
    const urls = Array.from(new Set(lines.map((l) => l.split("\t")[0]).filter(Boolean)));
    const retryPath = path.join(OUT, "urls", `${op.slug}-retry.txt`);
    await fs.writeFile(retryPath, urls.join("\n") + "\n");
    // move old fail log aside
    try { await fs.rename(failFile, failFile + ".prev"); } catch {}
    await cmdParse([op], { urlsFile: retryPath });
  }
}

const [cmd, ...rest] = process.argv.slice(2);
const ops = pickOps(rest);
if (!ops.length) { console.log("no operators selected"); process.exit(1); }
if (cmd === "discover") await cmdDiscover(ops);
else if (cmd === "parse") await cmdParse(ops);
else if (cmd === "retry") await cmdRetry(ops);
else { console.log("usage: run.mjs {discover|parse|retry} [opSlug ...]"); process.exit(1); }
