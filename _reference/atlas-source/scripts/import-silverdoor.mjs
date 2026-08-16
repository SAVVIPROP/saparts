/**
 * SilverDoor import script
 * Reads /tmp/silverdoor-all.json, downloads images to CDN, inserts into properties + room_types tables.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import mysql from "mysql2/promise";
import https from "https";
import http from "http";

const LOG = "/tmp/import-silverdoor.log";
const log = (...a) => { const line = a.join(" "); console.log(line); fs.appendFileSync(LOG, line + "\n"); };

const db = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  multipleStatements: false,
});

// Load scraped data
const properties = JSON.parse(fs.readFileSync("/tmp/silverdoor-all.json", "utf8"));
log(`Loaded ${properties.length} SilverDoor properties`);

// Get existing city IDs
const [cities] = await db.execute("SELECT id, name, slug FROM cities");
const cityMap = {};
for (const c of cities) {
  cityMap[c.name.toLowerCase()] = c.id;
  cityMap[c.slug.toLowerCase()] = c.id;
}
log("City map keys:", Object.keys(cityMap).join(", "));

// Get existing property names to avoid duplicates
const [existing] = await db.execute("SELECT name FROM properties");
const existingNames = new Set(existing.map(p => p.name.toLowerCase().trim()));
log(`Existing properties: ${existingNames.size}`);

// CDN base
const APP_DOMAIN = "sapartsdir-7tjeqx4c.manus.space";

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    const proto = url.startsWith("https") ? https : http;
    const req = proto.get(url, { headers: { "Referer": "https://www.silverdoor.com/", "User-Agent": "Mozilla/5.0" } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(dest); });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(30000, () => { req.destroy(); resolve(null); });
  });
}

function uploadToCDN(localPath) {
  try {
    const out = execSync(`manus-upload-file --webdev "${localPath}"`, { timeout: 60000 }).toString().trim();
    // Output: "Storage Path: /manus-storage/filename_hash.ext"
    const match = out.match(/\/manus-storage\/([^\s]+)/);
    if (match) return `https://${APP_DOMAIN}/manus-storage/${match[1]}`;
    return null;
  } catch (e) {
    return null;
  }
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// SilverDoor property URL builder
function silverdoorUrl(prop) {
  return `https://www.silverdoor.com/serviced-apartments/${prop.url}`;
}

let imported = 0;
let skipped = 0;

for (const prop of properties) {
  const name = prop.name?.trim();
  if (!name) { skipped++; continue; }
  
  if (existingNames.has(name.toLowerCase())) {
    log(`SKIP (duplicate): ${name}`);
    skipped++;
    continue;
  }

  // Find city
  const propCities = prop.cities || [];
  let cityId = null;
  for (const c of propCities) {
    cityId = cityMap[c.toLowerCase()];
    if (cityId) break;
  }
  if (!cityId) {
    // Try country-based fallback
    log(`SKIP (no city match): ${name} | cities: ${propCities.join(", ")} | country: ${prop.country}`);
    skipped++;
    continue;
  }

  log(`\nImporting: ${name} (city: ${propCities[0]}, id: ${prop.id})`);

  // Download hero image
  let heroImageUrl = null;
  const heroImg = prop.images?.[0];
  if (heroImg?.fullImageUrl || heroImg?.imgURL) {
    const imgUrl = heroImg.fullImageUrl || heroImg.imgURL;
    const ext = path.extname(imgUrl.split("?")[0]) || ".jpg";
    const tmpFile = `/tmp/sd_hero_${prop.id}${ext}`;
    const downloaded = await downloadImage(imgUrl, tmpFile);
    if (downloaded) {
      heroImageUrl = uploadToCDN(tmpFile);
      fs.unlinkSync(tmpFile);
    }
  }

  // Build slug
  let slug = slugify(name);
  // Ensure unique slug
  const [slugCheck] = await db.execute("SELECT id FROM properties WHERE slug = ?", [slug]);
  if (slugCheck.length > 0) slug = slug + "-sd";

  // Build amenities from facilities
  const facilitiesRaw = prop.facilities || {};
  const facilitiesArr = Array.isArray(facilitiesRaw) ? facilitiesRaw : Object.values(facilitiesRaw).flat();
  const amenities = facilitiesArr.slice(0, 8).map(f => (typeof f === 'string' ? f : f.name || f.label || '')).filter(Boolean);

  // Compute rating from rosette (0-5 scale → 6-10 scale)
  const rating = prop.rosette ? Math.min(10, 6 + prop.rosette) : 7.5;

  // Monthly rate from minimumRate (SilverDoor rates are per night)
  const nightlyRate = prop.minimumRate || null;
  const monthlyRate = nightlyRate ? Math.round(nightlyRate * 30) : null;

  // Description from apartments
  const apts = prop.apartments || [];
  const aptSummary = apts.length > 0 
    ? `${apts.length} apartment type${apts.length > 1 ? "s" : ""} available: ${apts.map(a => a.name || a.type).filter(Boolean).join(", ")}.`
    : "";
  const description = `${name} is a premium serviced apartment property in ${propCities[0]}. ${aptSummary} Listed on SilverDoor's curated corporate accommodation platform.`;

  const bookingUrl = silverdoorUrl(prop);

  try {
    const [result] = await db.execute(
      `INSERT INTO properties 
       (cityId, name, slug, description, heroImageUrl, rating, monthlyRateLow, monthlyRateHigh, bookingUrl, source, isPublished, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'silverdoor', 1, NOW(), NOW())`,
      [
        cityId,
        name,
        slug,
        description,
        heroImageUrl || null,
        rating,
        monthlyRate || null,
        monthlyRate ? Math.round(monthlyRate * 1.4) : null,
        bookingUrl,
      ]
    );

    const propertyId = result.insertId;
    log(`  Inserted property ID: ${propertyId}, hero: ${heroImageUrl ? "yes" : "no"}`);

    // Insert additional images
    let imgOrder = 1;
    for (const img of (prop.images || []).slice(1, 9)) {
      const imgUrl = img.fullImageUrl || img.imgURL;
      if (!imgUrl) continue;
      const ext = path.extname(imgUrl.split("?")[0]) || ".jpg";
      const tmpFile = `/tmp/sd_img_${prop.id}_${imgOrder}${ext}`;
      const downloaded = await downloadImage(imgUrl, tmpFile);
      if (downloaded) {
        const cdnUrl = uploadToCDN(tmpFile);
        if (cdnUrl) {
          await db.execute(
            "INSERT INTO property_images (propertyId, url, sortOrder, createdAt) VALUES (?, ?, ?, NOW())",
            [propertyId, cdnUrl, imgOrder]
          );
          imgOrder++;
        }
        fs.unlinkSync(tmpFile);
      }
    }
    log(`  Images uploaded: ${imgOrder - 1}`);

    // Insert room types from apartments
    for (const apt of apts) {
      const roomName = apt.name || apt.type || "Apartment";
      const beds = apt.beds || apt.bedrooms || null;
      const sqm = apt.size || apt.sqm || null;
      const maxGuests = apt.maxOccupancy || apt.guests || null;
      const nightlyMin = apt.fromRate || apt.minimumRate || nightlyRate;
      const monthlyMin = nightlyMin ? Math.round(nightlyMin * 30) : null;
      const monthlyMax = monthlyMin ? Math.round(monthlyMin * 1.3) : null;

      await db.execute(
        `INSERT INTO room_types (scraped_property_id, room_name, beds, size_sqm, max_guests, price_30_nights_min, price_30_nights_max, facilities, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          propertyId, // use propertyId as reference since these are directly imported
          roomName,
          beds,
          sqm,
          maxGuests,
          monthlyMin,
          monthlyMax,
          JSON.stringify(apt.facilities || []),
        ]
      );
    }
    log(`  Room types inserted: ${apts.length}`);

    imported++;
    existingNames.add(name.toLowerCase());

  } catch (err) {
    log(`  ERROR inserting ${name}: ${err.message}`);
  }
}

await db.end();
log(`\n=== DONE: ${imported} imported, ${skipped} skipped ===`);
