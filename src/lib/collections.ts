import type { Listing } from "./types";
import { unitTypeName } from "./format";

export type CollectionDef = {
  slug: string;
  symbol: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
};

export const COLLECTIONS: CollectionDef[] = [
  {
    slug: "executives",
    symbol: "◈",
    title: "Best for Executives",
    subtitle: "Premium serviced apartments for senior professionals and C-suite travellers.",
    description:
      "Curated for executives who require a seamless transition between home and office. Properties selected for workspace quality, concierge-level service, proximity to business districts, and the discretion that senior professionals demand.",
    tags: ["High-speed WiFi", "Dedicated workspace", "Concierge service", "Business district", "Premium finish"],
  },
  {
    slug: "families",
    symbol: "◇",
    title: "Best for Families",
    subtitle: "Spacious serviced apartments designed for families on extended stays.",
    description:
      "Multi-bedroom apartments with fully equipped kitchens, laundry facilities, and child-friendly amenities. Selected for proximity to international schools, parks, and family services.",
    tags: ["2+ bedrooms", "Full kitchen", "Laundry", "Child-friendly", "Near schools"],
  },
  {
    slug: "luxury",
    symbol: "◉",
    title: "Luxury Residences",
    subtitle: "The world's finest serviced apartments and branded residences.",
    description:
      "Five-star serviced apartments and branded residences where hotel-grade service meets the privacy and space of a private home.",
    tags: ["5-star service", "Designer interiors", "Spa & wellness", "Private dining", "Butler service"],
  },
  {
    slug: "remote-work",
    symbol: "◐",
    title: "Remote Work Ready",
    subtitle: "Serviced apartments built for digital nomads and remote professionals.",
    description:
      "Properties verified for high-speed fibre connectivity, ergonomic workspaces, and the infrastructure that remote professionals require.",
    tags: ["Fibre broadband", "Ergonomic desk", "Co-working access", "Quiet environment", "Multiple screens"],
  },
  {
    slug: "pet-friendly",
    symbol: "△",
    title: "Pet-Friendly Stays",
    subtitle: "Serviced apartments that welcome your pets without compromise.",
    description:
      "A curated selection of serviced apartments with confirmed pet policies — including weight limits, breed restrictions, and pet deposit terms.",
    tags: ["Pets welcome", "Near parks", "Ground floor options", "Pet deposit terms", "Outdoor space"],
  },
  {
    slug: "long-stay",
    symbol: "◎",
    title: "Extended Stay",
    subtitle: "Serviced apartments optimised for stays of three months or longer.",
    description:
      "Properties offering monthly rate discounts, flexible lease terms, and the domestic infrastructure — full kitchens, laundry, storage — that make long-term living genuinely comfortable.",
    tags: ["Monthly rates", "Full kitchen", "Laundry in-unit", "Storage", "Flexible terms"],
  },
  {
    slug: "corporate-relocation",
    symbol: "◑",
    title: "Corporate Relocation",
    subtitle: "Serviced apartments for corporate mobility and international assignments.",
    description:
      "Properties selected for their experience with corporate clients — including invoice billing, corporate rate programmes, HR liaison services, and assignment flexibility.",
    tags: ["Invoice billing", "Corporate rates", "HR liaison", "Flexible check-in", "Assignment terms"],
  },
  {
    slug: "short-stay",
    symbol: "◆",
    title: "Short Stay & Flexible",
    subtitle: "Serviced apartments available for stays from one night to one month.",
    description:
      "Properties offering daily and weekly rates alongside their monthly programmes — ideal for project-based work and trial relocations.",
    tags: ["Daily rates", "Weekly rates", "Flexible check-out", "No minimum stay", "Instant booking"],
  },
  {
    slug: "wellness",
    symbol: "◈",
    title: "Wellness & Fitness",
    subtitle: "Serviced apartments with premium wellness and fitness facilities.",
    description:
      "Properties selected for the quality of their wellness offering — including gym, pool, spa, and access to outdoor fitness.",
    tags: ["Gym on-site", "Swimming pool", "Spa access", "Yoga studio", "Running routes"],
  },
  {
    slug: "couples",
    symbol: "♡",
    title: "Couples & Romance",
    subtitle: "Intimate serviced apartments for couples on extended stays.",
    description:
      "Studio and one-bedroom apartments selected for their ambience, design quality, and the intimacy that couples require.",
    tags: ["Studio & 1-bed", "High design", "Quiet location", "Romantic setting", "City views"],
  },
  {
    slug: "airport-access",
    symbol: "◁",
    title: "Airport Access",
    subtitle: "Serviced apartments with direct or rapid access to major airports.",
    description:
      "Properties within easy reach of a major international airport — selected for frequent travellers and aircrew.",
    tags: ["30 min to airport", "Transit links", "Early check-in", "Late check-out", "Luggage storage"],
  },
  {
    slug: "groups",
    symbol: "◇",
    title: "Groups & Teams",
    subtitle: "Large serviced apartments for teams, groups, and multi-person relocations.",
    description:
      "Three-bedroom and larger apartments, plus properties that can accommodate multiple bookings in the same building.",
    tags: ["3+ bedrooms", "Multiple units", "Group rates", "Meeting space", "Team billing"],
  },
];

export function getCollection(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

function blob(p: Listing): string {
  return [
    p.name,
    p.brand,
    p.category,
    p.neighborhood,
    p.tagline,
    p.description,
    ...(p.amenities ?? []),
    ...(p.unitTypes ?? []).map((u) => (typeof u === "string" ? u : u.name ?? "")),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasAmen(p: Listing, keys: string[]): boolean {
  const amen = (p.amenities ?? []).map((a) => a.toLowerCase());
  return keys.some((k) => amen.some((a) => a.includes(k)));
}

function units(p: Listing): string[] {
  return (p.unitTypes ?? []).map((u) => (typeof u === "string" ? u : u.name ?? "")).map((s) => s.toLowerCase());
}

export function collectionMatch(p: Listing, slug: string): boolean {
  const text = blob(p);
  const u = units(p);
  switch (slug) {
    case "executives":
      return hasAmen(p, ["workspace", "desk", "concierge", "business"]) || /workspace|concierge|business district|financial/.test(text);
    case "families":
      return u.some((x) => /2-bed|3-bed|4-bed|family|two bed|three bed/.test(x)) || hasAmen(p, ["laundry", "family", "child"]);
    case "luxury":
      return (p.category ?? "").toLowerCase() === "penthouse" || hasAmen(p, ["spa", "butler", "pool"]) || /luxury|penthouse|cheval|four seasons|mandarin|rosewood/.test(text);
    case "remote-work":
      return hasAmen(p, ["wifi", "workspace", "desk", "cowork", "co-work"]) || /workspace|fibre|fiber|cowork/.test(text);
    case "pet-friendly":
      return hasAmen(p, ["pet"]) || /pet[- ]?friendly|pets welcome|dogs welcome/.test(text);
    case "long-stay":
      return hasAmen(p, ["laundry", "kitchen", "washer"]) || (p.minStayNights != null && p.minStayNights >= 28) || /extended stay|monthly/.test(text);
    case "corporate-relocation":
      return hasAmen(p, ["concierge", "workspace"]) || /corporate|relocation|assignment/.test(text);
    case "short-stay":
      return p.minStayNights != null && p.minStayNights <= 7;
    case "wellness":
      return hasAmen(p, ["gym", "pool", "spa", "fitness", "yoga"]);
    case "couples":
      return u.some((x) => /studio|1-bed|one[- ]bed/.test(x)) && !u.some((x) => /3-bed|4-bed/.test(x));
    case "airport-access":
      return /airport|heathrow|cdg|jfk|dxb|haneda|changi|narita|gatwick/.test(text);
    case "groups":
      return u.some((x) => /3-bed|4-bed|three bed|four bed|penthouse/.test(x));
    default:
      return false;
  }
}
