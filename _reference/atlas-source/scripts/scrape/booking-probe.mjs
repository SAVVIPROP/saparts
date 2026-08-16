/**
 * Booking.com structure probe — London apartments
 * Waits for full JS render and handles consent dialogs
 * Run: node scripts/scrape/booking-probe.mjs
 */
import { chromium } from "playwright";
import fs from "fs";

const URL =
  "https://www.booking.com/searchresults.html?" +
  new URLSearchParams({
    ss: "London, United Kingdom",
    lang: "en-gb",
    checkin: "2026-06-01",
    checkout: "2026-07-01",
    group_adults: "2",
    no_rooms: "1",
    group_children: "0",
    nflt: "ht_id=201;ht_id=220", // 201=Apartment, 220=Aparthotel
    offset: "0",
  });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-GB",
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: {
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });
  const page = await ctx.newPage();

  console.log("Navigating to:", URL);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });

  // Dismiss cookie/consent dialog if present
  try {
    const acceptBtn = page.locator('[id*="accept"], button:has-text("Accept"), button:has-text("I accept")').first();
    if (await acceptBtn.isVisible({ timeout: 3000 })) {
      await acceptBtn.click();
      console.log("Dismissed consent dialog");
      await page.waitForTimeout(2000);
    }
  } catch {}

  // Wait for property cards to appear
  try {
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 15000 });
    console.log("Property cards found!");
  } catch {
    console.log("Timed out waiting for property-card testid, trying alternatives...");
    // Try alternative selectors
    const altSelectors = [
      '[data-testid="property-card-container"]',
      '.sr_property_block',
      '[data-hotelid]',
      '.bui-card',
      '[class*="property"]',
    ];
    for (const sel of altSelectors) {
      const count = await page.$$(sel).then(r => r.length);
      if (count > 0) console.log(`  Found ${count} elements with: ${sel}`);
    }
  }

  // Save full HTML for analysis
  const html = await page.content();
  fs.writeFileSync("/tmp/booking-probe.html", html);
  console.log(`HTML saved (${(html.length / 1024).toFixed(0)} KB)`);

  // Count all data-testid attributes
  const testIds = await page.$$eval("[data-testid]", els =>
    [...new Set(els.map(el => el.getAttribute("data-testid")))].filter(Boolean).sort()
  );
  console.log("\nAll data-testid attributes on page:", testIds.slice(0, 40));

  // Count property cards
  const cards = await page.$$('[data-testid="property-card"]');
  console.log(`\nProperty cards (data-testid="property-card"): ${cards.length}`);

  if (cards.length > 0) {
    const first = cards[0];
    const name = await first.$eval('[data-testid="title"]', el => el.textContent?.trim()).catch(() => "N/A");
    const score = await first.$eval('[data-testid="review-score"]', el => el.textContent?.trim()).catch(() => "N/A");
    const price = await first.$eval('[data-testid="price-and-discounted-price"]', el => el.textContent?.trim()).catch(() => "N/A");
    const img = await first.$eval('img', el => el.getAttribute("src")).catch(() => "N/A");
    const link = await first.$eval('a[data-testid="title-link"]', el => el.getAttribute("href")).catch(() => "N/A");
    const address = await first.$eval('[data-testid="address"]', el => el.textContent?.trim()).catch(() => "N/A");

    console.log("\n--- First property ---");
    console.log("Name:", name);
    console.log("Score:", score);
    console.log("Price:", price);
    console.log("Image:", img?.slice(0, 100));
    console.log("Link:", link?.slice(0, 100));
    console.log("Address:", address);

    const cardTestIds = await first.$$eval("[data-testid]", els =>
      [...new Set(els.map(el => el.getAttribute("data-testid")))].filter(Boolean)
    );
    console.log("\ndata-testid inside first card:", cardTestIds);
  }

  // Check for JSON-LD
  const jsonLd = await page.$$eval('script[type="application/ld+json"]', scripts =>
    scripts.map(s => s.textContent?.slice(0, 300))
  );
  console.log(`\nJSON-LD blocks: ${jsonLd.length}`);
  if (jsonLd[0]) console.log("First:", jsonLd[0]);

  await browser.close();
  console.log("\nDone.");
})();
