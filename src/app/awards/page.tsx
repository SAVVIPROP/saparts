import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Awards",
  description: "SAparts Awards — recognising excellence in the global serviced apartment sector.",
};

const AWARDS = [
  {
    rank: "01",
    title: "Top Serviced Apartment Awards",
    subtitle: "The annual ranking of the world's finest serviced apartments.",
    criteria: ["Accommodation quality", "Service standards", "Location", "Guest experience"],
  },
  {
    rank: "02",
    title: "Luxury Residences",
    subtitle: "Branded residences and five-star serviced apartments.",
    criteria: ["Interior finish", "Personalised service", "Exclusive amenities"],
  },
  {
    rank: "03",
    title: "Business & Mobility",
    subtitle: "Residences that serve corporate travellers and assignment teams.",
    criteria: ["Workspace", "Corporate services", "Flexible terms"],
  },
  {
    rank: "04",
    title: "Family Stays",
    subtitle: "Apartments that make extended family living genuinely comfortable.",
    criteria: ["Space & layout", "Family amenities", "Neighbourhood"],
  },
];

export default function AwardsPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Awards" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20">
          <span className="section-mark">§ 04</span>
          <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
            Awards, <em>when earned.</em>
          </h1>
          <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            Categories are published. Shortlists are not invented — they will be drawn from imported, reviewed inventory
            only.
          </p>
        </div>
      </section>
      <section>
        <div className="container py-12 space-y-5">
          {AWARDS.map((a) => (
            <article key={a.rank} className="paper p-6 sm:p-8 grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3">
                <div className="section-mark">{a.rank}</div>
                <h2 className="display text-[1.8rem] mt-4">{a.title}</h2>
              </div>
              <div className="lg:col-span-9">
                <p className="text-muted-foreground leading-relaxed">{a.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.criteria.map((c) => (
                    <span key={c} className="tracker-muted border border-border px-2 py-1">
                      {c}
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
