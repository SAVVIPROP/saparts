// Classify only the new high-ID properties (ID > 10M) — runs from sandbox with valid Forge API
import mysql from 'mysql2/promise';
import fs from 'fs';

const DB_URL = process.env.DATABASE_URL;
const FORGE_URL = (process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.ai').replace(/\/+$/, '');
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;

if (!DB_URL) { console.error('DATABASE_URL required'); process.exit(1); }
if (!FORGE_KEY) { console.error('BUILT_IN_FORGE_API_KEY required'); process.exit(1); }

async function llm(batch) {
  const nameList = batch.map(([id, n], i) => `${i+1}. [ID:${id}] ${n}`).join('\n');
  const systemPrompt = `You are classifying property listings for a serviced apartment directory.
For each property, respond REAL if it is a specific named serviced apartment, aparthotel, corporate housing, or extended-stay residence.
Respond JUNK if it is: a regular hotel, hostel, guesthouse, B&B, inn, lodge, villa rental, Airbnb-style listing, travel article, listicle, generic description, street address, or company name.
Respond with ONLY a JSON array: [{"id": <number>, "verdict": "REAL" or "JUNK"}]`;
  const userPrompt = `Classify these ${batch.length} properties:\n\n${nameList}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await fetch(`${FORGE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${FORGE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet',
          max_tokens: 6000,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        }),
        signal: AbortSignal.timeout(120000)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      const match = content.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON in response: ' + content.slice(0, 200));
      return JSON.parse(match[0]);
    } catch(e) {
      console.error(`  Attempt ${attempt} failed: ${e.message}`);
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
}

async function main() {
  const conn = await mysql.createConnection({ uri: DB_URL, ssl: { rejectUnauthorized: true } });
  const [rows] = await conn.execute('SELECT id, name FROM properties WHERE id > 10000000 AND published=1 ORDER BY id');
  console.log(`Classifying ${rows.length} new properties...`);

  const junkIds = [];
  const BATCH = 150;
  const totalBatches = Math.ceil(rows.length / BATCH);

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map(r => [r.id, r.name]);
    const batchNum = Math.floor(i / BATCH) + 1;
    process.stdout.write(`Batch ${batchNum}/${totalBatches}... `);
    try {
      const results = await llm(batch);
      let junk = 0;
      for (const r of results) {
        if (r.verdict === 'JUNK') { junkIds.push(r.id); junk++; }
      }
      console.log(`${junk} junk (running total: ${junkIds.length})`);
    } catch(e) {
      console.log('ERROR:', e.message);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nTotal junk: ${junkIds.length}/${rows.length}`);
  fs.writeFileSync('/tmp/new-batch-junk.json', JSON.stringify({ junkIds, total: rows.length }));

  if (junkIds.length > 0) {
    const CHUNK = 500;
    let total = 0;
    for (let i = 0; i < junkIds.length; i += CHUNK) {
      const chunk = junkIds.slice(i, i + CHUNK);
      const ph = chunk.map(() => '?').join(',');
      const [r] = await conn.execute(`UPDATE properties SET published=false WHERE id IN (${ph})`, chunk);
      total += r.affectedRows;
    }
    console.log(`Unpublished ${total} junk properties`);
  }

  const [[{ remaining }]] = await conn.execute('SELECT COUNT(*) as remaining FROM properties WHERE published=1');
  console.log(`Remaining published: ${remaining}`);
  await conn.end();
}

main().catch(console.error);
