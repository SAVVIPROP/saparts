# SAparts Atlas

World's Leading Directory of Serviced Apartments.

Public Next.js App Router replica. File-based city and listing data. No login. Launch inventory is 653 official serviced-apartment listings across 7 cities.

## Requirements

- Node.js 20+
- npm

## Setup

Install dependencies, then start the development server:

    npm install
    npm run dev

Open http://localhost:3000

## Production build

    npm run build
    npm start

## Data

- data/cities.json — launch cities (Hong Kong, London, New York, Paris, Singapore, Dubai, Tokyo) plus optional forthcoming stubs. Fields: slug, name, country, region, tagline, currency, launch.
- data/properties/<citySlug>.json — arrays of listings. Launch counts: Hong Kong 51, London 151, New York 214, Paris 113, Singapore 41, Dubai 44, Tokyo 39 (653 total). Official operator pages only. No hotels. No invented prices.

No listing inventory or prices are invented in this repository. Rate fields appear on a property page only when present on an imported record.

## Import ENRICHED.json

ENRICHED.json must be a JSON array of listing objects (or an object with a listings array).

    node scripts/import-enriched.mjs ./ENRICHED.json
    node scripts/import-enriched.mjs ./packs/hong-kong.ENRICHED.json hong-kong
    npm run import -- ./ENRICHED.json london

When the optional citySlug argument is supplied, every record is written to data/properties/<citySlug>.json. Otherwise listings are grouped by each record citySlug (or city) field.

Expected listing fields:

slug, citySlug, name, brand, category (Serviced Apartment | Aparthotel | Residence | Penthouse), tagline, description, neighborhood, address, latitude, longitude, heroImageUrl, imageUrls, imageFiles, unitTypes, amenities, minStayNights, priceFromMonthlyUsd, priceFromMonthlyNative, priceCurrencyNative, priceNotes, bookingUrl, officialUrl, virtualTourUrl, videoUrls, layoutUrls, operatorGroup, published, sources

The importer overwrites the destination city file. After import, restart the dev server or rebuild so pages pick up the new file.

## Routes

- / Home
- /cities City index
- /cities/[slug] City hub
- /properties/[slug] Property dossier
- /search Directory search (city, neighbourhood, brand)
- /collections Editorial collections
- /operators For operators
- /corporate For mobility teams
- /contact Contact
- /about About
- /resources Resources
- /insights Journal (thin)
- /awards Awards (thin)
- /privacy Privacy
- /terms Terms
- /admin Administration stub

## Notes

This is a public directory. There is no account system. /admin is a stub only.

