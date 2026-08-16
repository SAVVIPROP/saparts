import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const progress = JSON.parse(readFileSync('/tmp/classify-bk-progress.json', 'utf8'));
const junkIds = progress.junkIds;
console.log(`Loaded ${junkIds.length} junk IDs to unpublish`);

const conn = await mysql.createConnection(DB_URL);
console.log('Connected to database');

const BATCH = 500;
let total = 0;
for (let i = 0; i < junkIds.length; i += BATCH) {
  const chunk = junkIds.slice(i, i + BATCH);
  const placeholders = chunk.map(() => '?').join(',');
  const [result] = await conn.execute(
    `UPDATE properties SET published = 0 WHERE id IN (${placeholders})`,
    chunk
  );
  total += result.affectedRows;
  console.log(`Batch ${Math.floor(i/BATCH)+1}/${Math.ceil(junkIds.length/BATCH)} — unpublished ${total}/${junkIds.length}`);
}

// Verify final count
const [rows] = await conn.execute('SELECT COUNT(*) as cnt FROM properties WHERE published = 1');
console.log(`\n=== DONE ===`);
console.log(`Unpublished: ${total} properties`);
console.log(`Remaining published: ${rows[0].cnt}`);

await conn.end();
