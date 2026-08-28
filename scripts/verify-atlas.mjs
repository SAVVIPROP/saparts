import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const cities = JSON.parse(readFileSync(join(root, "data/cities.json"), "utf8"));
const publicListings = join(root, "public", "listings");

function walkListingFiles(dir, urlBase, found) {
  if (!existsSync(dir)) return found;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) walkListingFiles(join(dir, ent.name), `${urlBase}/${ent.name}`, found);
    else if (ent.isFile() && /\.(webp|jpe?g|png|gif|avif)$/i.test(ent.name)) {
      found.add(`${urlBase}/${ent.name}`);
    }
  }
  return found;
}

const onDisk = walkListingFiles(publicListings, "/listings", new Set());
const map = JSON.parse(readFileSync(join(root, "data/local-images.json"), "utf8"));

let listings = 0;
const stills = new Set();
const pricedByCity = {};
for (const file of readdirSync(join(root, "data/properties")).filter((f) => f.endsWith(".json"))) {
  const rows = JSON.parse(readFileSync(join(root, "data/properties", file), "utf8"));
  for (const p of rows) {
    if (!p?.slug || p.published === false) continue;
    listings += 1;
    const candidates = [
      ...(p.imageFiles ?? []),
      ...(map[p.slug] ?? []),
      p.heroImageUrl,
      ...(p.imageUrls ?? []),
    ];
    for (const u of candidates) {
      if (typeof u === "string" && u.startsWith("/listings/") && !/^https?:\/\//i.test(u) && onDisk.has(u)) {
        stills.add(u);
      }
    }
    if (typeof p.priceFromMonthlyUsd === "number" && p.priceFromMonthlyUsd > 0) {
      (pricedByCity[p.citySlug] ??= []).push(p.priceFromMonthlyUsd);
    }
  }
}

const liveCities = cities.filter((c) => c?.slug && c?.name);
assert.equal(liveCities.length, 30, "live register is the 30-city pack");
assert.equal(listings, 738, "published residences stay at 738");
assert.ok(stills.size <= onDisk.size, "stills cannot exceed files on disk");
assert.ok(![...stills].some((u) => !onDisk.has(u)), "every counted still exists on disk");
assert.notEqual(stills.size, 702, "do not reprint the leftover JSON-path stills count");

const medians = Object.entries(pricedByCity).map(([slug, prices]) => {
  const sorted = [...prices].sort((a, b) => a - b);
  return { slug, median: sorted[Math.floor(sorted.length / 2)] };
});
assert.ok(medians.some((m) => m.slug === "washington-dc"), "Washington, D.C. filed rate must enter the index");
assert.ok(medians.some((m) => m.slug === "new-york"), "New York filed rate must enter the index");
const highest = [...medians].sort((a, b) => b.median - a.median)[0];
const best = [...medians].sort((a, b) => a.median - b.median)[0];
assert.equal(highest.slug, "new-york");
assert.equal(best.slug, "washington-dc");
assert.notEqual(highest.slug, best.slug, "highest and best-value cannot both collapse to New York");

console.log(
  JSON.stringify(
    {
      cities: liveCities.length,
      listings,
      stillsOnDisk: stills.size,
      filesOnDisk: onDisk.size,
      highest,
      best,
    },
    null,
    2,
  ),
);
