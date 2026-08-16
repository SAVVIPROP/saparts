/**
 * update-enriched-properties.mjs
 * 
 * Updates existing DB property records with enriched data from the scraping pipeline.
 * - Matches enriched JSON files to DB records by slug
 * - Updates description, address, lat/lng, amenities, unitTypes, neighbourhood
 * - Sets heroImageUrl from first CDN image
 * - Inserts propertyImages rows for all CDN images
 * - Sets published=true, featured=true for HIGH confidence, published=true for MEDIUM
 * - Sets bestForTags, operatorGroup, minStayNights from enriched data
 * 
 * Run with: node scripts/update-enriched-properties.mjs [--dry-run]
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

// ─── Load CDN URL map ────────────────────────────────────────────────────────
function loadCdnMap() {
  if (!existsSync(CDN_PROGRESS_FILE)) {
    console.warn('No CDN progress file found, will use SilverDoor CDN URLs as fallback');
    return {};
  }
  const raw = JSON.parse(readFileSync(CDN_PROGRESS_FILE, 'utf8'));
  // Convert keys like "amsterdam/slug/filename.jpg" -> "/manus-storage/..."
  return raw;
}

// ─── Get CDN URL for a local image path ─────────────────────────────────────
function getCdnUrl(cdnMap, city, slug, filename) {
  const key = `${city}/${slug}/${filename}`;
  return cdnMap[key] || null;
}

// ─── Load all enriched JSON files ───────────────────────────────────────────
function loadEnrichedProperties() {
  const props = [];
  if (!existsSync(ENRICHED_DIR)) {
    console.error(`Enriched directory not found: ${ENRICHED_DIR}`);
    return props;
  }
  
  for (const cityDir of readdirSync(ENRICHED_DIR)) {
    const cityPath = join(ENRICHED_DIR, cityDir);
    if (!readdirSync(cityPath).length) continue;
    
    for (const file of readdirSync(cityPath)) {
      if (!file.endsWith('.json')) continue;
      try {
        const data = JSON.parse(readFileSync(join(cityPath, file), 'utf8'));
        props.push(data);
      } catch (e) {
        console.warn(`Failed to parse ${file}: ${e.message}`);
      }
    }
  }
  return props;
}

// ─── Map enriched data to DB fields ─────────────────────────────────────────
function mapToDbFields(enriched, cdnMap) {
  const city = (enriched.city || '').toLowerCase().replace(/\s+/g, '-');
  const slug = enriched.slug;
  
  // Build CDN image list
  const cdnImages = [];
  for (const img of (enriched.images || [])) {
    if (!img.local_filename) continue;
    const cdnPath = getCdnUrl(cdnMap, city, slug, img.local_filename);
    if (cdnPath) {
      cdnImages.push({
        url: cdnPath,
        alt: img.alt || enriched.name,
        caption: img.alt || null,
      });
    } else if (img.url) {
      // Fallback to SilverDoor CDN URL if local not uploaded yet
      cdnImages.push({
        url: img.url,
        alt: img.alt || enriched.name,
        caption: img.alt || null,
      });
    }
  }
  
  const heroImageUrl = cdnImages.length > 0 ? cdnImages[0].url : null;
  
  // Map amenities - clean up the array
  const amenities = (enriched.amenities || [])
    .filter(a => a && typeof a === 'string' && a.length < 100)
    .slice(0, 30);
  
  // Map unit types
  const unitTypes = (enriched.apartment_types || [])
    .filter(u => u && typeof u === 'string')
    .slice(0, 10);
  
  // Map tags
  const bestForTags = (enriched.tags || [])
    .filter(t => t && typeof t === 'string')
    .slice(0, 10);
  
  // Determine published/featured
  const published = true;
  const featured = enriched.tier === 'HIGH';
  
  // Rating
  const ratingScore = enriched.trustpilot_stars ? parseFloat(enriched.trustpilot_stars) : null;
  const ratingSource = enriched.trustpilot_stars ? 'Trustpilot' : null;
  
  return {
    dbFields: {
      description: enriched.description || null,
      address: enriched.address || null,
      latitude: enriched.latitude ? parseFloat(enriched.latitude) : null,
      longitude: enriched.longitude ? parseFloat(enriched.longitude) : null,
      heroImageUrl,
      amenities: amenities.length > 0 ? JSON.stringify(amenities) : null,
      unitTypes: unitTypes.length > 0 ? JSON.stringify(unitTypes) : null,
      bestForTags: bestForTags.length > 0 ? JSON.stringify(bestForTags) : null,
      operatorGroup: enriched.operator || null,
      neighborhood: enriched.neighbourhood || enriched.district || null,
      minStayNights: enriched.min_stay_nights ? parseInt(enriched.min_stay_nights) : null,
      ratingScore,
      ratingSource,
      bookingUrl: enriched.silverdoor_url || null,
      published,
      featured,
    },
    cdnImages,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE UPDATE'}`);
  
  const cdnMap = loadCdnMap();
  const cdnUploaded = Object.keys(cdnMap).length;
  console.log(`CDN map loaded: ${cdnUploaded} images mapped`);
  
  const enrichedProps = loadEnrichedProperties();
  console.log(`Enriched properties loaded: ${enrichedProps.length}`);
  
  // Connect to DB
  const conn = await createConnection(DB_URL);
  console.log('Connected to database');
  
  let matched = 0;
  let notFound = 0;
  let updated = 0;
  let imagesInserted = 0;
  const notFoundSlugs = [];
  
  for (const enriched of enrichedProps) {
    const slug = enriched.slug;
    if (!slug) continue;
    
    // Look up existing property by slug
    const [rows] = await conn.execute(
      'SELECT id, slug, name, published, heroImageUrl FROM properties WHERE slug = ? LIMIT 1',
      [slug]
    );
    
    if (!rows || rows.length === 0) {
      notFound++;
      notFoundSlugs.push(slug);
      continue;
    }
    
    matched++;
    const property = rows[0];
    const { dbFields, cdnImages } = mapToDbFields(enriched, cdnMap);
    
    if (!DRY_RUN) {
      // Build UPDATE query
      const updates = [];
      const values = [];
      
      if (dbFields.description) { updates.push('description = ?'); values.push(dbFields.description); }
      if (dbFields.address) { updates.push('address = ?'); values.push(dbFields.address); }
      if (dbFields.latitude !== null) { updates.push('latitude = ?'); values.push(dbFields.latitude); }
      if (dbFields.longitude !== null) { updates.push('longitude = ?'); values.push(dbFields.longitude); }
      if (dbFields.heroImageUrl) { updates.push('heroImageUrl = ?'); values.push(dbFields.heroImageUrl); }
      if (dbFields.amenities) { updates.push('amenities = ?'); values.push(dbFields.amenities); }
      if (dbFields.unitTypes) { updates.push('unitTypes = ?'); values.push(dbFields.unitTypes); }
      if (dbFields.bestForTags) { updates.push('bestForTags = ?'); values.push(dbFields.bestForTags); }
      if (dbFields.operatorGroup) { updates.push('operatorGroup = ?'); values.push(dbFields.operatorGroup); }
      if (dbFields.neighborhood) { updates.push('neighborhood = ?'); values.push(dbFields.neighborhood); }
      if (dbFields.minStayNights) { updates.push('minStayNights = ?'); values.push(dbFields.minStayNights); }
      if (dbFields.ratingScore) { updates.push('ratingScore = ?'); values.push(dbFields.ratingScore); }
      if (dbFields.ratingSource) { updates.push('ratingSource = ?'); values.push(dbFields.ratingSource); }
      if (dbFields.bookingUrl) { updates.push('bookingUrl = ?'); values.push(dbFields.bookingUrl); }
      
      // Always update published/featured
      updates.push('published = ?'); values.push(dbFields.published ? 1 : 0);
      updates.push('featured = ?'); values.push(dbFields.featured ? 1 : 0);
      
      if (updates.length > 0) {
        values.push(property.id);
        await conn.execute(
          `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
        updated++;
      }
      
      // Insert property images (delete existing first to avoid duplicates)
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
    } else {
      // Dry run - just log
      console.log(`  [DRY RUN] Would update: ${slug} (${enriched.tier}) - ${cdnImages.length} images`);
      updated++;
      imagesInserted += cdnImages.length;
    }
    
    if (matched % 10 === 0) {
      console.log(`  Progress: ${matched} matched, ${updated} updated, ${imagesInserted} images`);
    }
  }
  
  await conn.end();
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total enriched properties: ${enrichedProps.length}`);
  console.log(`Matched in DB: ${matched}`);
  console.log(`Not found in DB: ${notFound}`);
  console.log(`Updated: ${updated}`);
  console.log(`Images inserted: ${imagesInserted}`);
  
  if (notFoundSlugs.length > 0) {
    console.log('\nNot found slugs (first 20):');
    notFoundSlugs.slice(0, 20).forEach(s => console.log(`  - ${s}`));
  }
}

main().catch(console.error);
