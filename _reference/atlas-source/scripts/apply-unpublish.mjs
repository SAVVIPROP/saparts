// Apply unpublish of junk IDs from classify-new-batch results
import mysql from 'mysql2/promise';
import fs from 'fs';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL required'); process.exit(1); }

async function main() {
  const { junkIds } = JSON.parse(fs.readFileSync('/tmp/new-batch-junk.json', 'utf8'));
  console.log(`Applying unpublish for ${junkIds.length} junk properties...`);

  const conn = await mysql.createConnection({ uri: DB_URL, ssl: { rejectUnauthorized: true } });

  const CHUNK = 500;
  let total = 0;
  for (let i = 0; i < junkIds.length; i += CHUNK) {
    const chunk = junkIds.slice(i, i + CHUNK);
    const ph = chunk.map(() => '?').join(',');
    const [r] = await conn.execute(`UPDATE properties SET published=false WHERE id IN (${ph})`, chunk);
    total += r.affectedRows;
    console.log(`Chunk ${Math.floor(i/CHUNK)+1}: ${r.affectedRows} unpublished`);
  }
  console.log(`Total unpublished: ${total}`);

  const [[{ remaining }]] = await conn.execute('SELECT COUNT(*) as remaining FROM properties WHERE published=1');
  console.log(`Remaining published: ${remaining}`);
  await conn.end();
}

main().catch(console.error);
