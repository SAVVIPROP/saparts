/**
 * SilverDoor probe — Bright Data Web Unlocker
 * Tests access to SilverDoor search results and property detail pages
 */
import https from 'https';
import fs from 'fs';

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || 'e41f3740-c95c-44bc-8275-b8d42065688e';

async function fetchWithBrightData(url) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      zone: 'web_unlocker1',
      url,
      format: 'raw',
    });

    const options = {
      hostname: 'api.brightdata.com',
      port: 443,
      path: '/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

// Test 1: SilverDoor search results for London
console.log('=== Test 1: SilverDoor London search ===');
const searchUrl = 'https://www.silverdoor.com/serviced-apartments/united-kingdom/london/';
const searchResult = await fetchWithBrightData(searchUrl);
console.log('Status:', searchResult.status);
console.log('Body size:', searchResult.body.length, 'bytes');
fs.writeFileSync('/tmp/silverdoor-search.html', searchResult.body);

// Check for property cards
const hasPropertyCards = searchResult.body.includes('property-card') || 
                          searchResult.body.includes('listing-card') ||
                          searchResult.body.includes('apartment-card') ||
                          searchResult.body.includes('data-property');
console.log('Has property cards:', hasPropertyCards);

// Look for property links
const propertyLinks = [...searchResult.body.matchAll(/href="(\/serviced-apartments\/[^"]+)"/g)]
  .map(m => 'https://www.silverdoor.com' + m[1])
  .filter(url => !url.includes('/serviced-apartments/united-kingdom/london/') && url.split('/').length > 6)
  .slice(0, 5);
console.log('Sample property links:', propertyLinks);

// Check for CAPTCHA
const hasCaptcha = searchResult.body.toLowerCase().includes('captcha') && 
                   !searchResult.body.includes('function captcha');
console.log('Blocked by CAPTCHA:', hasCaptcha);

if (propertyLinks.length > 0) {
  // Test 2: Property detail page
  console.log('\n=== Test 2: SilverDoor property detail ===');
  const detailResult = await fetchWithBrightData(propertyLinks[0]);
  console.log('Status:', detailResult.status);
  console.log('Body size:', detailResult.body.length, 'bytes');
  fs.writeFileSync('/tmp/silverdoor-detail.html', detailResult.body);
  
  // Extract key fields
  const nameMatch = detailResult.body.match(/<h1[^>]*>([^<]+)<\/h1>/);
  console.log('Property name:', nameMatch?.[1]?.trim());
  
  const ratingMatch = detailResult.body.match(/(\d+\.?\d*)\s*\/\s*10|rating[^>]*>([^<]+)</i);
  console.log('Rating found:', ratingMatch?.[0]?.trim());
  
  const imgCount = (detailResult.body.match(/\.(jpg|jpeg|webp|png)/gi) || []).length;
  console.log('Image references:', imgCount);
}

console.log('\nProbe complete. Files saved to /tmp/silverdoor-*.html');
