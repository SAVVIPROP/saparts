/**
 * SilverDoor Property Import Script (Optimized)
 * 
 * Uses batch inserts and connection pooling for fast import.
 * 
 * Usage: node scripts/scrape/silverdoor-import.mjs [--dry-run] [--city london]
 */

import mysql from 'mysql2/promise';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');
const CITY_FILTER = process.argv.includes('--city') 
  ? process.argv[process.argv.indexOf('--city') + 1] 
  : null;

const DOWNLOADS_DIR = '/home/ubuntu/Downloads';
const BATCH_SIZE = 50; // Insert properties in batches

// Map SilverDoor city names → DB city slugs
const CITY_MAP = {
  'London': 'london',
  'Paris': 'paris',
  'Amsterdam': 'amsterdam',
  'Berlin': 'berlin',
  'Munich': 'munich',
  'Frankfurt': 'frankfurt',
  'Zurich': 'zurich',
  'Dublin': 'dublin',
  'Edinburgh': 'edinburgh',
  'Madrid': 'madrid',
  'Barcelona': null,
  'Brussels': null,
  'Vienna': null,
  'Milan': null,
  'Rome': null,
  'Stockholm': null,
  'Copenhagen': 'copenhagen',
  'Helsinki': null,
  'Warsaw': null,
  'Prague': null,
  'Budapest': null,
  'Lisbon': 'lisbon',
  'Geneva': null,
  'Singapore': 'singapore',
  'Dubai': 'dubai',
  'Hong Kong': 'hong-kong',
  'Tokyo': 'tokyo',
  'New York': 'new-york',
  'Sydney': 'sydney',
  'Oslo': null,
};

const GBP_TO_USD = 1.27;

function gbpToUsd(gbp) {
  if (!gbp) return null;
  return Math.round(gbp * GBP_TO_USD);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractAmenities(facilities) {
  if (!facilities) return [];
  const amenityMap = {
    parking: 'Parking',
    onSiteFitnessCentre: 'Fitness Centre',
    laundryService: 'Laundry Service',
    petPolicy: 'Pet-Friendly',
    electronicKeyCards: 'Electronic Key Cards',
    onSiteRestaurant: 'Restaurant',
    swimmingPool: 'Swimming Pool',
    conciergeService: 'Concierge',
    businessCentre: 'Business Centre',
    housekeepingService: 'Housekeeping',
    elevatorLift: 'Elevator/Lift',
    gardensTerrace: 'Gardens/Terrace',
    welcomePack: 'Welcome Pack',
    complimentaryBreakfast: 'Complimentary Breakfast',
    receptionServiceHours: 'Reception/Front Desk',
    onSiteSecurity: 'On-Site Security',
    wheelchairAccess: 'Wheelchair Access',
    bikeStorage: 'Bike Storage',
    evChargingPoints: 'EV Charging',
    rooftopTerrace: 'Rooftop Terrace',
  };
  const result = [];
  for (const [key, label] of Object.entries(amenityMap)) {
    const val = facilities[key];
    if (val && val !== 'no' && val !== false && val !== 0 && val !== null) {
      result.push(label);
    }
  }
  return result;
}

function extractUnitTypes(apartments) {
  if (!apartments || apartments.length === 0) return [];
  const types = new Set();
  for (const apt of apartments) {
    const label = apt.label || apt.derivedType || '';
    if (label.toLowerCase().includes('studio')) types.add('Studio');
    else if (label.toLowerCase().includes('1 bed') || apt.bedroomCount === 1) types.add('1 Bed');
    else if (label.toLowerCase().includes('2 bed') || apt.bedroomCount === 2) types.add('2 Bed');
    else if (label.toLowerCase().includes('3 bed') || apt.bedroomCount === 3) types.add('3 Bed');
    else if (label.toLowerCase().includes('4 bed') || apt.bedroomCount === 4) types.add('4 Bed');
    else if (label) types.add(label);
  }
  return [...types];
}

function extractCategory(facilities) {
  const hasReception = facilities?.receptionServiceHours && facilities.receptionServiceHours !== 'no';
  const hasRestaurant = facilities?.onSiteRestaurant && facilities.onSiteRestaurant !== 'no';
  const hasConcierge = facilities?.conciergeService && facilities.conciergeService !== 'no';
  if (hasReception && (hasRestaurant || hasConcierge)) return 'Aparthotel';
  return 'Serviced Apartment';
}

function buildDescription(prop) {
  const parts = [];
  const unitTypes = extractUnitTypes(prop.apartments);
  if (unitTypes.length > 0) parts.push(`Available in ${unitTypes.join(', ')} configurations.`);
  const energy = prop.propertyEnergyData;
  if (energy?.propertyLevelCalculation) {
    const co2 = parseFloat(energy.propertyLevelCalculation);
    if (co2 < 5) parts.push(`Highly sustainable with only ${co2.toFixed(1)} kg CO₂e per night.`);
    else if (energy.renewableEnergyValue) parts.push(`${energy.renewableEnergyValue}% renewable energy.`);
  }
  if (prop.districts && prop.districts.length > 0) {
    const districts = [...new Set(prop.districts)].slice(0, 3);
    parts.push(`Located in ${districts.join(', ')}.`);
  }
  return parts.join(' ') || null;
}

async function main() {
  const pool = await mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  });
  
  const conn = await pool.getConnection();
  
  // Load existing cities from DB
  const [dbCities] = await conn.execute('SELECT id, slug, name FROM cities');
  const cityBySlug = {};
  for (const city of dbCities) cityBySlug[city.slug] = city.id;
  
  // Load existing property slugs to avoid duplicates
  const [existingProps] = await conn.execute('SELECT slug FROM properties');
  const existingSlugs = new Set(existingProps.map(p => p.slug));
  console.log(`Existing properties: ${existingSlugs.size}`);
  
  conn.release();
  
  // Find all city JSON files
  const files = readdirSync(DOWNLOADS_DIR)
    .filter(f => f.startsWith('silverdoor-') && f.endsWith('.json') 
      && !f.includes('all-1636') && !f.includes('london-500'))
    .sort();
  
  console.log(`Found ${files.length} city files`);
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const file of files) {
    if (CITY_FILTER && !file.includes(CITY_FILTER)) continue;
    
    // Find DB city ID
    const sdCityName = Object.keys(CITY_MAP).find(k => 
      k.toLowerCase().replace(/\s+/g, '-') === file.replace('silverdoor-', '').replace('.json', '')
    );
    const dbSlug = sdCityName ? CITY_MAP[sdCityName] : null;
    const cityId = dbSlug ? cityBySlug[dbSlug] : null;
    
    if (!cityId) {
      console.log(`⚠️  Skipping ${file} — no DB city mapping for "${sdCityName || file}"`);
      continue;
    }
    
    const data = JSON.parse(readFileSync(join(DOWNLOADS_DIR, file), 'utf8'));
    const props = data.properties || [];
    
    console.log(`\n📍 ${sdCityName} (cityId=${cityId}): ${props.length} properties`);
    
    let inserted = 0;
    let skipped = 0;
    
    // Process in batches
    for (let i = 0; i < props.length; i += BATCH_SIZE) {
      const batch = props.slice(i, i + BATCH_SIZE);
      
      // Prepare batch property inserts
      const propRows = [];
      const propImageMap = []; // { propIndex, images }
      
      for (const prop of batch) {
        const baseSlug = prop.url 
          ? prop.url.replace(/\/$/, '').split('/').pop()
          : slugify(prop.name);
        
        if (existingSlugs.has(baseSlug)) {
          skipped++;
          continue;
        }
        
        let slug = baseSlug;
        let attempt = 0;
        while (existingSlugs.has(slug)) {
          attempt++;
          slug = `${baseSlug}-${attempt}`;
        }
        existingSlugs.add(slug);
        
        const amenities = extractAmenities(prop.facilities);
        const unitTypes = extractUnitTypes(prop.apartments);
        const category = extractCategory(prop.facilities);
        const description = buildDescription(prop);
        const minRateUsd = gbpToUsd(prop.minimumRate);
        const heroImageUrl = prop.images?.[0]?.imgURL || null;
        const neighborhood = prop.districts?.[0] || null;
        const ratingScore = prop.rosette ? Math.min(5, prop.rosette) : null;
        const bookingUrl = prop.url ? `https://www.silverdoor.com/${prop.url}` : null;
        
        const bestForTags = [];
        if (prop.sustainability?.greenEnergy?.includes('yes')) bestForTags.push('Eco-Friendly');
        if (amenities.includes('Pet-Friendly')) bestForTags.push('Pet-Friendly');
        if (amenities.includes('Fitness Centre')) bestForTags.push('Fitness');
        if (amenities.includes('Concierge')) bestForTags.push('Full Service');
        if (amenities.includes('Business Centre')) bestForTags.push('Business');
        if (category === 'Aparthotel') bestForTags.push('Aparthotel');
        
        const unitMix = prop.apartments?.map(a => ({
          label: a.label,
          type: a.derivedType,
          bedroomCount: a.bedroomCount,
          occupancy: a.totalOccupancy,
          description: a.description,
          fromRate: a.sdaFromRate,
        })) || [];
        
        propRows.push({
          slug, cityId, name: prop.name, category, description, neighborhood,
          latitude: prop.location?.lat?.toString() || null,
          longitude: prop.location?.lon?.toString() || null,
          heroImageUrl,
          unitTypes: JSON.stringify(unitTypes),
          amenities: JSON.stringify(amenities),
          ratingScore, ratingSource: ratingScore ? 'SilverDoor' : null,
          priceFromDailyUsd: minRateUsd,
          priceFromMonthlyUsd: minRateUsd ? minRateUsd * 30 : null,
          bookingUrl,
          bestForTags: JSON.stringify(bestForTags),
          unitMix: JSON.stringify(unitMix),
          images: prop.images || [],
        });
      }
      
      if (DRY_RUN) {
        for (const r of propRows) {
          console.log(`  [DRY] ${r.name} (${r.slug})`);
        }
        inserted += propRows.length;
        continue;
      }
      
      // Batch insert properties
      if (propRows.length === 0) continue;
      
      const conn2 = await pool.getConnection();
      try {
        // Insert properties one by one but collect image inserts
        const imageInserts = [];
        
        for (const row of propRows) {
          try {
            const [result] = await conn2.execute(
              `INSERT INTO properties 
               (slug, cityId, name, brand, category, tagline, description, neighborhood, address,
                latitude, longitude, heroImageUrl, unitTypes, amenities, minStayNights,
                ratingScore, ratingSource, priceFromDailyUsd, priceToDailyUsd,
                priceFromMonthlyUsd, priceToMonthlyUsd, bookingUrl, expediaUrl, tripUrl,
                officialUrl, virtualTourUrl, bestForTags, wfaScore, transitScore,
                lifestyleScore, quietnessScore, valueScore, featured, published, sortOrder,
                operatorGroup, rateCurve, unitMix, personaFit)
               VALUES (?, ?, ?, NULL, ?, NULL, ?, ?, NULL, ?, ?, ?, ?, ?, 1, ?, ?, ?, NULL, ?, NULL, ?, NULL, NULL, NULL, NULL, ?, NULL, NULL, NULL, NULL, NULL, false, true, 0, 'SilverDoor', NULL, ?, NULL)`,
              [
                row.slug, row.cityId, row.name, row.category, row.description, row.neighborhood,
                row.latitude, row.longitude, row.heroImageUrl,
                row.unitTypes, row.amenities,
                row.ratingScore, row.ratingSource,
                row.priceFromDailyUsd, row.priceFromMonthlyUsd, row.bookingUrl,
                row.bestForTags, row.unitMix,
              ]
            );
            
            const propertyId = result.insertId;
            inserted++;
            
            // Collect image inserts
            for (let idx = 0; idx < row.images.length; idx++) {
              const img = row.images[idx];
              imageInserts.push([propertyId, img.imgURL || img.fullImageUrl, img.title || null, img.alt || null, idx]);
            }
          } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              skipped++;
            } else {
              console.error(`  ❌ ${row.name}: ${err.message}`);
              totalErrors++;
            }
          }
        }
        
        // Batch insert all images for this batch
        if (imageInserts.length > 0) {
          const placeholders = imageInserts.map(() => '(?, ?, ?, ?, ?)').join(', ');
          const values = imageInserts.flat();
          await conn2.execute(
            `INSERT INTO propertyImages (propertyId, url, caption, alt, sortOrder) VALUES ${placeholders}`,
            values
          );
        }
        
        console.log(`  ✅ Batch ${Math.floor(i/BATCH_SIZE)+1}: ${inserted} inserted (${imageInserts.length} images)`);
      } finally {
        conn2.release();
      }
    }
    
    console.log(`  → ${sdCityName}: Inserted: ${inserted}, Skipped: ${skipped}`);
    totalInserted += inserted;
    totalSkipped += skipped;
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Total inserted: ${totalInserted}`);
  console.log(`   Total skipped: ${totalSkipped}`);
  console.log(`   Total errors: ${totalErrors}`);
  
  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
