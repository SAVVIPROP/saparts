import mysql2 from 'mysql2/promise';

const conn = await mysql2.createConnection(process.env.DATABASE_URL);

// Junk patterns - articles, web pages, generic terms
const junkPatterns = [
  // Article/list titles
  'Best%serviced', 'Best%Serviced', '%Top%Serviced', '%Top%serviced',
  '%Guide%', '%Review%', '%Awards%', '%Award%',
  '% Best %', 'Suite Life%', '%Most Stylish%',
  // Generic/non-property names
  'SA/%', 'Webpage%', '%not available%', '%[OBJECT%',
  '%Apart Hotels%', '%Serviced Apartments in%', '%Serviced Apartments In%',
  '%Serviced Apartment Guide%', '%Network%SANET%', '%SANET%',
  '%Hotels & Serviced%', '%Hotels and Serviced%',
  // Generic city-level names (not specific properties)
  '%Hong Kong Serviced%', '%Singapore Serviced%', '%Dubai Serviced%',
  '%London Serviced%', '%New York Serviced%', '%Tokyo Serviced%',
  '%Bangkok Serviced%', '%Sydney Serviced%', '%Melbourne Serviced%',
  '%Paris Serviced%', '%Berlin Serviced%', '%Amsterdam Serviced%',
  // Booking/OTA platform names
  '%Booking.com%', '%Airbnb%', '%Expedia%', '%TripAdvisor%',
  // Generic descriptors
  '%Cheap%', '%Affordable%', '%Budget%serviced%',
  '%New hotels in%', '%hotels in%',
];

let whereClause = junkPatterns.map(p => `name LIKE '${p}'`).join(' OR ');

// Count junk
const [[{junkCount}]] = await conn.execute(
  `SELECT COUNT(*) as junkCount FROM properties WHERE published = 1 AND (${whereClause})`
);
console.log('Junk properties (pattern match):', junkCount);

// Sample junk names
const [junkSample] = await conn.execute(
  `SELECT id, name, slug FROM properties WHERE published = 1 AND (${whereClause}) LIMIT 50`
);
console.log('\nSample junk names:');
junkSample.forEach(p => console.log(' -', p.name));

// Count by city - how many junk per city
const [junkByCityRaw] = await conn.execute(
  `SELECT c.name as city, COUNT(*) as junk 
   FROM properties p JOIN cities c ON c.id = p.cityId 
   WHERE p.published = 1 AND (${whereClause})
   GROUP BY c.name ORDER BY junk DESC LIMIT 20`
);
console.log('\nJunk by city (top 20):');
junkByCityRaw.forEach(r => console.log(` ${r.city}: ${r.junk}`));

// Total cities with at least 1 property
const [[{citiesWithProps}]] = await conn.execute(
  `SELECT COUNT(DISTINCT cityId) as citiesWithProps FROM properties WHERE published = 1`
);
console.log('\nCities with published properties:', citiesWithProps);

// Cities with at least 1 property WITH images
const [[{citiesWithImages}]] = await conn.execute(
  `SELECT COUNT(DISTINCT p.cityId) as cnt FROM properties p 
   JOIN propertyImages pi ON pi.propertyId = p.id WHERE p.published = 1`
);
console.log('Cities with at least 1 property with images:', citiesWithImages);

// Real properties = has images + not junk
const [[{realCount}]] = await conn.execute(
  `SELECT COUNT(DISTINCT p.id) as cnt FROM properties p 
   JOIN propertyImages pi ON pi.propertyId = p.id 
   WHERE p.published = 1 
   AND NOT (${whereClause})`
);
console.log('\nReal properties (has images + not junk pattern):', realCount);

// SilverDoor properties with images
const [[{sdWithImages}]] = await conn.execute(
  `SELECT COUNT(DISTINCT p.id) as cnt FROM properties p 
   JOIN propertyImages pi ON pi.propertyId = p.id 
   WHERE p.published = 1 AND p.brand = 'SilverDoor'`
);
console.log('SilverDoor properties with images:', sdWithImages);

await conn.end();
