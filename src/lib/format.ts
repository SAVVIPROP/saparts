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
