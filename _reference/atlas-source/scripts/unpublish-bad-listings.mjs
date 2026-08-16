#!/usr/bin/env node
/**
 * Unpublish confirmed bad listings from the audit:
 * - hotel_chain: major hotel chains (not serviced apartments)
 * - airbnb_style: individual vacation rental listings with descriptive names
 * - garbled: names with spaced-out letters
 * - too_long: names > 80 chars (Airbnb-style descriptions)
 * 
 * Does NOT unpublish non_property (e.g., "Battersea Power Apartments" - may be real)
 */
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1); }

function parseDbUrl(url) {
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!m) throw new Error('Bad DB URL');
  return { user: m[1], password: m[2], host: m[3], port: parseInt(m[4]), database: m[5] };
}

const pool = mysql.createPool({ ...parseDbUrl(DATABASE_URL), connectionLimit: 2, ssl: { rejectUnauthorized: false } });

async function main() {
  const data = JSON.parse(readFileSync('/tmp/bad-listings-audit.json', 'utf8'));
  
  // Only unpublish confirmed bad categories (not non_property which may have false positives)
  const toUnpublish = data.filter(d => 
    d.reason.startsWith('hotel_chain') ||
    d.reason.startsWith('airbnb_style') ||
    d.reason.startsWith('garbled') ||
    d.reason.startsWith('too_long')
  );
  
  console.log(`Total to unpublish: ${toUnpublish.length}`);
  console.log(`  - hotel_chain: ${toUnpublish.filter(d => d.reason.startsWith('hotel_chain')).length}`);
  console.log(`  - airbnb_style: ${toUnpublish.filter(d => d.reason.startsWith('airbnb_style')).length}`);
  console.log(`  - garbled: ${toUnpublish.filter(d => d.reason.startsWith('garbled')).length}`);
  console.log(`  - too_long: ${toUnpublish.filter(d => d.reason.startsWith('too_long')).length}`);
  
  const ids = toUnpublish.map(d => d.id);
  
  // Batch unpublish in chunks of 500
  let total = 0;
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const placeholders = chunk.map(() => '?').join(',');
    const [result] = await pool.execute(
      `UPDATE properties SET published=false WHERE id IN (${placeholders})`,
      chunk
    );
    total += result.affectedRows;
    console.log(`Batch ${Math.floor(i/500)+1}: unpublished ${result.affectedRows} (total: ${total})`);
  }
  
  console.log(`\nDone. Total unpublished: ${total}`);
  
  // Check remaining count
  const [[{ cnt }]] = await pool.execute(`SELECT COUNT(*) as cnt FROM properties WHERE published=true`);
  console.log(`Remaining published: ${cnt}`);
  
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
