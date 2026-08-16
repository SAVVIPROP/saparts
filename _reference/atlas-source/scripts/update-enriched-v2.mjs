/**
 * update-enriched-v2.mjs
 * 
 * Improved version: Uses SilverDoor API cache for amenities/facilities data
 * and generates proper descriptions from apartment types + facilities.
 * 
 * Run with: node scripts/update-enriched-v2.mjs [--dry-run]
 */

import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync, existsSync } from 'fs';
import * as path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const DRY_RUN = process.argv.includes('--dry-run');
const ENRICHED_DIR = '/home/ubuntu/saparts-enriched/enriched-properties';
const CDN_PROGRESS_FILE = '/home/ubuntu/saparts-enriched/upload-progress.json';
const SD_CACHE_FILE = '/home/ubuntu/saparts-scraper/all-properties-cache.json';

// ─── Facility key to human-readable amenity name ─────────────────────────────
const FACILITY_MAP = {
  onSiteFitnessCentre: 'Gym',
  swimmingPool: 'Pool',
  laundryService: 'Laundry',
  conciergeService: 'Concierge',
  businessCentre: 'Business Centre',
  meetingRoom: 'Meeting Room',
  onSiteRestaurant: 'Restaurant',
  onSiteBar: 'Bar',
  maidService: 'Housekeeping',
  parking: 'Parking',
  complementaryBreakfast: 'Breakfast Included',
  spaTreatments: 'Spa',
  gardensRoofDeck: 'Rooftop Garden',
  lift: 'Elevator',
  onsiteSecurity: '24hr Security',
  electronicKeyCards: 'Keycard Access',
  welcomePack: 'Welcome Pack',
  petPolicy: 'Pet Friendly',
};

// ─── Bedroom count type to readable name ─────────────────────────────────────
const APT_TYPE_MAP = {
  studioApartment: 'Studio',
  '1BedroomApartment': '1 Bedroom',
  '2BedroomApartment': '2 Bedroom',
  '3BedroomApartment': '3 Bedroom',
  '4BedroomApartment': '4 Bedroom',
  penthouseApartment: 'Penthouse',
};

// ─── Load SilverDoor API cache ────────────────────────────────────────────────
function loadSdCache() {
  if (!existsSync(SD_CACHE_FILE)) {
    console.warn('SilverDoor cache not found');
    return {};
  }
  console.log('Loading SilverDoor cache...');
  const data = JSON.parse(readFileSync(SD_CACHE_FILE, 'utf8'));
  const byId = {};
  for (const p of data) {
    byId[p.id] = p;
  }
  console.log(`SilverDoor cache loaded: ${Object.keys(byId).length} properties`);
  return byId;
}

// ─── Load CDN URL map ────────────────────────────────────────────────────────
function loadCdnMap() {
  if (!existsSync(CDN_PROGRESS_FILE)) {
    return {};
  }
  return JSON.parse(readFileSync(CDN_PROGRESS_FILE, 'utf8'));
}

// ─── Get CDN URL for a local image ───────────────────────────────────────────
function getCdnUrl(cdnMap, city, slug, filename) {
  const key = `${city}/${slug}/${filename}`;
  return cdnMap[key] || null;
}

// ─── Build description from SD API data ──────────────────────────────────────
function buildDescription(sdData, enriched) {
  if (!sdData) return null;
  
  const parts = [];
  const name = enriched.sd_name || enriched.name;
  const city = enriched.city;
  const district = enriched.district || enriched.neighbourhood;
  
  // Opening sentence
  if (district) {
    parts.push(`${name} is a premium serviced apartment property located in ${district}, ${city}.`);
  } else {
    parts.push(`${name} is a premium serviced apartment property in ${city}.`);
  }
  
  // Apartment types
  const apts = sdData.apartments || [];
  const aptTypes = [...new Set(apts.map(a => APT_TYPE_MAP[a.bedroomCountType] || a.bedroomCountType).filter(Boolean))];
  if (aptTypes.length > 0) {
    parts.push(`The property offers ${aptTypes.join(', ')} apartments.`);
  }
  
  // Key amenities
  const fac = sdData.facilities || {};
  const amenities = [];
  for (const [key, label] of Object.entries(FACILITY_MAP)) {
    const val = fac[key];
    if (val && (val === 'yes' || (Array.isArray(val) && val.includes('yes')))) {
      amenities.push(label);
    }
  }
  if (amenities.length > 0) {
    parts.push(`Facilities include ${amenities.slice(0, 5).join(', ')}.`);
  }
  
  // Rosette rating
  if (sdData.rosette) {
    const rosettes = ['', 'One', 'Two', 'Three', 'Four', 'Five'];
    const r = rosettes[sdData.rosette] || sdData.rosette;
    parts.push(`Rated ${r} Rosette by SilverDoor.`);
  }
  
  // Min stay / sustainability
  if (enriched.min_stay_nights && enriched.min_stay_nights > 1) {
    parts.push(`Minimum stay: ${enriched.min_stay_nights} nights.`);
  }
  
  return parts.join(' ');
}

// ─── Extract amenities from SD API data ──────────────────────────────────────
function extractAmenities(sdData, enrichedAmenities) {
  const amenities = new Set();
  
  // From SD API facilities
  if (sdData) {
    const fac = sdData.facilities || {};
    for (const [key, label] of Object.entries(FACILITY_MAP)) {
      const val = fac[key];
      if (val && (val === 'yes' || (Array.isArray(val) && val.includes('yes')))) {
        amenities.add(label);
      }
    }
    // Check parking
    const parking = fac.parking;
    if (parking && Array.isArray(parking) && !parking.includes('none')) {
      amenities.add('Parking');
    }
    // Check reception hours
    const reception = fac.receptionServiceHours;
    if (reception && Array.isArray(reception) && reception.includes('24Hours')) {
      amenities.add('24hr Reception');
    }
  }
  
  // From enriched data (tags)
  if (enrichedAmenities && enrichedAmenities.length > 0) {
    for (const a of enrichedAmenities) {
      if (a && typeof a === 'string' && a.length < 50) {
        amenities.add(a);
      }
    }
  }
  
  return [...amenities].slice(0, 25);
}

// ─── Extract unit types from SD API data ─────────────────────────────────────
function extractUnitTypes(sdData, enrichedTypes) {
  const types = new Set();
  
  if (sdData) {
    const apts = sdData.apartments || [];
    for (const apt of apts) {
      const t = APT_TYPE_MAP[apt.bedroomCountType] || APT_TYPE_MAP[apt.type];
      if (t) types.add(t);
    }
  }
  
  if (enrichedTypes && enrichedTypes.length > 0) {
    for (const t of enrichedTypes) {
      if (t && typeof t === 'string') types.add(t);
    }
  }
  
  return [...types].slice(0, 10);
}

// ─── Load all enriched JSON files ───────────────────────────────────────────
function loadEnrichedProperties() {
  const props = [];
  if (!existsSync(ENRICHED_DIR)) return props;
  
  for (const cityDir of readdirSync(ENRICHED_DIR)) {
    const cityPath = join(ENRICHED_DIR, cityDir);
    try {
      for (const file of readdirSync(cityPath)) {
        if (!file.endsWith('.json')) continue;
        try {
          const data = JSON.parse(readFileSync(join(cityPath, file), 'utf8'));
          props.push(data);
        } catch (e) {
          console.warn(`Failed to parse ${file}: ${e.message}`);
        }
      }
    } catch (e) {}
  }
  return props;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE UPDATE'}`);
  
  const cdnMap = loadCdnMap();
  const sdCache = loadSdCache();
  const enrichedProps = loadEnrichedProperties();
  console.log(`Enriched properties loaded: ${enrichedProps.length}`);
  console.log(`CDN map: ${Object.keys(cdnMap).length} images`);
  
  const conn = await createConnection(DB_URL);
  console.log('Connected to database');
  
  let matched = 0, notFound = 0, updated = 0, imagesInserted = 0;
  const notFoundSlugs = [];
  
  for (const enriched of enrichedProps) {
    const slug = enriched.slug;
    if (!slug) continue;
    
    // Extract silverdoor_id from slug (last numeric segment)
    const sdIdMatch = slug.match(/-(\d+)$/);
    const sdId = sdIdMatch ? parseInt(sdIdMatch[1]) : null;
    
    // Look up in SD cache
    const sdData = sdId ? sdCache[sdId] : null;
    
    // Look up existing property by slug
    const [rows] = await conn.execute(
      'SELECT id, slug, name, published FROM properties WHERE slug = ? LIMIT 1',
      [slug]
    );
    
    if (!rows || rows.length === 0) {
      notFound++;
      notFoundSlugs.push(slug);
      continue;
    }
    
    matched++;
    const property = rows[0];
    
    // Build CDN image list
    const city = (enriched.city || '').toLowerCase().replace(/\s+/g, '-');
    const cdnImages = [];
    for (const img of (enriched.images || [])) {
      if (!img.local_filename) continue;
      const cdnPath = getCdnUrl(cdnMap, city, slug, img.local_filename);
      if (cdnPath) {
        cdnImages.push({ url: cdnPath, alt: img.alt || enriched.name, caption: img.alt || null });
      } else if (img.url) {
        // Fallback to SilverDoor CDN URL
        cdnImages.push({ url: img.url, alt: img.alt || enriched.name, caption: img.alt || null });
      }
    }
    
    const heroImageUrl = cdnImages.length > 0 ? cdnImages[0].url : null;
    
    // Build enriched fields
    const description = buildDescription(sdData, enriched);
    const amenities = extractAmenities(sdData, enriched.amenities);
    const unitTypes = extractUnitTypes(sdData, enriched.apartment_types);
    const bestForTags = (enriched.tags || []).slice(0, 10);
    
    // Coordinates from enriched JSON (more reliable than SD cache)
    const latitude = enriched.latitude ? parseFloat(enriched.latitude) : 
                     (sdData?.location?.lat ? parseFloat(sdData.location.lat) : null);
    const longitude = enriched.longitude ? parseFloat(enriched.longitude) : 
                      (sdData?.location?.lon ? parseFloat(sdData.location.lon) : null);
    
    // Rating
    const ratingScore = enriched.trustpilot_stars ? parseFloat(enriched.trustpilot_stars) : null;
    const ratingSource = enriched.trustpilot_stars ? 'Trustpilot' : null;
    
    if (DRY_RUN) {
      console.log(`  [DRY RUN] ${slug} (${enriched.tier}) - desc:${description?.length||0}ch, ${amenities.length} amenities, ${cdnImages.length} images`);
      updated++;
      imagesInserted += cdnImages.length;
      continue;
    }
    
    // Build UPDATE
    const updates = [];
    const values = [];
    
    if (description) { updates.push('description = ?'); values.push(description); }
    if (enriched.address) { updates.push('address = ?'); values.push(enriched.address.replace(/\\"/g, '"').replace(/\\/g, '')); }
    if (latitude !== null) { updates.push('latitude = ?'); values.push(latitude); }
    if (longitude !== null) { updates.push('longitude = ?'); values.push(longitude); }
    if (heroImageUrl) { updates.push('heroImageUrl = ?'); values.push(heroImageUrl); }
    if (amenities.length > 0) { updates.push('amenities = ?'); values.push(JSON.stringify(amenities)); }
    if (unitTypes.length > 0) { updates.push('unitTypes = ?'); values.push(JSON.stringify(unitTypes)); }
    if (bestForTags.length > 0) { updates.push('bestForTags = ?'); values.push(JSON.stringify(bestForTags)); }
    if (enriched.operator) { updates.push('operatorGroup = ?'); values.push(enriched.operator); }
    if (enriched.district) { 
      updates.push('neighborhood = ?'); 
      values.push(enriched.district); 
    } else if (enriched.neighbourhood && enriched.neighbourhood.length > 5 && !['UAE', 'United', 'Germany', 'France', 'Japan', 'China', 'Singapore', 'Australia', 'Switzerland'].includes(enriched.neighbourhood)) { 
      updates.push('neighborhood = ?'); 
      values.push(enriched.neighbourhood); 
    }
    if (enriched.min_stay_nights) { updates.push('minStayNights = ?'); values.push(parseInt(enriched.min_stay_nights)); }
    if (ratingScore) { updates.push('ratingScore = ?'); values.push(ratingScore); }
    if (ratingSource) { updates.push('ratingSource = ?'); values.push(ratingSource); }
    if (enriched.silverdoor_url) { updates.push('bookingUrl = ?'); values.push(enriched.silverdoor_url); }
    
    // Always set published/featured
    updates.push('published = ?'); values.push(1);
    updates.push('featured = ?'); values.push(enriched.tier === 'HIGH' ? 1 : 0);
    
    if (updates.length > 0) {
      values.push(property.id);
      await conn.execute(`UPDATE properties SET ${updates.join(', ')} WHERE id = ?`, values);
      updated++;
    }
    
    // Insert property images
    if (cdnImages.length > 0) {
      await conn.execute('DELETE FROM propertyImages WHERE propertyId = ?', [property.id]);
      for (let i = 0; i < cdnImages.length; i++) {
        const img = cdnImages[i];
        await conn.execute(
          'INSERT INTO propertyImages (propertyId, url, caption, alt, sortOrder) VALUES (?, ?, ?, ?, ?)',
          [property.id, img.url, img.caption, img.alt, i]
        );
        imagesInserted++;
      }
    }
    
    if (matched % 10 === 0) {
      console.log(`  Progress: ${matched} matched, ${updated} updated, ${imagesInserted} images`);
    }
  }
  
  await conn.end();
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total enriched: ${enrichedProps.length}`);
  console.log(`Matched in DB: ${matched}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Updated: ${updated}`);
  console.log(`Images inserted: ${imagesInserted}`);
  if (notFoundSlugs.length > 0) {
    console.log('\nNot found slugs:');
    notFoundSlugs.forEach(s => console.log(`  - ${s}`));
  }
}

main().catch(console.error);
