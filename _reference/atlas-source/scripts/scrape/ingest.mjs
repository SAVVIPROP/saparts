#!/usr/bin/env node
// Ingest scraped JSONL records into the SAparts database.
import { promises as fs } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const PARSED_DIR = path.join(ROOT, "out", "parsed");

// Map from arbitrary operator city strings to our 20 city slugs (known DB set).
const CITY_ALIASES = {
  "london": "london",
  "greater london": "london",
  "new york": "new-york",
  "nyc": "new-york",
  "manhattan": "new-york",
  "brooklyn": "new-york",
  "paris": "paris",
  "tokyo": "tokyo",
  "singapore": "singapore",
  "hong kong": "hong-kong",
  "dubai": "dubai",
  "abu dhabi": "abu-dhabi",
  "sydney": "sydney",
  "frankfurt": "frankfurt",
  "san francisco": "san-francisco",
  "amsterdam": "amsterdam",
  "madrid": "madrid",
  "los angeles": "los-angeles",
  "la": "los-angeles",
  "shanghai": "shanghai",
  "seoul": "seoul",
  "mumbai": "mumbai",
  "toronto": "toronto",
  "berlin": "berlin",
  "zurich": "zurich",
  "zürich": "zurich",
  "cambridge": "cambridge",
  "dublin": "dublin",
  "copenhagen": "copenhagen",
  "edinburgh": "edinburgh",
  "lisbon": "lisbon",
  "liverpool": "liverpool",
  "manchester": "manchester",
  "munich": "munich",
  "münchen": "munich",
  "the hague": "the-hague",
  "jersey": "jersey",
};

const NON_PROPERTY_PATH_PATTERNS = [
  "/features/", "/feature/", "/events/", "/event/", "/in-the-press/", "/press/", "/blog/",
  "/careers/", "/privacy", "/terms", "/login", "/signup", "/offers",
];
function isLikelyNonProperty(url) {
  const u = (url || "").toLowerCase();
  return NON_PROPERTY_PATH_PATTERNS.some((p) => u.includes(p));
}
function decodeHtmlEntities(s) {
  if (!s) return s;
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#223;/g, "\u00df") // ß
    .replace(/&#228;/g, "\u00e4")
    .replace(/&#246;/g, "\u00f6")
    .replace(/&#252;/g, "\u00fc")
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function categoryToEnum(s) {
  if (!s) return "Serviced Apartment";
  const low = s.toLowerCase();
  if (low.includes("apart")) return "Aparthotel";
  if (low.includes("residence")) return "Residence";
  if (low.includes("penthouse")) return "Penthouse";
  return "Serviced Apartment";
}

function slugify(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140);
}

function inferCityFromUrlOrAddress(rec) {
  const candidates = [];
  // URL-style hints (e.g. /en/london/..., /destinations/paris/...)
  if (rec.sourceUrl) {
    const m = rec.sourceUrl.toLowerCase().match(/\/(?:en|destinations|furnished-apartments-|coliving|stay|cheval-)([a-z0-9-]+)?(?:\/([a-z0-9-]+))?/);
    if (m?.[1]) candidates.push(m[1].replace(/-/g, " "));
    if (m?.[2]) candidates.push(m[2].replace(/-/g, " "));
    if (rec.sourceUrl.includes("cheval-")) {
      // Cheval properties are London unless address/name contains dubai/palm/expo etc.
      const low = (rec.name ?? "").toLowerCase();
      if (low.includes("dubai") || low.includes("palm") || low.includes("expo") || low.includes("discovery")) {
        candidates.push("dubai");
      } else {
        candidates.push("london");
      }
    }
  }
  if (rec.address?.city) candidates.push(rec.address.city);
  if (rec.name) candidates.push(rec.name);

  for (const c of candidates) {
    const key = String(c ?? "").toLowerCase().trim();
    if (!key) continue;
    // exact alias
    if (CITY_ALIASES[key]) return CITY_ALIASES[key];
    // substring alias
    for (const [alias, slug] of Object.entries(CITY_ALIASES)) {
      if (key.includes(alias)) return slug;
    }
  }
  return null;
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  conn.on("error", (e) => console.error("conn error", e));
  const [citiesRows] = await conn.query("SELECT id, slug FROM cities");
  const citiesBySlug = new Map(citiesRows.map((c) => [c.slug, c.id]));

  const files = (await fs.readdir(PARSED_DIR)).filter((f) => f.endsWith(".jsonl"));
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let mappedOut = 0;
  const unmapped = [];

  for (const file of files) {
    const lines = (await fs.readFile(path.join(PARSED_DIR, file), "utf8")).split("\n").filter(Boolean);
    let idx = 0;
    for (const line of lines) {
      idx++;
      if (idx % 5 === 0 || idx === lines.length) console.log(`[${file}] ${idx}/${lines.length}`);
      let rec;
      try { rec = JSON.parse(line); } catch { skipped++; continue; }
      const citySlug = inferCityFromUrlOrAddress(rec);
      if (isLikelyNonProperty(rec.sourceUrl)) { skipped++; continue; }
      if (!citySlug || !citiesBySlug.has(citySlug)) {
        unmapped.push({ name: rec.name, url: rec.sourceUrl, reason: citySlug ? "city-not-in-db" : "no-city-match" });
        mappedOut++;
        continue;
      }
      const cityId = citiesBySlug.get(citySlug);
      const baseSlug = slugify((rec.operatorSlug ?? "") + "-" + rec.name);
      const slug = baseSlug || slugify(rec.sourceUrl);

      // dedupe: existing by slug
      const [existing] = await conn.query("SELECT id FROM properties WHERE slug = ? LIMIT 1", [slug]);
      const payload = {
        slug,
        cityId,
        name: rec.name.slice(0, 256),
        brand: (rec.brand ?? null)?.slice(0, 128) ?? null,
        category: categoryToEnum(rec.category),
        tagline: null,
        description: decodeHtmlEntities(rec.description) ?? null,
        neighborhood: decodeHtmlEntities(rec.address?.region) ?? null,
        address: decodeHtmlEntities(rec.address?.street) ?? null,
        latitude: rec.geo?.lat ?? null,
        longitude: rec.geo?.lng ?? null,
        heroImageUrl: rec.heroImageUrl ?? null,
        unitTypes: JSON.stringify(rec.unitTypes ?? []),
        amenities: JSON.stringify([]),
        minStayNights: 1,
        ratingScore: rec.ratingScore ?? null,
        ratingSource: rec.ratingScore ? "Operator" : null,
        officialUrl: rec.sourceUrl,
        bestForTags: JSON.stringify([]),
        wfaScore: null,
        transitScore: null,
        lifestyleScore: null,
        quietnessScore: null,
        valueScore: null,
        featured: false,
        published: true,
        sortOrder: 0,
      };

      if (existing.length) {
        await conn.query(
          `UPDATE properties SET cityId=?, name=?, brand=?, category=?, description=?, neighborhood=?, address=?, latitude=?, longitude=?, heroImageUrl=?, unitTypes=?, officialUrl=? WHERE id=?`,
          [payload.cityId, payload.name, payload.brand, payload.category, payload.description, payload.neighborhood, payload.address, payload.latitude, payload.longitude, payload.heroImageUrl, payload.unitTypes, payload.officialUrl, existing[0].id]
        );
        updated++;
        // refresh images
        await conn.query("DELETE FROM propertyImages WHERE propertyId=?", [existing[0].id]);
        const gallery = (rec.galleryUrls ?? []).slice(0, 12);
        for (let i = 0; i < gallery.length; i++) {
          await conn.query("INSERT INTO propertyImages (propertyId, url, sortOrder) VALUES (?, ?, ?)", [existing[0].id, gallery[i], i]);
        }
      } else {
        const [res] = await conn.query(
          `INSERT INTO properties (slug, cityId, name, brand, category, description, neighborhood, address, latitude, longitude, heroImageUrl, unitTypes, amenities, minStayNights, ratingScore, ratingSource, officialUrl, bestForTags, featured, published, sortOrder)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [payload.slug, payload.cityId, payload.name, payload.brand, payload.category, payload.description, payload.neighborhood, payload.address, payload.latitude, payload.longitude, payload.heroImageUrl, payload.unitTypes, payload.amenities, payload.minStayNights, payload.ratingScore, payload.ratingSource, payload.officialUrl, payload.bestForTags, payload.featured, payload.published, payload.sortOrder]
        );
        const propertyId = res.insertId;
        inserted++;
        const gallery = (rec.galleryUrls ?? []).slice(0, 12);
        for (let i = 0; i < gallery.length; i++) {
          await conn.query("INSERT INTO propertyImages (propertyId, url, sortOrder) VALUES (?, ?, ?)", [propertyId, gallery[i], i]);
        }
      }
    }
  }
  await conn.end();
  console.log(`inserted=${inserted} updated=${updated} skipped=${skipped} unmapped=${mappedOut}`);
  if (unmapped.length) {
    await fs.writeFile(path.join(ROOT, "logs", "unmapped.json"), JSON.stringify(unmapped, null, 2));
    console.log(`wrote ${unmapped.length} unmapped rows → logs/unmapped.json`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
