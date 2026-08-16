import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PropertyCard from "@/components/PropertyCard";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { formatUSD } from "@/lib/format";
import { usePageMeta } from "@/hooks/usePageMeta";

const REGIONS = ["Europe", "Americas", "Asia-Pacific", "Middle East & Africa"] as const;

export default function Home() {
  const citiesQuery = trpc.cities.list.useQuery();
  const propertiesQuery = trpc.properties.search.useQuery({ limit: 1000 });
  const { data: cities = [] } = citiesQuery;
  const { data: properties = [] } = propertiesQuery;
  const { data: globalStats } = trpc.stats.global.useQuery();
  const { data: execProps = [] } = trpc.properties.featuredByTag.useQuery({ tag: "Best for Executives", limit: 6 });
  const { data: insights = [] } = trpc.insights.list.useQuery({ limit: 6 });
  const { data: analytics } = trpc.home.analytics.useQuery();

  usePageMeta(
    "SAparts — The World's Leading Independent Serviced Apartment Directory",
    "An independent, source-backed index of serviced apartments and aparthotels. Listings are reviewed for factual content, location, and property imagery."
  );

  const [email, setEmail] = useState("");
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("You're subscribed to The SAparts Review.");
      setEmail("");
    },
    onError: () => toast.error("Subscription failed — please try again."),
  });

  // === Computed datasets for dashboard sections ===
  const directoryReady = globalStats !== undefined || (citiesQuery.isSuccess && propertiesQuery.isSuccess);
  const totalProperties = globalStats?.totalProperties ?? (directoryReady ? properties.length : "—");
  const tierI = globalStats?.tierIProperties ?? (directoryReady ? properties.filter((p: any) => Number(p.ratingScore) >= 9.0).length : "—");
  const medianMonthly = useMemo(() => {
    const arr = properties
      .map((p: any) => p.priceFromMonthlyUsd)
      .filter((n: any) => typeof n === "number" && n > 0)
      .sort((a: number, b: number) => a - b);
    return arr.length ? arr[Math.floor(arr.length / 2)] : 0;
  }, [properties]);
  const indexedCities = useMemo(() => {
    const counts: Record<number, number> = {};
    properties.forEach((p: any) => (counts[p.cityId] = (counts[p.cityId] || 0) + 1));
    return cities.filter((c: any) => counts[c.id] > 0);
  }, [cities, properties]);

  const cheapestCity = useMemo(() => {
    return [...cities]
      .filter((c: any) => c.avgMonthlyRateUsd)
      .sort((a: any, b: any) => a.avgMonthlyRateUsd - b.avgMonthlyRateUsd)[0];
  }, [cities]);
  const dearestCity = useMemo(() => {
    return [...cities]
      .filter((c: any) => c.avgMonthlyRateUsd)
      .sort((a: any, b: any) => b.avgMonthlyRateUsd - a.avgMonthlyRateUsd)[0];
  }, [cities]);

  // Top 6 cities by property count
  const topCities = useMemo(() => {
    const counts: Record<number, number> = {};
    properties.forEach((p: any) => (counts[p.cityId] = (counts[p.cityId] || 0) + 1));
    return [...cities]
      .map((c: any) => ({ ...c, _count: counts[c.id] || 0 }))
      .sort((a: any, b: any) => (b._count || 0) - (a._count || 0))
      .slice(0, 6);
  }, [cities, properties]);

  // Highest-rated properties (Index)
  const indexRows = useMemo(() => {
    return [...properties]
      .filter((p: any) => p.ratingScore != null)
      .sort((a: any, b: any) => Number(b.ratingScore) - Number(a.ratingScore))
      .slice(0, 8);
  }, [properties]);

  return (
    <div>
      {/* === HERO MASTHEAD === */}
      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">§ 00</span>
              <span className="eyebrow">The SAparts Directory · Est. MMXXV</span>
            </div>
            <h1 className="display text-[2.4rem] sm:text-[3.25rem] md:text-[4.2rem] lg:text-[5.6rem]">
              Official global <em>serviced apartment</em>
              <br className="hidden sm:inline" />{" "}
              booking directory <em>index.</em>
            </h1>
            <p
              className="mt-7 text-[1.05rem] lg:text-[1.1rem] text-muted-foreground max-w-2xl leading-[1.7]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              An independent, source-backed index of premium serviced apartments and aparthotels. Listings are reviewed for factual content, location, and property imagery across {cities.length ? `${cities.length} cities` : "our global city coverage"}.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/search" className="btn-primary">
                Browse the directory <span className="text-brass">↗︎</span>
              </Link>
              <div className="hidden sm:flex flex-wrap items-center gap-6 border-l border-border pl-6">
                <Link
                  href="/awards"
                  className="font-serif text-[1.15rem] text-charcoal hover:text-brass transition-colors"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Awards 2026 <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
                <Link
                  href="/collections"
                  className="font-serif text-[1.15rem] text-charcoal hover:text-brass transition-colors"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Collections <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
                <Link
                  href="/corporate"
                  className="font-serif text-[1.15rem] text-charcoal hover:text-brass transition-colors"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  For mobility teams <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Counts panel — Vitaei "stat-block" */}
          <div className="lg:col-span-4 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-7">
            <Stat label="Cities indexed" value={globalStats?.totalCities ?? (directoryReady ? cities.length : "—")} suffix="markets covered" />
            <Stat label="Residences vetted" value={totalProperties} suffix="published" />
            <Stat label="Tier I addresses" value={tierI} suffix="rating ≥ 9.0" />
            <Stat
              label="Median monthly"
              value={medianMonthly ? `$${(medianMonthly / 1000).toFixed(1)}k` : "—"}
              suffix="per residence"
              raw
            />
            <div className="col-span-2 hairline-top pt-4">
              <div className="tracker-muted">Methodology, in brief</div>
              <p className="mt-2 text-[0.86rem] text-muted-foreground leading-relaxed">
                Each residence is scored on five axes — workspace, transit, lifestyle, quietness, value — and assigned a tier. Tier I requires a verified third-party rating ≥ 9.0 with consistent long-stay reviews. All commercial relationships are disclosed. If a claim cannot be traced to a verifiable source, it does not appear in the register.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === AS SEEN IN — press quotes === */}
      <section className="hairline-bottom bg-ivory-warm">
        <div className="container py-6 sm:py-10">
          <div className="tracker-muted text-center mb-5 sm:mb-7">As seen in</div>
          {/* Mobile: single rotating quote */}
          <PressQuoteTicker />
          {/* Desktop: three columns */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col gap-3">
              <div className="font-serif text-[1.05rem] leading-relaxed text-charcoal">
                &ldquo;Blending urban stays with home comforts has — in the past few years — seen the arrival of a stylish set of aparthotels.&rdquo;
              </div>
              <div className="tracker-muted text-[0.8rem]">— Forbes, February 2025</div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="font-serif text-[1.05rem] leading-relaxed text-charcoal">
                &ldquo;Serviced apartments are increasingly the go-to for travellers seeking the comforts of home with the perks of a hotel.&rdquo;
              </div>
              <div className="tracker-muted text-[0.8rem]">— Condé Nast Traveler</div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="font-serif text-[1.05rem] leading-relaxed text-charcoal">
                &ldquo;Serviced apartments have become a game-changer for modern travellers — offering the space, flexibility, and cost savings that hotels simply cannot match.&rdquo;
              </div>
              <div className="tracker-muted text-[0.8rem]">— Financial Times</div>
            </div>
          </div>
        </div>
      </section>

      {/* === § 01 ATLAS — top cities table === */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
              The Atlas, <em>by depth</em>.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Cities are ranked by depth of vetted inventory, with the editor's average monthly benchmark. The global serviced apartment market is projected to reach £183 billion by 2030 — SAparts tracks the premium tier across {cities.length} markets. [GSAIR 2025]
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
              {topCities.map((c: any, i: number) => (
                <Link key={c.id} href={`/cities/${c.slug}`} className="block group">
                  {/* Desktop / sm+ table row */}
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
                      {c._count}
                    </div>
                    <div className="col-span-2 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {c.avgMonthlyRateUsd ? formatUSD(c.avgMonthlyRateUsd) : "—"}
                    </div>
                  </div>
                  {/* Mobile stacked card */}
                  <div className="sm:hidden border-t border-border py-4 grid grid-cols-[2.4rem_1fr_auto] gap-2 items-baseline">
                    <div className="row-rank">{String(i + 1).padStart(2, "0")}</div>
                    <div className="min-w-0">
                      <div className="font-serif text-[1.25rem] leading-tight group-hover:text-forest break-words">{c.name}</div>
                      <div className="tracker-muted mt-0.5">{c.country} · {c.region}</div>
                      <div className="tracker mt-1">{c._count} indexed</div>
                    </div>
                    <div className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {c.avgMonthlyRateUsd ? `$${(c.avgMonthlyRateUsd / 1000).toFixed(1)}k` : "—"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === § 02 RATE INDEX — bar chart === */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 02</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
              The <em>Rate Index</em>.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Median monthly all-in rate, USD, for a one-bed serviced apartment in each city's prime business district. The global average daily rate for serviced apartments stands at £145 in 2025, with New York reporting the highest ADR at £265. [GSAIR 2025, Ariosi / Travel Intelligence Network]
            </p>
            <div className="mt-5 fig-caption">
              <strong>Highest:</strong> {dearestCity?.name ?? "—"} at{" "}
              {dearestCity?.avgMonthlyRateUsd ? formatUSD(dearestCity.avgMonthlyRateUsd) : "—"}.{" "}
              <strong>Best value:</strong> {cheapestCity?.name ?? "—"} at{" "}
              {cheapestCity?.avgMonthlyRateUsd ? formatUSD(cheapestCity.avgMonthlyRateUsd) : "—"}.
            </div>
          </div>

          <div className="lg:col-span-8">
            <RateBars cities={cities as any[]} />
          </div>
        </div>
      </section>

      {/* === § 02b STAY-LENGTH RATE CURVE === */}
      {analytics && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4">
              <span className="section-mark">§ 02b</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
                The <em>length-of-stay</em> curve.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                What the same residence costs at one week, one month, three months and six months. A 30-night booking averages <strong>{(analytics.rateCurve.find((x: any) => x.stayDays === 30)?.savingsPct ?? 0)}%</strong>{" "}lower than a flex 7-night rate; a 180-night booking is{" "}<strong>{(analytics.rateCurve.find((x: any) => x.stayDays === 180)?.savingsPct ?? 0)}%</strong>{" "}lower. For stays exceeding 30 nights, serviced apartments are typically 20–40% more cost-effective than equivalent hotel accommodation. [Apartool / AEGVE, 2026]
              </p>
            </div>
            <div className="lg:col-span-8">
              <RateCurve points={analytics.rateCurve} />
            </div>
          </div>
        </section>
      )}

      {/* === § 03 DESTINATIONS BY REGION === */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="section-mark">§ 03</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
                Destinations, <em>by region</em>.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
                The SAparts register spans {cities.length}+ markets across four global regions. Europe leads by depth of inventory, with London, Paris, and Madrid accounting for the highest concentration of premium serviced apartments worldwide. Asia-Pacific and the Americas are growing fastest, driven by corporate mobility demand. [GSAIR 2025]
              </p>
            </div>
            <Link href="/cities" className="btn-ghost shrink-0">All {cities.length} markets ↗︎</Link>
          </div>
          <DestinationsByRegion cities={cities as any[]} properties={properties as any[]} />
        </div>
      </section>







      {/* === § 04 AWARDS TEASER === */}
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
                <div className="font-serif text-[1.05rem] leading-tight group-hover:text-forest transition-colors">{award.title}</div>
                <div className="mt-3 tracker text-forest text-[0.8rem]">Nominations open ↗︎</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === § 05 INDEX — top-rated residences table === */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 05</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
              The <em>Tier I</em> register.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The residences currently leading the index. Tier I requires a verified third-party rating ≥ 9.0 with consistent positive reviews on long-stay metrics — kitchen, workspace, quietness. The average corporate relocation stay exceeds 83 days; these addresses are benchmarked for that duration. [CHPA / Corporate Housing Statistics, 2026]
            </p>
            <Link href="/search" className="btn-ghost mt-6 inline-flex">
              Open the full register ↗︎
            </Link>
          </div>
          <div className="lg:col-span-8">
            <div className="hairline-top hairline-bottom">
              <div className="hidden sm:grid grid-cols-12 gap-3 py-3 tracker-muted">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Residence</div>
                <div className="col-span-3">City</div>
                <div className="col-span-2 text-right">Rating</div>
                <div className="col-span-1 text-right">Tier</div>
              </div>
              {indexRows.map((p: any, i: number) => {
                const city = cities.find((c: any) => c.id === p.cityId);
                return (
                  <Link key={p.id} href={`/properties/${p.slug}`} className="block group">
                    <div className="hidden sm:grid grid-cols-12 gap-3 py-4 border-t border-border items-baseline">
                      <div className="col-span-1 row-rank">{String(i + 1).padStart(2, "0")}</div>
                      <div className="col-span-5 min-w-0">
                        <div className="font-serif text-[1.2rem] leading-tight group-hover:text-forest break-words">
                          {p.name}
                        </div>
                        <div className="tracker-muted mt-0.5">
                          {p.brand ?? p.category} · {p.neighborhood ?? "—"}
                        </div>
                      </div>
                      <div className="col-span-3 tracker">{city?.name ?? ""}</div>
                      <div className="col-span-2 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                        {Number(p.ratingScore).toFixed(1)}
                      </div>
                      <div className="col-span-1 text-right">
                        <span className="tag tag-tier-1">T·I</span>
                      </div>
                    </div>
                    <div className="sm:hidden border-t border-border py-4 grid grid-cols-[2.4rem_1fr_auto] gap-2 items-baseline">
                      <div className="row-rank">{String(i + 1).padStart(2, "0")}</div>
                      <div className="min-w-0">
                        <div className="font-serif text-[1.1rem] leading-tight group-hover:text-forest break-words">{p.name}</div>
                        <div className="tracker-muted mt-0.5">{city?.name ?? ""} · {p.neighborhood ?? "—"}</div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontFamily: "var(--font-mono)" }}>{Number(p.ratingScore).toFixed(1)}</div>
                        <div className="tag tag-tier-1 mt-1">T·I</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* === § 06 EDITOR'S DOSSIER — featured property cards (executive) === */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 mb-10 items-end">
            <div className="lg:col-span-7">
              <span className="section-mark">§ 06</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
                Editor's dossier: <em>residences for executives</em>.
              </h2>
            </div>
            <div className="lg:col-span-5 text-muted-foreground leading-relaxed">
              Six residences this volume, chosen for proximity to financial districts, fully equipped workspaces, and a residential calm uncommon at the rates they command. Accommodation represents nearly 30% of total corporate travel expenditure. [GBTA] These addresses are benchmarked to justify every line of that budget.
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {execProps.slice(0, 6).map((p: any) => {
              const c = cities.find((x: any) => x.id === p.cityId);
              return <PropertyCard key={p.id} property={p} cityName={c?.name} />;
            })}
          </div>
        </div>
      </section>

      {/* === § 07 JOURNAL — recent essays === */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 07</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
              From the <em>Journal</em>.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              City reports, methodology notes and market intelligence on the global long-stay sector. The global serviced apartment market was valued at $126.9 billion in 2024 and is projected to reach $420.9 billion by 2034 at a CAGR of 12.7%. [Precedence Research, 2025] Published on a deliberate schedule, with sources cited.
            </p>
            <Link href="/insights" className="btn-ghost mt-6 inline-flex">All essays ↗︎</Link>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8">
            {insights.slice(0, 4).map((ins: any, i: number) => (
              <Link key={ins.id} href={`/insights/${ins.slug}`} className="group block">
                <div className="aspect-[16/10] overflow-hidden bg-ivory-warm border border-border">
                  {ins.heroImageUrl && (
                    <img
                      src={ins.heroImageUrl}
                      alt={ins.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="pt-4">
                  <div className="tracker">
                    {String(i + 1).padStart(2, "0")} · {ins.category}
                  </div>
                  <div className="font-serif text-[1.4rem] mt-1 leading-tight group-hover:text-forest">
                    {ins.title}
                  </div>
                  <div className="tracker-muted mt-2">{ins.readMinutes} min read</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === § 08 NEWSLETTER === */}
      <section>
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            <span className="section-mark">§ 08</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
              <em>The SAparts Review.</em>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
              One issue every other Sunday. Index changes, new residences, rate movements and a single quiet essay on the global mobility market. No sponsored content. The only commercial relationships are our affiliate partners, disclosed in full. If a claim cannot be traced to a verifiable source, it does not appear in the newsletter.
            </p>
          </div>
          <form
            className="lg:col-span-7"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) return toast.error("Please enter a valid email.");
              subscribe.mutate({ email, source: "home" });
            }}
          >
            <div className="tracker-muted">Your email</div>
            <div className="mt-2 flex items-center gap-3 border-b border-charcoal/30 focus-within:border-forest py-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.edu"
                className="flex-1 bg-transparent outline-none text-charcoal placeholder:text-charcoal/40 py-1"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}
              />
              <button type="submit" className="tracker hover:text-forest" disabled={subscribe.isPending}>
                {subscribe.isPending ? "…" : "Subscribe ↗︎"}
              </button>
            </div>
            <div className="tracker-muted mt-3">
              No marketing, no sponsored content. Unsubscribe in one click.
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  raw,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  raw?: boolean;
}) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{raw ? value : value.toString()}</div>
      {suffix && <div className="stat-sub mt-1">{suffix}</div>}
    </div>
  );
}

function RateCurve({ points }: { points: Array<{ stayDays: number; avgMonthlyUsd: number; savingsPct: number }> }) {
  const ordered = [...points].sort((a, b) => a.stayDays - b.stayDays);
  const max = Math.max(...ordered.map((p) => p.avgMonthlyUsd), 1);
  return (
    <div>
      {/* Header row */}
      <div className="grid gap-2 sm:gap-3 py-3 tracker-muted hairline-bottom" style={{ gridTemplateColumns: "minmax(80px,140px) 1fr 64px 72px" }}>
        <div>Stay</div>
        <div className="hidden sm:block">Avg monthly (USD)</div>
        <div className="sm:hidden">Rate</div>
        <div className="hidden sm:block text-right">Rate</div>
        <div className="text-right">vs 7-night</div>
      </div>
      {ordered.map((p) => {
        const w = (p.avgMonthlyUsd / max) * 100;
        const label =
          p.stayDays === 7 ? "1 week" : p.stayDays === 30 ? "1 month" : p.stayDays === 90 ? "3 months" : "6 months";
        return (
          <div key={p.stayDays} className="grid gap-2 sm:gap-3 py-3 border-t border-border items-center" style={{ gridTemplateColumns: "minmax(80px,140px) 1fr 64px 72px" }}>
            <div className="font-serif text-[1rem] sm:text-[1.05rem]">{label}</div>
            <div className="min-w-0">
              <div className="h-2.5 sm:h-3 bg-ivory-warm border border-border overflow-hidden">
                <div className="h-full" style={{ width: `${w}%`, background: "linear-gradient(90deg, var(--forest) 70%, var(--brass))" }} />
              </div>
            </div>
            <div className="text-right" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
              ${(p.avgMonthlyUsd / 1000).toFixed(1)}k
            </div>
            <div className="text-right tracker-muted" style={{ fontSize: "0.78rem" }}>
              {p.savingsPct > 0 ? `−${p.savingsPct}%` : "—"}
            </div>
          </div>
        );
      })}
      <div className="fig-caption mt-3">
        <strong>Fig. 02b</strong> — portfolio-wide average. Operator-specific curves vary; see each
        residence page for its own published rate ladder.
      </div>
    </div>
  );
}

function ReviewThemesByTier({ byTier }: { byTier: Array<{ tier: string; themes: Array<{ key: string; score: number }> }> }) {
  const order = ["I", "II", "III"];
  const tiers = [...byTier].sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {tiers.map((t) => (
        <div key={t.tier} className="paper p-5">
          <div className="tracker-muted">Tier {t.tier}</div>
          <div className="font-serif text-[1.4rem] mt-1">
            {t.tier === "I" ? "Editor-vetted" : t.tier === "II" ? "Quietly excellent" : "Working register"}
          </div>
          <div className="mt-4 space-y-3">
            {t.themes.map((th) => (
              <div key={th.key}>
                <div className="flex items-baseline justify-between">
                  <div className="tracker">{th.key}</div>
                  <div style={{ fontFamily: "var(--font-mono)" }}>{th.score.toFixed(1)}</div>
                </div>
                <div className="h-1.5 mt-1 bg-ivory-warm border border-border overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(th.score / 10) * 100}%`,
                      background: "var(--forest)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Destinations by Region component — uses real DB data
const REGION_ORDER = ["Europe", "Asia-Pacific", "Americas", "Middle East & Africa"];

function DestinationsByRegion({ cities, properties }: { cities: any[]; properties: any[] }) {
  const counts: Record<number, number> = {};
  properties.forEach((p: any) => (counts[p.cityId] = (counts[p.cityId] || 0) + 1));

  const byRegion: Record<string, any[]> = {};
  REGION_ORDER.forEach((r) => (byRegion[r] = []));
  cities.forEach((c: any) => {
    const r = c.region;
    if (r && byRegion[r]) {
      byRegion[r].push({ ...c, _count: counts[c.id] || 0 });
    }
  });
  REGION_ORDER.forEach((r) => {
    byRegion[r].sort((a: any, b: any) => b._count - a._count);
  });

  return (
    <div className="grid sm:grid-cols-2 gap-px bg-border">
      {REGION_ORDER.map((region) => {
        const regionCities = byRegion[region].filter((c: any) => c._count > 0);
        const total = regionCities.reduce((sum: number, c: any) => sum + c._count, 0);
        const top5 = regionCities.slice(0, 5);
        const maxCount = top5[0]?._count || 1;
        return (
          <div key={region} className="bg-background p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5 pb-4 hairline-bottom">
              <div className="tracker text-[0.75rem] text-forest uppercase tracking-[0.18em]">{region}</div>
              <div className="tracker-muted text-[0.75rem]" style={{ fontFamily: "var(--font-mono)" }}>{total.toLocaleString()} residences</div>
            </div>
            <div className="space-y-3.5">
              {top5.map((c: any, i: number) => {
                const barW = Math.max(8, Math.round((c._count / maxCount) * 100));
                return (
                  <Link key={c.id} href={`/cities/${c.slug}`} className="block group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 text-[0.7rem] tracking-[0.15em] text-muted-foreground" style={{ fontFamily: "var(--font-mono)", minWidth: "1.4rem" }}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-serif text-[1.05rem] leading-none group-hover:text-forest transition-colors truncate">{c.name}</span>
                        <span className="tracker-muted text-[0.7rem] shrink-0 hidden sm:inline">{c.country}</span>
                      </div>
                      <span className="shrink-0 ml-3 text-[0.75rem] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>{c._count}</span>
                    </div>
                    <div className="h-[3px] bg-border overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                        style={{ width: `${barW}%`, background: i === 0 ? "var(--forest)" : i === 1 ? "color-mix(in srgb, var(--forest) 75%, var(--brass))" : i === 2 ? "color-mix(in srgb, var(--forest) 50%, var(--brass))" : "var(--brass)" }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 pt-4 hairline-top">
              <Link href={`/cities`} className="tracker text-[0.75rem] text-forest hover:underline inline-flex items-center gap-1">
                {regionCities.length} cities in {region} ↗︎
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function RateBars({ cities }: { cities: any[] }) {
  const sorted = [...cities]
    .filter((c) => c.avgMonthlyRateUsd)
    .sort((a, b) => b.avgMonthlyRateUsd - a.avgMonthlyRateUsd)
    .slice(0, 12);
  const max = Math.max(...sorted.map((c) => c.avgMonthlyRateUsd), 1);
  return (
    <div>
      <div className="space-y-0">
        {sorted.map((c, idx) => {
          const w = Math.max(4, (c.avgMonthlyRateUsd / max) * 100);
          const isTop = idx === 0;
          return (
            <Link
              key={c.id}
              href={`/cities/${c.slug}`}
              className="group block border-t border-border py-3 sm:py-3.5"
            >
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <div className="min-w-0 flex items-baseline gap-2">
                  <div className={`font-serif leading-none truncate group-hover:text-forest transition-colors ${isTop ? "text-[1.15rem]" : "text-[1.0rem]"}`}>{c.name}</div>
                  <div className="tracker-muted text-[0.7rem] shrink-0">{c.region}</div>
                </div>
                <div className="text-right text-[0.82rem] shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                  ${(c.avgMonthlyRateUsd / 1000).toFixed(1)}k
                </div>
              </div>
              <div className="h-[5px] bg-border/60 overflow-hidden">
                <div
                  className="h-full transition-all duration-700 group-hover:opacity-75"
                  style={{
                    width: `${w}%`,
                    background: isTop
                      ? "linear-gradient(90deg, var(--forest), var(--brass))"
                      : "linear-gradient(90deg, var(--forest) 60%, color-mix(in srgb, var(--forest) 40%, var(--brass)))"
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="fig-caption mt-4">
        <strong>Fig. 02b</strong> — Median monthly benchmark rate, USD, for a one-bedroom serviced apartment in each city's prime business district. Source: GSAIR 2025 / Ariosi Travel Intelligence.
      </div>
    </div>
  );
}

const PRESS_QUOTES = [
  { text: "\u201cBlending urban stays with home comforts has \u2014 in the past few years \u2014 seen the arrival of a stylish set of aparthotels.\u201d", source: "Forbes, February 2025" },
  { text: "\u201cServiced apartments are increasingly the go-to for travellers seeking the comforts of home with the perks of a hotel.\u201d", source: "Cond\u00e9 Nast Traveler" },
  { text: "\u201cServiced apartments have become a game-changer for modern travellers \u2014 offering the space, flexibility, and cost savings that hotels simply cannot match.\u201d", source: "Financial Times" },
];

function PressQuoteTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % PRESS_QUOTES.length);
        setVisible(true);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const q = PRESS_QUOTES[idx];
  return (
    <div className="sm:hidden text-center px-2 pb-2" style={{ minHeight: "5rem" }}>
      <div
        style={{
          transition: "opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        <div className="font-serif text-[1rem] leading-relaxed text-charcoal">{q.text}</div>
        <div className="tracker-muted text-[0.78rem] mt-2">\u2014 {q.source}</div>
      </div>
    </div>
  );
}
