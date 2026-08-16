/**
 * SilverDoor City Page Scraper
 * Uses Bright Data Web Unlocker with JS rendering to scrape fully-rendered city pages
 * This bypasses Cloudflare AND waits for React to load the property listings
 */
import https from 'https';
import fs from 'fs';

const BRIGHTDATA_API_KEY = 'e41f3740-c95c-44bc-8275-b8d42065688e';
const BRIGHTDATA_ZONE = 'web_unlocker1';

// City URL slugs for SilverDoor (country/city format)
const CITIES = [
  { name: 'London', url: 'https://www.silverdoor.com/serviced-apartments/united-kingdom/london/' },
  { name: 'Edinburgh', url: 'https://www.silverdoor.com/serviced-apartments/united-kingdom/edinburgh/' },
  { name: 'Manchester', url: 'https://www.silverdoor.com/serviced-apartments/united-kingdom/manchester/' },
  { name: 'New York', url: 'https://www.silverdoor.com/serviced-apartments/united-states/new-york/' },
  { name: 'Dubai', url: 'https://www.silverdoor.com/serviced-apartments/united-arab-emirates/dubai/' },
  { name: 'Singapore', url: 'https://www.silverdoor.com/serviced-apartments/singapore/singapore/' },
  { name: 'Paris', url: 'https://www.silverdoor.com/serviced-apartments/france/paris/' },
  { name: 'Amsterdam', url: 'https://www.silverdoor.com/serviced-apartments/netherlands/amsterdam/' },
  { name: 'Berlin', url: 'https://www.silverdoor.com/serviced-apartments/germany/berlin/' },
  { name: 'Sydney', url: 'https://www.silverdoor.com/serviced-apartments/australia/sydney/' },
];

async function fetchWithBrightDataRendered(url) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      zone: BRIGHTDATA_ZONE,
      url: url,
      format: 'raw',
      country: 'gb',
      render: 'html',  // Enable JS rendering
    });

    const options = {
      hostname: 'api.brightdata.com',
      port: 443,
      path: '/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function extractPropertiesFromHTML(html, cityName) {
  const properties = [];
  
  // SilverDoor property cards typically have links like /serviced-apartments/property-slug
  // Look for property card patterns
  const propertyLinkPattern = /href="(\/serviced-apartments\/[^"]+\/[^"]+\/[^"]+)"[^>]*>/g;
  const namePattern = /<h[23][^>]*class="[^"]*(?:property|apartment|card)[^"]*"[^>]*>([^<]+)<\/h[23]>/gi;
  
  // Try to find property data in window variables or JSON
  const windowCurrentLocation = html.match(/window\.currentLocation\s*=\s*({[^;]+});/);
  if (windowCurrentLocation) {
    try {
      const locationData = JSON.parse(windowCurrentLocation[1]);
      console.log(`  City data: ${JSON.stringify(locationData).substring(0, 200)}`);
    } catch(e) {}
  }
  
  // Look for property cards - SilverDoor uses specific CSS classes
  // Pattern: data within the city-page-properties div
  const cityPropsSection = html.match(/<div[^>]*id="city-page-properties"[^>]*>([\s\S]*?)(?=<div[^>]*id="city-page-unavailable|<\/body>)/);
  if (cityPropsSection) {
    const section = cityPropsSection[1];
    console.log(`  Found city-page-properties section (${section.length} chars)`);
    
    // Extract property links
    const links = [...section.matchAll(/href="(\/serviced-apartments\/[^"]+)"[^>]*>/g)];
    const uniqueLinks = [...new Set(links.map(m => m[1]))].filter(l => l.split('/').length >= 4);
    
    for (const link of uniqueLinks) {
      // Extract property name from nearby text
      const linkIdx = section.indexOf(`href="${link}"`);
      const nearby = section.substring(Math.max(0, linkIdx - 200), linkIdx + 500);
      
      // Try to find property name
      const nameMatch = nearby.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i) || 
                        nearby.match(/title="([^"]+)"/i) ||
                        nearby.match(/alt="([^"]+)"/i);
      
      const name = nameMatch ? nameMatch[1].trim() : link.split('/').pop().replace(/-/g, ' ');
      
      // Try to find image
      const imgMatch = nearby.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
      const image = imgMatch ? imgMatch[1] : null;
      
      properties.push({
        name,
        url: `https://www.silverdoor.com${link}`,
        slug: link.split('/').pop(),
        image,
        city: cityName,
      });
    }
  }
  
  return properties;
}

async function scrapeCity(city) {
  console.log(`\nScraping ${city.name}...`);
  console.log(`  URL: ${city.url}`);
  
  try {
    const result = await fetchWithBrightDataRendered(city.url);
    console.log(`  Status: ${result.status}`);
    console.log(`  Response size: ${result.data.length} chars`);
    
    if (result.status !== 200) {
      console.log(`  Error response: ${result.data.substring(0, 200)}`);
      return [];
    }
    
    // Save HTML for analysis
    const filename = `/tmp/silverdoor-${city.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    fs.writeFileSync(filename, result.data);
    console.log(`  Saved to ${filename}`);
    
    // Check if it's a Cloudflare challenge
    if (result.data.includes('Just a moment') || result.data.includes('cf-browser-verification')) {
      console.log('  ⚠️  Cloudflare challenge detected - JS rendering needed');
      return [];
    }
    
    // Extract properties
    const properties = extractPropertiesFromHTML(result.data, city.name);
    console.log(`  Found ${properties.length} properties`);
    
    for (const p of properties.slice(0, 5)) {
      console.log(`    - ${p.name} (${p.url})`);
    }
    
    return properties;
  } catch (e) {
    console.error(`  Error: ${e.message}`);
    return [];
  }
}

async function main() {
  console.log('=== SilverDoor City Page Scraper ===\n');
  
  // Start with London only to test
  const testCity = CITIES[0];
  const properties = await scrapeCity(testCity);
  
  console.log(`\n=== Results for ${testCity.name} ===`);
  console.log(`Total properties found: ${properties.length}`);
  
  if (properties.length > 0) {
    console.log('\nSample properties:');
    properties.slice(0, 10).forEach(p => {
      console.log(`  - ${p.name}`);
      console.log(`    URL: ${p.url}`);
    });
    
    // Save results
    fs.writeFileSync('/tmp/silverdoor-london-properties.json', JSON.stringify(properties, null, 2));
    console.log('\nSaved to /tmp/silverdoor-london-properties.json');
  }
  
  // Also check the raw HTML for clues about the API
  const htmlFile = '/tmp/silverdoor-london.html';
  if (fs.existsSync(htmlFile)) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    console.log('\n=== Checking existing London HTML for API clues ===');
    
    // Look for the properties API URL pattern
    const apiPatterns = [
      /\/api\/v\d+\/properties[^"'\s]*/g,
      /\/api\/[a-z-]+\/[a-z-]+[^"'\s]*/g,
    ];
    
    for (const pattern of apiPatterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        console.log('API patterns found:', matches.map(m => m[0]).join(', '));
      }
    }
    
    // Look for the city ID being used in API calls
    const cityIdMatch = html.match(/city[_-]?id['":\s]+(\d+)/i);
    if (cityIdMatch) {
      console.log(`City ID found: ${cityIdMatch[1]}`);
    }
    
    // Look for any fetch/axios calls with full URLs
    const fetchCalls = html.match(/(?:fetch|axios\.get|axios\.post)\(['"`]([^'"`]+)['"`]/g);
    if (fetchCalls) {
      console.log('Fetch/axios calls:', fetchCalls.slice(0, 10));
    }
    
    // Check what data is in the city-page-properties div
    const propertiesDiv = html.match(/<div[^>]*id="city-page-properties"[^>]*>([\s\S]{0,2000})/);
    if (propertiesDiv) {
      console.log('\ncity-page-properties div content (first 500 chars):');
      console.log(propertiesDiv[1].substring(0, 500));
    }
  }
}

main().catch(console.error);
