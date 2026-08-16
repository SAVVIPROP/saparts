import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

const AWARDS = [
  {
    slug: "top-50",
    rank: "01",
    title: "Top 50 Serviced Apartment Awards",
    subtitle: "The definitive annual ranking of the world's finest serviced apartments.",
    description:
      "Recognising excellence across the full spectrum of the serviced apartment sector. Properties are evaluated on quality of accommodation, service standards, location, value, and guest experience. The Top 50 represents the pinnacle of the global serviced apartment industry.",
    criteria: ["Accommodation quality", "Service standards", "Location & connectivity", "Guest experience", "Value for extended stay"],
    color: "var(--brass)",
    category: "All Categories",
  },
  {
    slug: "top-30-luxury",
    rank: "02",
    title: "Top 30 Luxury Serviced Apartment Awards",
    subtitle: "The world's most exceptional luxury serviced residences and branded apartments.",
    description:
      "Celebrating the finest luxury serviced apartments globally — properties that deliver five-star hotel service with the space and privacy of a private residence. Evaluated on interior design, personalised service, exclusive amenities, and the quality of the long-stay experience.",
    criteria: ["Interior design & finish", "Personalised concierge service", "Exclusive amenities", "Privacy & security", "Culinary offering"],
    color: "#C9A84C",
    category: "Luxury",
  },
  {
    slug: "top-30-business",
    rank: "03",
    title: "Top 30 Business Serviced Apartment Awards",
    subtitle: "The leading serviced apartments for corporate travellers and mobility teams.",
    description:
      "Recognising the serviced apartments that best serve the needs of business professionals, corporate relocations, and extended-stay executives. Evaluated on workspace quality, connectivity, proximity to business districts, and corporate service capabilities.",
    criteria: ["Workspace & connectivity", "Corporate services", "Business district proximity", "Flexible booking terms", "Corporate rate programmes"],
    color: "#4A6741",
    category: "Business Travel",
  },
  {
    slug: "top-50-family",
    rank: "04",
    title: "Top 50 Family Serviced Apartment Awards",
    subtitle: "The world's best serviced apartments for families and extended family stays.",
    description:
      "Honouring the serviced apartments that go above and beyond for families — providing the space, safety, and home comforts that make extended stays genuinely comfortable for all ages. Evaluated on apartment size, family amenities, child-friendly services, and neighbourhood suitability.",
    criteria: ["Apartment space & layout", "Family amenities", "Child-friendly services", "Neighbourhood safety", "Kitchen & laundry facilities"],
    color: "#8B6F47",
    category: "Families",
  },
];

export default function Awards() {
  usePageMeta(
    "SAparts Awards — Recognising Excellence in Serviced Apartments",
    "The SAparts Awards recognise the world's finest serviced apartments across four categories: Top 50 overall, Top 30 Luxury, Top 30 Business, and Top 50 Family. Nominations now open for 2026."
  );

  return (
    <div>
      {/* Hero */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-mark">§ Awards</span>
            <span className="eyebrow">SAparts Editorial Awards · 2026 Edition</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="display text-[2.4rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[5rem]">
                Recognising the <em>world's finest</em>
                <br className="hidden sm:inline" /> serviced apartments.
              </h1>
              <p className="mt-6 text-[1.05rem] text-muted-foreground max-w-2xl leading-[1.7]" style={{ fontFamily: "var(--font-serif)" }}>
                The SAparts Awards are the independent benchmark for excellence in the global serviced apartment industry. Evaluated annually across four categories — recognising properties that set the standard for quality, service, and the long-stay experience. No entry fees. No commercial influence on results.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#nominate" className="btn-primary">
                  Nominate a property ↗︎
                </a>
                <Link href="/search" className="btn-ghost">
                  Browse the directory
                </Link>
              </div>
            </div>
            <div className="lg:col-span-4 paper p-6 space-y-4">
              <div>
                <div className="stat-label">Award categories</div>
                <div className="stat-value mt-1">4</div>
                <div className="stat-sub mt-1">Annual editorial awards</div>
              </div>
              <div className="rule" />
              <div>
                <div className="stat-label">Nominations status</div>
                <div className="mt-1 tracker text-forest">Open</div>
                <div className="stat-sub mt-1">Closes 31 August 2026</div>
              </div>
              <div className="rule" />
              <div>
                <div className="stat-label">Winners announced</div>
                <div className="mt-1 tracker">October 2026</div>
              </div>
              <div className="rule" />
              <div className="tracker-muted text-[0.82rem] leading-relaxed">
                Independent editorial process. No entry fees. No commercial influence on results.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Award categories */}
      {AWARDS.map((award) => (
        <section key={award.slug} className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4">
              <span className="section-mark">§ {award.rank}</span>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: award.color }} />
                <span className="tracker" style={{ color: award.color }}>{award.category}</span>
              </div>
              <h2 className="display text-[1.9rem] lg:text-[2.4rem] mt-3 leading-tight">
                {award.title}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {award.description}
              </p>
              <div className="mt-6 paper p-4">
                <div className="tracker text-forest text-[0.8rem]">Nominations Open</div>
                <div className="tracker-muted text-[0.78rem] mt-1">2026 winners announced October</div>
              </div>
              <a
                href="#nominate"
                className="btn-ghost mt-4 inline-flex"
              >
                Nominate for this award ↗︎
              </a>
            </div>

            <div className="lg:col-span-8">
              <div className="paper p-6 sm:p-8">
                <div className="tracker-muted mb-5">Evaluation criteria</div>
                <div className="space-y-0">
                  {award.criteria.map((c, ci) => (
                    <div key={c} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                      <div className="row-rank shrink-0">{String(ci + 1).padStart(2, "0")}</div>
                      <div className="font-serif text-[1.15rem]">{c}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-[0.88rem] text-muted-foreground leading-relaxed">
                    {award.subtitle} The SAparts editorial team evaluates properties independently, with no commercial influence on results. Properties cannot pay to be included.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Methodology note */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <span className="section-mark">§ Methodology</span>
            <h2 className="display text-[2rem] lg:text-[2.6rem] mt-4">
              How the <em>awards work</em>.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The SAparts Awards are determined by the SAparts editorial team using traceable property data, guest-review signals, and direct property assessments. Properties are drawn from the current source-backed directory.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              There are no entry fees, no paid placements, and no commercial influence on results. Our editorial independence is the foundation of the awards' credibility. All commercial relationships are disclosed in full on our disclosures page.
            </p>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {[
              { label: "No entry fees", desc: "Properties cannot pay to be considered" },
              { label: "Independent editorial", desc: "Results determined by our editorial team" },
              { label: "Verified data", desc: "Based on confirmed property data and reviews" },
              { label: "Annual review", desc: "Awards refreshed every year" },
            ].map((item) => (
              <div key={item.label} className="paper p-5">
                <div className="font-serif text-[1.1rem]">{item.label}</div>
                <div className="tracker-muted mt-2">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nominate CTA */}
      <section id="nominate">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="section-mark">§ Nominate</span>
            <h2 className="display text-[2rem] lg:text-[2.8rem] mt-4">
              Nominate a <em>property</em>.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
              Nominations for the 2026 SAparts Awards are now open. Operators, guests, and corporate mobility professionals are invited to nominate properties they believe represent the best in the sector. Nominations close 31 August 2026.
            </p>
            <div className="mt-6 paper p-5 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="tracker-muted mb-1">Nominations close</div>
                  <div className="font-serif text-[1.2rem]">31 August 2026</div>
                </div>
                <div>
                  <div className="tracker-muted mb-1">Winners announced</div>
                  <div className="font-serif text-[1.2rem]">October 2026</div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <a
              href="mailto:awards@saparts.com?subject=SAparts Awards 2026 — Nomination"
              className="btn-primary text-center"
            >
              Submit a nomination ↗︎
            </a>
            <a
              href="mailto:awards@saparts.com?subject=SAparts Awards 2026 — Enquiry"
              className="btn-ghost text-center"
            >
              Awards enquiry
            </a>
            <p className="tracker-muted text-[0.78rem] text-center">
              Nominations are reviewed by our editorial panel. Commercial relationships do not influence outcomes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
