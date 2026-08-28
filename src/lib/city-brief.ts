import type { Listing } from "./types.ts";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export type DistrictCount = { name: string; count: number };

export type CityRegisterSummary = {
  residences: number;
  brands: number;
  operators: number;
  districts: DistrictCount[];
  pricedUsd: number;
  medianUsd: number | null;
  kitchen: number;
  minStayCount: number;
  minStayValues: number[];
};

function hasKitchen(p: Listing): boolean {
  const amen = (p.amenities ?? []).join(" ");
  const units = JSON.stringify(p.unitTypes ?? []);
  return /kitchen/i.test(`${amen} ${units}`);
}

export function summarizeCityPack(listings: Listing[]): CityRegisterSummary {
  const brands = new Set<string>();
  const operators = new Set<string>();
  const neigh = new Map<string, number>();
  const prices: number[] = [];
  const stays = new Set<number>();
  let kitchen = 0;
  let minStayCount = 0;

  for (const p of listings) {
    if (p.brand?.trim()) brands.add(p.brand.trim());
    if (p.operatorGroup?.trim()) operators.add(p.operatorGroup.trim());
    if (p.neighborhood?.trim()) {
      const name = p.neighborhood.trim();
      neigh.set(name, (neigh.get(name) || 0) + 1);
    }
    if (typeof p.priceFromMonthlyUsd === "number" && p.priceFromMonthlyUsd > 0) {
      prices.push(p.priceFromMonthlyUsd);
    }
    if (typeof p.minStayNights === "number" && p.minStayNights > 0) {
      minStayCount += 1;
      stays.add(p.minStayNights);
    }
    if (hasKitchen(p)) kitchen += 1;
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const districts = [...neigh.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    residences: listings.length,
    brands: brands.size,
    operators: operators.size,
    districts,
    pricedUsd: prices.length,
    medianUsd: sorted.length ? sorted[Math.floor(sorted.length / 2)] : null,
    kitchen,
    minStayCount,
    minStayValues: [...stays].sort((a, b) => a - b),
  };
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Factual sentences from the listing pack only. No travel-guide filler. */
export function cityRegisterBrief(cityName: string, s: CityRegisterSummary): string[] {
  if (s.residences === 0) {
    return [
      `The register for ${cityName} is empty. No residences are filed in this volume. We will not invent inventory.`,
    ];
  }

  const lines: string[] = [];

  const who: string[] = [];
  if (s.brands) who.push(plural(s.brands, "brand", "brands"));
  if (s.operators) who.push(plural(s.operators, "operator group", "operator groups"));
  lines.push(
    who.length
      ? `The ${cityName} register files ${plural(s.residences, "residence", "residences")} from ${who.join(" and ")}.`
      : `The ${cityName} register files ${plural(s.residences, "residence", "residences")}.`,
  );

  if (s.districts.length) {
    const top = s.districts.slice(0, 5).map((d) => `${d.name} (${d.count})`);
    lines.push(
      `${plural(s.districts.length, "district is", "districts are")} on file. Deepest filed stock: ${top.join(", ")}.`,
    );
  }

  if (s.pricedUsd && s.medianUsd != null) {
    lines.push(
      `A monthly USD figure is filed on ${s.pricedUsd} of ${s.residences} residences. The median of those filed figures is ${formatUsd(s.medianUsd)}. Residences without a figure remain on request.`,
    );
  } else {
    lines.push(`No monthly USD figure is filed in this pack. Residences remain on request.`);
  }

  const extras: string[] = [];
  if (s.kitchen) extras.push(`a kitchen or kitchenette is filed on ${s.kitchen}`);
  if (s.minStayCount) {
    extras.push(
      `a minimum stay is filed on ${s.minStayCount} (${s.minStayValues.join(", ")} nights)`,
    );
  }
  if (extras.length) {
    const [first, ...rest] = extras;
    lines.push(`On the rows as filed, ${first}${rest.length ? `; ${rest.join("; ")}` : ""}.`);
  }

  return lines;
}
