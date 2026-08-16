import Link from "next/link";
import {
  getCities,
  getLaunchCities,
  directoryStats,
  cityListingCounts,
  citiesWithRates,
  featuredPhotographed,
  listingsWithScores,
  getCity,
} from "@/lib/data";
import { formatUSD } from "@/lib/format";
import { PropertyCard } from "@/components/PropertyCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { PressQuoteTicker } from "@/components/PressQuoteTicker";
import { getInsights } from "@/lib/editorial";

function Stat({ label, value, suffix, raw }: { label: string; value: string | number; suffix?: string; raw?: boolean }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{raw ? value : value.toString()}</div>
      {suffix && <div className="stat-sub mt-1">{suffix}</div>}
    </div>
  );
}

export default function HomePage() {
  const cities = getCities();
  const launch = getLaunchCities();
  const stats = directoryStats();
  const counts = cityListingCounts();
  const topCities = [...launch]
    .map((c) => ({ ...c, _count: counts[c.slug] || 0 }))
    .sort((a, b) => b._count - a._count)
    .slice(0, 6);
  const rated = listingsWithScores().slice(0, 8);
  const featured = featuredPhotographed(6);
  const insights = getInsights().slice(0, 4);
  const pricedCities = citiesWithRates();
  const medianMonthly = (() => {
    const arr = pricedCities.map((c) => c.avgMonthlyRateUsd!).sort((a, b) => a - b);
    return arr.length ? arr[Math.floor(arr.length / 2)] : 0;
  })();
  const cheapest = [...pricedCities].sort((a, b) => a.avgMonthlyRateUsd! - b.avgMonthlyRateUsd!)[0];
  const dearest = [...pricedCities].sort((a, b) => b.avgMonthlyRateUsd! - a.avgMonthlyRateUsd!)[0];

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">§ 00</span>
              <span className="eyebrow">The SAparts Directory · Est. MMXXV</span>
            </div>
            <h1 className="display text-[2.4rem] sm:text-[3.25rem] md:text-[4.2rem] lg:text-[5.6rem]">
              Official global <em>serviced apartment</em>
              <br className="hidden sm:inline" /> booking directory <em>index.</em>
            </h1>
            <p className="mt-7 text-[1.05rem] lg:text-[1.1rem] text-muted-foreground max-w-2xl leading-[1.7] font-serif">
              An independent, source-backed index of premium serviced apartments and aparthotels. Listings are reviewed for factual content, location, and property imagery across {launch.length} launch cities.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/search" className="btn-primary">
                Browse the directory <span className="text-brass">↗︎</span>
              </Link>
              <div className="hidden sm:flex flex-wrap items-center gap-6 border-l border-border pl-6">
                <Link href="/awards" className="font-serif text-[1.15rem] text-charcoal hover:text-brass">
                  Awards 2026 <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
                <Link href="/collections" className="font-serif text-[1.15rem] text-charcoal hover:text-brass">
                  Collections <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
                <Link href="/corporate" className="font-serif text-[1.15rem] text-charcoal hover:text-brass">
                  For mobility teams <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-7">
            <Stat label="Cities indexed" value={cities.length} suffix="markets covered" />
            <Stat label="Residences vetted" value={stats.properties} suffix="published" />
            <Stat label="With photography" value={stats.withPhotos} suffix="usable stills" />
            <Stat
              label="Median monthly"
              value={medianMonthly ? `$${(medianMonthly / 1000).toFixed(1)}k` : "—"}
              suffix={medianMonthly ? "from filed rates" : "rates on request"}
              raw
            />
            <div className="col-span-2 hairline-top pt-4">
              <div className="tracker-muted">Methodology, in brief</div>
              <p className="mt-2 text-[0.86rem] text-muted-foreground leading-relaxed">
                Each residence is published only after factual content, location, and property-image review. Rates and scores appear only when the source file supplies them. If a claim cannot be traced, it does not appear in the register.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="hairline-bottom bg-ivory-warm">
        <div className="container py-6 sm:py-10">
          <div className="tracker-muted text-center mb-5 sm:mb-7">As seen in</div>
          <PressQuoteTicker />
          <div className="hidden sm:grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              ["“Blending urban stays with home comforts has — in the past few years — seen the arrival of a stylish set of aparthotels.”", "Forbes, February 2025"],
              ["“Serviced apartments are increasingly the go-to for travellers seeking the comforts of home with the perks of a hotel.”", "Condé Nast Traveler"],
              ["“Serviced apartments have become a game-changer for modern travellers — offering the space, flexibility, and cost savings that hotels simply cannot match.”", "Financial Times"],
            ].map(([quote, source]) => (
              <div key={source} className="flex flex-col gap-3">
                <div className="font-serif text-[1.05rem] leading-relaxed text-charcoal">{quote}</div>
                <div className="tracker-muted text-[0.8rem]">— {source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">The Atlas, <em>by depth</em>.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Cities are ranked by depth of vetted inventory. The global serviced apartment market is projected to reach £183 billion by 2030 — SAparts tracks the premium tier across {cities.length} markets. [GSAIR 2025]
            </p>
            <Link href="/cities" className="btn-ghost mt-6 inline-flex">All {cities.length} markets ↗︎</Link>
          </div>
          <div className="lg:col-span-8">
            <div className="hairline-top hairline-bottom">
              <div className="hidden sm:grid grid-cols-12 gap-3 py-3 tracker-muted">
                <div className="col-span-1">#</div>
                <div className="col-span-4">City</div>
                <div className="col-span-3">Region</div>
                <div className="col-span-2 text-right">Indexed</div>
                <div className="col-span-2 text-right">Avg / month</div>
              </div>
              {topCities.map((c, i) => {
                const avg = pricedCities.find((x) => x.slug === c.slug)?.avgMonthlyRateUsd;
                return (
                  <Link key={c.slug} href={`/cities/${c.slug}`} className="block group">
                    <div className="hidden sm:grid grid-cols-12 gap-3 py-4 border-t border-border items-baseline">
                      <div className="col-span-1 row-rank">{String(i + 1).padStart(2, "0")}</div>
                      <div className="col-span-4 min-w-0">
                        <div className="font-serif text-[1.4rem] leading-tight group-hover:text-forest break-words">{c.name}</div>
                        <div className="tracker-muted mt-0.5">{c.country}</div>
                      </div>
                      <div className="col-span-3 tracker">{c.region}</div>
                      <div className="col-span-2 text-right font-mono">{c._count}</div>
                      <div className="col-span-2 text-right font-mono">{avg ? formatUSD(avg) : "—"}</div>
                    </div>
                    <div className="sm:hidden border-t border-border py-4 grid grid-cols-[2.4rem_1fr_auto] gap-2 items-baseline">
                      <div className="row-rank">{String(i + 1).padStart(2, "0")}</div>
                      <div className="min-w-0">
                        <div className="font-serif text-[1.25rem] leading-tight group-hover:text-forest">{c.name}</div>
                        <div className="tracker-muted mt-0.5">{c.country} · {c.region}</div>
                        <div className="tracker mt-1">{c._count} indexed</div>
                      </div>
                      <div className="text-right font-mono">{avg ? `$${(avg / 1000).toFixed(1)}k` : "—"}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {pricedCities.length > 0 && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4">
              <span className="section-mark">§ 02</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">The <em>Rate Index</em>.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Median monthly rate, USD, from residences that publish a figure in the official packs. Most listings remain on request — we do not invent a tariff.
              </p>
              {(dearest || cheapest) && (
                <div className="mt-5 fig-caption">
                  {dearest && <><strong>Highest filed:</strong> {dearest.name} at {formatUSD(dearest.avgMonthlyRateUsd)}. </>}
                  {cheapest && <><strong>Best value filed:</strong> {cheapest.name} at {formatUSD(cheapest.avgMonthlyRateUsd)}.</>}
                </div>
              )}
            </div>
            <div className="lg:col-span-8">
              {(() => {
                const sorted = [...pricedCities].sort((a, b) => b.avgMonthlyRateUsd! - a.avgMonthlyRateUsd!);
                const max = Math.max(...sorted.map((c) => c.avgMonthlyRateUsd!), 1);
                return (
                  <div>
                    {sorted.map((c, idx) => {
                      const w = Math.max(4, (c.avgMonthlyRateUsd! / max) * 100);
                      return (
                        <Link key={c.slug} href={`/cities/${c.slug}`} className="group block border-t border-border py-3">
                          <div className="flex items-baseline justify-between gap-3 mb-1.5">
                            <div className="font-serif leading-none truncate group-hover:text-forest">{c.name}</div>
                            <div className="text-right text-[0.82rem] font-mono">${(c.avgMonthlyRateUsd! / 1000).toFixed(1)}k</div>
                          </div>
                          <div className="h-[5px] bg-border/60 overflow-hidden">
                            <div className="h-full" style={{ width: `${w}%`, background: idx === 0 ? "linear-gradient(90deg, var(--forest), var(--brass))" : "var(--forest)" }} />
                          </div>
                        </Link>
                      );
                    })}
                    <div className="fig-caption mt-4"><strong>Fig. 02</strong> — Filed monthly rates only. Source: official listing packs.</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="section-mark">§ 03</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">Destinations, <em>by region</em>.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
                The register spans {cities.length} markets. Europe and the Americas lead by depth of filed inventory; Asia-Pacific and the Middle East follow.
              </p>
            </div>
            <Link href="/cities" className="btn-ghost shrink-0">All {cities.length} markets ↗︎</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-border">
            {["Europe", "Asia-Pacific", "Americas", "Middle East & Africa"].map((region) => {
              const regionCities = cities
                .filter((c) => (c.region === "Oceania" ? "Asia-Pacific" : c.region) === region)
                .map((c) => ({ ...c, _count: counts[c.slug] || 0 }))
                .sort((a, b) => b._count - a._count);
              const total = regionCities.reduce((s, c) => s + c._count, 0);
              const top5 = regionCities.slice(0, 5);
              const maxCount = top5[0]?._count || 1;
              return (
                <div key={region} className="bg-background p-5 sm:p-7">
                  <div className="flex items-center justify-between mb-5 pb-4 hairline-bottom">
                    <div className="tracker text-[0.75rem] text-forest uppercase tracking-[0.18em]">{region}</div>
                    <div className="tracker-muted text-[0.75rem] font-mono">{total.toLocaleString()} residences</div>
                  </div>
                  <div className="space-y-3.5">
                    {top5.map((c, i) => {
                      const barW = Math.max(8, Math.round((c._count / maxCount) * 100));
                      return (
                        <Link key={c.slug} href={`/cities/${c.slug}`} className="block group">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="shrink-0 text-[0.7rem] tracking-[0.15em] text-muted-foreground font-mono" style={{ minWidth: "1.4rem" }}>{String(i + 1).padStart(2, "0")}</span>
                              <span className="font-serif text-[1.05rem] leading-none group-hover:text-forest truncate">{c.name}</span>
                            </div>
                            <span className="shrink-0 ml-3 text-[0.75rem] text-muted-foreground font-mono">{c._count}</span>
                          </div>
                          <div className="h-[3px] bg-border overflow-hidden rounded-full">
                            <div className="h-full rounded-full" style={{ width: `${barW}%`, background: i === 0 ? "var(--forest)" : "var(--brass)" }} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="section-mark">§ 04</span>
              <h2 className="display text-[1.6rem] sm:text-[2rem]">The SAparts Awards <em>2026</em>.</h2>
            </div>
            <Link href="/awards" className="tracker text-forest hover:underline">All awards ↗︎</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {[
              { title: "Top 50 Serviced Apartment Awards", cat: "All Categories", color: "var(--brass)" },
              { title: "Top 30 Luxury Serviced Apartment Awards", cat: "Luxury", color: "#C9A84C" },
              { title: "Top 30 Business Serviced Apartment Awards", cat: "Business Travel", color: "#4A6741" },
              { title: "Top 50 Family Serviced Apartment Awards", cat: "Families", color: "#8B6F47" },
            ].map((award) => (
              <Link key={award.title} href="/awards" className="bg-background p-5 sm:p-6 group block">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: award.color }} />
                  <span className="tracker text-[0.75rem]" style={{ color: award.color }}>{award.cat}</span>
                </div>
                <div className="font-serif text-[1.05rem] leading-tight group-hover:text-forest">{award.title}</div>
                <div className="mt-3 tracker text-forest text-[0.8rem]">Nominations open ↗︎</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {rated.length > 0 && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4">
              <span className="section-mark">§ 05</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">The <em>Tier I</em> register.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Residences with a filed third-party rating. Tiers are not invented — they appear only when a score is in the source file.
              </p>
            </div>
            <div className="lg:col-span-8 hairline-top hairline-bottom">
              {rated.map((p, i) => (
                <Link key={p.slug} href={`/properties/${p.slug}`} className="block group">
                  <div className="grid grid-cols-12 gap-3 py-4 border-t border-border items-baseline">
                    <div className="col-span-1 row-rank">{String(i + 1).padStart(2, "0")}</div>
                    <div className="col-span-7 font-serif text-[1.2rem] group-hover:text-forest">{p.name}</div>
                    <div className="col-span-2 tracker">{getCity(p.citySlug)?.name}</div>
                    <div className="col-span-2 text-right font-mono">{Number(p.ratingScore).toFixed(1)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 mb-10 items-end">
            <div className="lg:col-span-7">
              <span className="section-mark">§ 06</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
                Editor&apos;s dossier: <em>best photographed</em>.
              </h2>
            </div>
            <div className="lg:col-span-5 text-muted-foreground leading-relaxed">
              Six residences chosen for the depth of usable property photography on file — never a promo banner, never a generic social card, never the first six rows of a city pack.
            </div>
          </div>
          {featured.length === 0 ? (
            <div className="paper p-8">No usable photographs on file yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {featured.map((p) => (
                <PropertyCard key={p.slug} listing={p} city={getCity(p.citySlug)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 07</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">From the <em>Journal</em>.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              City reports, methodology notes and market intelligence on the global long-stay sector. Published on a deliberate schedule, with sources cited.
            </p>
            <Link href="/insights" className="btn-ghost mt-6 inline-flex">All essays ↗︎</Link>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8">
            {insights.map((ins, i) => (
              <Link key={ins.slug} href={`/insights/${ins.slug}`} className="group block">
                <div className="aspect-[16/10] overflow-hidden bg-ivory-warm border border-border" />
                <div className="pt-4">
                  <div className="tracker">{String(i + 1).padStart(2, "0")} · {ins.category}</div>
                  <div className="font-serif text-[1.4rem] mt-1 leading-tight group-hover:text-forest">{ins.title}</div>
                  <div className="tracker-muted mt-2">{ins.readMinutes} min read</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            <span className="section-mark">§ 08</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4"><em>The SAparts Review.</em></h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
              One issue every other Sunday. Index changes, new residences, rate movements and a single quiet essay. No sponsored content.
            </p>
          </div>
          <div className="lg:col-span-7">
            <NewsletterForm source="home" />
          </div>
        </div>
      </section>
    </div>
  );
}
