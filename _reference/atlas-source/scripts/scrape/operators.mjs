// Focused operator registry: five brands we can reliably parse from static HTML.
export const OPERATORS = [
  {
    slug: "sonder",
    brand: "Sonder",
    category: "design-aparthotel",
    home: "https://www.sonder.com",
    // Sonder's /destinations index contains city/country links; each city page links to property pages.
    indexUrls: [
      "https://www.sonder.com/destinations",
    ],
    // property detail URL shape: /destinations/<city>/<property-slug>
    propertyUrlTest: /^https:\/\/www\.sonder\.com\/destinations\/[a-z0-9-]+\/[a-z0-9-]+\/?$/i,
    linkDiscoveryDepth: 2,
  },
  {
    slug: "cheval",
    brand: "Cheval Collection",
    category: "serviced-residence",
    home: "https://www.chevalcollection.com",
    indexUrls: [
      "https://www.chevalcollection.com/",
    ],
    propertyUrlTest: /^https:\/\/www\.chevalcollection\.com\/(?:en\/)?(?:cheval-|residences\/)[a-z0-9-]+\/?$/i,
    linkDiscoveryDepth: 1,
  },
  {
    slug: "mint-house",
    brand: "Mint House",
    category: "tech-enabled-apartment",
    home: "https://minthouse.com",
    indexUrls: [
      "https://minthouse.com/",
      "https://minthouse.com/locations",
    ],
    propertyUrlTest: /^https:\/\/minthouse\.com\/stay\/[a-z0-9-]+\/?$/i,
    linkDiscoveryDepth: 2,
  },
  {
    slug: "locke",
    brand: "Locke (Edyn)",
    category: "design-aparthotel",
    home: "https://www.lockeliving.com",
    indexUrls: [
      "https://www.lockeliving.com/",
      "https://www.lockeliving.com/en",
    ],
    // e.g. /en/london/buckle-street-studios, /en/berlin/schwan-locke
    propertyUrlTest: /^https:\/\/www\.lockeliving\.com\/(?:en\/)?[a-z0-9-]+\/[a-z0-9-]+\/?$/i,
    linkDiscoveryDepth: 2,
  },
  {
    slug: "blueground",
    brand: "Blueground",
    category: "furnished-apartment",
    home: "https://www.theblueground.com",
    // city index pages (the site's /furnished-apartments-<city> route) — each lists many apartments.
    indexUrls: [
      "https://www.theblueground.com/furnished-apartments-london",
      "https://www.theblueground.com/furnished-apartments-new-york",
      "https://www.theblueground.com/furnished-apartments-paris",
      "https://www.theblueground.com/furnished-apartments-dubai",
      "https://www.theblueground.com/furnished-apartments-berlin",
      "https://www.theblueground.com/furnished-apartments-boston",
      "https://www.theblueground.com/furnished-apartments-chicago",
      "https://www.theblueground.com/furnished-apartments-los-angeles",
      "https://www.theblueground.com/furnished-apartments-san-francisco",
      "https://www.theblueground.com/furnished-apartments-washington-dc",
      "https://www.theblueground.com/furnished-apartments-seattle",
      "https://www.theblueground.com/furnished-apartments-miami",
      "https://www.theblueground.com/furnished-apartments-austin",
      "https://www.theblueground.com/furnished-apartments-madrid",
      "https://www.theblueground.com/furnished-apartments-istanbul",
    ],
    propertyUrlTest: /^https:\/\/www\.theblueground\.com\/furnished-apartments-[a-z0-9-]+\/[a-z0-9-]+(?:\/[a-z0-9-]+)?\/?$/i,
    linkDiscoveryDepth: 2,
  },
];
