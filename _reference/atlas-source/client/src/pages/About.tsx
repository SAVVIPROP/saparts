import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";

export default function About() {
  usePageMeta(
    "About SAparts — The World's Leading Independent Serviced Apartment Directory",
    "SAparts is the world's leading independent directory supporting the best in class serviced apartments and aparthotels. Trusted by business professionals, travellers, and families."
  );

  const { data: stats } = trpc.stats.global.useQuery();

  return (
    <div>
      {/* Breadcrumb */}
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>About</span>
        </div>
      </section>

      {/* Masthead */}
      <section className="hairline-bottom">
        <div className="container py-16 sm:py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">ABOUT</span>
            </div>
            <h1 className="display text-[2.8rem] sm:text-[4rem] lg:text-[5.5rem] leading-[0.95]">
              Independent.<br /><em>Authoritative.</em><br />Global.
            </h1>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="paper p-5">
              <div className="stat-label">Properties indexed</div>
              <div className="stat-value mt-1">{(stats?.totalProperties || 10000).toLocaleString()}+</div>
            </div>
            <div className="paper p-5">
              <div className="stat-label">Cities covered</div>
              <div className="stat-value mt-1">{stats?.totalCities || 200}+</div>
            </div>
            <div className="paper p-5">
              <div className="stat-label">Founded</div>
              <div className="stat-value mt-1">MMXXVI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="hairline-bottom">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">Our Mission.</h2>
          </div>
          <div className="lg:col-span-9 editorial-body prose prose-lg max-w-none">
            <p>
              SAparts is the world's leading independent directory supporting the best in class serviced apartments and aparthotels. We exist to make the global serviced apartment market transparent, navigable, and trustworthy — for business professionals, families, and long-stay travellers alike.
            </p>
            <p>
              Unlike hotel booking platforms, we do not take commissions on bookings. Unlike operator-owned directories, we are not affiliated with any single brand or portfolio. Our editorial independence is the foundation of our authority.
            </p>
            <p>
              Every property in our register has been indexed from authoritative sources. Every claim on this platform can be traced to a verifiable source. If it cannot, it does not appear here.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Standards */}
      <section className="hairline-bottom bg-ivory-warm">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 02</span>
            <h2 className="display text-[2rem] mt-4">Editorial Standards.</h2>
          </div>
          <div className="lg:col-span-9">
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Independence",
                  body: "SAparts is not owned by, affiliated with, or funded by any serviced apartment operator, hotel group, or booking platform. Our editorial decisions are made independently of commercial relationships."
                },
                {
                  title: "Verifiability",
                  body: "Every statistic, claim, and market figure cited on this platform is sourced from a publicly available, authoritative reference. Sources are cited inline and listed in the footer of each page."
                },
                {
                  title: "Transparency",
                  body: "When operators pay to claim their listing or access premium features, this is disclosed. Paid placements are labelled. Organic rankings are determined by our editorial criteria, not by commercial arrangements."
                },
                {
                  title: "Accuracy",
                  body: "Property data is refreshed regularly from primary sources. Where data is unavailable or unverifiable, we display a dash rather than an estimate. We do not fabricate figures."
                },
                {
                  title: "Privacy",
                  body: "We do not sell user data. We do not share enquiry information with third parties without explicit consent. Our full privacy policy is available at /privacy."
                },
                {
                  title: "Corrections",
                  body: "If you identify an error in our data or editorial content, we welcome corrections. Contact us at editorial@saparts.com. Verified corrections are applied within 48 hours."
                }
              ].map((item) => (
                <div key={item.title} className="paper p-6">
                  <div className="tracker mb-3">{item.title}</div>
                  <p className="text-[0.92rem] leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="hairline-bottom">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 03</span>
            <h2 className="display text-[2rem] mt-4">What We Cover.</h2>
          </div>
          <div className="lg:col-span-9 editorial-body prose prose-lg max-w-none">
            <p>
              SAparts indexes serviced apartments and aparthotels across {stats?.totalCities || 200}+ cities globally. Our coverage spans:
            </p>
            <ul>
              <li><strong>Serviced apartments</strong> — fully furnished residences with hotel-grade services, available for short and extended stays</li>
              <li><strong>Aparthotels</strong> — hybrid properties combining apartment living with hotel amenities and daily housekeeping</li>
              <li><strong>Corporate housing</strong> — purpose-built accommodation for business travellers and relocating professionals</li>
              <li><strong>Extended stay properties</strong> — residences designed for stays of 30 days or longer</li>
            </ul>
            <p>
              We do not index traditional hotels, Airbnb-style short-term rentals, or private holiday lettings. Our focus is the professional, long-stay accommodation market.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="hairline-bottom">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 04</span>
            <h2 className="display text-[2rem] mt-4">Data Sources.</h2>
          </div>
          <div className="lg:col-span-9">
            <div className="space-y-4">
              {[
                {
                  name: "GSAIR 2025",
                  full: "Global Serviced Apartment Industry Report",
                  org: "Ariosi / Travel Intelligence Network",
                  url: "https://ariosi.com/gsair/",
                  desc: "The definitive annual survey of the global serviced apartment industry. Used for market size, ADR, occupancy, and pipeline data."
                },
                {
                  name: "Precedence Research",
                  full: "Serviced Apartment Market Size Report",
                  org: "Precedence Research",
                  url: "https://www.precedenceresearch.com/serviced-apartment-market",
                  desc: "Market sizing and growth projections for the global serviced apartment sector."
                },
                {
                  name: "CHPA",
                  full: "Corporate Housing Providers Association",
                  org: "CHPA",
                  url: "https://www.chpaonline.org/",
                  desc: "Industry association data on corporate housing demand, occupancy, and operator landscape."
                },
                {
                  name: "Numbeo",
                  full: "Cost of Living & Safety Index",
                  org: "Numbeo",
                  url: "https://www.numbeo.com/",
                  desc: "City-level cost of living indices and safety scores. Used in city intelligence sidebars."
                },
                {
                  name: "UN Tourism",
                  full: "International Visitor Arrivals",
                  org: "United Nations World Tourism Organization",
                  url: "https://www.unwto.org/",
                  desc: "Official international visitor arrival statistics by destination."
                },
                {
                  name: "IATA Timatic",
                  full: "Travel Information Manual",
                  org: "International Air Transport Association",
                  url: "https://www.iata.org/en/publications/timatic/",
                  desc: "Authoritative visa and entry requirement data used in city living guides."
                }
              ].map((src) => (
                <div key={src.name} className="grid sm:grid-cols-12 gap-4 py-5 border-t border-border">
                  <div className="sm:col-span-3">
                    <div className="tracker">{src.name}</div>
                    <div className="tracker-muted mt-1">{src.org}</div>
                  </div>
                  <div className="sm:col-span-7">
                    <div className="font-serif text-[1rem] mb-1">{src.full}</div>
                    <p className="text-[0.88rem] text-muted-foreground leading-relaxed">{src.desc}</p>
                  </div>
                  <div className="sm:col-span-2 flex items-start justify-end">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tracker-muted text-[0.75rem] hover:text-forest"
                    >
                      Visit ↗︎
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section>
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 05</span>
            <h2 className="display text-[2rem] mt-4">Get in Touch.</h2>
          </div>
          <div className="lg:col-span-9 grid sm:grid-cols-3 gap-5">
            <div className="paper p-6">
              <div className="tracker mb-2">General Enquiries</div>
              <a href="mailto:hello@saparts.com" className="text-[0.92rem] hover:text-forest">hello@saparts.com</a>
            </div>
            <div className="paper p-6">
              <div className="tracker mb-2">Editorial</div>
              <a href="mailto:editorial@saparts.com" className="text-[0.92rem] hover:text-forest">editorial@saparts.com</a>
            </div>
            <div className="paper p-6">
              <div className="tracker mb-2">Partnerships</div>
              <a href="mailto:partnerships@saparts.com" className="text-[0.92rem] hover:text-forest">partnerships@saparts.com</a>
            </div>
            <div className="sm:col-span-3 mt-4">
              <Link href="/contact" className="btn-primary inline-flex">Contact us →︎</Link>
              <Link href="/collaboration" className="btn-ghost ml-4 inline-flex">List a property →︎</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
