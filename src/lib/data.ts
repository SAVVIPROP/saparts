import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type { City, Listing, SearchFilters } from "./types";

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

export function searchProperties(filters: SearchFilters): Listing[] {
  const q = (filters.q ?? "").trim().toLowerCase();
  const city = (filters.city ?? "").trim().toLowerCase();
  const neighborhood = (filters.neighborhood ?? "").trim().toLowerCase();
  const brand = (filters.brand ?? "").trim().toLowerCase();

  return getAllProperties().filter((p) => {
    if (city && (p.citySlug ?? "").toLowerCase() !== city) return false;
    if (neighborhood && !(p.neighborhood ?? "").toLowerCase().includes(neighborhood)) return false;
    if (brand && !(p.brand ?? "").toLowerCase().includes(brand)) return false;
    if (q) {
      const hay = [p.name, p.brand, p.neighborhood, p.tagline, p.description, p.operatorGroup]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueNeighborhoods(citySlug?: string): string[] {
  const source = citySlug ? getPropertiesForCity(citySlug) : getAllProperties();
  return [...new Set(source.map((p) => p.neighborhood).filter((v): v is string => Boolean(v)))].sort();
}

export function uniqueBrands(citySlug?: string): string[] {
  const source = citySlug ? getPropertiesForCity(citySlug) : getAllProperties();
  return [...new Set(source.map((p) => p.brand).filter((v): v is string => Boolean(v)))].sort();
}

export function directoryStats() {
  const cities = getLaunchCities();
  const properties = getAllProperties();
  return {
    launchCities: cities.length,
    forthcomingCities: getCities().length - cities.length,
    properties: properties.length,
    brands: uniqueBrands().length,
  };
}
