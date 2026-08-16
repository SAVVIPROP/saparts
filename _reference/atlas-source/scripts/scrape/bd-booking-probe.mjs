/**
 * Bright Data Web Unlocker — Booking.com probe
 * Tests if we can get real property listings for London serviced apartments
 */
import * as fs from 'fs';

const API_KEY = process.env.BRIGHTDATA_API_KEY;

// London serviced apartments / aparthotels, review score 9+, sorted by top reviewed
// ht_id=201=Aparthotel, ht_id=220=Apartment, review_score=90 (9.0+), order=bayesian_review_score
const TEST_URL = [
  'https://www.booking.com/searchresults.html',
  '?ss=London%2C+United+Kingdom',
  '&nflt=ht_id%3D201%3Bht_id%3D220%3Breview_score%3D90',
  '&order=bayesian_review_score',
  '&checkin=2026-06-15&checkout=2026-07-15',
  '&group_adults=1&no_rooms=1&group_children=0',
  '&lang=en-gb&selected_currency=USD',
].join('');

console.log('Testing Bright Data Web Unlocker against Booking.com...');
console.log('URL:', TEST_URL);
console.log('');

try {
  const response = await fetch('https://api.brightdata.com/request', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zone: 'web_unlocker1',
      url: TEST_URL,
      format: 'raw',
      country: 'gb',
    }),
    signal: AbortSignal.timeout(90000),
  });

  console.log('HTTP Status:', response.status);

  if (!response.ok) {
    const err = await response.text();
    console.error('Error response:', err.slice(0, 500));
    process.exit(1);
  }

  const html = await response.text();
  console.log('HTML length:', html.length, 'chars');

  // Save for inspection
  fs.writeFileSync('/tmp/bd-booking-probe.html', html);
  console.log('Saved to /tmp/bd-booking-probe.html');

  // Key indicators
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'not found';
  console.log('Page title:', title);

  const propCards  = (html.match(/data-testid="property-card"/g) || []).length;
  const hotelIds   = (html.match(/data-hotelid="\d+"/g) || []).length;
  const propNames  = (html.match(/data-testid="title"/g) || []).length;
  const captcha    = /captcha|robot|blocked|access denied/i.test(html);

  console.log('Property cards found:', propCards);
  console.log('Hotel IDs found:', hotelIds);
  console.log('Property name elements:', propNames);
  console.log('CAPTCHA / blocked:', captcha);

  if (propCards > 0 || hotelIds > 0) {
    console.log('\n✅ SUCCESS — Bright Data can retrieve Booking.com listings');
    // Extract first few property names
    const names = [...html.matchAll(/data-testid="title"[^>]*>([^<]+)</g)].slice(0, 5);
    names.forEach((m, i) => console.log(`  ${i+1}. ${m[1].trim()}`));
  } else if (captcha) {
    console.log('\n❌ BLOCKED — CAPTCHA or access denied page returned');
  } else {
    console.log('\n⚠️  Page loaded but no property cards detected — may need different selectors');
    console.log('First 1000 chars:', html.slice(0, 1000));
  }

} catch (err) {
  console.error('Request failed:', err.message);
}
