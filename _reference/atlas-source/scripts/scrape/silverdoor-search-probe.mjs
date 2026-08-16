/**
 * SilverDoor Search API Probe
 * Uses Bright Data Web Unlocker to bypass Cloudflare and find the real search API
 */
import https from 'https';

const BRIGHTDATA_API_KEY = 'e41f3740-c95c-44bc-8275-b8d42065688e';
const BRIGHTDATA_ZONE = 'web_unlocker1';

async function fetchViaWebUnlocker(url, options = {}) {
  const proxyUrl = `https://brd.superproxy.io:33335`;
  const auth = `brd-customer-hl_5a3a1e3d-zone-${BRIGHTDATA_ZONE}:${BRIGHTDATA_API_KEY}`;
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(proxyUrl);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: url,
      method: options.method || 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(auth).toString('base64'),
        'x-brd-url': url,
        'x-brd-render': 'html',
        ...options.headers
      }
    };
    
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function fetchWithBrightData(url) {
  // Use Bright Data's Web Unlocker API
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'brd.superproxy.io',
      port: 33335,
      path: url,
      method: 'GET',
      headers: {
        'Host': 'www.silverdoor.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*',
      },
      auth: `brd-customer-hl_5a3a1e3d-zone-${BRIGHTDATA_ZONE}:${BRIGHTDATA_API_KEY}`,
      rejectUnauthorized: false
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

// Try the Bright Data API endpoint directly
async function probeViaBrightDataAPI(targetUrl) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      zone: BRIGHTDATA_ZONE,
      url: targetUrl,
      format: 'raw',
      country: 'gb'
    });
    
    const options = {
      hostname: 'api.brightdata.com',
      port: 443,
      path: '/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=== SilverDoor Search API Probe ===\n');
  
  // Test 1: Try the destination autocomplete API
  console.log('1. Testing /api/v1/destination?q=London ...');
  try {
    const result = await probeViaBrightDataAPI('https://www.silverdoor.com/api/v1/destination?q=London');
    console.log('Status:', result.status);
    console.log('Response (first 500 chars):', result.data.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  console.log('\n2. Testing /api/v1/properties with location search ...');
  try {
    const result = await probeViaBrightDataAPI('https://www.silverdoor.com/api/v1/properties?location=London&country=GB&page=1&per_page=50');
    console.log('Status:', result.status);
    console.log('Response (first 500 chars):', result.data.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  console.log('\n3. Testing /api/v1/properties with city_id ...');
  try {
    const result = await probeViaBrightDataAPI('https://www.silverdoor.com/api/v1/properties?city_id=1&page=1&per_page=50');
    console.log('Status:', result.status);
    console.log('Response (first 500 chars):', result.data.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  console.log('\n4. Testing /api/v2/properties ...');
  try {
    const result = await probeViaBrightDataAPI('https://www.silverdoor.com/api/v2/properties?destination=London&page=1');
    console.log('Status:', result.status);
    console.log('Response (first 500 chars):', result.data.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  console.log('\n5. Testing search endpoint with destination slug ...');
  try {
    const result = await probeViaBrightDataAPI('https://www.silverdoor.com/api/v1/search?destination=london&country=united-kingdom');
    console.log('Status:', result.status);
    console.log('Response (first 500 chars):', result.data.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  console.log('\n6. Testing the London search results page HTML ...');
  try {
    const result = await probeViaBrightDataAPI('https://www.silverdoor.com/serviced-apartments/united-kingdom/london/');
    console.log('Status:', result.status);
    // Look for API calls in the HTML/JS
    const html = result.data;
    const apiMatches = html.match(/\/api\/v[0-9]+\/[a-z-]+[^"'\s]*/g);
    if (apiMatches) {
      console.log('API endpoints found in page:', [...new Set(apiMatches)].join('\n'));
    }
    // Look for fetch calls or XHR patterns
    const fetchMatches = html.match(/fetch\(['"]([^'"]+)['"]/g);
    if (fetchMatches) {
      console.log('Fetch calls found:', fetchMatches.slice(0, 10).join('\n'));
    }
    // Save the HTML for analysis
    import('fs').then(fs => {
      fs.default.writeFileSync('/tmp/silverdoor-london.html', html);
      console.log('HTML saved to /tmp/silverdoor-london.html');
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main().catch(console.error);
