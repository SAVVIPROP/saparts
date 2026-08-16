/**
 * Copy an ENRICHED.json listing pack into data/properties/<citySlug>.json
 *
 * Usage:
 *   node scripts/import-enriched.mjs <ENRICHED.json> [citySlug]
 *
 * ENRICHED.json must be a JSON array of listings (or { listings: [...] }).
 * When citySlug is omitted, records are grouped by each listing citySlug/city.
 * The script overwrites the destination file. It does not invent prices or inventory.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const propertiesDir = join(root, "data", "properties");
const inputPath = process.argv[2];
const forcedCity = process.argv[3];

if (!inputPath) {
  console.error("Usage: node scripts/import-enriched.mjs <ENRICHED.json> [citySlug]");
  process.exit(1);
}

const abs = resolve(process.cwd(), inputPath);
if (!existsSync(abs)) {
  console.error("File not found: " + abs);
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(readFileSync(abs, "utf8"));
} catch (err) {
  console.error("Could not parse JSON: " + (err instanceof Error ? err.message : err));
  process.exit(1);
}

const listings = Array.isArray(raw) ? raw : Array.isArray(raw && raw.listings) ? raw.listings : null;
if (!listings) {
  console.error("ENRICHED.json must be an array of listings, or an object with a listings array.");
  process.exit(1);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => (typeof v === "string" ? v : String(v))).filter(Boolean);
  if (typeof value === "string") return value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function normalise(listing, fallbackCity) {
  const citySlug = slugify(listing.citySlug) || slugify(listing.city) || slugify(fallbackCity);
  const slug = slugify(listing.slug) || slugify(listing.name);
  if (!slug) return null;
  return {
    slug,
    citySlug,
    name: listing.name ?? "",
    brand: listing.brand ?? null,
    category: listing.category ?? null,
    tagline: listing.tagline ?? null,
    description: listing.description ?? null,
    neighborhood: listing.neighborhood ?? listing.neighbourhood ?? listing.district ?? null,
    address: listing.address ?? null,
    latitude: listing.latitude ?? listing.lat ?? null,
    longitude: listing.longitude ?? listing.lng ?? listing.lon ?? null,
    heroImageUrl: listing.heroImageUrl ?? listing.heroImage ?? null,
    imageUrls: asStringArray(listing.imageUrls ?? listing.images),
    imageFiles: asStringArray(listing.imageFiles),
    unitTypes: Array.isArray(listing.unitTypes) ? listing.unitTypes : Array.isArray(listing.roomTypes) ? listing.roomTypes : [],
    amenities: asStringArray(listing.amenities),
    minStayNights: listing.minStayNights ?? listing.minStay ?? null,
    priceFromMonthlyUsd: listing.priceFromMonthlyUsd ?? null,
    priceFromMonthlyNative: listing.priceFromMonthlyNative ?? null,
    priceCurrencyNative: listing.priceCurrencyNative ?? null,
    priceNotes: listing.priceNotes ?? null,
    bookingUrl: listing.bookingUrl ?? null,
    officialUrl: listing.officialUrl ?? listing.officialWebsite ?? null,
    virtualTourUrl: listing.virtualTourUrl ?? listing.matterportUrl ?? null,
    videoUrls: asStringArray(listing.videoUrls),
    layoutUrls: asStringArray(listing.layoutUrls),
    operatorGroup: listing.operatorGroup ?? listing.operator ?? null,
    published: listing.published !== false,
    sources: asStringArray(listing.sources ?? listing.sourceUrls),
  };
}

const grouped = new Map();
let skipped = 0;
for (const item of listings) {
  const record = normalise(item, forcedCity);
  if (!record || !record.citySlug) {
    skipped += 1;
    continue;
  }
  if (forcedCity) record.citySlug = slugify(forcedCity);
  const bucket = grouped.get(record.citySlug) ?? [];
  bucket.push(record);
  grouped.set(record.citySlug, bucket);
}

if (grouped.size === 0) {
  console.error("No valid listings found. Each record needs a slug and a citySlug.");
  process.exit(1);
}

mkdirSync(propertiesDir, { recursive: true });
for (const [citySlug, rows] of grouped) {
  const dest = join(propertiesDir, citySlug + ".json");
  writeFileSync(dest, JSON.stringify(rows, null, 2) + "\n", "utf8");
  console.log("Wrote " + rows.length + " listing(s) to data/properties/" + citySlug + ".json");
}
if (skipped) console.log("Skipped " + skipped + " record(s) without slug or city.");
