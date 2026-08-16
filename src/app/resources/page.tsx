import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides and reference for serviced apartment stays, corporate housing, and long-stay planning.",
};

const GUIDES = [
  {
    category: "Comparison",
    title: "Serviced apartment vs hotel",
    summary: "Space, flexibility, amenities, and suitability across stay lengths — without invented city rates.",
  },
  {
    category: "Corporate",
    title: "A housing brief for mobility teams",
    summary: "How HR and global mobility teams source, compare, and govern serviced apartment programmes.",
  },
  {
    category: "Checklist",
    title: "Thirty questions before you book",
    summary: "Lease terms, utilities, internet, laundry, storage, and the questions most travellers forget.",
  },
  {
    category: "Family",
    title: "Choosing a residence for relocation",
    summary: "School proximity, safety, space, and the domestic infrastructure that makes family stays work.",
  },
];

export default function ResourcesPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Resources" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20">
          <span className="section-mark">§ 05</span>
          <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
            Resources for the <em>long stay.</em>
          </h1>
          <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            Editorial guides. Market figures that cannot be traced to a public source are omitted.
          </p>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-12 grid sm:grid-cols-2 gap-5">
          {GUIDES.map((g) => (
            <article key={g.title} className="paper p-6">
              <div className="tracker-muted">{g.category}</div>
              <h2 className="display text-[1.8rem] mt-3">{g.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{g.summary}</p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="container py-12 lg:py-16">
          <div className="tracker-muted mb-4">Cited industry references</div>
          <div className="space-y-4">
            {[
              ["GSAIR", "Global Serviced Apartment Industry Report — Ariosi / Travel Intelligence Network", "https://ariosi.com/gsair/"],
              ["Precedence Research", "Serviced Apartment Market Size Report", "https://www.precedenceresearch.com/serviced-apartment-market"],
              ["CHPA", "Corporate Housing Providers Association", "https://www.chpaonline.org/"],
            ].map(([name, full, url]) => (
              <div key={name} className="grid sm:grid-cols-12 gap-3 py-4 hairline-top">
                <div className="sm:col-span-3 tracker">{name}</div>
                <div className="sm:col-span-9 text-sm text-muted-foreground">
                  {full}{" "}
                  <a href={url} className="text-forest hover:underline" target="_blank" rel="noreferrer">
                    Source
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
