export type Insight = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  readMinutes: number;
  featured?: boolean;
  publishedAt: string;
  body: string[];
};

export const INSIGHTS: Insight[] = [
  {
    slug: "relocating-to-london",
    title: "Relocating to London — The Serviced Apartment Playbook for Finance Executives",
    dek: "A working brief for mobility teams sending talent into the Square Mile, Canary Wharf, and the West End — neighbourhoods, commute, and what the register actually holds.",
    category: "Relocation",
    readMinutes: 8,
    featured: true,
    publishedAt: "2026-03-12",
    body: [
      "London remains the deepest serviced-apartment market in the SAparts register. For finance and professional-services assignments, the brief is rarely “find a hotel with a kitchen.” It is: a quiet one- or two-bed within a defensible commute of a trading floor, with a workspace that survives a 90-day stay.",
      "The City and Canary Wharf still concentrate the longest corporate stays. Residences filed in those districts tend to publish unit mixes (studio through two-bed) and hotel-grade services. West End and Marylebone listings more often trade on neighbourhood and building character. We do not invent rates; where a source file carries a monthly figure it appears on the residence page, otherwise the indication is “on request.”",
      "Visa and entry have tightened. UK ETA is now required for many visa-waiver nationals. Oyster or contactless remains the practical way to move; the Elizabeth Line has shortened Heathrow-to-Square-Mile time to under 40 minutes. Sunday trading hours and a 10–15% restaurant tip remain the small frictions that catch first-time assignees.",
      "Our London city dossier collects destination statistics, a living guide, and the current register. Use the directory filters for unit type and neighbourhood rather than assuming a “best for executives” tag exists on every record — tags appear only when the source file supplies them.",
    ],
  },
  {
    slug: "kitchen-test",
    title: "The Kitchen Test — Why Serviced Apartments Are Beating Hotels for Long Stays",
    dek: "A kitchen is not an amenity. For stays beyond two weeks it is the difference between a hotel bill and a working household.",
    category: "Lifestyle",
    readMinutes: 6,
    featured: true,
    publishedAt: "2026-02-18",
    body: [
      "The kitchen test is simple: can you cook a weeknight meal without improvising on a kettle and a minibar? Residences that pass it — a hob, a fridge that holds a shop, a sink you can actually use — are the ones mobility teams keep on file.",
      "Industry surveys continue to show serviced apartments 20–40% more cost-effective than equivalent hotels once a stay exceeds 30 nights. The saving is not only the nightly rate. It is groceries instead of room service, laundry in-building instead of valet, and a table that is not also the desk.",
      "When we file a residence we record unit types and amenities as supplied. “Full kitchen” and “laundry” appear only when the source says so. We do not upgrade a kitchenette into a kitchen in the copy.",
      "If you are comparing a hotel and a serviced apartment for the same city and stay length, the Resources calculator will show the arithmetic. The register will show which kitchens are actually on file.",
    ],
  },
  {
    slug: "methodology-note",
    title: "How the Register Is Built — A Methodology Note",
    dek: "If a claim cannot be traced to a verifiable source, it does not appear. That sentence is the whole product.",
    category: "Methodology",
    readMinutes: 5,
    featured: false,
    publishedAt: "2026-01-20",
    body: [
      "SAparts is an independent directory. Listings are imported from official city packs. We do not invent residences, photographs, or prices. Official listing photographs are copied from the city packs into self-hosted /listings/<slug>/ files. The gallery never hotlinks operator CDNs. A listing stays blank when no official file is on disk.",
      "Ratings and “Tier I” labels appear only when a source file carries a ratingScore. The current official packs do not. We will not fabricate a 9.0 so that a table looks full.",
      "City intelligence — visa notes, safety scores, checklists — is ported from the Atlas destination files and cited to the sources those files already name (IATA Timatic, Numbeo, UN Tourism, GSAIR). Forthcoming cities in cities.json render a designed empty state until a listing pack exists. We do not print a filesystem path as the user-facing message.",
      "Corrections: editorial@saparts.com. Verified corrections are applied to the next pack import.",
    ],
  },
  {
    slug: "corporate-mobility-brief",
    title: "A Brief for Mobility Teams — Policy-Safe Sourcing",
    dek: "Accommodation is nearly 30% of corporate travel spend. The register exists so that line is defensible.",
    category: "Corporate Mobility",
    readMinutes: 7,
    featured: false,
    publishedAt: "2026-04-02",
    body: [
      "Global mobility teams do not need another booking widget. They need a source-backed index: who operates the building, what unit types exist, whether a kitchen and workspace are on file, and a link to the official site.",
      "Enquiries and bookings go through SAparts. Residence pages do not send guests to the operator website.",
      "For an RFI, write from the Corporate page. Include city, stay length, unit mix, and any policy constraints (invoice billing, pet policy, minimum stay). We will not invent inventory to fill a gap — if the register is thin in a market, that is the answer.",
      "The Awards programme (2026) is editorial. No entry fees. Nominations close 31 August 2026. Results are not for sale.",
    ],
  },
  {
    slug: "city-guides-how-we-read-a-market",
    title: "How We Read a City — Atlas Dossiers",
    dek: "Each launch city is a dossier: brief, living guide, checklist, and the register. Forthcoming markets stay empty on purpose.",
    category: "City Guides",
    readMinutes: 6,
    featured: false,
    publishedAt: "2026-03-28",
    body: [
      "A city hub is not a gallery of the first six photographs we found. It is a working dossier: the editor’s brief (from destination notes), destination statistics with sources, visa and connectivity, a city checklist, then the register of residences actually filed for that slug.",
      "Launch cities in the current packs are Hong Kong, London, New York, Paris, Singapore, Dubai, and Tokyo. Forthcoming stubs — Sydney, Melbourne, Shanghai, Seoul, Amsterdam, Berlin, Los Angeles, Toronto — keep the same page chrome and a designed empty state. Destination intelligence still renders when the Atlas files have a match.",
      "Counts on the Atlas index are live: they are the length of each city JSON after dropping unpublished rows. Two New York rows that were dead (aka-united-nations, sonder-battery-park) are not in the pack.",
      "If you need a market that is not yet launched, the concierge widget will take the brief. It is UI-only until an LLM key is connected; the Contact page remains the reliable path.",
    ],
  },
];

export function getInsights(): Insight[] {
  return INSIGHTS;
}

export function getInsight(slug: string): Insight | undefined {
  return INSIGHTS.find((i) => i.slug === slug);
}

export const AWARDS = [
  {
    slug: "top-50",
    rank: "01",
    title: "Top 50 Serviced Apartment Awards",
    subtitle: "The definitive annual ranking of the world's finest serviced apartments.",
    description:
      "Recognising excellence across the full spectrum of the serviced apartment sector. Properties are evaluated on quality of accommodation, service standards, location, value, and guest experience.",
    criteria: ["Accommodation quality", "Service standards", "Location & connectivity", "Guest experience", "Value for extended stay"],
    color: "var(--brass)",
    category: "All Categories",
  },
  {
    slug: "top-30-luxury",
    rank: "02",
    title: "Top 30 Luxury Serviced Apartment Awards",
    subtitle: "The world's most exceptional luxury serviced residences and branded apartments.",
    description:
      "Celebrating the finest luxury serviced apartments globally — properties that deliver five-star hotel service with the space and privacy of a private residence.",
    criteria: ["Interior design & finish", "Personalised concierge service", "Exclusive amenities", "Privacy & security", "Culinary offering"],
    color: "#C9A84C",
    category: "Luxury",
  },
  {
    slug: "top-30-business",
    rank: "03",
    title: "Top 30 Business Serviced Apartment Awards",
    subtitle: "The leading serviced apartments for corporate travellers and mobility teams.",
    description:
      "Recognising the serviced apartments that best serve business professionals, corporate relocations, and extended-stay executives.",
    criteria: ["Workspace & connectivity", "Corporate services", "Business district proximity", "Flexible booking terms", "Corporate rate programmes"],
    color: "#4A6741",
    category: "Business Travel",
  },
  {
    slug: "top-50-family",
    rank: "04",
    title: "Top 50 Family Serviced Apartment Awards",
    subtitle: "The world's best serviced apartments for families and extended family stays.",
    description:
      "Honouring the serviced apartments that go above and beyond for families — space, safety, and home comforts for all ages.",
    criteria: ["Apartment space & layout", "Family amenities", "Child-friendly services", "Neighbourhood safety", "Kitchen & laundry facilities"],
    color: "#8B6F47",
    category: "Families",
  },
];
