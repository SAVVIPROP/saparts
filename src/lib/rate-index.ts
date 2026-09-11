export type PricedMarket = {
  slug: string;
  name: string;
  avgMonthlyRateUsd: number;
};

/**
 * Highest and best-value must be different markets whenever two filed medians exist.
 * A single priced city is reported as highest only — never as both.
 */
export function rateIndexHighlights<T extends PricedMarket>(priced: T[]): {
  highest: T | null;
  bestValue: T | null;
} {
  if (!priced.length) return { highest: null, bestValue: null };

  const byHigh = [...priced].sort(
    (a, b) => b.avgMonthlyRateUsd - a.avgMonthlyRateUsd || a.name.localeCompare(b.name),
  );
  const byLow = [...priced].sort(
    (a, b) => a.avgMonthlyRateUsd - b.avgMonthlyRateUsd || a.name.localeCompare(b.name),
  );
  const highest = byHigh[0];
  const bestValue = byLow.find((c) => c.slug !== highest.slug) ?? null;
  return { highest, bestValue };
}
