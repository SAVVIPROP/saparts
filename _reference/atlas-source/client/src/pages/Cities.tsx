import { Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatUSD } from "@/lib/format";
import { usePageMeta } from "@/hooks/usePageMeta";

const REGIONS = ["All", "Europe", "Americas", "Asia-Pacific", "Middle East & Africa"] as const;

export default function Cities() {
  const { data: cities = [], isLoading } = trpc.cities.list.useQuery();
  const { data: properties = [] } = trpc.properties.search.useQuery({ limit: 1000 });
  const { data: globalStats } = trpc.stats.global.useQuery();
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [view, setView] = useState<"index" | "atlas">("index");

  usePageMeta(
    "The Atlas — SAparts",
    "Browse 30 global cities in the SAparts Atlas. Compare serviced apartment supply, pricing, and tier distribution across Europe, Americas, Asia-Pacific, and the Middle East."
  );

  const counts = useMemo(() => {
    const m: Record<number, number> = {};
    properties.forEach((p: any) => (m[p.cityId] = (m[p.cityId] || 0) + 1));
    return m;
  }, [properties]);

  const filtered = useMemo(() => {
    const list = (region === "All" ? cities : cities.filter((c: any) => c.region === region)) as any[];
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, region]);

  return (
    <div>
      {/* Masthead */}
      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">§ 01</span>
              <span className="eyebrow">The Atlas · Volume I · {cities.length} markets</span>
            </div>
            <h1 className="display text-[2.2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem]">
              {cities.length ? `${cities.length} cities,` : "Our cities,"} <em>quietly</em> indexed for the long stay.
            </h1>
            <p
              className="mt-7 text-[1.05rem] text-muted-foreground max-w-2xl leading-[1.7]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              A working atlas for extended stays — from the financial quarters of London and New York
              to the residential enclaves of Tokyo, Singapore and Zurich. Each entry is a point of
              departure, not a catalogue.
            </p>
          </div>
          <div className="lg:col-span-4 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-7">
            <Stat label="Markets indexed" value={globalStats?.totalCities || cities.length} />
            <Stat label="Residences" value={globalStats?.totalProperties || properties.length} />
            <Stat
              label="Avg. monthly"
              value={
                cities.length
                  ? `$${(
                      cities.reduce((s: number, c: any) => s + (c.avgMonthlyRateUsd || 0), 0) /
                      cities.filter((c: any) => c.avgMonthlyRateUsd).length /
                      1000
                    ).toFixed(1)}k`
                  : "—"
              }
              raw
            />
            <Stat label="Regions covered" value={4} />
          </div>
        </div>
      </section>

      {/* Filter strip */}
      <section className="hairline-bottom sticky top-[56px] sm:top-[64px] z-30 bg-ivory">
        <div className="container py-3 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="tracker-muted mr-3">Region</span>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`tracker px-2.5 py-1 transition ${
                  region === r ? "bg-charcoal text-ivory" : "hover:text-forest"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="tracker-muted mr-3">View</span>
            <button
              onClick={() => setView("index")}
              className={`tracker px-2.5 py-1 transition ${
                view === "index" ? "bg-charcoal text-ivory" : "hover:text-forest"
              }`}
            >
              Index
            </button>
            <button
              onClick={() => setView("atlas")}
              className={`tracker px-2.5 py-1 transition ${
                view === "atlas" ? "bg-charcoal text-ivory" : "hover:text-forest"
              }`}
            >
              Atlas
            </button>
          </div>
        </div>
      </section>

      {/* Index — table view */}
      {view === "index" && (
        <section>
          <div className="container py-8 sm:py-10 lg:py-14">
            {isLoading && <div className="tracker-muted">Loading register…</div>}
            <div className="hairline-top hairline-bottom">
              <div className="hidden sm:grid grid-cols-12 gap-3 py-3 tracker-muted">
                <div className="col-span-1">#</div>
                <div className="col-span-4">City</div>
                <div className="col-span-3">Region</div>
                <div className="col-span-2 text-right">Indexed</div>
                <div className="col-span-2 text-right">Avg / month</div>
              </div>
              {filtered.map((c: any, i: number) => (
                <Link key={c.id} href={`/cities/${c.slug}`} className="block group">
                  <div className="hidden sm:grid grid-cols-12 gap-3 py-4 border-t border-border items-baseline">
                    <div className="col-span-1 row-rank">{String(i + 1).padStart(2, "0")}</div>
                    <div className="col-span-4 min-w-0">
                      <div className="font-serif text-[1.4rem] leading-tight group-hover:text-forest break-words">
                        {c.name}
                      </div>
                      <div className="tracker-muted mt-0.5">{c.country}</div>
                    </div>
                    <div className="col-span-3 tracker">{c.region}</div>
                    <div className="col-span-2 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {counts[c.id] ?? 0}
                    </div>
                    <div className="col-span-2 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {c.avgMonthlyRateUsd ? formatUSD(c.avgMonthlyRateUsd) : "—"}
                    </div>
                  </div>
                  <div className="sm:hidden border-t border-border py-4 grid grid-cols-[2.4rem_1fr_auto] gap-2 items-baseline">
                    <div className="row-rank">{String(i + 1).padStart(2, "0")}</div>
                    <div className="min-w-0">
                      <div className="font-serif text-[1.25rem] leading-tight group-hover:text-forest break-words">{c.name}</div>
                      <div className="tracker-muted mt-0.5">{c.country} · {c.region}</div>
                      <div className="tracker mt-1">{counts[c.id] ?? 0} indexed</div>
                    </div>
                    <div className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {c.avgMonthlyRateUsd ? `$${(c.avgMonthlyRateUsd / 1000).toFixed(1)}k` : "—"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Atlas — card view */}
      {view === "atlas" && (
        <section>
          <div className="container py-8 sm:py-10 lg:py-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 sm:gap-x-6 gap-y-10 sm:gap-y-12">
              {filtered.map((c: any, i: number) => (
                <Link key={c.id} href={`/cities/${c.slug}`} className="group block">
                  <div className="relative aspect-[5/4] overflow-hidden bg-ivory-warm border border-border">
                    {c.heroImageUrl ? (
                      <img
                        src={c.heroImageUrl}
                        alt={c.name}
                        className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-ivory-warm to-stone/40" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-ivory/90 px-2 py-0.5 text-[0.65rem] tracking-[0.2em] uppercase">
                        {String(i + 1).padStart(2, "0")} · {c.region}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="font-serif text-[1.6rem] leading-tight group-hover:text-forest">
                      {c.name}
                    </div>
                    <div className="tracker-muted mt-1">{c.country}</div>
                    <div className="hairline-top mt-3 pt-3 grid grid-cols-3 gap-2">
                      <Mini label="Indexed" value={counts[c.id] ?? 0} />
                      <Mini
                        label="Avg / mo"
                        value={c.avgMonthlyRateUsd ? `$${(c.avgMonthlyRateUsd / 1000).toFixed(1)}k` : "—"}
                      />
                      <Mini label="Tier" value={c.featured ? "I" : "II"} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, raw }: { label: string; value: string | number; raw?: boolean }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{raw ? value : value.toString()}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="tracker-muted">{label}</div>
      <div className="mt-0.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>
        {value}
      </div>
    </div>
  );
}
