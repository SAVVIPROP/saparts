import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Collections",
  description: "Editorial collections of serviced apartments — executives, families, luxury, remote work, and extended stay.",
};

const COLLECTIONS = [
  {
    symbol: "01",
    title: "Best for Executives",
    subtitle: "Premium serviced apartments for senior professionals and C-suite travellers.",
    description:
      "Curated for executives who require a seamless transition between home and office. Properties selected for workspace quality, concierge-level service, proximity to business districts, and discretion.",
    tags: ["Dedicated workspace", "Concierge", "Business district", "Premium finish"],
  },
  {
    symbol: "02",
    title: "Best for Families",
    subtitle: "Spacious serviced apartments designed for families on extended stays.",
    description:
      "Multi-bedroom apartments with fully equipped kitchens, laundry, and child-friendly amenities. Selected for proximity to international schools, parks, and family services.",
    tags: ["2+ bedrooms", "Full kitchen", "Laundry", "Near schools"],
  },
  {
    symbol: "03",
    title: "Luxury Residences",
    subtitle: "The world's finest serviced apartments and branded residences.",
    description:
      "Five-star serviced apartments and branded residences where hotel-grade service meets the privacy of a private home.",
    tags: ["Designer interiors", "Spa & wellness", "Personalised service"],
  },
  {
    symbol: "04",
    title: "Remote Work Ready",
    subtitle: "Serviced apartments built for digital nomads and remote professionals.",
    description:
      "Properties verified for high-speed connectivity, ergonomic workspaces, and the quiet that focused work demands.",
    tags: ["Fibre broadband", "Ergonomic desk", "Quiet environment"],
  },
  {
    symbol: "05",
    title: "Extended Stay",
    subtitle: "Serviced apartments optimised for stays of three months or longer.",
    description:
      "Properties offering monthly programmes and the domestic infrastructure — kitchens, laundry, storage — that make long-term living comfortable.",
    tags: ["Full kitchen", "Laundry in-unit", "Flexible terms"],
  },
  {
    symbol: "06",
    title: "Corporate Relocation",
    subtitle: "Serviced apartments for corporate mobility and international assignments.",
    description:
      "Selected for experience with corporate clients — invoice billing, HR liaison, and the flexibility international assignments require.",
    tags: ["Invoice billing", "HR liaison", "Assignment terms"],
  },
];

export default function CollectionsPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Collections" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20">
          <span className="section-mark">§ 03</span>
          <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
            Collections, <em>not catalogues.</em>
          </h1>
          <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            Editorial shortlists. Membership is assigned only after a listing pack is imported and reviewed — these
            pages do not invent inventory counts.
          </p>
        </div>
      </section>
      <section>
        <div className="container py-12 lg:py-16 space-y-6">
          {COLLECTIONS.map((c) => (
            <article key={c.symbol} className="paper p-6 sm:p-8 grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3">
                <div className="section-mark">{c.symbol}</div>
                <h2 className="display text-[2rem] mt-4">{c.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
              </div>
              <div className="lg:col-span-9">
                <p className="leading-relaxed text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <span key={tag} className="tracker-muted border border-border px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
