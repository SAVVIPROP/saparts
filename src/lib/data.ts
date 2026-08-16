import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type { City, Listing, SearchFilters } from "./types";
import { galleryUrls } from "./media";
import { unitTypeName } from "./format";
import { collectionMatch } from "./collections";
import { PAGE_SIZE } from "./constants";
export { PAGE_SIZE } from "./constants";

const DATA_DIR = join(process.cwd(), "data");

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function getCities(): City[] {
  noStore();
  const cities = readJson<City[]>(join(DATA_DIR, "cities.json"), []);
  return cities.filter((c) => c?.slug && c?.name);
}

export function getLaunchCities(): City[] {
  return getCities().filter((c) => c.launch !== false);
}

export function getCity(slug: string): City | undefined {
  return getCities().find((c) => c.slug === slug);
}

export function getPropertiesForCity(citySlug: string): Listing[] {
  noStore();
  const rows = readJson<Listing[]>(join(DATA_DIR, "properties", `${citySlug}.json`), []);
  return rows.filter((p) => p?.slug && p.published !== false);
}

export function getAllProperties(): Listing[] {
  noStore();
  const dir = join(DATA_DIR, "properties");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const listings: Listing[] = [];
  for (const file of files) {
    const rows = readJson<Listing[]>(join(dir, file), []);
    for (const row of rows) {
      if (row?.slug && row.published !== false) listings.push(row);
    }
  }
  return listings;
}

export function getProperty(slug: string): Listing | undefined {
  return getAllProperties().find((p) => p.slug === slug);
}

function haystack(p: Listing): string {
  return [p.name, p.brand, p.neighborhood, p.tagline, p.description, p.operatorGroup, p.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function unitNames(p: Listing): string[] {
  return (p.unitTypes ?? []).map(unitTypeName);
}

export function searchProperties(filters: SearchFilters): Listing[] {
  const q = (filters.q ?? "").trim().toLowerCase();
  const city = (filters.city ?? "").trim().toLowerCase();
  const neighborhood = (filters.neighborhood ?? "").trim().toLowerCase();
  const brand = (filters.brand ?? "").trim().toLowerCase();
  const category = (filters.category ?? "").trim().toLowerCase();
  const unitType = (filters.unitType ?? "").trim().toLowerCase();
  const bestFor = (filters.bestFor ?? "").trim().toLowerCase();
  const collection = (filters.collection ?? "").trim().toLowerCase();

  return getAllProperties().filter((p) => {
    if (city && (p.citySlug ?? "").toLowerCase() !== city) return false;
    if (neighborhood && !(p.neighborhood ?? "").toLowerCase().includes(neighborhood)) return false;
    if (brand && !(p.brand ?? "").toLowerCase().includes(brand)) return false;
    if (category && (p.category ?? "").toLowerCase() !== category) return false;
    if (unitType) {
      const units = unitNames(p).map((u) => u.toLowerCase());
      if (!units.some((u) => u.includes(unitType))) return false;
    }
    if (bestFor) {
      const tags = (p.bestForTags ?? []).map((t) => t.toLowerCase());
      const amen = (p.amenities ?? []).map((a) => a.toLowerCase());
      const blob = [...tags, ...amen, haystack(p)].join(" ");
      const key = bestFor.replace(/^best for /, "").replace(/s$/, "");
      if (!blob.includes(key) && !blob.includes(bestFor)) return false;
    }
    if (collection && !collectionMatch(p, collection)) return false;
    if (q && !haystack(p).includes(q)) return false;
    return true;
  });
}

export function paginate<T>(items: T[], page = 1, size = PAGE_SIZE) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    total,
    page: current,
    pages,
    size,
  };
}

export function uniqueNeighborhoods(citySlug?: string): string[] {
  const source = citySlug ? getPropertiesForCity(citySlug) : getAllProperties();
  return [...new Set(source.map((p) => p.neighborhood).filter((v): v is string => Boolean(v)))].sort();
}

export function uniqueBrands(citySlug?: string): string[] {
  const source = citySlug ? getPropertiesForCity(citySlug) : getAllProperties();
  return [...new Set(source.map((p) => p.brand).filter((v): v is string => Boolean(v)))].sort();
}

export function uniqueCategories(citySlug?: string): string[] {
  const source = citySlug ? getPropertiesForCity(citySlug) : getAllProperties();
  return [...new Set(source.map((p) => p.category).filter((v): v is string => Boolean(v)))].sort();
}

export function listingsForCollection(slug: string): Listing[] {
  return getAllProperties().filter((p) => collectionMatch(p, slug));
}

export function listingsBySlugs(slugs: string[]): Listing[] {
  const set = new Set(slugs);
  const order = new Map(slugs.map((s, i) => [s, i]));
  return getAllProperties()
    .filter((p) => set.has(p.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}

export function directoryStats() {
  const cities = getLaunchCities();
  const properties = getAllProperties();
  const withPhotos = properties.filter((p) => galleryUrls(p).length > 0).length;
  const withPrices = properties.filter(
    (p) => typeof p.priceFromMonthlyUsd === "number" && p.priceFromMonthlyUsd > 0,
  ).length;
  const withScores = properties.filter((p) => typeof p.ratingScore === "number" && p.ratingScore > 0);
  return {
    launchCities: cities.length,
    forthcomingCities: getCities().length - cities.length,
    properties: properties.length,
    brands: uniqueBrands().length,
    withPhotos,
    withPrices,
    tierI: withScores.filter((p) => Number(p.ratingScore) >= 9).length,
  };
}

export function cityListingCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of getAllProperties()) {
    counts[p.citySlug] = (counts[p.citySlug] || 0) + 1;
  }
  return counts;
}

export function cityMedianMonthlyUsd(citySlug: string): number | null {
  const prices = getPropertiesForCity(citySlug)
    .map((p) => p.priceFromMonthlyUsd)
    .filter((n): n is number => typeof n === "number" && n > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return null;
  return prices[Math.floor(prices.length / 2)];
}

export function citiesWithRates() {
  return getLaunchCities()
    .map((c) => ({ ...c, avgMonthlyRateUsd: cityMedianMonthlyUsd(c.slug), count: getPropertiesForCity(c.slug).length }))
    .filter((c) => c.avgMonthlyRateUsd != null);
}

export function featuredPhotographed(limit = 6): Listing[] {
  return getAllProperties()
    .map((p) => ({ p, n: galleryUrls(p).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((x) => x.p);
}

export function listingsWithScores(): Listing[] {
  return getAllProperties()
    .filter((p) => typeof p.ratingScore === "number" && p.ratingScore > 0)
    .sort((a, b) => Number(b.ratingScore) - Number(a.ratingScore));
}

export function relatedInCity(listing: Listing, limit = 3): Listing[] {
  return getPropertiesForCity(listing.citySlug)
    .filter((p) => p.slug !== listing.slug)
    .sort((a, b) => galleryUrls(b).length - galleryUrls(a).length)
    .slice(0, limit);
}
