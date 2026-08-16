/**
 * cleanup-junk.mjs
 * 
 * Safely identifies and unpublishes junk listings (blog posts, SEO articles,
 * listicles, forum posts) while preserving all real properties.
 * 
 * Run with: node scripts/cleanup-junk.mjs [--dry-run]
 */

import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const DB_URL = process.env.DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Junk detection patterns ────────────────────────────────────────────────
// These patterns match names that are clearly blog/article/forum content,
// NOT real property names. Each pattern is commented with examples.

const JUNK_PATTERNS = [
  // Numbered listicle titles: "18 Best serviced apartments in Hong Kong"
  /^\d+ (Best|Top|Great|Amazing|Affordable|Cheap|Luxury) (Serviced|Apartment|Hotel|Stay|Place|Thing|Reason)/i,
  /^\d+ Serviced [Aa]partments/i,
  /^\d+ [Aa]partments? [Rr]entals? in/i,
  /\d+ Serviced [Aa]partments? (in |&)/i,
  // "823 Serviced Apartments & Apartments Rentals in Tokyo | MetroResidences"
  /\| MetroResidences$/i,
  /Serviced Apartments? in [A-Z][a-z]+ \| /i,

  // Blog/guide article titles
  /\bGuide to\b/i,
  /\bGuide for\b/i,
  /\bHow to (Find|Book|Choose|Pick|Rent)\b/i,
  /\bTips for (Finding|Booking|Choosing|Renting)\b/i,
  /\bThings to Do in\b/i,
  /\bReasons to (Stay|Visit|Book)\b/i,
  /\bPlaces to Stay in\b/i,
  /^Where to (Stay|Go|Visit|Eat) in /i,
  /^Where to Stay in [A-Z]/i,
  /^Where to\?$/i,
  /For more inspiration on where to stay/i,
  /^An Agent'?s Guide/i,
  /^The Best Things to Do in/i,
  /^The Best Places to Stay in/i,
  /^The Best Hotels in/i,
  /^The Best Serviced Apartments/i,
  /^Best Serviced Apartments? [A-Z].+\d{4}/i, // "Best Serviced Apartments Miami, EUA 2025"
  /^Best Hotel Apartments in [A-Z]/i,
  /\bAffordable Luxury Living Guide\b/i,

  // Forum / Reddit style posts
  /^Any good places to rent/i,
  /^Anyone (know|recommend|have|tried)/i,
  /^Has anyone (used|tried|stayed|been)/i,
  /^Does anyone (know|recommend|have)/i,
  /^Can anyone (recommend|suggest|help)/i,
  /^Looking for (serviced|furnished|short-term|a good)/i,

  // Sentence fragments scraped from articles
  /^For more (information|details|inspiration)/i,
  /^Click here (to|for)/i,
  /^Read more (about|on)/i,
  /^See more (options|properties|hotels)/i,
  /^Find out more/i,
  /, visit:$/i,

  // Clearly not property names — colon-ended fragments, question fragments
  /^Best (hotel|boutique hotel|serviced) for .+:$/i,
  /^Best (hotel|boutique hotel):?$/i,
  /^Best serviced\/furnished apartments\?$/i,

  // "The best hotels in X" article titles
  /^The best hotels in /i,
  /^The Best Hotels in /i,

  // "Top X Serviced Apartments in Y" listicles
  /^Top \d+ Serviced Apartments/i,
  /^Top Serviced Apartments/i,

  // Social media / hashtag titles
  /#(hotel|apartment|serviced|suite)/i,

  // "The Complete Guide", "The Ultimate Guide", "The Top X"
  /^The (Complete|Ultimate|Comprehensive|Definitive) Guide/i,
  /^The Top \d+ (Serviced|Apartment|Hotel)/i,

  // "Best Serviced Apartments [City], [Country] 2025" style
  /^Best Serviced Apartments [A-Z].+\d{4}/i,
  /^Best Places to Stay in/i,
];

// ─── False positive protection ───────────────────────────────────────────────
// Names that match patterns above but ARE real properties — never unpublish these
const SAFE_NAMES = new Set([
  '1 Hotel Copenhagen',
  '1 Hotel Melbourne',
  '1 Hotel Brooklyn Bridge',
  '1 Hotel Nashville',
  '1 Hotel West Hollywood',
  '1 Hotel South Beach',
  '1 Hotel Central Park',
  '1 Hotel Toronto',
  '1 Hotel Hanalei Bay',
  '1 Hotel Mayfair',
  '188 Apartments',
  '20 Apartment Centre',
  '59 Great Titchfield Street, London',
]);

// Also protect names that start with a number followed by a real street/address pattern
const SAFE_PATTERNS = [
  /^\d+ [A-Z][a-z]+ (Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Place|Pl|Court|Ct|Way|Drive|Dr|Square|Sq|Row|Crescent|Terrace|Gardens|Park|Close|Walk|Gate|Hill|House|Tower|Building)/i,
  /^\d+ [A-Z][a-z]+ [A-Z][a-z]+, (London|New York|Paris|Tokyo|Sydney|Dubai|Singapore)/i,
];

function isJunk(name) {
  if (!name) return false;
  
  // Check safe list first
  if (SAFE_NAMES.has(name)) return false;
  
  // Check safe patterns (real addresses starting with numbers)
  for (const pattern of SAFE_PATTERNS) {
    if (pattern.test(name)) return false;
  }
  
  // Check junk patterns
  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(name)) return true;
  }
  
  return false;
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will unpublish junk)'}`);
  
  // Parse DATABASE_URL
  const url = new URL(DB_URL);
  const conn = await createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 4000,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connected to database.');

  // Fetch all published properties
  const [rows] = await conn.execute(
    'SELECT id, name, category FROM properties WHERE published = true ORDER BY name'
  );
  
  console.log(`Total published properties: ${rows.length}`);

  // Identify junk
  const junkIds = [];
  const junkList = [];
  
  for (const row of rows) {
    if (isJunk(row.name)) {
      junkIds.push(row.id);
      junkList.push({ id: row.id, name: row.name, category: row.category });
    }
  }

  console.log(`\nJunk listings identified: ${junkIds.length}`);
  console.log(`Clean listings: ${rows.length - junkIds.length}`);
  
  // Write junk list to file for review
  const reportPath = join(__dirname, '../junk-listings-report.json');
  writeFileSync(reportPath, JSON.stringify(junkList, null, 2));
  console.log(`\nJunk list saved to: ${reportPath}`);
  
  // Print sample
  console.log('\nSample junk listings:');
  junkList.slice(0, 30).forEach(j => console.log(`  [${j.id}] ${j.name}`));
  if (junkList.length > 30) {
    console.log(`  ... and ${junkList.length - 30} more`);
  }

  if (!DRY_RUN && junkIds.length > 0) {
    // Unpublish in batches of 500
    const batchSize = 500;
    let totalUnpublished = 0;
    
    for (let i = 0; i < junkIds.length; i += batchSize) {
      const batch = junkIds.slice(i, i + batchSize);
      const placeholders = batch.map(() => '?').join(',');
      const [result] = await conn.execute(
        `UPDATE properties SET published = false WHERE id IN (${placeholders})`,
        batch
      );
      totalUnpublished += result.affectedRows;
      console.log(`Batch ${Math.floor(i/batchSize) + 1}: unpublished ${result.affectedRows} properties`);
    }
    
    console.log(`\nDone. Unpublished ${totalUnpublished} junk listings.`);
    
    // Final count
    const [countRows] = await conn.execute(
      'SELECT COUNT(*) as cnt FROM properties WHERE published = true'
    );
    console.log(`Final published count: ${countRows[0].cnt}`);
  } else if (DRY_RUN) {
    console.log('\nDry run complete. No changes made.');
  }

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
