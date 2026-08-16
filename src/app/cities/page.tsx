import type { Metadata } from "next";
import Link from "next/link";
import { getCities, cityListingCounts, citiesWithRates, directoryStats } from "@/lib/data";
import { formatUSD } from "@/lib/format";
import { CitiesClient } from "./CitiesClient";

export const metadata: Metadata = {
  title: "The Atlas",
  description: "Browse launch and forthcoming cities in the SAparts Atlas.",
};

export default function CitiesPage() {
  const cities = getCities();
  const counts = cityListingCounts();
  const rates = Object.fromEntries(citiesWithRates().map((c) => [c.slug, c.avgMonthlyRateUsd]));
  const stats = directoryStats();
  const rows = cities.map((c) => ({
    slug: c.slug,
    name: c.name,
    country: c.country,
    region: c.region,
    launch: c.launch !== false,
    count: counts[c.slug] || 0,
    avgMonthlyRateUsd: rates[c.slug] ?? null,
  }));
  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">§ 01</span>
              <span className="eyebrow">The Atlas · Volume I · {cities.length} markets</span>
            </div>
            <h1 className="display text-[2.2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem]">
              {cities.length} cities, <em>quietly</em> indexed for the long stay.
            </h1>
            <p className="mt-7 text-[1.05rem] text-muted-foreground max-w-2xl leading-[1.7] font-serif">
              A working atlas for extended stays — from the financial quarters of London and New York to the residential enclaves of Tokyo, Singapore and Dubai. Forthcoming markets keep a designed empty state until a listing pack is filed.
            </p>
          </div>
          <div className="lg:col-span-4 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <div className="stat-label">Markets indexed</div>
              <div className="stat-value mt-1">{cities.length}</div>
            </div>
            <div>
              <div className="stat-label">Residences</div>
              <div className="stat-value mt-1">{stats.properties}</div>
            </div>
            <div>
              <div className="stat-label">Launch cities</div>
              <div className="stat-value mt-1">{stats.launchCities}</div>
            </div>
            <div>
              <div className="stat-label">Forthcoming</div>
              <div className="stat-value mt-1">{stats.forthcomingCities}</div>
            </div>
          </div>
        </div>
      </section>
      <CitiesClient rows={rows} />
    </div>
  );
}
