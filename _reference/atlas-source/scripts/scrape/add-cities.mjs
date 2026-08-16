#!/usr/bin/env node
import mysql from "mysql2/promise";

const EXTRA_CITIES = [
  { slug: "cambridge",  name: "Cambridge",  country: "United Kingdom", region: "Europe" },
  { slug: "dublin",     name: "Dublin",     country: "Ireland",        region: "Europe" },
  { slug: "copenhagen", name: "Copenhagen", country: "Denmark",        region: "Europe" },
  { slug: "edinburgh",  name: "Edinburgh",  country: "United Kingdom", region: "Europe" },
  { slug: "lisbon",     name: "Lisbon",     country: "Portugal",       region: "Europe" },
  { slug: "liverpool",  name: "Liverpool",  country: "United Kingdom", region: "Europe" },
  { slug: "manchester", name: "Manchester", country: "United Kingdom", region: "Europe" },
  { slug: "munich",     name: "Munich",     country: "Germany",        region: "Europe" },
  { slug: "the-hague",  name: "The Hague",  country: "Netherlands",    region: "Europe" },
  { slug: "jersey",     name: "Jersey",     country: "United Kingdom", region: "Europe" },
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);
let added = 0;
for (const c of EXTRA_CITIES) {
  const [rows] = await conn.query("SELECT id FROM cities WHERE slug=?", [c.slug]);
  if (rows.length) continue;
  await conn.query(
    `INSERT INTO cities (slug, name, country, region, tagline, featured, published, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [c.slug, c.name, c.country, c.region, `Extended coverage — ${c.name}.`, false, true, 200]
  );
  added++;
  console.log("+", c.slug);
}
await conn.end();
console.log(`added=${added}`);
