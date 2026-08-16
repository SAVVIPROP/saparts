import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";

const MARKET_STATS = [
  { label: "Global market size (2025)", value: "£183bn", source: "GSAIR 2025", detail: "Projected to reach £183 billion by 2030" },
  { label: "Average cost saving vs hotels", value: "30%", source: "CHPA 2026", detail: "Serviced apartments save 30% vs equivalent hotel stays" },
  { label: "Corporate travel using serviced apts", value: "42%", source: "GBTA 2025", detail: "Of corporate extended stays use serviced apartments" },
  { label: "Average stay length", value: "28 nights", source: "GSAIR 2025", detail: "Global average stay across all serviced apartment types" },
  { label: "Directory methodology", value: "Source-backed", source: "SAparts", detail: "Listings are published only after factual content and property-image review" },
  { label: "Directory coverage", value: "Live index", source: "SAparts", detail: "Coverage grows through retained authoritative sources and administrator review" },
];

const GUIDES = [
  {
    slug: "serviced-apartment-vs-hotel",
    category: "Comparison Guide",
    title: "Serviced Apartment vs Hotel: A Complete Guide",
    summary: "A comprehensive comparison across 20 dimensions — space, cost, flexibility, amenities, and suitability for different stay lengths and traveller types.",
    readMinutes: 8,
  },
  {
    slug: "corporate-housing-guide",
    category: "Corporate Guide",
    title: "The Corporate Housing Guide for Mobility Teams",
    summary: "Everything HR and Global Mobility teams need to know about sourcing, managing, and optimising serviced apartment programmes for international assignments.",
    readMinutes: 12,
  },
  {
    slug: "long-stay-checklist",
    category: "Checklist",
    title: "The Long-Stay Checklist: 30 Questions Before You Book",
    summary: "The definitive pre-booking checklist for extended stays — covering lease terms, utilities, internet, laundry, storage, and the questions most travellers forget to ask.",
    readMinutes: 5,
  },
  {
    slug: "family-relocation-guide",
    category: "Family Guide",
    title: "Family Relocation: Choosing the Right Serviced Apartment",
    summary: "A practical guide for families relocating internationally — covering school proximity, safety, space requirements, and the domestic infrastructure that makes family stays work.",
    readMinutes: 10,
  },
  {
    slug: "rate-negotiation-guide",
    category: "Negotiation Guide",
    title: "How to Negotiate Serviced Apartment Rates",
    summary: "Proven strategies for negotiating monthly rates, securing extended-stay discounts, and structuring corporate rate agreements with serviced apartment operators.",
    readMinutes: 7,
  },
  {
    slug: "city-comparison-guide",
    category: "City Guide",
    title: "Global City Comparison: Serviced Apartment Costs 2026",
    summary: "Average monthly rates for serviced apartments across 50 global cities — from London and New York to Singapore, Dubai, and emerging markets.",
    readMinutes: 6,
  },
];

const TOOLS = [
  {
    id: "stay-calculator",
    title: "Stay Length Calculator",
    description: "Calculate whether a serviced apartment or hotel is more cost-effective for your stay length and city.",
    icon: "◈",
  },
  {
    id: "city-comparison",
    title: "City Cost Comparison",
    description: "Compare average serviced apartment monthly rates across 50+ global cities side by side.",
    icon: "◐",
  },
  {
    id: "budget-estimator",
    title: "Budget Estimator",
    description: "Estimate your total accommodation budget for an international assignment or extended stay.",
    icon: "◉",
  },
  {
    id: "checklist-generator",
    title: "Requirements Checklist",
    description: "Generate a personalised checklist of requirements based on your traveller type and stay purpose.",
    icon: "◇",
  },
];

// Simple stay calculator tool
function StayCalculator() {
  const [nights, setNights] = useState(30);
  const [city, setCity] = useState("London");
  const CITY_RATES: Record<string, { hotel: number; sa: number }> = {
    "London": { hotel: 280, sa: 4500 },
    "New York": { hotel: 320, sa: 5200 },
    "Singapore": { hotel: 220, sa: 3800 },
    "Dubai": { hotel: 180, sa: 2900 },
    "Hong Kong": { hotel: 260, sa: 4200 },
    "Paris": { hotel: 240, sa: 3600 },
    "Sydney": { hotel: 200, sa: 3400 },
    "Tokyo": { hotel: 190, sa: 3100 },
    "Amsterdam": { hotel: 210, sa: 3300 },
    "Zurich": { hotel: 290, sa: 4800 },
  };
  const rates = CITY_RATES[city] || { hotel: 250, sa: 4000 };
  const hotelTotal = nights * rates.hotel;
  const saMonthly = rates.sa;
  const saTotal = Math.round((nights / 30) * saMonthly);
  const saving = hotelTotal - saTotal;
  const savingPct = Math.round((saving / hotelTotal) * 100);

  return (
    <div className="paper p-6 sm:p-8">
      <div className="tracker-muted mb-6">Stay Length Calculator</div>
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="tracker-muted text-[0.82rem] block mb-2">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-border bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-forest"
          >
            {Object.keys(CITY_RATES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="tracker-muted text-[0.82rem] block mb-2">Stay length: <strong>{nights} nights</strong></label>
          <input
            type="range"
            min={7}
            max={180}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="w-full accent-forest"
          />
          <div className="flex justify-between tracker-muted text-[0.72rem] mt-1">
            <span>7 nights</span>
            <span>180 nights</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="paper p-4 bg-ivory-warm">
          <div className="tracker-muted text-[0.78rem]">Hotel cost</div>
          <div className="font-serif text-[1.4rem] mt-1">£{hotelTotal.toLocaleString()}</div>
          <div className="tracker-muted text-[0.72rem] mt-1">£{rates.hotel}/night avg</div>
        </div>
        <div className="paper p-4 bg-ivory-warm">
          <div className="tracker-muted text-[0.78rem]">Serviced apt</div>
          <div className="font-serif text-[1.4rem] mt-1">£{saTotal.toLocaleString()}</div>
          <div className="tracker-muted text-[0.72rem] mt-1">£{saMonthly.toLocaleString()}/month avg</div>
        </div>
        <div className={`paper p-4 ${saving > 0 ? "bg-forest/5 border-forest/30" : "bg-ivory-warm"}`}>
          <div className="tracker-muted text-[0.78rem]">You save</div>
          <div className={`font-serif text-[1.4rem] mt-1 ${saving > 0 ? "text-forest" : "text-charcoal/50"}`}>
            {saving > 0 ? `£${saving.toLocaleString()}` : "Hotel wins"}
          </div>
          <div className="tracker-muted text-[0.72rem] mt-1">
            {saving > 0 ? `${savingPct}% less than hotel` : "For short stays"}
          </div>
        </div>
      </div>
      <div className="tracker-muted text-[0.78rem] leading-relaxed">
        Estimates based on average market rates for {city}. Actual rates vary by property, season, and booking terms. Source: SAparts market data 2026.
      </div>
    </div>
  );
}

export default function Resources() {
  usePageMeta(
    "Resources — Serviced Apartment Guides, Tools & Market Intelligence | SAparts",
    "The SAparts Resources Centre: market intelligence, comparison guides, planning tools, and industry data for serviced apartment travellers, corporate mobility teams, and relocation professionals."
  );

  return (
    <div>
      {/* Hero */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-mark">§ Resources</span>
            <span className="eyebrow">Market intelligence · Guides · Tools</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="display text-[2.4rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[5rem]">
                Everything you need to <em>decide</em>,<br className="hidden sm:inline" /> plan, and book.
              </h1>
              <p className="mt-6 text-[1.05rem] text-muted-foreground max-w-2xl leading-[1.7]" style={{ fontFamily: "var(--font-serif)" }}>
                The SAparts Resources Centre brings together market intelligence, practical guides, and planning tools for everyone who works with serviced apartments — from first-time travellers to seasoned Global Mobility professionals.
              </p>
            </div>
            <div className="lg:col-span-4 paper p-6 space-y-4">
              <div>
                <div className="stat-label">Guides published</div>
                <div className="stat-value mt-1">{GUIDES.length}</div>
                <div className="stat-sub mt-1">Practical resources</div>
              </div>
              <div className="rule" />
              <div>
                <div className="stat-label">Interactive tools</div>
                <div className="stat-value mt-1">{TOOLS.length}</div>
                <div className="stat-sub mt-1">Planning calculators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market stats */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-3 mb-10">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[1.8rem] lg:text-[2.4rem]">The market, <em>in numbers</em>.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {MARKET_STATS.map((stat) => (
              <div key={stat.label} className="bg-background p-6 sm:p-8">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value mt-2">{stat.value}</div>
                <div className="mt-3 text-[0.88rem] text-muted-foreground leading-relaxed">{stat.detail}</div>
                <div className="mt-3 tracker-muted text-[0.72rem]">Source: {stat.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stay calculator */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 02</span>
            <h2 className="display text-[2rem] lg:text-[2.6rem] mt-4">
              Hotel vs serviced apartment: <em>calculate it</em>.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              For stays of 14 nights or longer, a serviced apartment typically costs 20–40% less than an equivalent hotel. Use the calculator to see the saving for your city and stay length.
            </p>
            <p className="mt-3 tracker-muted text-[0.82rem]">
              Based on SAparts market rate data. Actual savings vary by property and season.
            </p>
          </div>
          <div className="lg:col-span-8">
            <StayCalculator />
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-3 mb-10">
            <span className="section-mark">§ 03</span>
            <h2 className="display text-[1.8rem] lg:text-[2.4rem]">Guides & <em>intelligence</em>.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {GUIDES.map((guide, i) => (
              <div key={guide.slug} className="bg-background p-6 sm:p-8 group">
                <div className="flex items-start justify-between mb-4">
                  <span className="eyebrow text-[0.72rem]">{guide.category}</span>
                  <span className="tracker-muted text-[0.72rem]">{guide.readMinutes} min</span>
                </div>
                <h3 className="font-serif text-[1.2rem] leading-tight group-hover:text-forest transition-colors">
                  {guide.title}
                </h3>
                <p className="mt-3 text-[0.88rem] text-muted-foreground leading-relaxed">
                  {guide.summary}
                </p>
                <div className="mt-5 tracker text-forest text-[0.82rem]">
                  Read guide ↗︎
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-3 mb-10">
            <span className="section-mark">§ 04</span>
            <h2 className="display text-[1.8rem] lg:text-[2.4rem]">Planning <em>tools</em>.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-border">
            {TOOLS.map((tool) => (
              <div key={tool.id} className="bg-background p-6 sm:p-8 group">
                <span className="text-[2rem] text-brass">{tool.icon}</span>
                <h3 className="font-serif text-[1.3rem] mt-4 group-hover:text-forest transition-colors">
                  {tool.title}
                </h3>
                <p className="mt-2 text-[0.9rem] text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 tracker text-forest text-[0.82rem]">
                  Coming soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="section-mark">§ Concierge</span>
            <h2 className="display text-[2rem] lg:text-[2.6rem] mt-4">
              Need expert <em>guidance</em>?
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
              Our corporate concierge team works with Global Mobility professionals, HR teams, and individual travellers to source the right serviced apartment for complex requirements. No fee for the initial consultation.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link href="/corporate" className="btn-primary">
              Corporate enquiry ↗︎
            </Link>
            <Link href="/search" className="btn-ghost">
              Browse the directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
