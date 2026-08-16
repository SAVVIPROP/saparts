// Seed SAparts database with 20 cities, curated properties, and editorial insights.
// Run with: node scripts/seed.mjs
import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL env var is required.");
  process.exit(1);
}

const SEED_CITIES_FILE = "/home/ubuntu/saparts-data/seed_all_cities.json";
const INSIGHTS_FILE = "/home/ubuntu/generate_insights_articles.json";

function log(...args) { console.log("[seed]", ...args); }

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  log("Connected to DB.");

  // ----- Clear existing curated data (keep users) -----
  log("Truncating existing content tables...");
  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  for (const t of ["shortlistItems", "shortlists", "propertyImages", "properties", "cities", "insights"]) {
    await conn.query(`DELETE FROM \`${t}\``);
    await conn.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
  }
  await conn.query("SET FOREIGN_KEY_CHECKS=1");

  // ----- Load seed data -----
  const seedData = JSON.parse(fs.readFileSync(SEED_CITIES_FILE, "utf8"));
  log(`Loaded ${Object.keys(seedData).length} cities from seed file.`);

  // ----- Insert cities -----
  const cityIdBySlug = {};
  for (const slug of Object.keys(seedData)) {
    const { city } = seedData[slug];
    const [result] = await conn.query(
      `INSERT INTO cities
       (slug, name, country, region, tagline, heroImageUrl, coverImageUrl, dossier,
        businessDistricts, neighborhoods, avgMonthlyRateUsd, avgDailyRateUsd,
        currencyCode, latitude, longitude, timezone, featured, published, sortOrder)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        city.slug,
        city.name,
        city.country,
        city.region,
        city.tagline ?? null,
        city.heroImageUrl ?? null,
        city.coverImageUrl ?? null,
        city.dossier ?? null,
        JSON.stringify(city.businessDistricts ?? []),
        JSON.stringify(city.neighborhoods ?? []),
        Math.round(city.avgMonthlyRateUsd ?? 0),
        Math.round(city.avgDailyRateUsd ?? 0),
        city.currency ?? "USD",
        city.lat,
        city.lng,
        city.timezone ?? null,
        city.featured ? 1 : 0,
        1,
        city.sortOrder ?? 0,
      ]
    );
    cityIdBySlug[slug] = result.insertId;
  }
  log(`Inserted ${Object.keys(cityIdBySlug).length} cities.`);

  // ----- Insert properties + images -----
  let propCount = 0, imgCount = 0;
  const slugSeen = new Set();
  for (const citySlug of Object.keys(seedData)) {
    const { properties } = seedData[citySlug];
    const cityId = cityIdBySlug[citySlug];
    for (const p of properties) {
      let slug = (p.slug || p.name || "property").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!slug.startsWith(citySlug + "-")) slug = `${citySlug}-${slug}`;
      let finalSlug = slug;
      let n = 2;
      while (slugSeen.has(finalSlug)) { finalSlug = `${slug}-${n++}`; }
      slugSeen.add(finalSlug);

      // Normalize category
      const allowedCats = new Set(["Serviced Apartment","Aparthotel","Residence","Penthouse"]);
      const category = allowedCats.has(p.category) ? p.category : "Serviced Apartment";

      const [result] = await conn.query(
        `INSERT INTO properties
         (slug, cityId, name, brand, category, tagline, description, neighborhood, address,
          latitude, longitude, heroImageUrl, unitTypes, amenities, minStayNights,
          ratingScore, ratingSource, priceFromDailyUsd, priceToDailyUsd,
          priceFromMonthlyUsd, priceToMonthlyUsd, bookingUrl, expediaUrl, tripUrl,
          officialUrl, virtualTourUrl, bestForTags, wfaScore, transitScore,
          lifestyleScore, quietnessScore, valueScore, featured, published, sortOrder)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          finalSlug,
          cityId,
          p.name,
          p.brand ?? null,
          category,
          p.tagline ?? null,
          p.description ?? null,
          p.neighborhood ?? null,
          p.address ?? null,
          p.latitude ?? null,
          p.longitude ?? null,
          p.heroImageUrl ?? null,
          JSON.stringify(p.unitTypes ?? []),
          JSON.stringify(p.amenities ?? []),
          Math.round(p.minStayNights ?? 1),
          p.ratingScore ? Number(p.ratingScore).toFixed(1) : null,
          p.ratingSource ?? "Booking.com",
          Math.round(p.priceFromDailyUsd ?? 0) || null,
          Math.round(p.priceToDailyUsd ?? 0) || null,
          Math.round(p.priceFromMonthlyUsd ?? 0) || null,
          Math.round(p.priceToMonthlyUsd ?? 0) || null,
          p.bookingUrl ?? null,
          p.expediaUrl ?? null,
          p.tripUrl ?? null,
          p.officialUrl ?? null,
          p.virtualTourUrl ?? null,
          JSON.stringify(p.bestForTags ?? []),
          p.wfaScore ? Math.round(p.wfaScore) : null,
          p.transitScore ? Math.round(p.transitScore) : null,
          p.lifestyleScore ? Math.round(p.lifestyleScore) : null,
          p.quietnessScore ? Math.round(p.quietnessScore) : null,
          p.valueScore ? Math.round(p.valueScore) : null,
          p.featured ? 1 : 0,
          1,
          p.sortOrder ?? 0,
        ]
      );
      propCount++;
      const propId = result.insertId;

      const images = Array.isArray(p.galleryImages) ? p.galleryImages : [];
      for (let i = 0; i < images.length; i++) {
        const g = images[i];
        const url = typeof g === "string" ? g : g.url;
        if (!url) continue;
        await conn.query(
          `INSERT INTO propertyImages (propertyId, url, caption, alt, sortOrder)
           VALUES (?,?,?,?,?)`,
          [propId, url, (typeof g === "object" ? g.caption : "") ?? null,
           (typeof g === "object" ? g.alt : p.name) ?? p.name, i + 1]
        );
        imgCount++;
      }
    }
  }
  log(`Inserted ${propCount} properties and ${imgCount} images.`);

  // ----- Insights -----
  if (fs.existsSync(INSIGHTS_FILE)) {
    const insightsRaw = JSON.parse(fs.readFileSync(INSIGHTS_FILE, "utf8"));
    const slugSet = new Set();
    let ic = 0;
    for (const r of insightsRaw.results || []) {
      if (r.error) continue;
      const out = r.output || {};
      const raw = out.payload_json || "";
      if (!raw) continue;
      let payload = null;
      try { payload = JSON.parse(raw); } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) { try { payload = JSON.parse(m[0]); } catch {} }
      }
      if (!payload) continue;
      let slug = payload.slug || out.slug || `insight-${ic+1}`;
      slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (slugSet.has(slug)) slug = `${slug}-${ic+1}`;
      slugSet.add(slug);
      await conn.query(
        `INSERT INTO insights (slug, title, dek, body, heroImageUrl, category, readMinutes, featured)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          slug,
          payload.title ?? "Untitled",
          payload.excerpt ?? null,
          payload.bodyMarkdown ?? null,
          payload.coverImageUrl ?? null,
          payload.category ?? "Market Intelligence",
          Math.round(payload.readTimeMinutes ?? 8),
          payload.featured ? 1 : 0,
        ]
      );
      ic++;
    }
    log(`Inserted ${ic} insights.`);
  }

  await conn.end();
  log("Seed complete.");
}

main().catch((e) => {
  console.error("[seed] FATAL", e);
  process.exit(1);
});
