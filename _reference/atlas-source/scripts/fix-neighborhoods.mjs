import { readFileSync } from 'fs';
import mysql2 from 'mysql2/promise';

const sql = readFileSync('/tmp/fix-neighborhoods.sql', 'utf8');
const statements = sql.split('\n').filter(s => s.trim());

const conn = await mysql2.createConnection(process.env.DATABASE_URL);
let updated = 0;
let notFound = 0;
for (const stmt of statements) {
  const [result] = await conn.execute(stmt);
  if (result.affectedRows > 0) updated++;
  else notFound++;
}
await conn.end();
console.log(`Updated neighborhoods for ${updated} properties (${notFound} not found in DB)`);
