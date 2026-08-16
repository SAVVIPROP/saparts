"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatUSD } from "@/lib/format";

const REGIONS = ["All", "Europe", "Americas", "Asia-Pacific", "Middle East & Africa", "Oceania"] as const;

type Row = {
  slug: string;
  name: string;
  country: string;
  region: string;
  launch: boolean;
  count: number;
  avgMonthlyRateUsd: number | null;
};

export function CitiesClient({ rows }: { rows: Row[] }) {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [view, setView] = useState<"index" | "atlas">("index");
  const filtered = useMemo(() => {
    const list = region === "All" ? rows : rows.filter((c) => c.region === region);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, region]);

  return (
    <>
      <section className="hairline-bottom sticky top-[56px] sm:top-[64px] z-30 bg-ivory">
        <div className="container py-3 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="tracker-muted mr-3">Region</span>
            {REGIONS.map((r) => (
              <button key={r} onClick={() => setRegion(r)} className={`tracker px-2.5 py-1 ${region === r ? "bg-charcoal text-ivory" : "hover:text-forest"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="tracker-muted mr-3">View</span>
            <button onClick={() => setView("index")} className={`tracker px-2.5 py-1 ${view === "index" ? "bg-charcoal text-ivory" : "hover:text-forest"}`}>Index</button>
            <button onClick={() => setView("atlas")} className={`tracker px-2.5 py-1 ${view === "atlas" ? "bg-charcoal text-ivory" : "hover:text-forest"}`}>Atlas</button>
          </div>
        </div>
      </section>
      {view === "index" ? (
        <section>
          <div className="container py-8 sm:py-10 lg:py-14">
            <div className="hairline-top hairline-bottom">
              <div className="hidden sm:grid grid-cols-12 gap-3 py-3 tracker-muted">
                <div className="col-span-1">#</div>
                <div className="col-span-4">City</div>
                <div className="col-span-3">Region</div>
                <div className="col-span-2 text-right">Indexed</div>
                <div className="col-span-2 text-right">Avg / month</div>
              </div>
              {filtered.map((c, i) => (
                <Link key={c.slug} href={`/cities/${c.slug}`} className="block group">
                  <div className="hidden sm:grid grid-cols-12 gap-3 py-4 border-t border-border items-baseline">
                    <div className="col-span-1 row-rank">{String(i + 1).padStart(2, "0")}</div>
                    <div className="col-span-4 min-w-0">
                      <div className="font-serif text-[1.4rem] leading-tight group-hover:text-forest">{c.name}</div>
                      <div className="tracker-muted mt-0.5">{c.country}{!c.launch ? " · Forthcoming" : ""}</div>
                    </div>
                    <div className="col-span-3 tracker">{c.region}</div>
                    <div className="col-span-2 text-right font-mono">{c.count}</div>
                    <div className="col-span-2 text-right font-mono">{c.avgMonthlyRateUsd ? formatUSD(c.avgMonthlyRateUsd) : "—"}</div>
                  </div>
                  <div className="sm:hidden border-t border-border py-4 grid grid-cols-[2.4rem_1fr_auto] gap-2">
                    <div className="row-rank">{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <div className="font-serif text-[1.25rem] group-hover:text-forest">{c.name}</div>
                      <div className="tracker-muted mt-0.5">{c.country} · {c.region}</div>
                      <div className="tracker mt-1">{c.count} indexed</div>
                    </div>
                    <div className="text-right font-mono">{c.avgMonthlyRateUsd ? `$${(c.avgMonthlyRateUsd / 1000).toFixed(1)}k` : "—"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="container py-8 sm:py-10 lg:py-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {filtered.map((c, i) => (
                <Link key={c.slug} href={`/cities/${c.slug}`} className="group block">
                  <div className="relative aspect-[5/4] overflow-hidden bg-ivory-warm border border-border">
                    <div className="absolute inset-0 bg-gradient-to-br from-ivory-warm to-stone/40" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-ivory/90 px-2 py-0.5 text-[0.65rem] tracking-[0.2em] uppercase">
                        {String(i + 1).padStart(2, "0")} · {c.region}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="font-serif text-[1.6rem] leading-tight group-hover:text-forest">{c.name}</div>
                    <div className="tracker-muted mt-1">{c.country}{!c.launch ? " · Forthcoming" : ""}</div>
                    <div className="hairline-top mt-3 pt-3 grid grid-cols-3 gap-2">
                      <div>
                        <div className="tracker-muted">Indexed</div>
                        <div className="mt-0.5 font-mono text-[0.95rem]">{c.count}</div>
                      </div>
                      <div>
                        <div className="tracker-muted">Avg / mo</div>
                        <div className="mt-0.5 font-mono text-[0.95rem]">{c.avgMonthlyRateUsd ? `$${(c.avgMonthlyRateUsd / 1000).toFixed(1)}k` : "—"}</div>
                      </div>
                      <div>
                        <div className="tracker-muted">Status</div>
                        <div className="mt-0.5 font-mono text-[0.95rem]">{c.launch ? "Live" : "Soon"}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
