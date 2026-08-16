export function formatUSD(n: number | null | undefined, opts?: { compact?: boolean }) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const num = Number(n);
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(num);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}

export function priceRangeDaily(from?: number | null, to?: number | null) {
  if (from && to) return `${formatUSD(from)}–${formatUSD(to)} / night`;
  if (from) return `From ${formatUSD(from)} / night`;
  return "On request";
}

export function priceRangeMonthly(from?: number | null, to?: number | null) {
  if (from && to) return `${formatUSD(from)}–${formatUSD(to)} / month`;
  if (from) return `From ${formatUSD(from)} / month`;
  return "On request";
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

export function titleCaseTag(s: string) {
  return s
    .split(/[\s-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
