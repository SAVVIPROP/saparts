// Fast batched seed script
import mysql from "mysql2/promise";
import fs from "node:fs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL required"); process.exit(1); }

const SEED_CITIES_FILE = "/home/ubuntu/saparts-data/seed_all_cities.json";
const INSIGHTS_FILE = "/home/ubuntu/generate_insights_articles.json";

const log = (...a) => console.log("[seed]", ...a);

function r(n) { return n == null ? null : Math.round(Number(n)); }

async function main() {
  const conn = await mysql.createConnection({
    uri: DATABASE_URL,
    connectTimeout: 30000,
    multipleStatements: false,
  });
  log("Connected.");

  // --- Clear tables ---
  log("Clearing tables...");
  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  for (const t of ["shortlistItems","shortlists","propertyImages","properties","cities","insights"]) {
    await conn.query(`DELETE FROM \`${t}\``);
    try { await conn.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`); } catch {}
  }
  await conn.query("SET FOREIGN_KEY_CHECKS=1");
  log("Cleared.");

  const seed = JSON.parse(fs.readFileSync(SEED_CITIES_FILE, "utf8"));

  // --- Insert cities in one batch ---
  const citySlugs = Object.keys(seed);
  const cityCols = ["slug","name","country","region","tagline","heroImageUrl","coverImageUrl","dossier",
    "businessDistricts","neighborhoods","avgMonthlyRateUsd","avgDailyRateUsd","currencyCode",
    "latitude","longitude","timezone","featured","published","sortOrder"];
  const cityPh = `(${cityCols.map(()=>"?").join(",")})`;
  const cityVals = [];
  const cityRows = [];
  for (const slug of citySlugs) {
    const { city } = seed[slug];
    cityRows.push([
      city.slug, city.name, city.country, city.region,
      city.tagline ?? null, city.heroImageUrl ?? null, city.coverImageUrl ?? null, city.dossier ?? null,
      JSON.stringify(city.businessDistricts ?? []), JSON.stringify(city.neighborhoods ?? []),
      r(city.avgMonthlyRateUsd) ?? 0, r(city.avgDailyRateUsd) ?? 0,
      city.currency ?? "USD", city.lat ?? null, city.lng ?? null, city.timezone ?? null,
      city.featured ? 1 : 0, 1, city.sortOrder ?? 0,
    ]);
  }
  for (const row of cityRows) cityVals.push(...row);
  const citySql = `INSERT INTO cities (${cityCols.map(c=>`\`${c}\``).join(",")}) VALUES ${cityRows.map(()=>cityPh).join(",")}`;
  await conn.query(citySql, cityVals);
  log(`Inserted ${cityRows.length} cities.`);

  // Get ids back
  const [cityIdRows] = await conn.query("SELECT id, slug FROM cities");
  const cityIdBySlug = {};
  for (const r of cityIdRows) cityIdBySlug[r.slug] = r.id;

  // --- Build property rows ---
  const propCols = ["slug","cityId","name","brand","category","tagline","description","neighborhood","address",
    "latitude","longitude","heroImageUrl","unitTypes","amenities","minStayNights","ratingScore","ratingSource",
    "priceFromDailyUsd","priceToDailyUsd","priceFromMonthlyUsd","priceToMonthlyUsd",
    "bookingUrl","expediaUrl","tripUrl","officialUrl","virtualTourUrl","bestForTags",
    "wfaScore","transitScore","lifestyleScore","quietnessScore","valueScore","featured","published","sortOrder"];
  const propPh = `(${propCols.map(()=>"?").join(",")})`;

  const allowedCats = new Set(["Serviced Apartment","Aparthotel","Residence","Penthouse"]);
  const slugSeen = new Set();
  const allProps = [];
  const propMetaByIndex = []; // store galleryImages per property

  for (const citySlug of citySlugs) {
    const cityId = cityIdBySlug[citySlug];
    for (const p of seed[citySlug].properties) {
      let s = (p.slug || p.name || "property").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      if (!s.startsWith(citySlug+"-")) s = `${citySlug}-${s}`;
      let finalSlug = s; let n=2;
      while (slugSeen.has(finalSlug)) finalSlug = `${s}-${n++}`;
      slugSeen.add(finalSlug);
      const category = allowedCats.has(p.category) ? p.category : "Serviced Apartment";
      const row = [
        finalSlug, cityId, p.name, p.brand ?? null, category,
        p.tagline ?? null, p.description ?? null, p.neighborhood ?? null, p.address ?? null,
        p.latitude ?? null, p.longitude ?? null, p.heroImageUrl ?? null,
        JSON.stringify(p.unitTypes ?? []), JSON.stringify(p.amenities ?? []),
        r(p.minStayNights) ?? 1,
        p.ratingScore ? Number(p.ratingScore).toFixed(1) : null,
        p.ratingSource ?? "Booking.com",
        r(p.priceFromDailyUsd) || null, r(p.priceToDailyUsd) || null,
        r(p.priceFromMonthlyUsd) || null, r(p.priceToMonthlyUsd) || null,
        p.bookingUrl ?? null, p.expediaUrl ?? null, p.tripUrl ?? null,
        p.officialUrl ?? null, p.virtualTourUrl ?? null,
        JSON.stringify(p.bestForTags ?? []),
        r(p.wfaScore), r(p.transitScore), r(p.lifestyleScore), r(p.quietnessScore), r(p.valueScore),
        p.featured ? 1 : 0, 1, p.sortOrder ?? 0,
      ];
      allProps.push(row);
      propMetaByIndex.push({ finalSlug, name: p.name, galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [] });
    }
  }

  // Insert properties in chunks of 40
  const chunk = 40;
  let inserted = 0;
  for (let i = 0; i < allProps.length; i += chunk) {
    const batch = allProps.slice(i, i+chunk);
    const flat = []; for (const row of batch) flat.push(...row);
    const sql = `INSERT INTO properties (${propCols.map(c=>`\`${c}\``).join(",")}) VALUES ${batch.map(()=>propPh).join(",")}`;
    await conn.query(sql, flat);
    inserted += batch.length;
    log(`Properties: ${inserted}/${allProps.length}`);
  }

  // Map property slug -> id
  const [propIdRows] = await conn.query("SELECT id, slug FROM properties");
  const propIdBySlug = {};
  for (const row of propIdRows) propIdBySlug[row.slug] = row.id;

  // --- Insert images in big batches ---
  const imgCols = ["propertyId","url","caption","alt","sortOrder"];
  const imgPh = `(${imgCols.map(()=>"?").join(",")})`;
  const imgRows = [];
  for (const meta of propMetaByIndex) {
    const pid = propIdBySlug[meta.finalSlug];
    if (!pid) continue;
    meta.galleryImages.forEach((g, idx) => {
      const url = typeof g === "string" ? g : g?.url;
      if (!url) return;
      const caption = (typeof g === "object" ? g.caption : null) ?? null;
      const alt = (typeof g === "object" ? g.alt : null) ?? meta.name;
      imgRows.push([pid, url, caption, alt, idx+1]);
    });
  }
  log(`Inserting ${imgRows.length} property images...`);
  const ichunk = 100;
  let iins = 0;
  for (let i = 0; i < imgRows.length; i += ichunk) {
    const batch = imgRows.slice(i, i+ichunk);
    const flat = []; for (const row of batch) flat.push(...row);
    const sql = `INSERT INTO propertyImages (${imgCols.map(c=>`\`${c}\``).join(",")}) VALUES ${batch.map(()=>imgPh).join(",")}`;
    await conn.query(sql, flat);
    iins += batch.length;
    log(`Images: ${iins}/${imgRows.length}`);
  }

  // --- Insights ---
  if (fs.existsSync(INSIGHTS_FILE)) {
    const insightsRaw = JSON.parse(fs.readFileSync(INSIGHTS_FILE, "utf8"));
    const slugSet = new Set();
    const rows = [];
    let ic = 0;
    for (const r of insightsRaw.results || []) {
      if (r.error) continue;
      const out = r.output || {};
      const raw = out.payload_json || "";
      if (!raw) continue;
      let payload = null;
      try { payload = JSON.parse(raw); } catch {
        const m = raw.match(/\{[\s\S]*\}/); if (m) { try { payload = JSON.parse(m[0]); } catch {} }
      }
      if (!payload) continue;
      let slug = payload.slug || out.slug || `insight-${ic+1}`;
      slug = slug.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      if (slugSet.has(slug)) slug = `${slug}-${ic+1}`;
      slugSet.add(slug);
      rows.push([
        slug,
        payload.title ?? "Untitled",
        payload.excerpt ?? null,
        payload.bodyMarkdown ?? null,
        payload.coverImageUrl ?? null,
        payload.category ?? "Market Intelligence",
        Math.round(payload.readTimeMinutes ?? 8),
        payload.featured ? 1 : 0,
      ]);
      ic++;
    }
    if (rows.length) {
      const iCols = ["slug","title","dek","body","heroImageUrl","category","readMinutes","featured"];
      const ph = `(${iCols.map(()=>"?").join(",")})`;
      const flat = []; for (const row of rows) flat.push(...row);
      await conn.query(`INSERT INTO insights (${iCols.map(c=>`\`${c}\``).join(",")}) VALUES ${rows.map(()=>ph).join(",")}`, flat);
    }
    log(`Inserted ${rows.length} insights.`);
  }

  await conn.end();
  log("Seed complete.");
}

main().catch(e => { console.error("[seed] FATAL", e); process.exit(1); });
