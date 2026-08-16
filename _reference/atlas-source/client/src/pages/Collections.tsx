import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

const COLLECTIONS = [
  {
    slug: "executives",
    symbol: "◈",
    title: "Best for Executives",
    subtitle: "Premium serviced apartments for senior professionals and C-suite travellers.",
    description: "Curated for executives who require a seamless transition between home and office. Properties selected for workspace quality, concierge-level service, proximity to business districts, and the discretion that senior professionals demand.",
    tags: ["High-speed WiFi", "Dedicated workspace", "Concierge service", "Business district", "Premium finish"],
    count: "340+",
  },
  {
    slug: "families",
    symbol: "◇",
    title: "Best for Families",
    subtitle: "Spacious serviced apartments designed for families on extended stays.",
    description: "Multi-bedroom apartments with fully equipped kitchens, laundry facilities, and child-friendly amenities. Selected for proximity to international schools, parks, and family services — making extended family relocations genuinely comfortable.",
    tags: ["2+ bedrooms", "Full kitchen", "Laundry", "Child-friendly", "Near schools"],
    count: "280+",
  },
  {
    slug: "luxury",
    symbol: "◉",
    title: "Luxury Residences",
    subtitle: "The world's finest serviced apartments and branded residences.",
    description: "Five-star serviced apartments and branded residences where hotel-grade service meets the privacy and space of a private home. Selected for interior design, personalised service, exclusive amenities, and the quality of the long-stay experience.",
    tags: ["5-star service", "Designer interiors", "Spa & wellness", "Private dining", "Butler service"],
    count: "180+",
  },
  {
    slug: "remote-work",
    symbol: "◐",
    title: "Remote Work Ready",
    subtitle: "Serviced apartments built for digital nomads and remote professionals.",
    description: "Properties verified for high-speed fibre connectivity, ergonomic workspaces, and the infrastructure that remote professionals require. Includes co-working access, reliable power, and the quiet that focused work demands.",
    tags: ["Fibre broadband", "Ergonomic desk", "Co-working access", "Quiet environment", "Multiple screens"],
    count: "420+",
  },
  {
    slug: "pet-friendly",
    symbol: "△",
    title: "Pet-Friendly Stays",
    subtitle: "Serviced apartments that welcome your pets without compromise.",
    description: "A curated selection of serviced apartments with confirmed pet policies — including weight limits, breed restrictions, and pet deposit terms. Selected for proximity to parks, veterinary services, and outdoor spaces.",
    tags: ["Pets welcome", "Near parks", "Ground floor options", "Pet deposit terms", "Outdoor space"],
    count: "160+",
  },
  {
    slug: "long-stay",
    symbol: "◎",
    title: "Extended Stay",
    subtitle: "Serviced apartments optimised for stays of three months or longer.",
    description: "Properties offering monthly rate discounts, flexible lease terms, and the domestic infrastructure — full kitchens, laundry, storage — that make long-term living genuinely comfortable rather than merely tolerable.",
    tags: ["Monthly rates", "Full kitchen", "Laundry in-unit", "Storage", "Flexible terms"],
    count: "510+",
  },
  {
    slug: "corporate-relocation",
    symbol: "◑",
    title: "Corporate Relocation",
    subtitle: "Serviced apartments for corporate mobility and international assignments.",
    description: "Properties selected for their experience with corporate clients — including invoice billing, corporate rate programmes, HR liaison services, and the flexibility that international assignments require. Preferred by Global Mobility teams.",
    tags: ["Invoice billing", "Corporate rates", "HR liaison", "Flexible check-in", "Assignment terms"],
    count: "290+",
  },
  {
    slug: "short-stay",
    symbol: "◆",
    title: "Short Stay & Flexible",
    subtitle: "Serviced apartments available for stays from one night to one month.",
    description: "Properties offering daily and weekly rates alongside their monthly programmes — ideal for project-based work, trial relocations, and travellers who need the space of an apartment without committing to a monthly lease.",
    tags: ["Daily rates", "Weekly rates", "Flexible check-out", "No minimum stay", "Instant booking"],
    count: "220+",
  },
  {
    slug: "wellness",
    symbol: "◈",
    title: "Wellness & Fitness",
    subtitle: "Serviced apartments with premium wellness and fitness facilities.",
    description: "Properties selected for the quality of their wellness offering — including gym, pool, spa, and access to outdoor fitness. For professionals who maintain a rigorous fitness routine regardless of where work takes them.",
    tags: ["Gym on-site", "Swimming pool", "Spa access", "Yoga studio", "Running routes"],
    count: "240+",
  },
  {
    slug: "couples",
    symbol: "♡",
    title: "Couples & Romance",
    subtitle: "Intimate serviced apartments for couples on extended stays.",
    description: "Studio and one-bedroom apartments selected for their ambience, design quality, and the intimacy that couples require. Ideal for sabbaticals, extended holidays, and relocations where two people are sharing a new city together.",
    tags: ["Studio & 1-bed", "High design", "Quiet location", "Romantic setting", "City views"],
    count: "310+",
  },
  {
    slug: "airport-access",
    symbol: "◁",
    title: "Airport Access",
    subtitle: "Serviced apartments with direct or rapid access to major airports.",
    description: "Properties within 30 minutes of a major international airport — selected for frequent travellers, aircrew, and professionals whose schedules demand rapid transit between accommodation and departure gates.",
    tags: ["30 min to airport", "Transit links", "Early check-in", "Late check-out", "Luggage storage"],
    count: "190+",
  },
  {
    slug: "groups",
    symbol: "◇",
    title: "Groups & Teams",
    subtitle: "Large serviced apartments for teams, groups, and multi-person relocations.",
    description: "Three-bedroom and larger apartments, plus properties that can accommodate multiple bookings in the same building — ideal for project teams, film crews, sports delegations, and family groups travelling together.",
    tags: ["3+ bedrooms", "Multiple units", "Group rates", "Meeting space", "Team billing"],
    count: "130+",
  },
];

export default function Collections() {
  usePageMeta(
    "Collections — Curated Serviced Apartment Collections | SAparts",
    "Explore curated collections of the world's finest serviced apartments — by purpose, lifestyle, and traveller type. From executive stays to family relocations, luxury residences to remote work retreats."
  );

  return (
    <div>
      {/* Hero */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-mark">§ Collections</span>
            <span className="eyebrow">Curated by purpose · {COLLECTIONS.length} collections</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="display text-[2.4rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[5rem]">
                Browse by <em>purpose</em>,<br className="hidden sm:inline" /> not just by city.
              </h1>
              <p className="mt-6 text-[1.05rem] text-muted-foreground max-w-2xl leading-[1.7]" style={{ fontFamily: "var(--font-serif)" }}>
                Every traveller has a different reason for needing a serviced apartment. Our collections are curated by purpose — so whether you are relocating for work, travelling with family, or simply need a quiet base for an extended project, you find the right property faster.
              </p>
            </div>
            <div className="lg:col-span-4 paper p-6">
              <div className="stat-label">Collections</div>
              <div className="stat-value mt-1">{COLLECTIONS.length}</div>
              <div className="stat-sub mt-1">Curated by purpose</div>
              <div className="rule my-4" />
              <div className="stat-label">Directory basis</div>
              <div className="stat-value mt-1">Verified</div>
              <div className="stat-sub mt-1">Source-backed city coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections grid */}
      <section>
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {COLLECTIONS.map((col) => (
              <Link
                key={col.slug}
                href={`/search?collection=${col.slug}`}
                className="group bg-background p-6 sm:p-8 hover:bg-ivory-warm transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[2rem] leading-none text-brass">{col.symbol}</span>
                  <span className="tracker-muted">{col.count} properties</span>
                </div>
                <h2 className="font-serif text-[1.4rem] leading-tight group-hover:text-forest transition-colors">
                  {col.title}
                </h2>
                <p className="mt-2 text-[0.88rem] text-muted-foreground leading-relaxed">
                  {col.subtitle}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {col.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="eyebrow text-[0.72rem] px-2 py-0.5 border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 tracker text-forest group-hover:gap-2 transition-all">
                  Explore collection ↗︎
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hairline-top">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="section-mark">§ Bespoke</span>
            <h2 className="display text-[2rem] lg:text-[2.6rem] mt-4">
              Can't find what you need? <em>We'll find it.</em>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
              Our concierge team works with corporate mobility managers, relocation specialists, and individual professionals to source serviced apartments that meet precise requirements — including properties not yet in our public directory.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4">
            <Link href="/corporate" className="btn-outline">
              Corporate enquiry →︎
            </Link>
            <Link href="/search" className="btn-ghost">
              Browse all properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
