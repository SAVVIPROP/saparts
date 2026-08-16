import type { Listing, UnitType } from "./types";

export function unitTypeName(unit: string | UnitType): string {
  if (typeof unit === "string") return unit;
  return unit.name || "Residence";
}

export function unitTypeMeta(unit: string | UnitType): string[] {
  if (typeof unit === "string") return [];
  const bits: string[] = [];
  if (unit.sizeSqm) bits.push(`${unit.sizeSqm} m²`);
  if (unit.maxOccupancy) bits.push(`Sleeps ${unit.maxOccupancy}`);
  if (Array.isArray(unit.beds) && unit.beds.length) bits.push(unit.beds.join(", "));
  else if (typeof unit.beds === "string" && unit.beds) bits.push(unit.beds);
  return bits;
}

export function formatUSD(n: number | null | undefined, opts?: { compact?: boolean }) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const num = Number(n);
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function priceRangeMonthly(from?: number | null, to?: number | null) {
  if (from && to) return `${formatUSD(from)}–${formatUSD(to)} / month`;
  if (from) return `From ${formatUSD(from)} / month`;
  return "On request";
}

export function formatPrice(listing: Listing): string | null {
  if (typeof listing.priceFromMonthlyUsd === "number" && listing.priceFromMonthlyUsd > 0) {
    return `From USD ${listing.priceFromMonthlyUsd.toLocaleString("en-US")} / month`;
  }
  if (
    typeof listing.priceFromMonthlyNative === "number" &&
    listing.priceFromMonthlyNative > 0 &&
    listing.priceCurrencyNative
  ) {
    return `From ${listing.priceCurrencyNative} ${listing.priceFromMonthlyNative.toLocaleString("en-US")} / month`;
  }
  return listing.priceNotes?.trim() || null;
}

export function regionOrder(region: string): number {
  const order = ["Europe", "Americas", "Asia-Pacific", "Oceania", "Middle East & Africa", "Asia"];
  const i = order.indexOf(region);
  return i === -1 ? 99 : i;
}

export function titleCaseTag(s: string) {
  return s
    .split(/[\s-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function cleanDescription(text?: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/You might be eligible for a Genius discount at [^.]+\./gi, "")
    .replace(/Genius discounts[^.]+\./gi, "")
    .replace(/Sign in[^.]+discount[^.]+\./gi, "")
    .trim();
}

export function dedupeAddress(addr?: string | null): string | null {
  if (!addr) return null;
  const parts = addr.split(",").map((p) => p.trim());
  const seen = new Set<string>();
  const unique = parts.filter((p) => {
    const key = p.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.join(", ");
}
