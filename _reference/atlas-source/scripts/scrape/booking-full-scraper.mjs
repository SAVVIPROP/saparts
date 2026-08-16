/**
 * Booking.com Full Scraper — SAparts
 * ===================================
 * Uses Bright Data Web Unlocker to scrape top 25 serviced apartments per city.
 * Captures ALL available data from each property page:
 *   - Property: name, address, description, score, review count, coordinates, amenities, images
 *   - Room types: name, beds, price/30nights, facilities, description
 * 
 * All data is stored in DB immediately — safe across hibernation.
 * Images are downloaded and uploaded to CDN (no hotlinking).
 * 
 * Usage:
 *   node scripts/scrape/booking-full-scraper.mjs              # all 30 cities
 *   node scripts/scrape/booking-full-scraper.mjs --city London # one city
 *   node scripts/scrape/booking-full-scraper.mjs --resume      # skip already-done
 */

import * as fs from 'fs';
import * as path from 'path';
import { createConnection } from 'mysql2/promise';
import { execSync } from 'child_process';

const API_KEY = process.env.BRIGHTDATA_API_KEY;
const DB_URL = process.env.DATABASE_URL;

if (!API_KEY) { console.error('BRIGHTDATA_API_KEY not set'); process.exit(1); }
if (!DB_URL)  { console.error('DATABASE_URL not set'); process.exit(1); }

// ─── City list ────────────────────────────────────────────────────────────────
const CITIES = [
  { name: 'London',        country: 'United Kingdom',       cc: 'gb' },
  { name: 'Paris',         country: 'France',               cc: 'fr' },
  { name: 'Amsterdam',     country: 'Netherlands',          cc: 'nl' },
  { name: 'Berlin',        country: 'Germany',              cc: 'de' },
  { name: 'Munich',        country: 'Germany',              cc: 'de' },
  { name: 'Frankfurt',     country: 'Germany',              cc: 'de' },
  { name: 'Zurich',        country: 'Switzerland',          cc: 'ch' },
  { name: 'Dublin',        country: 'Ireland',              cc: 'ie' },
  { name: 'Madrid',        country: 'Spain',                cc: 'es' },
  { name: 'Lisbon',        country: 'Portugal',             cc: 'pt' },
  { name: 'Copenhagen',    country: 'Denmark',              cc: 'dk' },
  { name: 'Edinburgh',     country: 'United Kingdom',       cc: 'gb' },
  { name: 'Manchester',    country: 'United Kingdom',       cc: 'gb' },
  { name: 'Cambridge',     country: 'United Kingdom',       cc: 'gb' },
  { name: 'Liverpool',     country: 'United Kingdom',       cc: 'gb' },
  { name: 'Jersey',        country: 'United Kingdom',       cc: 'gb' },
  { name: 'The Hague',     country: 'Netherlands',          cc: 'nl' },
  { name: 'New York',      country: 'United States',        cc: 'us' },
  { name: 'Los Angeles',   country: 'United States',        cc: 'us' },
  { name: 'San Francisco', country: 'United States',        cc: 'us' },
  { name: 'Toronto',       country: 'Canada',               cc: 'ca' },
  { name: 'Dubai',         country: 'United Arab Emirates', cc: 'ae' },
  { name: 'Abu Dhabi',     country: 'United Arab Emirates', cc: 'ae' },
  { name: 'Singapore',     country: 'Singapore',            cc: 'sg' },
  { name: 'Hong Kong',     country: 'Hong Kong SAR',        cc: 'hk' },
  { name: 'Tokyo',         country: 'Japan',                cc: 'jp' },
  { name: 'Sydney',        country: 'Australia',            cc: 'au' },
  { name: 'Seoul',         country: 'South Korea',          cc: 'kr' },
  { name: 'Shanghai',      country: 'China',                cc: 'cn' },
  { name: 'Mumbai',        country: 'India',                cc: 'in' },
];

// ─── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const cityFilter  = args[args.indexOf('--city') + 1] || null;
const resumeMode  = args.includes('--resume');
const citiesToRun = cityFilter
  ? CITIES.filter(c => c.name.toLowerCase() === cityFilter.toLowerCase())
  : CITIES;

// ─── Bright Data fetch ────────────────────────────────────────────────────────
async function fetchBD(url, country = 'gb', retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.brightdata.com/request', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: 'web_unlocker1', url, format: 'raw', country }),
        signal: AbortSignal.timeout(90000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return await res.text();
    } catch (err) {
      console.warn(`  [BD] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(6000 * attempt);
    }
  }
}

// ─── Search page parser ───────────────────────────────────────────────────────
function parseSearchPage(html, city) {
  // Extract unique property URLs (deduplicated)
  const urlMatches = [...html.matchAll(/href="(https:\/\/www\.booking\.com\/hotel\/[a-z]{2}\/[^"?#]+\.html)/g)];
  const uniqueUrls = [...new Set(urlMatches.map(m => m[1].split('?')[0]))].slice(0, 25);

  return uniqueUrls.map(url => {
    const slugMatch = url.match(/\/hotel\/[a-z]{2}\/([^.]+)\.html/);
    const bookingId = slugMatch?.[1] || url.split('/').pop().replace('.html', '');
    return {
      booking_com_id: bookingId,
      booking_com_url: url,
      city_name: city.name,
      country: city.country,
      name: bookingId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    };
  });
}

// ─── Property detail parser ───────────────────────────────────────────────────
function parsePropertyDetail(html, fallback) {
  // ── Property-level fields ──────────────────────────────────────────────────

  // Name (multiple fallback patterns)
  const name =
    html.match(/id="hp_hotel_name"[^>]*>[\s\S]{0,300}?<span[^>]*>([^<]+)/)?.[1]?.trim() ||
    html.match(/class="[^"]*pp-header__title[^"]*"[^>]*>([^<]+)/)?.[1]?.trim() ||
    html.match(/<h2[^>]*itemprop="name"[^>]*>([^<]+)/)?.[1]?.trim() ||
    fallback.name;

  // Review score
  const reviewScore = parseFloat(
    html.match(/class="[^"]*review-score-badge[^"]*"[^>]*>([\d.]+)/)?.[1] ||
    html.match(/aria-label="Scored\s+([\d.]+)/)?.[1] ||
    html.match(/"reviewScore":([\d.]+)/)?.[1] || '0'
  ) || null;

  // Review count
  const reviewCountMatch = html.match(/([\d,]+)\s+reviews?/i) || html.match(/"reviewCount":(\d+)/);
  const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[1].replace(/,/g, '')) : null;

  // Address
  const address =
    html.match(/data-testid="property-address"[^>]*>([^<]+)/)?.[1]?.trim() ||
    html.match(/class="[^"]*hp_address_subtitle[^"]*"[^>]*>([^<]+)/)?.[1]?.trim() ||
    html.match(/itemprop="streetAddress"[^>]*>([^<]+)/)?.[1]?.trim() || null;

  // Description (first substantial paragraph)
  const descMatch =
    html.match(/id="property_description_content"[^>]*>([\s\S]{100,3000}?)<\/div>/) ||
    html.match(/class="[^"]*hp_desc_main_content[^"]*"[^>]*>([\s\S]{100,3000}?)<\/div>/);
  const description = descMatch
    ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500)
    : null;

  // Coordinates
  const latitude  = parseFloat(html.match(/"latitude":([-\d.]+)/)?.[1] || html.match(/data-lat="([-\d.]+)"/)?.[1] || '0') || null;
  const longitude = parseFloat(html.match(/"longitude":([-\d.]+)/)?.[1] || html.match(/data-lng="([-\d.]+)"/)?.[1] || '0') || null;

  // Star rating
  const starRating = parseInt(html.match(/aria-label="(\d+) stars?"/i)?.[1] || html.match(/"starRating":(\d+)/)?.[1] || '0') || null;

  // Property type
  const propertyType =
    html.match(/data-testid="property-type"[^>]*>([^<]+)/)?.[1]?.trim() ||
    html.match(/class="[^"]*hp_hotel_type[^"]*"[^>]*>([^<]+)/)?.[1]?.trim() ||
    'Serviced Apartment';

  // Top-level amenities (from the main facilities section)
  const facilityKeywords = [
    'WiFi', 'Kitchen', 'Parking', 'Air conditioning', 'Washing machine',
    'Dishwasher', 'Gym', 'Pool', 'Concierge', 'Balcony', 'Terrace',
    'Elevator', 'Pet friendly', 'Spa', 'Sauna', 'Rooftop', '24-hour front desk',
    'Airport shuttle', 'Bicycle rental', 'Bar', 'Restaurant',
  ];
  const amenities = facilityKeywords.filter(a => new RegExp(a, 'i').test(html));

  // Property images (max1024x768, deduplicated by image ID)
  const allImgMatches = [...html.matchAll(/https:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/max(?:1024x768|500)\/(\d+)\.[a-z]+\?[^"'\s]*/g)];
  const seenPropImgIds = new Set();
  const rawImages = [];
  for (const m of allImgMatches) {
    if (!seenPropImgIds.has(m[1]) && rawImages.length < 12) {
      seenPropImgIds.add(m[1]);
      rawImages.push(m[0].replace(/\/max500\//, '/max1024x768/'));
    }
  }

  // ── Room types ─────────────────────────────────────────────────────────────
  const roomTypes = parseRoomTypes(html);

  return {
    name,
    address,
    description,
    review_score: reviewScore,
    review_count: reviewCount,
    latitude,
    longitude,
    star_rating: starRating,
    property_type: propertyType,
    amenities,
    raw_images: rawImages,
    room_types: roomTypes,
  };
}

// ─── Room type parser ─────────────────────────────────────────────────────────
function parseRoomTypes(html) {
  // Find the hprt-table tbody
  const tableStart = html.indexOf('id="hprt-table"');
  if (tableStart === -1) return [];

  const tbodyStart = html.indexOf('<tbody>', tableStart);
  const tbodyEnd   = html.indexOf('</tbody>', tbodyStart);
  if (tbodyStart === -1 || tbodyEnd === -1) return [];

  const tbody = html.slice(tbodyStart, tbodyEnd);
  const parts = tbody.split('<tr ');

  const rooms = [];
  const seenRoomIds = new Set();

  for (const part of parts.slice(1)) {
    if (!part.includes('hprt-table-cell-roomtype')) continue;

    const roomIdMatch = part.match(/data-room-id="(\d+)"/);
    const roomId = roomIdMatch?.[1];
    if (!roomId || seenRoomIds.has(roomId)) continue;
    seenRoomIds.add(roomId);

    // Price for 30 nights
    const priceMatch = part.match(/data-hotel-rounded-price="(\d+)"/);
    const price30nights = priceMatch ? parseInt(priceMatch[1]) : null;

    // Room name
    const nameMatch = part.match(/hprt-roomtype-icon-link[^>]*>\s*([\s\S]{0,300}?)\s*<\/span>/);
    const name = nameMatch?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!name) continue;

    // Bed configuration
    const bedMatches = [...part.matchAll(/<li[^>]*bedroom_bed_type[^>]*>[\s\S]{0,300}?<span>([\s\S]{0,100}?)<\/span>/g)];
    const beds = bedMatches.map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean);

    // Short description
    const descMatch = part.match(/class="[^"]*short-room-desc[^"]*"[^>]*>([\s\S]{0,800}?)<\/p>/);
    const description = descMatch?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || null;

    // Size in m² (from description or room text)
    const sizeMatch = (description || part).match(/(\d+)\s*m\u00b2/);
    const sizeSqm = sizeMatch ? parseInt(sizeMatch[1]) : null;

    // Max guests
    const guestMatch = part.match(/aria-label="(\d+)\s*(?:guests?|adults?)/i) ||
                       part.match(/(\d+)\s*(?:guests?|adults?)/i);
    const maxGuests = guestMatch ? parseInt(guestMatch[1]) : null;

    // Facilities
    const facilityMatches = [...part.matchAll(/data-name-en="([^"]+)"/g)];
    const facilities = [...new Set(facilityMatches.map(m => m[1]))];

    // Room images (lazy-loaded thumbnails from lightbox)
    const imgMatches = [...part.matchAll(/https:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/max\d+\/(\d+)\.[a-z]+\?[^"'\s]*/g)];
    const seenImgIds = new Set();
    const rawImages = [];
    for (const m of imgMatches) {
      if (!seenImgIds.has(m[1])) {
        seenImgIds.add(m[1]);
        rawImages.push(m[0].replace(/\/max\d+\//, '/max1024x768/'));
      }
    }

    rooms.push({
      booking_room_id: roomId,
      name,
      description,
      beds,
      size_sqm: sizeSqm,
      max_guests: maxGuests,
      price_30nights_usd: price30nights,
      price_per_night_usd: price30nights ? Math.round(price30nights / 30 * 100) / 100 : null,
      facilities,
      raw_images: rawImages,
    });
  }

  return rooms;
}

// ─── Image downloader & CDN uploader ─────────────────────────────────────────
async function downloadAndUploadImages(rawImages, label, maxImages = 8) {
  const cdnUrls = [];
  const tmpDir = `/tmp/saparts-imgs/${label.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  for (let i = 0; i < Math.min(rawImages.length, maxImages); i++) {
    const imgUrl = rawImages[i];
    const ext = imgUrl.includes('.jpg') || imgUrl.includes('jpg') ? 'jpg' : 'webp';
    const tmpFile = path.join(tmpDir, `img-${i + 1}.${ext}`);

    try {
      const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(30000) });
      if (!imgRes.ok) { console.warn(`    [img] ${i+1} HTTP ${imgRes.status}`); continue; }
      fs.writeFileSync(tmpFile, Buffer.from(await imgRes.arrayBuffer()));

      const uploadOut = execSync(`manus-upload-file --webdev "${tmpFile}"`, { encoding: 'utf8', timeout: 60000 }).trim();
      const cdnUrl = uploadOut.split('\n').find(l => l.startsWith('http'))?.trim();
      if (cdnUrl) { cdnUrls.push(cdnUrl); process.stdout.write('.'); }
    } catch (err) {
      console.warn(`    [img] ${i+1} error: ${err.message.slice(0, 80)}`);
    }
  }

  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  return cdnUrls;
}

// ─── DB helpers ───────────────────────────────────────────────────────────────
async function upsertProperty(conn, prop) {
  const [result] = await conn.execute(`
    INSERT INTO scraped_properties
      (booking_com_id, booking_com_url, city_name, country, name, address, description,
       review_score, review_count, price_per_night_usd, price_per_month_usd, property_type,
       amenities, latitude, longitude, star_rating, images, raw_images, scrape_status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      name=VALUES(name), address=VALUES(address), description=VALUES(description),
      review_score=VALUES(review_score), review_count=VALUES(review_count),
      price_per_night_usd=VALUES(price_per_night_usd), price_per_month_usd=VALUES(price_per_month_usd),
      property_type=VALUES(property_type), amenities=VALUES(amenities),
      latitude=VALUES(latitude), longitude=VALUES(longitude), star_rating=VALUES(star_rating),
      images=VALUES(images), raw_images=VALUES(raw_images), scrape_status=VALUES(scrape_status),
      scraped_at=CURRENT_TIMESTAMP
  `, [
    prop.booking_com_id, prop.booking_com_url, prop.city_name, prop.country,
    prop.name, prop.address || null, prop.description || null,
    prop.review_score || null, prop.review_count || null,
    prop.price_per_night_usd || null, prop.price_per_month_usd || null,
    prop.property_type || 'Serviced Apartment',
    JSON.stringify(prop.amenities || []),
    prop.latitude || null, prop.longitude || null, prop.star_rating || null,
    JSON.stringify(prop.images || []), JSON.stringify(prop.raw_images || []),
    prop.scrape_status || 'scraped',
  ]);

  // Get the inserted/updated ID
  const [rows] = await conn.execute('SELECT id FROM scraped_properties WHERE booking_com_id = ?', [prop.booking_com_id]);
  return rows[0]?.id;
}

async function upsertRoomTypes(conn, propertyDbId, roomTypes) {
  if (!roomTypes?.length) return;
  // Delete existing room types for this property then re-insert
  await conn.execute('DELETE FROM room_types WHERE scraped_property_id = ?', [propertyDbId]);
  for (const room of roomTypes) {
    await conn.execute(`
      INSERT INTO room_types
        (scraped_property_id, booking_room_id, name, description, beds, size_sqm, max_guests,
         price_30nights_usd, price_per_night_usd, facilities, raw_images, cdn_images)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      propertyDbId, room.booking_room_id, room.name, room.description || null,
      JSON.stringify(room.beds || []), room.size_sqm || null, room.max_guests || null,
      room.price_30nights_usd || null, room.price_per_night_usd || null,
      JSON.stringify(room.facilities || []),
      JSON.stringify(room.raw_images || []),
      JSON.stringify(room.cdn_images || []),
    ]);
  }
}

async function isAlreadyDone(conn, bookingId) {
  const [rows] = await conn.execute(
    'SELECT id, scrape_status FROM scraped_properties WHERE booking_com_id = ?',
    [bookingId]
  );
  return rows[0] || null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

const RAW_DIR = '/home/ubuntu/saparts/data/raw-scrapes';
fs.mkdirSync(RAW_DIR, { recursive: true });

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(70));
  console.log('SAparts — Booking.com Full Scraper (with room types)');
  console.log(`Cities: ${citiesToRun.length} | Resume: ${resumeMode}`);
  console.log('='.repeat(70));

  const conn = await createConnection(DB_URL);
  let totalProperties = 0;
  let totalRooms = 0;

  for (const city of citiesToRun) {
    console.log(`\n\n📍 ${city.name}, ${city.country}`);
    console.log('─'.repeat(50));

    // Build search URL — filter aparthotels (201) + apartments (220), score ≥ 8.5, sort by score
    const searchUrl = [
      'https://www.booking.com/searchresults.html',
      `?ss=${encodeURIComponent(city.name + ', ' + city.country)}`,
      '&nflt=ht_id%3D201%3Bht_id%3D220%3Breview_score%3D85',
      '&order=bayesian_review_score',
      '&checkin=2026-06-15&checkout=2026-07-15',
      '&group_adults=1&no_rooms=1&group_children=0',
      '&lang=en-gb&selected_currency=USD',
    ].join('');

    let searchHtml;
    try {
      console.log('  Fetching search page...');
      searchHtml = await fetchBD(searchUrl, city.cc);
      fs.writeFileSync(`${RAW_DIR}/${city.name.replace(/\s+/g,'-').toLowerCase()}-search.html`, searchHtml);
      console.log(`  ✅ Search page: ${(searchHtml.length/1024).toFixed(0)}KB`);
    } catch (err) {
      console.error(`  ❌ Search failed: ${err.message}`);
      continue;
    }

    const properties = parseSearchPage(searchHtml, city);
    console.log(`  Found ${properties.length} property URLs`);
    if (!properties.length) { console.warn('  ⚠️  No properties — skipping city'); continue; }

    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      console.log(`\n  [${i+1}/${properties.length}] ${prop.name}`);

      // Resume mode: skip if already fully done
      if (resumeMode) {
        const existing = await isAlreadyDone(conn, prop.booking_com_id);
        if (existing?.scrape_status === 'images_downloaded') {
          console.log('    ⏭️  Already complete — skipping');
          continue;
        }
      }

      // Polite delay
      await sleep(3000 + Math.random() * 2000);

      // Fetch property detail page
      let detailHtml;
      try {
        const detailUrl = `${prop.booking_com_url}?checkin=2026-06-15&checkout=2026-07-15&group_adults=1&no_rooms=1&group_children=0&selected_currency=USD&lang=en-gb`;
        detailHtml = await fetchBD(detailUrl, city.cc);
        fs.writeFileSync(`${RAW_DIR}/${prop.booking_com_id}.html`, detailHtml);
        console.log(`    Detail: ${(detailHtml.length/1024).toFixed(0)}KB`);
      } catch (err) {
        console.error(`    ❌ Detail failed: ${err.message}`);
        await upsertProperty(conn, { ...prop, scrape_status: 'pending' });
        continue;
      }

      // Parse all data
      const details = parsePropertyDetail(detailHtml, prop);
      console.log(`    Name: ${details.name}`);
      console.log(`    Score: ${details.review_score} | Reviews: ${details.review_count}`);
      console.log(`    Address: ${details.address || 'n/a'}`);
      console.log(`    Room types: ${details.room_types.length}`);
      details.room_types.forEach(r => {
        console.log(`      • ${r.name} — $${r.price_30nights_usd || '?'}/30nights | ${r.beds.join(', ')}`);
      });
      console.log(`    Property images: ${details.raw_images.length}`);

      // Download property images
      let cdnImages = [];
      if (details.raw_images.length > 0) {
        process.stdout.write('    Uploading images: ');
        cdnImages = await downloadAndUploadImages(details.raw_images, details.name || prop.name, 8);
        console.log(` ${cdnImages.length} done`);
      }

      // Save property to DB
      const fullProp = {
        ...prop,
        ...details,
        images: cdnImages,
        price_per_night_usd: details.room_types[0]?.price_per_night_usd || null,
        price_per_month_usd: details.room_types[0]?.price_30nights_usd || null,
        scrape_status: cdnImages.length > 0 ? 'images_downloaded' : 'scraped',
      };
      const propertyDbId = await upsertProperty(conn, fullProp);

      // Save room types to DB
      if (propertyDbId && details.room_types.length > 0) {
        await upsertRoomTypes(conn, propertyDbId, details.room_types);
        totalRooms += details.room_types.length;
        console.log(`    ✅ Saved: ${details.room_types.length} room types`);
      }

      totalProperties++;
      console.log(`    ✅ Property saved (total: ${totalProperties})`);
    }

    console.log(`\n  ✅ ${city.name} complete`);
    await sleep(5000);
  }

  await conn.end();

  console.log('\n' + '='.repeat(70));
  console.log(`✅ DONE — ${totalProperties} properties, ${totalRooms} room types saved`);
  console.log('='.repeat(70));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
