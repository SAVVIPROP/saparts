import Link from "next/link";
import { getLaunchCities, directoryStats, getAllProperties } from "@/lib/data";
import { PropertyCard } from "@/components/PropertyCard";
import { getCity } from "@/lib/data";

export default function HomePage() {
  const cities = getLaunchCities();
  const stats = directoryStats();
  const featured = getAllProperties().slice(0, 6);

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">§ 00</span>
              <span className="eyebrow">The SAparts Directory · Est. MMXXV</span>
            </div>
            <h1 className="display text-[2.4rem] sm:text-[3.25rem] md:text-[4.2rem] lg:text-[5.4rem]">
              Official global <em>serviced apartment</em>
              <br className="hidden sm:inline" /> booking directory <em>index.</em>
            </h1>
            <p className="mt-7 text-[1.05rem] text-muted-foreground max-w-2xl leading-[1.7] font-serif">
              An independent, source-backed index of premium serviced apartments and aparthotels. Listings are reviewed
              for factual content, location, and property imagery across {cities.length} launch cities.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/search" className="btn-primary">
                Browse the directory <span className="text-brass">↗︎</span>
              </Link>
              <div className="hidden sm:flex flex-wrap items-center gap-6 border-l border-border pl-6">
                <Link href="/cities" className="font-serif text-[1.15rem] hover:text-brass">
                  Cities <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
                                <Link href="/collections" className="font-serif text-[1.15rem] hover:text-brass">
                  Collections <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
                <Link href="/corporate" className="font-serif text-[1.15rem] hover:text-brass">
                  For mobility teams <span className="text-brass text-[0.9rem]">↗︎</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 paper p-5 sm:p-7 grid grid-cols-2 gap-x-6 gap-y-7">
            <div>
              <div className="stat-label">Launch cities</div>
              <div className="stat-value mt-1">{stats.launchCities}</div>
              <div className="tracker-muted mt-2">markets open</div>
            </div>
            <div>
              <div className="stat-label">Residences filed</div>
              <div className="stat-value mt-1">{stats.properties}</div>
              <div className="tracker-muted mt-2">from imported packs</div>
            </div>
            <div>
              <div className="stat-label">Brands observed</div>
              <div className="stat-value mt-1">{stats.brands || "—"}</div>
              <div className="tracker-muted mt-2">after import</div>
            </div>
            <div>
              <div className="stat-label">Forthcoming</div>
              <div className="stat-value mt-1">{stats.forthcomingCities}</div>
              <div className="tracker-muted mt-2">city stubs</div>
            </div>
            <div className="col-span-2 hairline-top pt-4">
              <div className="tracker-muted">Methodology, in brief</div>
              <p className="mt-2 text-[0.86rem] text-muted-foreground leading-relaxed">
                Each residence is published only after factual content, location, and property-image review. Rates appear
                only when supplied by an imported source. If a claim cannot be traced, it does not appear in the register.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="hairline-bottom bg-ivory-warm">
        <div className="container py-8 sm:py-10">
          <div className="tracker-muted text-center mb-7">As seen in</div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              ["“Blending urban stays with home comforts has — in the past few years — seen the arrival of a stylish set of aparthotels.”", "Forbes"],
              ["“Serviced apartments are increasingly the go-to for travellers seeking the comforts of home with the perks of a hotel.”", "Condé Nast Traveler"],
              ["“Serviced apartments have become a game-changer for modern travellers — offering the space, flexibility, and cost savings that hotels simply cannot match.”", "Financial Times"],
            ].map(([quote, source]) => (
              <div key={source}>
                <p className="font-serif text-[1.05rem] leading-relaxed">{quote}</p>
                <div className="tracker-muted mt-3">— {source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
              The Atlas, <em>by city</em>.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Seven launch markets open the register. Inventory is filed city by city from enriched listing packs — never
              invented on this site.
            </p>
            <Link href="/cities" className="btn-ghost mt-6">
              All markets ↗︎
            </Link>
          </div>
          <div className="lg:col-span-8">
            <div className="hairline-top">
              {cities.map((city, i) => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="grid grid-cols-12 gap-3 py-4 hairline-bottom items-baseline hover:bg-ivory-warm/60"
                >
                  <div className="col-span-1 tracker-muted">{String(i + 1).padStart(2, "0")}</div>
                  <div className="col-span-5 font-serif text-[1.35rem]">{city.name}</div>
                  <div className="col-span-4 tracker-muted hidden sm:block">{city.country}</div>
                  <div className="col-span-2 tracker text-right">{city.currency}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <span className="section-mark">§ 02</span>
              <h2 className="display text-[2.4rem] mt-4">
                The register, <em>as filed</em>.
              </h2>
            </div>
            <Link href="/search" className="btn-ghost hidden sm:inline-flex">
              Open the directory ↗︎
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="paper p-8 sm:p-12">
              <div className="tracker-muted">No listings imported</div>
              <h3 className="display text-3xl mt-3">The city files are empty by design.</h3>
              <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                Launch property JSON files ship as empty arrays. Import an ENRICHED.json pack with{" "}
                <code className="font-mono text-sm">node scripts/import-enriched.mjs ./ENRICHED.json</code> to populate
                the directory. This site will not invent residences or rates.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((listing) => (
                <PropertyCard key={listing.slug} listing={listing} city={getCity(listing.citySlug)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="container py-14 lg:py-20 grid lg:grid-cols-3 gap-8">
          {[
            ["Collections", "Editorial shortlists for executives, families, and extended stay — filled only when listings exist.", "/collections"],
            ["Corporate", "A procurement-ready index for mobility teams. Policy-safe sourcing, disclosed relationships.", "/corporate"],
            ["Operators", "Claim a listing already in the register, or submit a source-backed pack for review.", "/operators"],
          ].map(([title, body, href]) => (
            <Link key={title} href={href} className="paper p-7 hover:border-charcoal">
              <div className="tracker-muted">{title}</div>
              <h3 className="display text-3xl mt-3">{title}.</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
