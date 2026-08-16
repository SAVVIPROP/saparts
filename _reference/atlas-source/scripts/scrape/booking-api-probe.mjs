/**
 * Booking.com API probe — intercepts internal API calls
 * Run: node scripts/scrape/booking-api-probe.mjs
 */
import { chromium } from "playwright";
import fs from "fs";

const SEARCH_URL =
  "https://www.booking.com/searchresults.html?" +
  new URLSearchParams({
    ss: "London, United Kingdom",
    lang: "en-gb",
    checkin: "2026-06-01",
    checkout: "2026-07-01",
    group_adults: "2",
    no_rooms: "1",
    group_children: "0",
    nflt: "ht_id=201;ht_id=220",
    offset: "0",
    rows: "25",
  });

const apiCalls = [];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-GB",
    viewport: { width: 1440, height: 900 },
  });

  // Intercept all API/JSON responses
  ctx.on("response", async (response) => {
    const url = response.url();
    const ct = response.headers()["content-type"] || "";
    if (
      ct.includes("json") &&
      (url.includes("booking.com") || url.includes("bstatic.com"))
    ) {
      try {
        const body = await response.text();
        if (body.length > 500 && body.length < 500000) {
          apiCalls.push({ url: url.slice(0, 150), size: body.length, preview: body.slice(0, 300) });
        }
      } catch {}
    }
  });

  const page = await ctx.newPage();
  console.log("Navigating...");

  try {
    await page.goto(SEARCH_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch (e) {
    console.log("Navigation timeout (expected):", e.message.slice(0, 80));
  }

  // Wait a bit for API calls to fire
  await page.waitForTimeout(8000);

  console.log(`\nCaptured ${apiCalls.length} JSON API calls:\n`);
  apiCalls.forEach((c, i) => {
    console.log(`[${i + 1}] ${c.url}`);
    console.log(`    Size: ${(c.size / 1024).toFixed(1)} KB`);
    console.log(`    Preview: ${c.preview.slice(0, 200)}\n`);
  });

  fs.writeFileSync("/tmp/booking-api-calls.json", JSON.stringify(apiCalls, null, 2));
  console.log("Saved to /tmp/booking-api-calls.json");

  await browser.close();
})();
