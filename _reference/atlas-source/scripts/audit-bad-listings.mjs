#!/usr/bin/env node
/**
 * Comprehensive audit of all published properties to find bad listings:
 * - Hotels (25hours, NH Hotels, Taj, Marriott, Hilton, etc.)
 * - Airbnb-style descriptive names ("Spacious 2BR with free WiFi")
 * - Garbled names (letters with spaces: "E A T O N")
 * - Articles/guides
 * - Generic non-property names
 * 
 * Outputs: /tmp/bad-listings-audit.json
 */
import mysql from 'mysql2/promise';
import { writeFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1); }

function parseDbUrl(url) {
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!m) throw new Error('Bad DB URL');
  return { user: m[1], password: m[2], host: m[3], port: parseInt(m[4]), database: m[5] };
}

const pool = mysql.createPool({ ...parseDbUrl(DATABASE_URL), connectionLimit: 2, ssl: { rejectUnauthorized: false } });

async function main() {
  const [rows] = await pool.execute(
    `SELECT id, name, slug FROM properties WHERE published=true ORDER BY id`
  );
  
  console.log(`Total published: ${rows.length}`);
  
  const bad = [];
  
  // Pattern categories
  const hotelChains = [
    /^25hours hotel/i, /^nh hotel/i, /^nh collection/i, /^nh world/i,
    /^taj \d+/i, /^taj hotel/i, /^taj mahal/i,
    /^marriott/i, /^jw marriott/i, /^w hotel/i, /^westin /i, /^sheraton /i,
    /^hilton /i, /^doubletree/i, /^hampton inn/i, /^curio collection/i,
    /^hyatt /i, /^park hyatt/i, /^grand hyatt/i, /^andaz /i, /^aloft /i,
    /^novotel /i, /^ibis /i, /^mercure /i, /^pullman /i, /^sofitel /i,
    /^mgallery/i, /^swissotel/i, /^fairmont /i, /^raffles /i,
    /^intercontinental /i, /^crowne plaza/i, /^holiday inn/i, /^staybridge/i,
    /^radisson /i, /^park inn/i, /^best western/i, /^ramada /i, /^wyndham /i,
    /^days inn/i, /^super 8/i, /^comfort inn/i, /^quality inn/i,
    /^four points/i, /^le meridien/i, /^renaissance /i, /^ritz.carlton/i,
    /^st regis /i, /^luxury collection/i, /^autograph collection/i,
    /^design hotel/i, /^boutique hotel/i, /^grand hotel/i,
    /^hotel indigo/i, /^kimpton /i, /^vignette collection/i,
    /^mövenpick/i, /^movenpick/i, /^anantara /i, /^kempinski /i,
    /^mandarin oriental/i, /^peninsula /i, /^shangri.la/i,
    /^banyan tree/i, /^six senses/i, /^aman /i, /^como /i,
    /^waldorf astoria/i, /^conrad /i, /^lxr hotels/i,
    /^rotana /i, /^jumeirah /i, /^address hotel/i,
    /^melia /i, /^me by melia/i, /^innside/i, /^tryp by/i,
    /^riu /i, /^barcelo /i, /^nh /i,
    /^ac hotel/i, /^moxy /i, /^element by/i, /^tribute portfolio/i,
  ];
  
  const airbnbPatterns = [
    // Descriptive Airbnb-style names with quotes
    /".+"/,
    // Names that are full sentences/descriptions
    /\bwith free\b/i, /\bfree wifi\b/i, /\bfree wi-fi\b/i, /\bfree parking\b/i,
    /\bself catering\b/i, /\bself-catering\b/i,
    /\bgreat location\b/i, /\bperfect location\b/i, /\bcentral location\b/i,
    /\bsteps from\b/i, /\bwalk to\b/i, /\bnear the\b/i,
    /\bcozy\b/i, /\bcosy\b/i, /\bluxurious\b/i, /\bcharming\b/i,
    /\bsunny\b/i, /\bbright\b/i, /\bmodern\b.*\bapartment\b/i,
    /\bspacious\b/i, /\bbeautiful\b/i, /\bstunning\b/i, /\belegant\b/i,
    /\bfamily friendly\b/i, /\bfamily-friendly\b/i,
    /\bpet friendly\b/i, /\bpet-friendly\b/i,
    // Names that are too long (Airbnb titles are often 60+ chars)
  ];
  
  const garbledPatterns = [
    // Letters with spaces between them: "E A T O N", "C I T Y"
    /\b[A-Z] [A-Z] [A-Z]\b/,
    /\b[A-Z] [A-Z] [A-Z] [A-Z]\b/,
    /\b[A-Z] [A-Z] [A-Z] [A-Z] [A-Z]\b/,
  ];
  
  const nonPropertyPatterns = [
    /\d+ best\b/i, /\btop \d+\b/i,
    /\bwhere to stay\b/i, /\bguide to\b/i, /\bbest places\b/i,
    /\bwebpage not available\b/i, /\bobject object\b/i,
    /\binstagram\b/i, /\bfacebook\b/i, /\btwitter\b/i,
    /\bclick here\b/i, /\bread more\b/i,
    /\bserviced apartments in\b/i, /\bapartments in\b/i, /\bhotels in\b/i,
    /\baccommodation in\b/i, /\bstay in\b/i,
    // Names that are just a city name + "apartments"
    /^[a-z]+ apartments$/i, /^[a-z]+ serviced apartments$/i,
    /^[a-z]+ [a-z]+ apartments$/i,
    // Hostel/guesthouse/B&B
    /\bhostel\b/i, /\bguesthouse\b/i, /\bguest house\b/i,
    /\bbed and breakfast\b/i, /\bb&b\b/i, /\binn\b/i,
    /\bbackpacker/i, /\bdormitory\b/i, /\bdorm\b/i,
    /\bmotel\b/i, /\blodge\b/i,
  ];
  
  for (const row of rows) {
    const name = row.name || '';
    let reason = null;
    
    // Check hotel chains
    if (!reason) {
      for (const p of hotelChains) {
        if (p.test(name)) { reason = `hotel_chain: ${p}`; break; }
      }
    }
    
    // Check Airbnb patterns
    if (!reason) {
      for (const p of airbnbPatterns) {
        if (p.test(name)) { reason = `airbnb_style: ${p}`; break; }
      }
    }
    
    // Check garbled names
    if (!reason) {
      for (const p of garbledPatterns) {
        if (p.test(name)) { reason = `garbled: ${p}`; break; }
      }
    }
    
    // Check non-property patterns
    if (!reason) {
      for (const p of nonPropertyPatterns) {
        if (p.test(name)) { reason = `non_property: ${p}`; break; }
      }
    }
    
    // Check for extremely long names (Airbnb-style descriptions > 80 chars)
    if (!reason && name.length > 80) {
      reason = `too_long (${name.length} chars)`;
    }
    
    if (reason) {
      bad.push({ id: row.id, name, slug: row.slug, reason });
    }
  }
  
  console.log(`\nBad listings found: ${bad.length}`);
  
  // Group by reason type
  const byType = {};
  for (const b of bad) {
    const type = b.reason.split(':')[0];
    byType[type] = (byType[type] || 0) + 1;
  }
  console.log('\nBy type:', JSON.stringify(byType, null, 2));
  
  // Show samples
  console.log('\n--- Sample bad listings ---');
  for (const b of bad.slice(0, 30)) {
    console.log(`  [${b.id}] ${b.name.slice(0, 80)} → ${b.reason.slice(0, 60)}`);
  }
  
  writeFileSync('/tmp/bad-listings-audit.json', JSON.stringify(bad, null, 2));
  console.log(`\nFull list saved to /tmp/bad-listings-audit.json`);
  
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
